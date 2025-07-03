import amqp from "amqplib";

let channel: amqp.Channel;

export const connectToRabbitMQ = async () => {
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
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ:", error);
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.error("❌ RabbitMQ channel not initialized");
    return;
  }

  await channel.assertQueue(queueName, { durable: true });

  const sent = channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify(message)),
    {
      persistent: true,
    }
  );

  if (!sent) {
    console.warn(`⚠️ Message not sent to queue ${queueName}`);
  }
};

export const invalidateCacheJob = async (cacheKeys: string[]) => {
  try {
    const message = {
      action: "invalidateCache",
      keys: cacheKeys,
    };

    await publishToQueue("cache-invalidation", message);
    console.log("🧹 Cache invalidation job published to RabbitMQ");
  } catch (error) {
    console.error("❌ Failed to publish cache invalidation job:", error);
  }
};
