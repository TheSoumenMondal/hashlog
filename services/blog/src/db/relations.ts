import { relations } from "drizzle-orm/relations";
import { blogs, comments, savedBlogs } from "./schema.js";

export const commentsRelations = relations(comments, ({one}) => ({
	blog: one(blogs, {
		fields: [comments.blogId],
		references: [blogs.id]
	}),
}));

export const blogsRelations = relations(blogs, ({many}) => ({
	comments: many(comments),
	savedBlogs: many(savedBlogs),
}));

export const savedBlogsRelations = relations(savedBlogs, ({one}) => ({
	blog: one(blogs, {
		fields: [savedBlogs.blogId],
		references: [blogs.id]
	}),
}));