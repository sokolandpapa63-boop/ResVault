export type HistoryAction = "CREATED" | "UPDATED" | "DELETED";

export interface ResourceDto {
  id: string;
  title: string;
  category: string;
  value: number;
  unit: string;
  description: string;
  imageUrl: string | null;
  emoji: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResourcePayload {
  title: string;
  category: string;
  value: number;
  unit: string;
  description?: string;
  imageUrl?: string | null;
  emoji?: string | null;
}

export type ChangeMap = Record<string, { from: unknown; to: unknown }>;

export interface HistoryDto {
  id: string;
  resourceId: string | null;
  action: HistoryAction;
  changes: ChangeMap & { __meta?: { title?: string } };
  timestamp: string;
}

export interface StatsDayPoint {
  date: string;
  CREATED: number;
  UPDATED: number;
  DELETED: number;
}

export interface StatsResponse {
  month: string;
  totals: { created: number; updated: number; deleted: number };
  prevTotals: { created: number; updated: number; deleted: number };
  perDay: StatsDayPoint[];
  categories: { name: string; count: number; value: number }[];
  resourcesTotal: number;
  resourcesValue: number;
}
