"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconRefresh } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { author_service, blog_service } from "@/context/app-context";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const blogCategory = [
  "Technology",
  "Health",
  "Travel",
  "Food",
  "Finance",
  "Education",
  "Lifestyle",
  "Business",
  "Entertainment",
  "Sports",
  "Science",
  "Politics",
  "Art",
  "Fashion",
  "Environment",
];

const EditBlogPage = () => {
  const { id } = useParams();
  const editor = useRef(null);

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [aiTitle, setAiTitle] = useState(false);
  const [aiDescription, setAiDescription] = useState(false);
  const [aiBlogImproving, setAiBlogImproving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null as File | null,
    blogcontent: "",
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = Cookies.get("token");

        console.log(token);

        const { data } = await axios.get(`${blog_service}/api/v1/blogs/${id}`);

        const { title, description, category, blogcontent } = data.blog;

        setFormData({
          title,
          description,
          category,
          image: null,
          blogcontent,
        });
        setContent(blogcontent);
      } catch {
        toast.error("Failed to fetch blog data.");
      }
    };

    if (id) fetchBlog();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Edit your blog content...",
    }),
    []
  );

  const aiTitleResponse = async () => {
    try {
      setAiTitle(true);
      const { data } = await axios.post(`${author_service}/api/v1/ai/title`, {
        text: formData.title || "Generate a blog title",
      });
      if (data?.title) {
        setFormData((prev) => ({ ...prev, title: data.title }));
        toast.success("AI updated the title.");
      } else toast.error("Invalid AI title.");
    } catch {
      toast.error("AI title generation failed.");
    } finally {
      setAiTitle(false);
    }
  };

  const aiDescriptionResponse = async () => {
    try {
      setAiDescription(true);
      const { data } = await axios.post(
        `${author_service}/api/v1/ai/description`,
        {
          title: formData.title,
          description: formData.description,
        }
      );
      if (data?.airesponse) {
        setFormData((prev) => ({ ...prev, description: data.airesponse }));
        toast.success("AI updated the description.");
      } else toast.error("Invalid AI description.");
    } catch {
      toast.error("AI description generation failed.");
    } finally {
      setAiDescription(false);
    }
  };

  const aiBlogResponse = async () => {
    try {
      setAiBlogImproving(true);
      const { data } = await axios.post(`${author_service}/api/v1/ai/blog`, {
        blog: content,
      });
      if (data?.html) {
        setContent(data.html);
        setFormData((prev) => ({ ...prev, blogcontent: data.html }));
        toast.success("Blog content improved.");
      } else toast.error("AI failed to improve blog.");
    } catch {
      toast.error("AI blog enhancement failed.");
    } finally {
      setAiBlogImproving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("blogcontent", formData.blogcontent);
    if (formData.image) {
      formDataToSend.append("file", formData.image);
    }

    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${author_service}/api/v1/blog/update/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message || "Blog updated successfully.");
    } catch {
      toast.error("Error updating blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Blog</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-row gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              <Button
                size="icon"
                onClick={aiTitleResponse}
                type="button"
                disabled={aiTitle}
              >
                <IconRefresh className={aiTitle ? "animate-spin" : ""} />
              </Button>
            </div>

            <div className="flex flex-row gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
              <Button
                size="icon"
                onClick={aiDescriptionResponse}
                type="button"
                disabled={aiDescription}
              >
                <IconRefresh className={aiDescription ? "animate-spin" : ""} />
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-row gap-2 w-full md:w-1/2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {blogCategory.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex w-full md:w-1/2 gap-2">
                <Label htmlFor="image">Change Image</Label>
                <Input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Blog Content</Label>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <blockquote className="text-sm border-l-2 pl-4">
                  You can edit your blog content below.
                </blockquote>
                <Button
                  size="sm"
                  type="button"
                  onClick={aiBlogResponse}
                  disabled={aiBlogImproving}
                  className="mt-2 md:mt-0"
                >
                  <IconRefresh
                    className={aiBlogImproving ? "animate-spin" : ""}
                  />
                  Improve Writing
                </Button>
              </div>
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1}
                onBlur={(newContent) => {
                  setContent(newContent);
                  setFormData((prev) => ({ ...prev, blogcontent: newContent }));
                }}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-4">
              {loading ? "Updating..." : "Update Blog"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditBlogPage;
