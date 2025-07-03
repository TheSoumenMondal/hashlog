import { relations } from "drizzle-orm/relations";
import { blogs, savedBlogs, comments } from "./schema";

export const savedBlogsRelations = relations(savedBlogs, ({one}) => ({
	blog: one(blogs, {
		fields: [savedBlogs.blogId],
		references: [blogs.id]
	}),
}));

export const blogsRelations = relations(blogs, ({many}) => ({
	savedBlogs: many(savedBlogs),
	comments: many(comments),
}));

export const commentsRelations = relations(comments, ({one}) => ({
	blog: one(blogs, {
		fields: [comments.blogId],
		references: [blogs.id]
	}),
}));