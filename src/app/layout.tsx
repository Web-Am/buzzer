// app/layout.tsx
import "./styles/globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { GameProvider } from "./core/context/GameContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Buzzer Game",
  description: "Buzzer Game con Firebase Realtime - Next + TypeScript",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
