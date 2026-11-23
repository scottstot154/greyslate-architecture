import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { Project, Studio } from "../lib/portfolio";

export const projects = sqliteTable("projects", {
  slug: text().primaryKey(),
  content: text({ mode: "json" }).$type<Project>().notNull(),
  published: integer({ mode: "boolean" }).notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const settings = sqliteTable("settings", {
  id: integer().primaryKey(),
  content: text({ mode: "json" }).$type<Studio>().notNull(),
});
