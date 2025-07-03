import express from "express";
import dotenv from "dotenv";
import blogRoutes from "./routes/blog.routes.js";
import CloudinaryConfig from "./utils/cloudinary.js";
import { connectToRabbitMQ } from "./utils/rabbitmq.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors({
  origin : process.env.CORS_ORIGIN
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.send("PONG");
});

app.use("/api/v1", blogRoutes);

const startServer = async () => {
  try {
    await connectToRabbitMQ();
    await CloudinaryConfig();

    app.listen(PORT, () => {
      console.log(`Server running at: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
};

startServer();
