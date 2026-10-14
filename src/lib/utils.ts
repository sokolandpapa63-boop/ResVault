import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORIES = [
  "Финансы",
  "Навыки",
  "Приватки",
  "Игры",
  "Подписки",
  "Имущество",
  "Крипта",
  "Прочее",
] as const;

export const CATEGORY_STYLE: Record<
  string,
  { color: string; glow: string; dot: string }
> = {
  Финансы: {
    color: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    glow: "shadow-[0_0_32px_-8px_rgba(16,185,129,0.45)]",
    dot: "bg-emerald-400",
  },
  Навыки: {
    color: "text-violet-300 bg-violet-400/10 border-violet-400/20",
    glow: "shadow-[0_0_32px_-8px_rgba(168,85,247,0.45)]",
    dot: "bg-violet-400",
  },
  Приватки: {
    color: "text-fuchsia-300 bg-fuchsia-400/10 border-fuchsia-400/20",
    glow: "shadow-[0_0_32px_-8px_rgba(232,121,249,0.45)]",
    dot: "bg-fuchsia-400",
  },
  Игры: {
    color: "text-sky-300 bg-sky-400/10 border-sky-400/20",
    glow: "shadow-[0_0_32px_-8px_rgba(56,189,248,0.45)]",
    dot: "bg-sky-400",
  },
  Подписки: {
    color: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    glow: "shadow-[0_0_32px_-8px_rgba(251,191,36,0.45)]",
    dot: "bg-amber-400",
  },
  Имущество: {
    color: "text-rose-300 bg-rose-400/10 border-rose-400/20",
    glow: "shadow-[0_0_32px_-8px_rgba(251,113,133,0.45)]",
    dot: "bg-rose-400",
  },
  Крипта: {
    color: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
    glow: "shadow-[0_0_32px_-8px_rgba(34,211,238,0.45)]",
    dot: "bg-cyan-400",
  },
  Прочее: {
    color: "text-zinc-300 bg-zinc-400/10 border-zinc-400/20",
    glow: "shadow-[0_0_32px_-8px_rgba(161,161,170,0.35)]",
    dot: "bg-zinc-400",
  },
};

export function categoryStyle(category: string) {
  return CATEGORY_STYLE[category] ?? CATEGORY_STYLE["Прочее"];
}

export const EMOJI_CHOICES = [
  "💰", "💎", "🏆", "🚀", "🎮", "🎯",
  "📚", "🎧", "⌚", "🏠", "🚗", "✈️",
  "🖥️", "📱", "🎨", "⚡", "🔥", "🌙",
  "⭐", "🎁", "🛡️", "🧠", "💼", "🏅",
];

export const ACTION_STYLE: Record<
  string,
  { label: string; className: string }
> = {
  CREATED: {
    label: "Создано",
    className: "text-emerald-300 bg-emerald-400/10 border-emerald-400/25",
  },
  UPDATED: {
    label: "Изменено",
    className: "text-violet-300 bg-violet-400/10 border-violet-400/25",
  },
  DELETED: {
    label: "Удалено",
    className: "text-rose-300 bg-rose-400/10 border-rose-400/25",
  },
};

export const FIELD_LABELS: Record<string, string> = {
  title: "Название",
  category: "Категория",
  value: "Значение",
  unit: "Единица",
  description: "Описание",
  imageUrl: "Изображение",
  emoji: "Эмодзи",
};

export function formatNumber(n: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(n);
}
