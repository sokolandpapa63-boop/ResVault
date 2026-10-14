"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, Package } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { ResourceDto } from "@/types";
import { categoryStyle, cn, formatNumber } from "@/lib/utils";

interface Props {
  resource: ResourceDto;
  onEdit: (r: ResourceDto) => void;
  onDelete: (r: ResourceDto) => void;
}

export function ResourceCard({ resource, onEdit, onDelete }: Props) {
  const style = categoryStyle(resource.category);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      whileHover={{ y: -4 }}
      className={cn(
        "glass group relative flex flex-col gap-4 overflow-hidden rounded-3xl p-5 transition-shadow duration-500",
        style.glow,
      )}
    >
      {/* hover sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at 50% -20%, rgba(168,85,247,0.14), transparent 60%)",
        }}
      />

      <div className="relative flex items-start gap-4">
        {/* preview */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {resource.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resource.imageUrl}
              alt={resource.title}
              className="h-full w-full object-cover"
            />
          ) : resource.emoji ? (
            <span className="flex h-full w-full items-center justify-center text-3xl">
              {resource.emoji}
            </span>
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/25 to-emerald-500/15 text-violet-300">
              <Package className="h-6 w-6" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-zinc-100">
            {resource.title}
          </h3>
          <span
            className={cn(
              "mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
              style.color,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
            {resource.category}
          </span>
        </div>

        <div className="flex gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={() => onEdit(resource)}
            title="Редактировать"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-violet-400/40 hover:text-violet-300"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(resource)}
            title="Удалить"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-rose-400/40 hover:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative flex items-end justify-between gap-3">
        <p className="tabular text-2xl font-bold tracking-tight text-white">
          {formatNumber(resource.value)}
          <span className="ml-1.5 text-sm font-medium text-zinc-400">{resource.unit}</span>
        </p>
        <p className="text-[11px] whitespace-nowrap text-zinc-500">
          обновл.{" "}
          {format(new Date(resource.updatedAt), "d MMM, HH:mm", { locale: ru })}
        </p>
      </div>

      {resource.description && (
        <p className="relative line-clamp-2 border-t border-white/5 pt-3 text-[13px] leading-relaxed text-zinc-400">
          {resource.description}
        </p>
      )}
    </motion.article>
  );
}
