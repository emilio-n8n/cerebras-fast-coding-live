"use client";

interface StatusIndicatorProps {
  status: string;
  elapsed?: number;
}

const statusConfig: Record<string, { label: string; color: string; pulse: boolean }> = {
  disconnected: { label: "Déconnecté", color: "#666", pulse: false },
  connected: { label: "Connecté", color: "#666", pulse: false },
  idle: { label: "Prêt", color: "#22c55e", pulse: false },
  thinking: { label: "Analyse...", color: "#eab308", pulse: true },
  running: { label: "Exécution...", color: "#3b82f6", pulse: true },
  done: { label: "Terminé", color: "#22c55e", pulse: false },
  error: { label: "Erreur", color: "#ef4444", pulse: false },
};

export default function StatusIndicator({ status, elapsed }: StatusIndicatorProps) {
  const config = statusConfig[status] ?? statusConfig.idle;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111] border border-[#222]">
      <div
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: config.color,
          animation: config.pulse ? "pulse-dot 1.5s ease-in-out infinite" : "none",
          boxShadow: config.pulse ? `0 0 6px ${config.color}` : "none",
        }}
      />
      <span className="text-sm text-[#ccc]">{config.label}</span>
      {elapsed !== undefined && status === "done" && (
        <span className="text-xs text-[#22c55e] ml-1">{elapsed}s</span>
      )}
    </div>
  );
}
