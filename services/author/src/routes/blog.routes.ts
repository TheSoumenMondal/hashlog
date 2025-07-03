import { Router } from "express";
import { isAuth } from "../middleware/isAuth.js";
import uploadFile from "../middleware/multer.js";
import {
  aiBlogResponse,
  createBlog,
  deleteBlog,
  generateAiDescription,
  generateAiTitle,
  updateBlog,
} from "../controllers/blog.controller.js";
const router = Router();

router.post("/blog/new", isAuth, uploadFile, createBlog);
router.post("/blog/update/:id", isAuth, uploadFile, updateBlog);
router.delete("/blog/:id", isAuth, deleteBlog);
router.post("/ai/title", generateAiTitle);
router.post("/ai/description", generateAiDescription);
router.post("/ai/blog", aiBlogResponse);

export default router;
