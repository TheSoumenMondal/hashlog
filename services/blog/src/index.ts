import express from "express";
import dotenv from "dotenv";
import blogRoutes from "./routes/blog.route.js";
import { ConnectToRedis } from "./utils/redis-client.js";
import { startCacheConsumer } from "./utils/consumer.js";
import cors from "cors"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;
app.use(cors({
  origin : process.env.CORS_ORIGIN
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", blogRoutes);

const startServer = async () => {
  ConnectToRedis();
  await startCacheConsumer();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();
