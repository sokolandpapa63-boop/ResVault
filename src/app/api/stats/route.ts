import { NextResponse } from "next/server";
import { and, eq, gte, lt } from "drizzle-orm";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { historyEntries, resources } from "@/db/schema";

function monthRange(month: string): { start: Date; end: Date } | null {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  const [y, m] = month.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  return { start, end };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const url = new URL(req.url);
  const monthParam = url.searchParams.get("month") ?? format(new Date(), "yyyy-MM");
  const range = monthRange(monthParam);
  if (!range) {
    return NextResponse.json({ error: "Некорректный месяц (YYYY-MM)" }, { status: 400 });
  }

  const prevStart = new Date(range.start.getFullYear(), range.start.getMonth() - 1, 1);

  const [userResources, monthEntries, prevEntries] = await Promise.all([
    db.select().from(resources).where(eq(resources.userId, session.user.id)),
    db
      .select({ action: historyEntries.action, timestamp: historyEntries.timestamp })
      .from(historyEntries)
      .where(
        and(
          eq(historyEntries.userId, session.user.id),
          gte(historyEntries.timestamp, range.start),
          lt(historyEntries.timestamp, range.end),
        ),
      ),
    db
      .select({ action: historyEntries.action })
      .from(historyEntries)
      .where(
        and(
          eq(historyEntries.userId, session.user.id),
          gte(historyEntries.timestamp, prevStart),
          lt(historyEntries.timestamp, range.start),
        ),
      ),
  ]);

  // per-day activity in the chosen month
  const daysInMonth = new Date(
    range.start.getFullYear(),
    range.start.getMonth() + 1,
    0,
  ).getDate();
  const perDay = Array.from({ length: daysInMonth }, (_, i) => ({
    date: format(new Date(range.start.getFullYear(), range.start.getMonth(), i + 1), "dd.MM"),
    CREATED: 0,
    UPDATED: 0,
    DELETED: 0,
  }));

  const totals = { created: 0, updated: 0, deleted: 0 };
  for (const e of monthEntries) {
    const dayIdx = e.timestamp.getDate() - 1;
    if (dayIdx >= 0 && dayIdx < perDay.length) {
      perDay[dayIdx][e.action] += 1;
    }
    if (e.action === "CREATED") totals.created += 1;
    else if (e.action === "UPDATED") totals.updated += 1;
    else totals.deleted += 1;
  }

  const prevTotals = { created: 0, updated: 0, deleted: 0 };
  for (const e of prevEntries) {
    if (e.action === "CREATED") prevTotals.created += 1;
    else if (e.action === "UPDATED") prevTotals.updated += 1;
    else prevTotals.deleted += 1;
  }

  // category breakdown of current resources
  const catMap = new Map<string, { name: string; count: number; value: number }>();
  let resourcesValue = 0;
  for (const r of userResources) {
    const entry = catMap.get(r.category) ?? { name: r.category, count: 0, value: 0 };
    entry.count += 1;
    entry.value += r.value;
    catMap.set(r.category, entry);
    resourcesValue += r.value;
  }
  const categories = [...catMap.values()].sort((a, b) => b.value - a.value);

  return NextResponse.json({
    month: monthParam,
    totals,
    prevTotals,
    perDay,
    categories,
    resourcesTotal: userResources.length,
    resourcesValue,
  });
}
