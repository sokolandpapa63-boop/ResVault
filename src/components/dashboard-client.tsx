"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Layers,
  Sigma,
  Library,
  Inbox,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import type { ResourceDto } from "@/types";
import { CATEGORIES, categoryStyle, cn, formatNumber } from "@/lib/utils";
import { LiveClock } from "@/components/clock";
import { ResourceCard } from "@/components/resource-card";
import { ResourceModal } from "@/components/resource-modal";

type SortKey = "date" | "name" | "value";

export function DashboardClient({ userName }: { userName: string }) {
  const [resources, setResources] = useState<ResourceDto[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [modal, setModal] = useState<{ open: boolean; initial: ResourceDto | null }>({
    open: false,
    initial: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<ResourceDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/resources", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setResources(await res.json());
    } catch {
      toast.error("Не удалось загрузить ресурсы");
      setResources([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!resources) return [];
    const q = query.trim().toLowerCase();
    const list = resources.filter((r) => {
      const matchQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      const matchC = category === "all" || r.category === category;
      return matchQ && matchC;
    });
    return [...list].sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title, "ru");
      if (sort === "value") return b.value - a.value;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [resources, query, category, sort]);

  const categorySums = useMemo(() => {
    if (!resources) return [];
    const map = new Map<string, number>();
    for (const r of resources) map.set(r.category, (map.get(r.category) ?? 0) + r.value);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [resources]);

  const totalValue = useMemo(
    () => (resources ?? []).reduce((s, r) => s + r.value, 0),
    [resources],
  );

  function onSaved(saved: ResourceDto, isEdit: boolean) {
    setResources((prev) => {
      if (!prev) return [saved];
      if (isEdit) return prev.map((r) => (r.id === saved.id ? saved : r));
      return [saved, ...prev];
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/resources/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error ?? "Не удалось удалить");
        return;
      }
      setResources((prev) => prev?.filter((r) => r.id !== deleteTarget.id) ?? []);
      toast.success(`«${deleteTarget.title}» удалён`);
      setDeleteTarget(null);
    } catch {
      toast.error("Сеть недоступна");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      {/* clock + greeting */}
      <section className="flex flex-col items-center gap-3 pt-10 pb-8">
        <LiveClock />
        <p className="mt-1 text-sm text-zinc-500">
          Привет, <span className="font-medium text-violet-300">{userName}</span> — вот твои
          ресурсы
        </p>
      </section>

      {/* summary */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-5"
        >
          <div className="flex items-center gap-2 text-zinc-400">
            <Library className="h-4 w-4 text-violet-400" />
            <span className="text-[12px] font-medium uppercase tracking-wider">
              Всего ресурсов
            </span>
          </div>
          <p className="tabular mt-2 text-3xl font-bold text-white">
            {resources ? resources.length : "—"}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-3xl p-5"
        >
          <div className="flex items-center gap-2 text-zinc-400">
            <Sigma className="h-4 w-4 text-emerald-400" />
            <span className="text-[12px] font-medium uppercase tracking-wider">
              Суммарное значение
            </span>
          </div>
          <p className="tabular mt-2 text-3xl font-bold text-white">
            {resources ? formatNumber(totalValue) : "—"}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass col-span-2 rounded-3xl p-5 lg:col-span-1"
        >
          <div className="flex items-center gap-2 text-zinc-400">
            <Layers className="h-4 w-4 text-fuchsia-400" />
            <span className="text-[12px] font-medium uppercase tracking-wider">
              По категориям
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {categorySums.length === 0 && (
              <span className="text-[13px] text-zinc-500">нет данных</span>
            )}
            {categorySums.map(([name, sum]) => {
              const s = categoryStyle(name);
              return (
                <span
                  key={name}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                    s.color,
                  )}
                >
                  {name}
                  <span className="tabular font-semibold">{formatNumber(sum)}</span>
                </span>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* controls */}
<section className="mt-8 flex flex-col gap-3">
  {/* верхняя строка: селекты + кнопка */}
  <div className="flex flex-wrap items-center gap-3">
    <select
      className="field w-auto min-w-[150px] flex-1 sm:flex-none"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
    >
      <option value="all">Все категории</option>
      {CATEGORIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
    <select
      className="field w-auto min-w-[150px] flex-1 sm:flex-none"
      value={sort}
      onChange={(e) => setSort(e.target.value as SortKey)}
    >
      <option value="date">По дате</option>
      <option value="name">По названию</option>
      <option value="value">По значению</option>
    </select>
    <button
      onClick={() => setModal({ open: true, initial: null })}
      className="ml-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-[0_8px_30px_-8px_rgba(168,85,247,0.8)] transition-all duration-300 hover:brightness-110 sm:w-auto"
    >
      <Plus className="h-4 w-4" />
      Добавить ресурс
    </button>
  </div>

  {/* нижняя строка: поиск на всю ширину */}
  <div className="relative">
    <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
    <input
      className="field pl-10"
      placeholder="Поиск по названию или описанию…"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  </div>
</section>
      {/* grid */}
      <section className="mt-6">
        {resources === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="glass h-[168px] animate-pulse rounded-3xl"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-16 text-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/4 text-zinc-500">
              <Inbox className="h-6 w-6" />
            </span>
            <p className="text-[15px] font-medium text-zinc-300">
              {resources.length === 0 ? "Пока пусто" : "Ничего не найдено"}
            </p>
            <p className="max-w-sm text-[13px] text-zinc-500">
              {resources.length === 0
                ? "Нажми «Добавить ресурс», чтобы создать первую карточку — деньги, навыки, приватки и всё остальное."
                : "Попробуй изменить запрос, категорию или сбросить фильтры."}
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  onEdit={(res) => setModal({ open: true, initial: res })}
                  onDelete={setDeleteTarget}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* create / edit modal */}
      <ResourceModal
        open={modal.open}
        initial={modal.initial}
        onClose={() => setModal({ open: false, initial: null })}
        onSaved={onSaved}
      />

      {/* delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !deleting && setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="glass-deep relative z-10 w-full max-w-sm rounded-3xl p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/10 text-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">Удалить ресурс?</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
                «{deleteTarget.title}» будет удалён безвозвратно. Действие запишется в историю.
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/8"
                >
                  Отмена
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(244,63,94,0.7)] transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Удалить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
