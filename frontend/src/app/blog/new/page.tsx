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
import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import { author_service } from "@/context/app-context";
import axios from "axios";
import { toast } from "sonner";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export const blogCategory = [
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

const Page = () => {
  const editor = useRef(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [aiTitle, setAiTitle] = useState<boolean>(false);
  const [aiDescription, setAiDescription] = useState<boolean>(false);
  const [aiBlogImproving, setAiBlogImproving] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null as File | null,
    blogcontent: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Start typing...",
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
        toast.success("AI generated a title for you.");
      } else {
        toast.error("AI did not return a valid title.");
      }
    } catch {
      toast.error("Problem while generating title.");
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
        toast.success("AI generated a description for you.");
      } else {
        toast.error("AI did not return a valid description.");
      }
    } catch {
      toast.error("Problem while generating description.");
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
        toast.success("AI improved your blog content.");
      } else {
        toast.error("AI did not return a valid blog.");
      }
    } catch {
      toast.error("Problem while generating blog.");
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
        `${author_service}/api/v1/blog/new`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message || "Blog Created Successfully.");
      setFormData({
        title: "",
        description: "",
        category: "",
        image: null,
        blogcontent: "",
      });
      setContent("");
    } catch {
      toast.error("Error while creating blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Blog</CardTitle>
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
                className={aiTitle ? "bg-green-500 hover:bg-green-600" : ""}
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
                className={
                  aiDescription ? "bg-green-500 hover:bg-green-600" : ""
                }
              >
                <IconRefresh className={aiDescription ? "animate-spin" : ""} />
              </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex flex-row gap-4 w-full md:w-1/2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {blogCategory.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex w-full md:w-full flex-row gap-2">
                <Label htmlFor="image" className="min-w-fit">
                  Upload Image
                </Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div>
              <Label>Blog Content</Label>
              <div className="flex justify-between items-start md:items-center flex-col md:flex-row">
                <blockquote className="mt-4 border-l-2 pl-6 text-[14px]">
                  Paste your blog or type here. You can use rich text
                  formatting.
                  <br />
                  <span className="text-red-600">
                    Note: Please add images only after improving your grammar.
                  </span>
                </blockquote>
                <Button
                  size="sm"
                  type="button"
                  className="w-full mt-4 md:w-fit"
                  onClick={aiBlogResponse}
                  disabled={aiBlogImproving}
                >
                  <IconRefresh
                    className={aiBlogImproving ? "animate-spin" : ""}
                  />
                  Fix and Improve Writing
                </Button>
              </div>
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

            <Button type="submit" disabled={loading} className="mt-4 w-full">
              {loading ? "Creating Blog..." : "Create New Blog"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
