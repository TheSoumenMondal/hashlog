import amqp from "amqplib";
import { redisClient } from "./redis-client.js";
import { db } from "../db/db.js";
import { blogs } from "../db/schema.js";
import { desc } from "drizzle-orm";

interface CacheInvalidationMessage {
  action: string;
  keys: string[];
}

let channel: amqp.Channel;

export const startCacheConsumer = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOSTNAME,
      port: Number(process.env.RABBITMQ_PORT),
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });

    channel = await connection.createChannel();
    console.log("✅ Connected to RabbitMQ");

    const queueName = "cache-invalidation";

    await channel.assertQueue(queueName, { durable: true });

    console.log("📬 Cache consumer started in blog service");

    channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(
          msg.content.toString()
        ) as CacheInvalidationMessage;

        console.log("📥 Blog service received:", content);

        if (content.action === "invalidateCache") {
          for (const pattern of content.keys) {
            const keys = await redisClient.keys(pattern);

            if (keys.length > 0) {
              await redisClient.del(keys);
              console.log(
                `🧹 Invalidated ${keys.length} Redis keys matching "${pattern}"`
              );
            }

            if (pattern === "blogs:*:*" || pattern === "blogs::") {
              const allBlogs = await db
                .select()
                .from(blogs)
                .orderBy(desc(blogs.createdAt));

              const cacheKey = `blogs::`;
              await redisClient.set(cacheKey, JSON.stringify(allBlogs), {
                EX: 3600,
              });

              console.log(`♻️ Rebuilt cache for key ${cacheKey}`);
            }
          }
        }

        channel.ack(msg);
      } catch (error) {
        console.error("❌ Error processing cache invalidation:", error);
        channel.nack(msg, false, true);
      }
    });
  } catch (error) {
    console.error("❌ Failed to start RabbitMQ consumer:", error);
  }
};
