import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/db.js";
import userRoutes from "./routes/user.routes.js";
import CloudinaryConfig from "./utils/cloudinary.js";
import cors from "cors";

dotenv.config({});

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
const port = process.env.PORT || 7001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", userRoutes);

const startServer = async () => {
  await connectDB();
  await CloudinaryConfig();
  app.listen(port, () => {
    console.log(`Server is Running on http://localhost:${port}`);
  });
};

startServer();