"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Loader2, Gem, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data?.error ?? "Не удалось зарегистрироваться");
          return;
        }
        toast.success("Аккаунт создан — входим…");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error(
          mode === "login"
            ? "Неверный email или пароль"
            : "Аккаунт создан, войдите вручную",
        );
        if (mode === "register") setMode("login");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Сеть недоступна");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="w-full max-w-md"
    >
      {/* logo */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <motion.span
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-[0_0_44px_-6px_rgba(168,85,247,0.9)]"
        >
          <Gem className="h-6 w-6 text-white" />
        </motion.span>
        <h1 className="text-2xl font-bold tracking-tight">
          Res<span className="text-gradient">Vault</span>
        </h1>
        <p className="max-w-xs text-[13px] leading-relaxed text-zinc-500">
          Личный кабинет учёта ресурсов: деньги, навыки, приватки — всё в одном месте.
        </p>
      </div>

      <div className="glass-deep rounded-3xl p-6 sm:p-8">
        {/* tabs */}
        <div className="relative mb-6 grid grid-cols-2 rounded-2xl border border-white/8 bg-black/40 p-1">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "relative z-10 rounded-xl py-2 text-sm font-medium transition-colors duration-300",
                mode === m ? "text-white" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {mode === m && (
                <motion.span
                  layoutId="auth-tab"
                  className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-violet-600/60 to-fuchsia-600/50 shadow-[0_0_20px_-6px_rgba(168,85,247,0.8)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {m === "login" ? "Вход" : "Регистрация"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence initial={false}>
            {mode === "register" && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0, marginTop: -16 }}
                animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: -16 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    className="field pl-10"
                    placeholder="Имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={60}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              className="field pl-10"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              className="field pl-10"
              type="password"
              placeholder={mode === "register" ? "Пароль (мин. 6 символов)" : "Пароль"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 6 : 1}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-[0_10px_36px_-10px_rgba(168,85,247,0.9)] transition-all duration-300 hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Войти в кабинет" : "Создать аккаунт"}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-[12px] text-zinc-600">
        Данные изолированы — каждый пользователь видит только свои ресурсы.
      </p>
    </motion.div>
  );
}
