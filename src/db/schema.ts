import {
  pgTable,
  pgEnum,
  uuid,
  text,
  doublePrecision,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const resources = pgTable(
  "resources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull(),
    value: doublePrecision("value").notNull().default(0),
    unit: text("unit").notNull().default("шт"),
    description: text("description").notNull().default(""),
    imageUrl: text("image_url"),
    emoji: text("emoji"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("resources_user_idx").on(t.userId)],
);

export const historyActionEnum = pgEnum("history_action", [
  "CREATED",
  "UPDATED",
  "DELETED",
]);

export const historyEntries = pgTable(
  "history_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resourceId: uuid("resource_id"),
    action: historyActionEnum("action").notNull(),
    changes: jsonb("changes").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("history_user_idx").on(t.userId),
    index("history_ts_idx").on(t.timestamp),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type ResourceRow = typeof resources.$inferSelect;
export type HistoryRow = typeof historyEntries.$inferSelect;
