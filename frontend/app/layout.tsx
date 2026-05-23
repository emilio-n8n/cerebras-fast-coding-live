import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice Coding Assistant MVP",
  description: "Assistant IA vocal pour coder en temps réel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="h-full">{children}</body>
    </html>
  );
}
