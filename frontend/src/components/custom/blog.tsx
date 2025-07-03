"use client";

import React from "react";
import BlogCard from "./blog-card";
import { useAppData } from "@/context/app-context";
import { IconLoader3 } from "@tabler/icons-react";

const Blogs = () => {
  const { blogs, loadingFilters } = useAppData();

  if (loadingFilters) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <IconLoader3 className="animate-spin w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {blogs &&
        blogs.length > 0 &&
        blogs.map((blog, index) => <BlogCard {...blog} key={index} />)}
    </div>
  );
};

export default Blogs;
