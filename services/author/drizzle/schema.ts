import { pgTable, foreignKey, uuid, text, timestamp, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const savedBlogs = pgTable("saved_blogs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	blogId: uuid("blog_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.blogId],
			foreignColumns: [blogs.id],
			name: "saved_blogs_blog_id_blogs_id_fk"
		}).onDelete("cascade"),
]);

export const blogs = pgTable("blogs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	blogcontent: text().notNull(),
	image: text(),
	category: varchar({ length: 100 }),
	author: varchar({ length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const comments = pgTable("comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	comment: text().notNull(),
	userId: varchar("user_id").notNull(),
	username: varchar({ length: 255 }).notNull(),
	blogId: uuid("blog_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	parentComment: uuid("parent_comment"),
}, (table) => [
	foreignKey({
			columns: [table.blogId],
			foreignColumns: [blogs.id],
			name: "comments_blog_id_blogs_id_fk"
		}).onDelete("cascade"),
]);
