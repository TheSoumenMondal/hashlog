import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  blogTable,
  commentsTable,
  InsertBlog,
  savedBlogs,
} from "../db/schema.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/data-uri.js";
import { Trycatch } from "../utils/try-catch-handler.js";
import { v2 as cloudinary } from "cloudinary";
import { extractPublicId } from "../utils/extract-public-id.js"; // ✅ Import this

export const createBlog = Trycatch(async (req: AuthenticatedRequest, res) => {
  const { title, description, blogcontent, category } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file to upload" });
  }

  const fileBuffer = getBuffer(file);
  if (!fileBuffer?.content) {
    return res.status(400).json({ message: "Failed to generate buffer." });
  }

  const cloudinaryResult = await cloudinary.uploader.upload(
    fileBuffer.content,
    {
      folder: "author_hashlog",
    }
  );

  if (!req.user?._id) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  const newBlog: InsertBlog = {
    title,
    description,
    blogcontent,
    category,
    image: cloudinaryResult.secure_url,
    author: req.user._id,
    createdAt: new Date(),
  };

  const result = await db.insert(blogTable).values(newBlog).returning();

  res.status(201).json({
    message: "Blog created successfully",
    blog: result[0],
  });
});

export const updateBlog = Trycatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, blogcontent, category } = req.body;
  const file = req.file;

  const blog = await db.select().from(blogTable).where(eq(blogTable.id, id));
  if (!blog || blog.length === 0) {
    return res.status(404).json({ message: "No Blog with this ID" });
  }

  if (blog[0].author !== req.user?._id) {
    return res
      .status(401)
      .json({ message: "You are not author of this Blog." });
  }

  let imageUrl = blog[0].image;

  if (file) {
    const publicId = extractPublicId(blog[0].image!);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
      return res.status(400).json({ message: "Failed to generate buffer." });
    }

    const cloudinaryResult = await cloudinary.uploader.upload(
      fileBuffer.content,
      {
        folder: "author_hashlog",
      }
    );

    imageUrl = cloudinaryResult.secure_url;
  }

  const updatedBlog = await db
    .update(blogTable)
    .set({
      image: imageUrl,
      title: title || blog[0].title,
      description: description || blog[0].description,
      blogcontent: blogcontent || blog[0].blogcontent,
      category: category || blog[0].category,
    })
    .where(eq(blogTable.id, id))
    .returning();

  res.status(201).json({
    message: "Blog Updated Successfully.",
    blog: updatedBlog[0],
  });
});

export const deleteBlog = Trycatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const blog = await db.select().from(blogTable).where(eq(blogTable.id, id));
  if (!blog || blog.length === 0) {
    res.status(404).json({ message: "No Blog with this ID" });
    return;
  }

  if (blog[0].author !== req.user?._id) {
    return res
      .status(401)
      .json({ message: "You are not author of this Blog." });
  }

  const publicId = extractPublicId(blog[0].image!);
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }

  await db.delete(commentsTable).where(eq(commentsTable.blogId, id));
  await db.delete(savedBlogs).where(eq(savedBlogs.blogId, id));
  await db.delete(blogTable).where(eq(blogTable.id, id));

  res.status(200).json({
    message: "Blog Deleted Successfully",
  });
});
