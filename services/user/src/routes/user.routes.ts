import express from "express";
import {
  getUserProfile,
  logInUser,
  myProfile,
  registerUser,
  updateUser,
} from "../controllers/user.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { isAuth } from "../middleware/auth-middleware.js";

const router = express.Router();

router.post("/login", asyncHandler(logInUser));
router.post("/register", asyncHandler(registerUser));
router.get("/me", isAuth, myProfile);
router.get("/user/:id", getUserProfile);
router.post("/user/update",isAuth,updateUser)

export default router;
