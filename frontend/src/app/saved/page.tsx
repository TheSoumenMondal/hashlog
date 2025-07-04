"use client";

import { blog_service, useAppData } from "@/context/app-context";
import { blogType } from "@/types/type";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";

export interface SavedBlogsType {
  id: string;
  userId: string;
  blogId: string;
  createdAt: string;
}

const SavedBlogs = () => {
  const { blogs } = useAppData();
  const [filteredBlogs, setFilteredBlogs] = useState<blogType[]>([]);

  const getAllSavedBlogs = async () => {
    try {
      const token = Cookies.get("token");
      const { data: saves } = await axios.get(`${blog_service}/api/v1/save`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const matchedBlogs = blogs?.filter((blog) =>
        saves.some((saved: SavedBlogsType) => saved.blogId === blog.id)
      );

      setFilteredBlogs(matchedBlogs || []);
    } catch (error) {
      toast.error("Something went wrong while fetching saved blogs.");
    }
  };

  useEffect(() => {
    getAllSavedBlogs();
  }, [blogs]);

  if (filteredBlogs.length === 0) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center text-lg font-medium">
        No Saved Blogs Available
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {filteredBlogs.map((blog) => (
        <div
          key={blog.id}
          className="bg-secondary rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
        >
          <Link href={`/blog/${blog.id}`}>
            <Image
              src={blog.image}
              alt={blog.title}
              width={500}
              height={300}
              className="w-full h-48 object-cover"
            />
          </Link>
          <div className="p-4 flex flex-col flex-grow">
            <Link href={`/blog/${blog.id}`}>
              <h2 className="text-lg font-semibold  hover:underline line-clamp-2">
                {blog.title}
              </h2>
            </Link>
            <p className="text-sm  mt-2 line-clamp-3">{blog.description}</p>
            <div className="mt-auto pt-4 flex items-center justify-between text-xs ">
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedBlogs;
