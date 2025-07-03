import { Request, Response } from "express";
import { db } from "../db/db.js";
import { blogs, comments, savedBlogs } from "../db/schema.js";
import { Trycatch } from "../utils/try-catch-handler.js";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import axios from "axios";
import { redisClient } from "../utils/redis-client.js";
import { AuthenticatedRequest } from "../middleware/isauth.js";

export const getAllBlogs = Trycatch(async (req: Request, res: Response) => {
  const { searchQuery = "", category = "" } = req.query;
  const cacheKey = `blogs:${searchQuery}:${category}`;

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }

  const conditions = [];
  if (typeof searchQuery === "string" && searchQuery.trim()) {
    conditions.push(
      or(
        ilike(blogs.title, `%${searchQuery}%`),
        ilike(blogs.description, `%${searchQuery}%`)
      )
    );
  }
  if (typeof category === "string" && category.trim()) {
    conditions.push(eq(blogs.category, category));
  }

  let allBlogs;
  if (conditions.length > 0) {
    allBlogs = await db
      .select()
      .from(blogs)
      .where(and(...conditions))
      .orderBy(desc(blogs.createdAt));
  } else {
    allBlogs = await db.select().from(blogs).orderBy(desc(blogs.createdAt));
  }

  await redisClient.set(cacheKey, JSON.stringify(allBlogs), { EX: 3600 });

  res.json(allBlogs);
});

export const getSingleBlog = Trycatch(async (req: Request, res: Response) => {
  const { id } = req.params;
  const cacheKey = `blog:${id}`;

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }

  const blogResult = await db.select().from(blogs).where(eq(blogs.id, id));
  if (blogResult.length === 0) {
    return res.status(404).json({ message: "Blog not found" });
  }

  const blog = blogResult[0];
  let author = null;
  let warning = null;

  try {
    const response = await axios.get(
      `${process.env.USER_SERVICE}/api/v1/user/${blog.author}`
    );
    author = response.data;
  } catch (error: any) {
    warning = "Author info could not be fetched";
  }

  const result = { blog, author, warning };

  await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 });

  res.json(result);
});

//Add Comment
export const addComment = Trycatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id: blogId } = req.params;
    const { comment, parentComment } = req.body;
    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }
    if (parentComment && typeof parentComment !== "string") {
      return res.status(400).json({ message: "Invalid parent comment ID" });
    }

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing user info" });
    }

    if (!req.user._id) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    if (!req.user.name) {
      return res.status(400).json({ message: "Username is missing" });
    }
    await db
      .insert(comments)
      .values({
        comment: comment.trim(),
        userId: req.user._id,
        username: req.user.name,
        blogId: blogId,
        parentComment: parentComment || null,
      })
      .returning();

    return res.status(201).json({ message: "Comment added successfully" });
  }
);

export const getAllComments = Trycatch(async (req, res) => {
  const { id } = req.params;
  const comment = await db
    .select()
    .from(comments)
    .where(eq(comments.blogId, id));
  res.json(comment);
});

export const deleteComment = Trycatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    console.log("Hello");

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid comment ID" });
    }
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const comment = await db.select().from(comments).where(eq(comments.id, id));

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment[0].userId !== req.user._id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can't delete this comment" });
    }

    // First delete all replies (comments that have this comment as parent)
    await db.delete(comments).where(eq(comments.parentComment, id));

    // Then delete the comment itself
    const deleted = await db.delete(comments).where(eq(comments.id, id));

    if (deleted.rowCount === 0) {
      return res.status(500).json({ message: "Failed to delete comment" });
    }

    return res.json({ message: "Comment and replies deleted successfully" });
  }
);

export const bookmarkBlog = Trycatch(async (req: AuthenticatedRequest, res) => {
  const { blogid } = req.params;
  const userId = req.user?._id;

  // Validation
  if (
    !blogid ||
    typeof blogid !== "string" ||
    !userId ||
    typeof userId !== "string"
  ) {
    return res
      .status(400)
      .json({ message: "Missing or invalid blogId or userId" });
  }

  try {
    // Ensure proper UUID format - cast to string explicitly
    const blogIdStr = String(blogid);
    const userIdStr = String(userId);

    const existing = await db
      .select()
      .from(savedBlogs)
      .where(
        and(eq(savedBlogs.blogId, blogIdStr), eq(savedBlogs.userId, userIdStr))
      );

    if (existing.length === 0) {
      await db.insert(savedBlogs).values({
        userId: userIdStr,
        blogId: blogIdStr,
      });
      return res.status(200).json({ message: "Blog bookmarked" });
    } else {
      await db
        .delete(savedBlogs)
        .where(
          and(
            eq(savedBlogs.blogId, blogIdStr),
            eq(savedBlogs.userId, userIdStr)
          )
        );
      return res.status(200).json({ message: "Bookmark removed" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Database operation failed" });
  }
});

export const getAllSavedBlogs = Trycatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ message: "Invalid or missing user ID" });
    }

    try {
      // Get all saved blog entries by this user
      const saved = await db
        .select()
        .from(savedBlogs)
        .where(eq(savedBlogs.userId, userId));

      const blogData = saved;

      return res.status(200).json(blogData);
    } catch (error) {
      console.error("Error fetching saved blogs:", error);
      return res.status(500).json({ message: "Failed to fetch saved blogs" });
    }
  }
);
