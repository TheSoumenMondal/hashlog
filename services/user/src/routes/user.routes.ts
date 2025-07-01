import express from "express";
import {
  getUserProfile,
  logInUser,
  myProfile,
  registerUser,
  updateProfilePic,
  updateUser,
} from "../controllers/user.controller.js";
import { isAuth } from "../middleware/auth-middleware.js";
import { Trycatch } from "../utils/try-catch-handler.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();

router.post("/login", Trycatch(logInUser));
router.post("/register", Trycatch(registerUser));
router.get("/me", isAuth, myProfile);
router.get("/user/:id", getUserProfile);
router.post("/user/update", isAuth, updateUser);
router.post("/user/update/pic", isAuth, uploadFile, updateProfilePic);

export default router;
