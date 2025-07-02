"use client";

import React, { useState, useEffect } from "react";
import BlogCard from "./blog-card";
import axios from "axios";
import { blogType } from "@/types/type";

const Blogs = () => {
  const [blogs, setBlogs] = useState<blogType[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/blogs/all`
        );
        setBlogs(response.data);
      } catch (error) {
        console.warn("Failed to fetch blog data.");
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="w-full flex flex-col gap-2">
      {blogs.length > 0 &&
        blogs.map((blog, index) => <BlogCard {...blog} key={index} />)}
    </div>
  );
};

export default Blogs;
