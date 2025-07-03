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
import { extractPublicId } from "../utils/extract-public-id.js";
import { invalidateCacheJob } from "../utils/rabbitmq.js";
import { GoogleGenAI } from "@google/genai";

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

  await invalidateCacheJob(["blogs*"]);

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

  await invalidateCacheJob(["blogs*", `blog:${id}`]);

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

  await invalidateCacheJob(["blogs*", `blog${id}`]);
  res.status(200).json({
    message: "Blog Deleted Successfully",
  });
});

export const generateAiTitle = Trycatch(async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ message: "Text is required." });
  }

  const prompt = `Correct the grammar of the following blog title and return only the corrected title without any additional text, formatting, or symbols. You may also improve the title: ${text}`;

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ message: "No text returned by AI." });
    }

    const cleanedTitle = rawText
      .replace(/\*\*/g, "")
      .replace(/[\r\n]+/g, "")
      .replace(/[*_`~]/g, "")
      .trim();

    return res.status(200).json({ title: cleanedTitle });
  } catch (err) {
    console.error("AI title generation error:", err);
    return res.status(500).json({ message: "Error generating AI title." });
  }
});

export const generateAiDescription = Trycatch(async (req, res) => {
  const { title, description } = req.body;

  if (
    (!title && !description) ||
    (typeof title !== "string" && typeof description !== "string")
  ) {
    return res
      .status(400)
      .json({ message: "Title or description are required." });
  }

  const prompt = title
    ? `Generate only one short blog description based on this title: ${title}. Your response should be a single sentence, no longer than 35 words. Do not include options, greetings, explanations, or extra text.`
    : `Fix the grammar in the following blog description and return only the corrected sentence. Do not add anything extra: ${description}`;

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ message: "No text returned by AI." });
    }

    const cleanedTitle = rawText
      .replace(/\*\*/g, "")
      .replace(/[\r\n]+/g, "")
      .replace(/[*_`~]/g, "")
      .trim();

    return res.status(200).json({ airesponse: cleanedTitle });
  } catch (err) {
    console.error("AI title generation error:", err);
    return res.status(500).json({ message: "Error generating AI title." });
  }
});

export const aiBlogResponse = Trycatch(async (req, res) => {
  const prompt = `You are a grammar correction and improvement engine. I will provide you with blog content in rich HTML format from the Jodit editor. Keep the original ideas the same, correct any spelling and grammar mistakes, but do not alter the HTML tags, formatting, or structural tags—maintain inline styles, image tags, line breaks, and structural tags exactly as they are. Return the fully corrected and improved HTML string as output.`;

  const { blog } = await req.body;
  if (!blog) {
    res.status(400).json({
      message: "Please provide blog.",
    });
    return;
  }

  const fullMessage = `${prompt}\n\n${blog}`;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: fullMessage,
  });

  const responseText = response.text || "";

  const cleanedBlog = responseText
    .replace(/^(html|```html|```)\n?/i, "")
    .replace(/```$/i, "")
    .replace(/\*\*/g, "")
    .replace(/[\r\n]+/g, "")
    .replace(/[*_`~]/g, "")
    .trim();

  res.status(200).json({
    html: cleanedBlog,
  });
});
