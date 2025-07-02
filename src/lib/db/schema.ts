import {
  sqliteTable,
  check,
  text,
  numeric,
  real,
  index,
  integer,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const sessions = sqliteTable("sessions", {
  sessionId: text("session_id").primaryKey(),
  createdAt: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  locationName: text("location_name").notNull(),
  latitude: real().notNull(),
  longitude: real().notNull(),
  category: text("category").default(""),
  isActive: numeric("is_active").default(sql`(TRUE)`),
  matchNotified: numeric("match_notified").default(sql`(FALSE)`),
});

export const matches = sqliteTable(
  "matches",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.sessionId, { onDelete: "cascade" }),
    businessId: text("business_id").notNull(),
    matchedAt: numeric("matched_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [index("idx_matches_session").on(table.sessionId)]
);

export const users = sqliteTable("users", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  joinedAt: numeric("joined_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const sessionUsers = sqliteTable("session_users", {
  id: integer().primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.sessionId, { onDelete: "cascade" }),
});

export const votes = sqliteTable(
  "votes",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.sessionId, { onDelete: "cascade" }),
    businessId: text("business_id").notNull(),
    voteType: text("vote_type").notNull(),
    votedAt: numeric("voted_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  () => [check("votes_check_1", sql`vote_type IN ('like', 'dislike')`)]
);
