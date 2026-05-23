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

export function useWebSocket(url: string = "ws://localhost:8000/ws") {
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
    const ws = new WebSocket(url);

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
  }, [url]);

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
