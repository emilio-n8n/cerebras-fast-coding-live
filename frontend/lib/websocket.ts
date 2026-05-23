"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type WSMessage =
  | { type: "status"; payload: string }
  | { type: "message"; payload: string; timestamp: number }
  | { type: "command"; payload: string; timestamp: number }
  | { type: "output"; payload: string; timestamp: number }
  | { type: "done"; payload: string; elapsed: number; timestamp: number }
  | { type: "error"; payload: string };

type ConnectionStatus = "disconnected" | "connecting" | "connected";

function resolveWsUrl(): string {
  if (typeof window === "undefined") return "ws://localhost:8000/ws";

  const envUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (envUrl) return envUrl;

  const { hostname, protocol } = window.location;
  const isHttps = protocol === "https:";

  // Cloud Shell / Google Cloud Workstations: PORT-HASH.cloudshell.dev
  if (hostname.includes("cloudshell.dev") || hostname.includes("googleusercontent.com")) {
    const rest = hostname.replace(/^\d+-/, "");
    return `${isHttps ? "wss" : "ws"}://8000-${rest}/ws`;
  }

  // Gitpod / Codespaces style
  if (hostname.includes("gitpod.io") || hostname.includes("preview.app.github.dev")) {
    return `${isHttps ? "wss" : "ws"}://8000-${hostname}/ws`;
  }

  return `ws://${hostname}:8000/ws`;
}

export function useWebSocket(url?: string) {
  const resolvedUrl = url ?? resolveWsUrl();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(text);
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus("connecting");
    const ws = new WebSocket(resolvedUrl);

    ws.onopen = () => {
      setConnectionStatus("connected");
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch {
        // Ignore non-JSON messages
      }
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
      wsRef.current = null;
      reconnectTimerRef.current = setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [resolvedUrl]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { connectionStatus, messages, sendMessage, clearMessages };
}
