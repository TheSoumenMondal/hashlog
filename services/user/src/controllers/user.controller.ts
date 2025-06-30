import { Request, Response } from "express";
import User from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { checkPassword, generateHashPassword } from "../utils/password.js";
import { Trycatch } from "../utils/try-catch-handler.js";
import { AuthenticatedRequest } from "../middleware/auth-middleware.js";

export const logInUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
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

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "10d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error: any) {
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

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "10d" }
    );

    return res.status(201).json({
      message: "Registration successful.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
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
    res.status(404).json({
      message: "No user with this ID.",
    });
    return;
  }
  res.json({ user });
});

export const updateUser = Trycatch(async (req: AuthenticatedRequest, res) => {
  const { name, instagram, facebook, linkedin, bio, github, youtube } =
    req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user?.id,
    { name, bio, instagram, facebook, linkedin, github, youtube },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found." });
  }

  const token = jwt.sign(
    { id: updatedUser._id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "10d",
    }
  );

  res.status(200).json({ user: updatedUser, token });
});
