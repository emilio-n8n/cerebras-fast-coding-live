"use client";

import { useCallback, useRef, useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import TerminalOutput from "@/components/TerminalOutput";
import StatusIndicator from "@/components/StatusIndicator";
import { useWebSocket } from "@/lib/websocket";

export default function Home() {
  const { connectionStatus, messages, sendMessage, clearMessages } = useWebSocket();
  const [elapsed, setElapsed] = useState<number>();
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStatus = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.type === "status") return m.payload;
    }
    return connectionStatus === "connected" ? "idle" : connectionStatus;
  })();

  const isRunning = currentStatus === "thinking" || currentStatus === "running";

  const handleSend = useCallback(
    (text: string) => {
      clearMessages();
      setElapsed(undefined);
      startTimeRef.current = Date.now();
      sendMessage(text);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsed((Date.now() - startTimeRef.current) / 1000);
      }, 100);
    },
    [sendMessage, clearMessages]
  );

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      <header className="flex items-center justify-between px-4 py-2 border-b border-[#222] bg-[#0d0d0d]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#22c55e]">⌘ Voice Coding</span>
          <span className="text-[#333] text-xs">|</span>
          <StatusIndicator status={currentStatus} elapsed={elapsed} />
        </div>
        <div className="flex items-center gap-2 text-xs text-[#555]">
          {elapsed !== undefined && currentStatus !== "idle" && (
            <span className="font-mono">{elapsed.toFixed(1)}s</span>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[400px] min-w-[320px] border-r border-[#222] flex flex-col">
          <ChatInterface
            onSend={handleSend}
            messages={messages}
            disabled={isRunning}
            connectionStatus={connectionStatus}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <TerminalOutput messages={messages} />
        </div>
      </div>
    </div>
  );
}
