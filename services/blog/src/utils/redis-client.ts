import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

export const ConnectToRedis = () => {
  redisClient
    .connect()
    .then(() => console.log("Connected to Redis."))
    .catch(console.error);
};
