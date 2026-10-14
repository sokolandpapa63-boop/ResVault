import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(resources)
    .where(eq(resources.userId, session.user.id))
    .orderBy(desc(resources.updatedAt));

  return NextResponse.json(rows.map(serialize));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const category = String(body?.category ?? "").trim();
  const value = Number(body?.value);
  const unit = String(body?.unit ?? "шт").trim() || "шт";
  const description = String(body?.description ?? "").trim();
  const imageUrl = body?.imageUrl ? String(body.imageUrl) : null;
  const emoji = body?.emoji ? String(body.emoji) : null;

  if (!title || title.length > 120) {
    return NextResponse.json({ error: "Название обязательно (до 120 символов)" }, { status: 400 });
  }
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return NextResponse.json({ error: "Выберите категорию" }, { status: 400 });
  }
  if (!Number.isFinite(value)) {
    return NextResponse.json({ error: "Значение должно быть числом" }, { status: 400 });
  }
  if (unit.length > 16) {
    return NextResponse.json({ error: "Единица измерения слишком длинная" }, { status: 400 });
  }
  if (imageUrl && imageUrl.length > 900_000) {
    return NextResponse.json({ error: "Изображение слишком большое" }, { status: 400 });
  }

  const [row] = await db
    .insert(resources)
    .values({
      userId: session.user.id,
      title,
      category,
      value,
      unit,
      description,
      imageUrl,
      emoji: imageUrl ? null : emoji,
    })
    .returning();

  await db.insert(historyEntries).values({
    userId: session.user.id,
    resourceId: row.id,
    action: "CREATED",
    changes: {
      title: { from: null, to: title },
      category: { from: null, to: category },
      value: { from: null, to: value },
      unit: { from: null, to: unit },
      __meta: { title },
    },
  });

  return NextResponse.json(serialize(row), { status: 201 });
}
