import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { resources, historyEntries } from "@/db/schema";
import { CATEGORIES } from "@/lib/utils";

function serialize(r: typeof resources.$inferSelect) {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    value: r.value,
    unit: r.unit,
    description: r.description,
    imageUrl: r.imageUrl,
    emoji: r.emoji,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const [row] = await db
    .select()
    .from(resources)
    .where(and(eq(resources.id, id), eq(resources.userId, session.user.id)))
    .limit(1);
  if (!row) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  return NextResponse.json(serialize(row));
}

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const [existing] = await db
    .select()
    .from(resources)
    .where(and(eq(resources.id, id), eq(resources.userId, session.user.id)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? existing.title).trim();
  const category = String(body?.category ?? existing.category).trim();
  const value = body?.value === undefined ? existing.value : Number(body.value);
  const unit = String(body?.unit ?? existing.unit).trim() || existing.unit;
  const description = String(body?.description ?? existing.description).trim();
  const imageUrl =
    body?.imageUrl === undefined ? existing.imageUrl : body.imageUrl ? String(body.imageUrl) : null;
  let emoji =
    body?.emoji === undefined ? existing.emoji : body.emoji ? String(body.emoji) : null;

  if (!title || title.length > 120) {
    return NextResponse.json({ error: "Название обязательно (до 120 символов)" }, { status: 400 });
  }
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return NextResponse.json({ error: "Выберите категорию" }, { status: 400 });
  }
  if (!Number.isFinite(value)) {
    return NextResponse.json({ error: "Значение должно быть числом" }, { status: 400 });
  }
  if (imageUrl && imageUrl.length > 900_000) {
    return NextResponse.json({ error: "Изображение слишком большое" }, { status: 400 });
  }
  if (imageUrl) emoji = null;

  const [row] = await db
    .update(resources)
    .set({
      title,
      category,
      value,
      unit,
      description,
      imageUrl,
      emoji,
      updatedAt: new Date(),
    })
    .where(eq(resources.id, id))
    .returning();

  const changes: Record<string, { from: unknown; to: unknown }> = {};
  if (existing.title !== title) changes.title = { from: existing.title, to: title };
  if (existing.category !== category) changes.category = { from: existing.category, to: category };
  if (existing.value !== value) changes.value = { from: existing.value, to: value };
  if (existing.unit !== unit) changes.unit = { from: existing.unit, to: unit };
  if (existing.description !== description)
    changes.description = {
      from: existing.description || null,
      to: description || null,
    };
  if (existing.imageUrl !== imageUrl)
    changes.imageUrl = { from: existing.imageUrl ? "есть" : null, to: imageUrl ? "есть" : null };
  if (existing.emoji !== emoji)
    changes.emoji = { from: existing.emoji, to: emoji };

  if (Object.keys(changes).length > 0) {
    await db.insert(historyEntries).values({
      userId: session.user.id,
      resourceId: id,
      action: "UPDATED",
      changes: { ...changes, __meta: { title } },
    });
  }

  return NextResponse.json(serialize(row));
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const [existing] = await db
    .select()
    .from(resources)
    .where(and(eq(resources.id, id), eq(resources.userId, session.user.id)))
    .limit(1);
  if (!existing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  await db.delete(resources).where(eq(resources.id, id));

  await db.insert(historyEntries).values({
    userId: session.user.id,
    resourceId: id,
    action: "DELETED",
    changes: {
      title: { from: existing.title, to: null },
      category: { from: existing.category, to: null },
      value: { from: existing.value, to: null },
      unit: { from: existing.unit, to: null },
      __meta: { title: existing.title },
    },
  });

  return NextResponse.json({ ok: true });
}
