"use client";

import { useEffect, useRef } from "react";
import type { WSMessage } from "@/lib/websocket";

interface TerminalOutputProps {
  messages: WSMessage[];
}

function formatTimestamp(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function lineStyle(type: string): string {
  switch (type) {
    case "command": return "text-[#eab308]";
    case "error": return "text-[#ef4444]";
    case "output": return "text-[#888]";
    case "done": return "text-[#22c55e]";
    case "message": return "text-[#3b82f6]";
    default: return "text-[#888]";
  }
}

function linePrefix(type: string): string {
  switch (type) {
    case "command": return "$";
    case "error": return "✗";
    case "output": return ">";
    case "done": return "✓";
    case "message": return "ℹ";
    default: return ">";
  }
}

export default function TerminalOutput({ messages }: TerminalOutputProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const displayLines = messages.filter(
    (m) => m.type === "command" || m.type === "output" || m.type === "error" || m.type === "done" || m.type === "message"
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#222] bg-[#0d0d0d]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
        <span className="text-xs text-[#555] ml-2">terminal</span>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
      >
        {displayLines.length === 0 && (
          <div className="text-[#444]">En attente de commandes...</div>
        )}
        {displayLines.map((msg, i) => (
          <div key={i} className={`${lineStyle(msg.type)} animate-fade-in`}>
            <span className="text-[#555] mr-2">[{formatTimestamp("timestamp" in msg ? (msg as any).timestamp : undefined)}]</span>
            <span className="mr-1">{linePrefix(msg.type)}</span>
            {msg.payload}
          </div>
        ))}
      </div>
    </div>
  );
}
