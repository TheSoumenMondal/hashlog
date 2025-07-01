import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/db.js";
import userRoutes from "./routes/user.routes.js";
import CloudinaryConfig from "./utils/cloudinary.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", userRoutes);

const startServer = async () => {
  await connectDB();
  await CloudinaryConfig();
  app.listen(3000, () => {
    console.log(`Server is Running on http://localhost:${port}`);
  });
};

startServer();
