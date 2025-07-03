import { Request, Response } from "express";
import User from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { checkPassword, generateHashPassword } from "../utils/password.js";
import { Trycatch } from "../utils/try-catch-handler.js";
import { AuthenticatedRequest } from "../middleware/auth-middleware.js";
import getBuffer from "../utils/data-uri.js";
import { v2 as cloudinary } from "cloudinary";
import { oauth2clint } from "../utils/google.config.js";
import axios from "axios";

const sanitizeUser = (userDoc: any) => {
  const user = userDoc.toObject();
  delete user.password;
  return user;
};

interface GoogleUserData {
  email: string;
  name: string;
  picture: string;
}

export const logInUser = async (req: Request, res: Response) => {
  try {
    const { email, password, code } = req.body;

    // === Google OAuth login ===
    if (code) {
      const googleRes = await oauth2clint.getToken(code);
      oauth2clint.setCredentials(googleRes.tokens);

      const userRes = await axios.get<GoogleUserData>(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
      );

      const { email, name, picture } = userRes.data;

      let user = await User.findOne({ email });

      if (!user) {
        // Auto-register the user
        user = await User.create({
          name,
          email,
          image: picture,
          password: "", // Empty password since using Google
        });
      }

      const safeUser = sanitizeUser(user);
      const token = jwt.sign(safeUser, process.env.JWT_SECRET as string, {
        expiresIn: "10d",
      });

      return res.status(200).json({
        message: "Google login successful.",
        user: safeUser,
        token,
      });
    }

    // === Traditional email/password login ===
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isMatch = await checkPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const safeUser = sanitizeUser(user);
    const token = jwt.sign(safeUser, process.env.JWT_SECRET as string, {
      expiresIn: "10d",
    });

    return res.status(200).json({
      message: "Login successful.",
      user: safeUser,
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error.",
    });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists.",
      });
    }

    const hashedPassword = await generateHashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const safeUser = sanitizeUser(newUser);

    const token = jwt.sign(safeUser, process.env.JWT_SECRET as string, {
      expiresIn: "10d",
    });

    return res.status(201).json({
      message: "Registration successful.",
      user: safeUser,
      token,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Internal server error.",
    });
  }
};

export const myProfile = Trycatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  res.json(user);
});

export const getUserProfile = Trycatch(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res.status(404).json({
      message: "No user with this ID.",
    });
  }
  res.json({ user });
});

export const updateUser = Trycatch(async (req: AuthenticatedRequest, res) => {
  const { name, instagram, facebook, linkedin, bio, github, youtube } =
    req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    { name, bio, instagram, facebook, linkedin, github, youtube },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found." });
  }

  const safeUser = sanitizeUser(updatedUser);

  const token = jwt.sign(safeUser, process.env.JWT_SECRET as string, {
    expiresIn: "10d",
  });

  res.status(200).json({ user: safeUser, token });
});

export const updateProfilePic = Trycatch(
  async (req: AuthenticatedRequest, res) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({
        message: "No file to upload.",
      });
      return;
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
      res.status(400).json({
        message: "Failed to generate buffer.",
      });
      return;
    }

    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
      folder: "blog_hashlog",
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        image: cloud.secure_url,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const safeUser = sanitizeUser(updatedUser);

    const token = jwt.sign({ safeUser }, process.env.JWT_SECRET as string, {
      expiresIn: "10d",
    });

    res.status(201).json({
      message: "Profile photo updated successfully.",
      token,
      user: safeUser,
    });
  }
);
