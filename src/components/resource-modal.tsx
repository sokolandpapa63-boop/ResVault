"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ImagePlus,
  Trash2,
  Loader2,
  Smile,
  Image as ImageIcon,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import type { ResourceDto } from "@/types";
import { CATEGORIES, categoryStyle, cn } from "@/lib/utils";

interface Props {
  open: boolean;
  initial: ResourceDto | null;
  onClose: () => void;
  onSaved: (r: ResourceDto, isEdit: boolean) => void;
}

type VisualTab = "emoji" | "image";

async function fileToResizedDataUrl(file: File): Promise<string> {
  if (file.size > 6 * 1024 * 1024) throw new Error("Файл больше 6 МБ");
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Некорректное изображение"));
    el.src = dataUrl;
  });
  const MAX = 560;
  const scale = Math.min(1, MAX / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas не поддерживается");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function ResourceModal({ open, initial, onClose, onSaved }: Props) {
  const isEdit = Boolean(initial);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [value, setValue] = useState("0");
  const [unit, setUnit] = useState("шт");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [visualTab, setVisualTab] = useState<VisualTab>("emoji");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setCategory(initial?.category ?? CATEGORIES[0]);
    setValue(initial ? String(initial.value) : "0");
    setUnit(initial?.unit ?? "шт");
    setDescription(initial?.description ?? "");
    setEmoji(initial?.emoji ?? null);
    setImageUrl(initial?.imageUrl ?? null);
    setVisualTab(initial?.imageUrl ? "image" : "emoji");
    setSaving(false);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      if (dataUrl.length > 850_000) {
        toast.error("Изображение слишком большое, выберите другое");
        return;
      }
      setImageUrl(dataUrl);
      setEmoji(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка загрузки изображения");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numValue = Number(String(value).replace(",", "."));
    if (!title.trim()) return toast.error("Введите название");
    if (!Number.isFinite(numValue)) return toast.error("Значение должно быть числом");

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        value: numValue,
        unit: unit.trim() || "шт",
        description: description.trim(),
        imageUrl: visualTab === "image" ? imageUrl : null,
        emoji: visualTab === "emoji" ? emoji : null,
      };
      const res = await fetch(
        isEdit ? `/api/resources/${initial!.id}` : "/api/resources",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error ?? "Не удалось сохранить");
        return;
      }
      toast.success(isEdit ? "Ресурс обновлён" : "Ресурс создан");
      onSaved(data as ResourceDto, isEdit);
      onClose();
    } catch {
      toast.error("Сеть недоступна");
    } finally {
      setSaving(false);
    }
  }

  const previewStyle = categoryStyle(category);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.96, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="glass-deep relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border text-xl",
                    previewStyle.color,
                  )}
                >
                  {visualTab === "image" && imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : visualTab === "emoji" && emoji ? (
                    emoji
                  ) : (
                    <Package className="h-4.5 w-4.5" />
                  )}
                </span>
                <h2 className="text-lg font-semibold">
                  {isEdit ? "Редактировать ресурс" : "Новый ресурс"}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-zinc-400">
                  Название *
                </label>
                <input
                  className="field"
                  placeholder="Например, Накопления на отпуск"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-zinc-400">
                  Категория *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => {
                    const s = categoryStyle(c);
                    const active = category === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all duration-200",
                          active
                            ? cn(s.color, "shadow-[0_0_14px_-4px_currentColor]")
                            : "border-white/10 bg-white/3 text-zinc-500 hover:text-zinc-300",
                        )}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-[1fr_110px] gap-3">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-zinc-400">
                    Значение *
                  </label>
                  <input
                    className="field tabular"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-zinc-400">
                    Единица
                  </label>
                  <input
                    className="field"
                    placeholder="шт, ₽, ч…"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    maxLength={16}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-zinc-400">
                  Описание
                </label>
                <textarea
                  className="field min-h-[72px] resize-none"
                  placeholder="Пара слов о ресурсе…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center gap-1 rounded-xl border border-white/8 bg-black/30 p-1">
                  {(
                    [
                      { id: "emoji", label: "Эмодзи", icon: Smile },
                      { id: "image", label: "Фото", icon: ImageIcon },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setVisualTab(t.id)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all",
                        visualTab === t.id
                          ? "bg-violet-500/20 text-violet-200 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.35)]"
                          : "text-zinc-500 hover:text-zinc-300",
                      )}
                    >
                      <t.icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  ))}
                </div>

                {visualTab === "emoji" ? (
                  <div className="overflow-hidden rounded-2xl border border-white/8">
                    <EmojiPicker onEmojiSelect={(emoji: string) => setEmoji(emoji)}>
                      <EmojiPicker.Header className="p-2 pb-0">
                        <EmojiPicker.Input
                          placeholder="Поиск эмодзи…"
                          className="field"
                        />
                      </EmojiPicker.Header>
                      <EmojiPicker.Group>
                        <EmojiPicker.List containerHeight={320} />
                      </EmojiPicker.Group>
                    </EmojiPicker>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        void handleFile(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                    {imageUrl ? (
                      <div className="relative h-36 overflow-hidden rounded-2xl border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                        <div className="absolute right-2 top-2 flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-black/70 px-2.5 text-[12px] text-zinc-200 backdrop-blur transition-colors hover:text-white"
                          >
                            <ImagePlus className="h-3.5 w-3.5" /> Заменить
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageUrl(null)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-rose-300 backdrop-blur transition-colors hover:text-rose-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/2 text-zinc-500 transition-all hover:border-violet-400/40 hover:text-violet-300"
                      >
                        <ImagePlus className="h-6 w-6" />
                        <span className="text-[12px]">Загрузить изображение (до 6 МБ)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/8 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-white/10 bg-white/4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/8"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(168,85,247,0.7)] transition-all hover:brightness-110 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? "Сохранить" : "Создать ресурс"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
