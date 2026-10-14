import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ResVault — личный кабинет учёта ресурсов",
  description:
    "Личный кабинет для учёта ресурсов: деньги, навыки, приватки. История изменений и статистика за месяц.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-dvh bg-[#050505] font-sans text-zinc-100 antialiased">
        {/* ambient background */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="orb absolute -top-48 left-1/2 h-[540px] w-[880px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[150px]" />
          <div
            className="orb absolute top-1/3 -left-44 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[130px]"
            style={{ animationDelay: "-4s" }}
          />
          <div
            className="orb absolute -bottom-48 right-[-80px] h-[480px] w-[480px] rounded-full bg-fuchsia-600/10 blur-[140px]"
            style={{ animationDelay: "-8s" }}
          />
          <div
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 100%)",
            }}
          />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
