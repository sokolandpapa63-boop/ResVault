"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
  PlusCircle,
  PencilLine,
  Trash2,
  History as HistoryIcon,
  RotateCcw,
  ArrowRight,
  Inbox,
} from "lucide-react";
import toast from "react-hot-toast";
import type { HistoryDto } from "@/types";
import { ACTION_STYLE, FIELD_LABELS, cn, formatNumber } from "@/lib/utils";

const ACTION_ICON = {
  CREATED: PlusCircle,
  UPDATED: PencilLine,
  DELETED: Trash2,
} as const;

const ACTION_ACCENT = {
  CREATED: "text-emerald-300 border-emerald-400/25 bg-emerald-400/10",
  UPDATED: "text-violet-300 border-violet-400/25 bg-violet-400/10",
  DELETED: "text-rose-300 border-rose-400/25 bg-rose-400/10",
} as const;

function formatCell(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return formatNumber(v);
  const s = String(v);
  return s.length > 36 ? `${s.slice(0, 36)}…` : s;
}

export function HistoryClient() {
  const [entries, setEntries] = useState<HistoryDto[] | null>(null);
  const [action, setAction] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (action !== "all") params.set("action", action);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    try {
      const res = await fetch(`/api/history?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setEntries(await res.json());
    } catch {
      toast.error("Не удалось загрузить историю");
      setEntries([]);
    }
  }, [action, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(() => {
    if (!entries) return [];
    const map = new Map<string, HistoryDto[]>();
    for (const e of entries) {
      const key = format(new Date(e.timestamp), "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return [...map.entries()];
  }, [entries]);

  const hasFilters = action !== "all" || from || to;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-20 sm:px-6">
      <section className="pt-10 pb-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-500/10 text-violet-300 shadow-[0_0_30px_-8px_rgba(168,85,247,0.6)]">
          <HistoryIcon className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          История <span className="text-gradient">изменений</span>
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Все события: создание, обновление и удаление ресурсов
        </p>
      </section>

      {/* filters */}
      <section className="glass flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center">
        <select
          className="field flex-1"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="all">Все действия</option>
          <option value="CREATED">Создано</option>
          <option value="UPDATED">Изменено</option>
          <option value="DELETED">Удалено</option>
        </select>
        <div className="flex flex-1 items-center gap-2">
          <input
            type="date"
            className="field flex-1"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <span className="text-zinc-600">—</span>
          <input
            type="date"
            className="field flex-1"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        {hasFilters && (
          <button
            onClick={() => {
              setAction("all");
              setFrom("");
              setTo("");
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-4 py-2.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Сбросить
          </button>
        )}
      </section>

      {/* list */}
      <section className="mt-6">
        {entries === null ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass h-24 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-16 text-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/4 text-zinc-500">
              <Inbox className="h-6 w-6" />
            </span>
            <p className="text-[15px] font-medium text-zinc-300">Событий не найдено</p>
            <p className="max-w-sm text-[13px] text-zinc-500">
              {hasFilters
                ? "Попробуй смягчить фильтры по типу действия или датам."
                : "Создай первый ресурс на дашборде — событие появится здесь автоматически."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {groups.map(([day, items]) => (
              <div key={day}>
                <div className="mb-3 flex items-center gap-3">
                  <p className="text-[12px] font-semibold tracking-wider text-zinc-500 uppercase">
                    {format(new Date(`${day}T00:00:00`), "d MMMM yyyy, EEEE", { locale: ru })}
                  </p>
                  <span className="h-px flex-1 bg-white/6" />
                  <span className="text-[11px] text-zinc-600">
                    {items.length}{" "}
                    {items.length === 1 ? "событие" : items.length < 5 ? "события" : "событий"}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {items.map((e, idx) => {
                    const Icon = ACTION_ICON[e.action];
                    const meta = ACTION_STYLE[e.action];
                    const title =
                      e.changes?.__meta?.title ??
                      formatCell(e.changes?.title?.to !== null ? e.changes?.title?.to : e.changes?.title?.from);
                    const diffKeys = Object.keys(e.changes ?? {}).filter(
                      (k) => k !== "__meta",
                    );
                    return (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                        className="glass flex gap-4 rounded-3xl p-4 transition-shadow duration-300 hover:shadow-[0_0_30px_-12px_rgba(168,85,247,0.35)]"
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                            ACTION_ACCENT[e.action],
                          )}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                                meta.className,
                              )}
                            >
                              {meta.label}
                            </span>
                            <h3 className="truncate text-[14px] font-semibold text-zinc-100">
                              {title}
                            </h3>
                            <span className="ml-auto text-[11px] whitespace-nowrap text-zinc-500">
                              {format(new Date(e.timestamp), "HH:mm", { locale: ru })} ·{" "}
                              {formatDistanceToNow(new Date(e.timestamp), {
                                addSuffix: true,
                                locale: ru,
                              })}
                            </span>
                          </div>
                          {e.action === "UPDATED" && diffKeys.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {diffKeys.map((k) => (
                                <li
                                  key={k}
                                  className="flex flex-wrap items-center gap-x-1.5 text-[12px] text-zinc-400"
                                >
                                  <span className="text-zinc-500">
                                    {FIELD_LABELS[k] ?? k}:
                                  </span>
                                  <span className="text-rose-300/80 line-through decoration-rose-400/40">
                                    {formatCell(e.changes[k]?.from)}
                                  </span>
                                  <ArrowRight className="h-3 w-3 text-zinc-600" />
                                  <span className="font-medium text-emerald-300">
                                    {formatCell(e.changes[k]?.to)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {e.action === "CREATED" && (
                            <p className="mt-1.5 text-[12px] text-zinc-500">
                              {formatCell(e.changes?.category?.to)} ·{" "}
                              {formatCell(e.changes?.value?.to)}{" "}
                              {formatCell(e.changes?.unit?.to)}
                            </p>
                          )}
                          {e.action === "DELETED" && (
                            <p className="mt-1.5 text-[12px] text-zinc-500">
                              {formatCell(e.changes?.category?.from)} · было:{" "}
                              {formatCell(e.changes?.value?.from)}{" "}
                              {formatCell(e.changes?.unit?.from)}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
