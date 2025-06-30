import mongoose from "mongoose";

const MONGODB_URI: string =
  process.env.MONGODB_URI || "mongodb://localhost:27017/blog";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: "blog",
    });

    console.log("🟢 Connected to MongoDB at:", conn.connection.host);
  } catch (error) {
    console.error("🔴 MongoDB connection error:", error);
    process.exit(1);
  }
};
