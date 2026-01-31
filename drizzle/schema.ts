import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const uploadedFiles = mysqlTable("uploaded_files", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileKey: varchar("file_key", { length: 512 }).notNull(),
  fileSize: int("file_size").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(), // 'csv' or 'xlsx'
  rowCount: int("row_count").notNull(),
  columnCount: int("column_count").notNull(),
  columnNames: text("column_names").notNull(), // JSON array
  columnTypes: text("column_types").notNull(), // JSON object
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = typeof uploadedFiles.$inferInsert;

export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  fileId: int("file_id").notNull(),
  analysisType: varchar("analysis_type", { length: 50 }).notNull(), // 'statistics', 'chart', 'filter'
  analysisName: varchar("analysis_name", { length: 255 }).notNull(),
  analysisData: text("analysis_data").notNull(), // JSON
  insights: text("insights"), // JSON with AI-generated insights
  anomalies: text("anomalies"), // JSON with detected anomalies
  recommendations: text("recommendations"), // JSON with recommendations
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

export const statistics = mysqlTable("statistics", {
  id: int("id").autoincrement().primaryKey(),
  analysisId: int("analysis_id").notNull(),
  columnName: varchar("column_name", { length: 255 }).notNull(),
  columnType: varchar("column_type", { length: 50 }).notNull(),
  mean: text("mean"), // JSON for numeric values
  median: text("median"),
  stdDev: text("std_dev"),
  min: text("min"),
  max: text("max"),
  count: int("count"),
  nullCount: int("null_count"),
  uniqueCount: int("unique_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Statistic = typeof statistics.$inferSelect;
export type InsertStatistic = typeof statistics.$inferInsert;