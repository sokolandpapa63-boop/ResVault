"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  History,
  BarChart3,
  LogOut,
  Gem,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Дашборд", icon: LayoutDashboard },
  { href: "/history", label: "История", icon: History },
  { href: "/stats", label: "Статистика", icon: BarChart3 },
];

export function Header({ userName }: { userName: string }) {
  const pathname = usePathname();
  const initial = userName.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
      <div className="glass mx-auto flex h-16 max-w-6xl items-center gap-3 rounded-2xl px-3 sm:px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-[0_0_24px_-4px_rgba(168,85,247,0.8)]">
            <Gem className="h-4.5 w-4.5 text-white" />
          </span>
          <span className="hidden text-[17px] font-semibold tracking-tight sm:block">
            Res<span className="text-gradient">Vault</span>
          </span>
        </Link>

        <nav className="mx-auto flex items-center gap-1 rounded-full border border-white/5 bg-black/30 p-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all duration-300 sm:px-4",
                  active
                    ? "bg-gradient-to-r from-violet-500/25 to-fuchsia-500/20 text-violet-200 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.35),0_0_18px_-6px_rgba(168,85,247,0.6)]"
                    : "text-zinc-500 hover:text-zinc-200",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:block">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden text-right sm:block">
            <p className="max-w-[140px] truncate text-[13px] font-medium text-zinc-200">
              {userName}
            </p>
            <p className="text-[11px] text-zinc-500">личный кабинет</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/30 bg-gradient-to-br from-violet-500/30 to-emerald-500/20 text-sm font-semibold text-violet-200">
            {initial}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Выйти"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-zinc-400 transition-all duration-300 hover:border-rose-400/40 hover:text-rose-300 hover:shadow-[0_0_18px_-6px_rgba(244,63,94,0.6)]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
