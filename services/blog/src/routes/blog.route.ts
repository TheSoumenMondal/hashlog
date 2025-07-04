import { Router } from "express";
import {
  addComment,
  bookmarkBlog,
  deleteComment,
  getAllBlogs,
  getAllComments,
  getAllSavedBlogs,
  getSingleBlog,
} from "../controllers/blog.controller.js";
import { isAuth } from "../middleware/isauth.js";

const router = Router();

router.get("/blogs/all", getAllBlogs);
router.get("/blogs/:id", getSingleBlog);
router.post("/comment/:id", isAuth, addComment);
router.get("/comment/:id", getAllComments);
router.delete("/comment/:id", isAuth, deleteComment);
router.post("/save/:blogid", isAuth, bookmarkBlog);
router.get("/save", isAuth, getAllSavedBlogs);


export default router;