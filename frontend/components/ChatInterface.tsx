"use client";

import { useState, useRef, useEffect } from "react";
import type { WSMessage } from "@/lib/websocket";

interface ChatInterfaceProps {
  onSend: (text: string) => void;
  messages: WSMessage[];
  disabled: boolean;
  connectionStatus: string;
}

export default function ChatInterface({ onSend, messages, disabled, connectionStatus }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<WSMessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const allMessages = [...localMessages, ...messages];

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [allMessages]);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    setLocalMessages((prev) => [
      ...prev,
      { type: "message" as const, payload: trimmed, timestamp: Date.now() / 1000 },
    ]);
    onSend(trimmed);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]">
        <h2 className="text-sm font-semibold text-[#ccc]">Assistant Vocal Coding</h2>
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            connectionStatus === "connected" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
          }`}
        >
          {connectionStatus}
        </span>
      </div>

      <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {allMessages.length === 0 && (
          <div className="text-[#555] text-sm text-center mt-8">
            Décris ce que tu veux modifier dans le projet...
          </div>
        )}
        {allMessages.map((msg, i) => {
          if (msg.type === "message" && msg.payload) {
            const isUser = !msg.payload.startsWith("[");
            return (
              <div key={i} className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 animate-fade-in ${isUser ? "bg-blue-900/20" : "bg-yellow-900/10"}`}>
                <span className="text-[#888] mt-0.5">{isUser ? ">" : "•"}</span>
                <span className={isUser ? "text-[#e5e5e5]" : "text-[#eab308]"}>
                  {isUser ? msg.payload : msg.payload.replace(/^\[/, "").replace(/\]$/, "")}
                </span>
              </div>
            );
          }
          if (msg.type === "command") {
            return (
              <div key={i} className="flex items-start gap-2 text-sm text-[#a78bfa] bg-purple-900/10 rounded-lg px-3 py-2 animate-fade-in font-mono">
                <span className="text-[#888] mt-0.5">$</span>
                <span className="break-all">{msg.payload}</span>
              </div>
            );
          }
          if (msg.type === "output") {
            return (
              <div key={i} className="flex items-start gap-2 text-sm text-[#ccc] rounded-lg px-3 py-1.5 animate-fade-in font-mono">
                <span className="text-[#555] mt-0.5 shrink-0">|</span>
                <span className="break-all whitespace-pre-wrap">{msg.payload}</span>
              </div>
            );
          }
          if (msg.type === "done") {
            return (
              <div key={i} className="flex items-center gap-2 text-sm text-[#22c55e] bg-green-900/10 rounded-lg px-3 py-2 animate-fade-in">
                <span>✓</span>
                <span>{msg.payload}</span>
              </div>
            );
          }
          if (msg.type === "error") {
            return (
              <div key={i} className="flex items-start gap-2 text-sm text-[#ef4444] bg-red-900/10 rounded-lg px-3 py-2 animate-fade-in">
                <span>✗</span>
                <span>{msg.payload}</span>
              </div>
            );
          }
          if (msg.type === "status") {
            const colors: Record<string, string> = {
              thinking: "text-[#eab308]",
              running: "text-[#a78bfa]",
              done: "text-[#22c55e]",
              connected: "text-[#22c55e]",
            };
            const color = colors[msg.payload] || "text-[#888]";
            return (
              <div key={i} className={`flex items-center gap-2 text-xs ${color} rounded-lg px-3 py-1.5 animate-fade-in italic`}>
                <span>◆</span>
                <span>{msg.payload}</span>
              </div>
            );
          }
          return null;
        })}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-[#222]">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? "Exécution en cours..." : "Parle ou tape ta demande..."}
            disabled={disabled}
            className="flex-1 bg-[#111] text-[#e5e5e5] text-sm rounded-lg px-3 py-2.5 border border-[#333] outline-none focus:border-[#555] transition-colors placeholder:text-[#555] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="bg-[#22c55e] text-black text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#16a34a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {disabled ? "..." : "→"}
          </button>
        </div>
      </form>
    </div>
  );
}
