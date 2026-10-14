import { NextResponse } from "next/server";
import { and, desc, eq, gte, lt, type SQL } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { historyEntries } from "@/db/schema";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const conds: SQL[] = [eq(historyEntries.userId, session.user.id)];
  if (action === "CREATED" || action === "UPDATED" || action === "DELETED") {
    conds.push(eq(historyEntries.action, action));
  }
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
    conds.push(gte(historyEntries.timestamp, new Date(`${from}T00:00:00`)));
  }
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    const end = new Date(`${to}T00:00:00`);
    end.setDate(end.getDate() + 1);
    conds.push(lt(historyEntries.timestamp, end));
  }

  const rows = await db
    .select()
    .from(historyEntries)
    .where(and(...conds))
    .orderBy(desc(historyEntries.timestamp))
    .limit(300);

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      resourceId: r.resourceId,
      action: r.action,
      changes: r.changes,
      timestamp: r.timestamp.toISOString(),
    })),
  );
}
