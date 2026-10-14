"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  PlusCircle,
  PencilLine,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Vault,
  Sigma,
  ChartPie,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import type { StatsResponse } from "@/types";
import { cn, formatNumber } from "@/lib/utils";

const PIE_COLORS = [
  "#a855f7",
  "#10b981",
  "#e879f9",
  "#38bdf8",
  "#fbbf24",
  "#fb7185",
  "#22d3ee",
  "#a1a1aa",
];

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

function Delta({ value }: { value: number }) {
  if (value === 0)
    return (
      <span className="flex items-center gap-1 text-[11px] text-zinc-500">
        <Minus className="h-3 w-3" /> 0 к прошлому месяцу
      </span>
    );
  const up = value > 0;
  return (
    <span
      className={cn(
        "flex items-center gap-1 text-[11px] font-medium",
        up ? "text-emerald-300" : "text-rose-300",
      )}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}
      {value} к прошлому месяцу
    </span>
  );
}

interface TipPayload {
  name?: string;
  value?: number;
  color?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-deep rounded-xl px-3.5 py-2.5 text-[12px]">
      {label && <p className="mb-1 font-semibold text-zinc-200">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-zinc-300">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: p.color ?? "#a855f7" }}
          />
          {p.name}: <span className="tabular font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function StatsClient() {
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [data, setData] = useState<StatsResponse | null>(null);

  const currentMonth = format(new Date(), "yyyy-MM");

  const load = useCallback(async (m: string) => {
    setData(null);
    try {
      const res = await fetch(`/api/stats?month=${m}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      toast.error("Не удалось загрузить статистику");
      setData(null);
    }
  }, []);

  useEffect(() => {
    void load(month);
  }, [month, load]);

  const monthLabel = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return format(new Date(y, m - 1, 1), "LLLL yyyy", { locale: ru });
  }, [month]);

  const kpis = [
    {
      label: "Добавлено",
      icon: PlusCircle,
      value: data?.totals.created,
      delta: data ? data.totals.created - data.prevTotals.created : 0,
      accent: "text-emerald-300 border-emerald-400/25 bg-emerald-400/10",
    },
    {
      label: "Изменено",
      icon: PencilLine,
      value: data?.totals.updated,
      delta: data ? data.totals.updated - data.prevTotals.updated : 0,
      accent: "text-violet-300 border-violet-400/25 bg-violet-400/10",
    },
    {
      label: "Удалено",
      icon: Trash2,
      value: data?.totals.deleted,
      delta: data ? data.totals.deleted - data.prevTotals.deleted : 0,
      accent: "text-rose-300 border-rose-400/25 bg-rose-400/10",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <section className="flex flex-col items-center gap-4 pt-10 pb-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-300 shadow-[0_0_30px_-8px_rgba(16,185,129,0.6)]">
          <Activity className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Статистика <span className="text-gradient">за месяц</span>
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 capitalize">{monthLabel}</p>
        </div>
        <input
          type="month"
          className="field w-auto"
          value={month}
          max={currentMonth}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
        />
      </section>

      {/* KPI */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass flex items-center gap-4 rounded-3xl p-5"
          >
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl border",
                k.accent,
              )}
            >
              <k.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[12px] font-medium tracking-wider text-zinc-400 uppercase">
                {k.label}
              </p>
              <p className="tabular text-2xl font-bold text-white">
                {data ? k.value : "—"}{" "}
                <span className="text-[12px] font-normal text-zinc-500">
                  {data
                    ? plural(k.value ?? 0, "событие", "события", "событий")
                    : ""}
                </span>
              </p>
              {data && <Delta value={k.delta} />}
            </div>
          </motion.div>
        ))}
      </section>

      {/* current snapshot */}
      <section className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="glass flex items-center gap-4 rounded-3xl p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-400/10 text-violet-300">
            <Vault className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[12px] font-medium tracking-wider text-zinc-400 uppercase">
              Ресурсов сейчас
            </p>
            <p className="tabular text-2xl font-bold text-white">
              {data ? data.resourcesTotal : "—"}
            </p>
          </div>
        </div>
        <div className="glass flex items-center gap-4 rounded-3xl p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
            <Sigma className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[12px] font-medium tracking-wider text-zinc-400 uppercase">
              Суммарное значение
            </p>
            <p className="tabular text-2xl font-bold text-white">
              {data ? formatNumber(data.resourcesValue) : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* activity chart */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass mt-4 rounded-3xl p-5 sm:p-6"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold">Динамика изменений</h2>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Создано
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-violet-400" /> Изменено
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400" /> Удалено
            </span>
          </div>
        </div>
        <div className="h-[280px] w-full">
          {data ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.perDay} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gUpdated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDeleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(168,85,247,0.3)" }} />
                <Area
                  type="monotone"
                  dataKey="CREATED"
                  name="Создано"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#gCreated)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="UPDATED"
                  name="Изменено"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fill="url(#gUpdated)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="DELETED"
                  name="Удалено"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="url(#gDeleted)"
                  stackId="1"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full animate-pulse rounded-2xl bg-white/3" />
          )}
        </div>
      </motion.section>

      {/* categories */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-5 sm:p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <ChartPie className="h-4 w-4 text-violet-300" />
            <h2 className="text-[15px] font-semibold">Категории по количеству</h2>
          </div>
          {data && data.categories.length > 0 ? (
            <>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categories}
                      dataKey="count"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {data.categories.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.categories.map((c, i) => (
                  <span
                    key={c.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/3 px-2.5 py-1 text-[11px] text-zinc-300"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    {c.name}
                    <span className="tabular font-semibold">{c.count}</span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="py-16 text-center text-[13px] text-zinc-500">
              {data ? "Нет активных ресурсов" : "Загрузка…"}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-3xl p-5 sm:p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Sigma className="h-4 w-4 text-emerald-300" />
            <h2 className="text-[15px] font-semibold">Сумма значений по категориям</h2>
          </div>
          {data && data.categories.length > 0 ? (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.categories}
                  layout="vertical"
                  margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={88}
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(168,85,247,0.06)" }} />
                  <Bar dataKey="value" name="Сумма" radius={[0, 8, 8, 0]} barSize={18}>
                    {data.categories.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-16 text-center text-[13px] text-zinc-500">
              {data ? "Нет активных ресурсов" : "Загрузка…"}
            </p>
          )}
        </motion.div>
      </section>
    </div>
  );
}
