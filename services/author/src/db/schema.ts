import { pgTable, text, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const blogTable = pgTable("blogs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  blogcontent: text("blogcontent").notNull(),
  image: text("image"),
  category: varchar("category", { length: 100 }),
  author: varchar("author", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const commentsTable = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  comment: text("comment").notNull(),
  userId: varchar("user_id").notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  blogId: uuid("blog_id")
    .notNull()
    .references(() => blogTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  parentId: uuid("parent_comment"),
});

export const savedBlogs = pgTable("saved_blogs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  blogId: uuid("blog_id")
    .notNull()
    .references(() => blogTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogRelations = relations(blogTable, ({ many }) => ({
  comments: many(commentsTable),
  savedByUsers: many(savedBlogs),
}));

export const commentRelations = relations(commentsTable, ({ one, many }) => ({
  blog: one(blogTable, {
    fields: [commentsTable.blogId],
    references: [blogTable.id],
  }),
  parent: one(commentsTable, {
    fields: [commentsTable.parentId],
    references: [commentsTable.id],
  }),
  replies: many(commentsTable, {
    relationName: "replies",
  }),
}));

export const savedBlogRelations = relations(savedBlogs, ({ one }) => ({
  blog: one(blogTable, {
    fields: [savedBlogs.blogId],
    references: [blogTable.id],
  }),
}));

export type InsertBlog = typeof blogTable.$inferInsert;
export type InsertComment = typeof commentsTable.$inferInsert;
export type InsertSavedBlogs = typeof savedBlogs.$inferInsert;
