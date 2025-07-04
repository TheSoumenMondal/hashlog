"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconBookmark,
  IconBookmarkPlus,
  IconLink,
  IconLoader3,
  IconMessage,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import axios from "axios";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
  author_service,
  blog_service,
  useAppData,
} from "@/context/app-context";
import { SavedBlogsType } from "@/app/saved/page";
import { blogType } from "@/types/type";
import { motion } from "framer-motion";

type CommentType = {
  id: string;
  comment: string;
  userId: string;
  username: string;
  blog_id: string;
  created_at?: string;
  parent_comment?: string;
};

type NestedComment = CommentType & { replies: NestedComment[] };

type BlogPageData = {
  blog: {
    id: string;
    title: string;
    description: string;
    blogcontent: string;
    image: string;
    category: string;
    author: string;
    createdAt: string;
  };
  author: {
    user: {
      _id: string;
      name: string;
      email: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
      facebook: string;
      instagram: string;
      image: string;
    };
  };
  warning: null | string;
};

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const { isAuth, user, blogs } = useAppData();
  const [data, setData] = useState<BlogPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [closeDialog, setCloseDialog] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [Comment, setComment] = useState("");
  const [bookmark, setBookmark] = useState(false);

  const id = typeof params?.id === "string" ? params.id : "";

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

      if (id) {
        const isBookmarked = saves.some(
          (saved: SavedBlogsType) => saved.blogId === id
        );
        setBookmark(isBookmarked);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching saved blogs.");
    }
  };

  useEffect(() => {
    getAllSavedBlogs();
  }, [blogs]);

  const handleBookMark = async () => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Please log in to bookmark");
      return;
    }
    try {
      const res = await axios.post(
        `${blog_service}/api/v1/save/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const message = res.data.message;
      if (message.includes("bookmarked")) {
        setBookmark(true);
        toast.success("Blog bookmarked");
      } else if (message.includes("removed")) {
        setBookmark(false);
        toast.success("Bookmark removed");
      } else {
        toast.warning("Unexpected response");
      }
    } catch (error) {
      console.error("Bookmark error:", error);
      toast.error("Bookmark action failed");
    }
  };

  const getSingleBlogData = async () => {
    try {
      const response = await axios.get(`${blog_service}/api/v1/blogs/${id}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
    await new Promise((resolve) => setTimeout(resolve, 3000));
  };

  const fetchAllComments = async () => {
    try {
      setCommentsLoading(true);
      const res = await axios.get(`${blog_service}/api/v1/comment/${id}`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const makeComment = async () => {
    if (!Comment.trim()) {
      toast.warning("Comment cannot be empty");
      return;
    }

    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("You must be logged in to comment");
        return;
      }

      await axios.post(
        `${blog_service}/api/v1/comment/${id}`,
        { comment: Comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComment("");
      toast.success("Comment added successfully");
      fetchAllComments();
    } catch (error) {
      console.error("Error making comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleCommentDelete = async (cmtId: string) => {
    try {
      const token = Cookies.get("token");
      await axios.delete(`${blog_service}/api/v1/comment/${cmtId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Comment deleted");
      fetchAllComments();
    } catch (err) {
      console.error("Failed to delete comment", err);
      toast.error("Failed to delete comment");
    }
  };

  useEffect(() => {
    if (id) {
      getSingleBlogData();
      fetchAllComments();
    }
  }, [id]);

  const handleEdit = () => {
    if (data?.author.user._id === user?._id) {
      router.push(`/blog/edit/${id}`);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const token = Cookies.get("token");
      await axios.delete(`${author_service}/api/v1/blog/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Blog deleted successfully");
      router.push("/");
    } catch (error: any) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    } finally {
      setDeleting(false);
    }
  };

  const buildNestedComments = (comments: CommentType[]): NestedComment[] => {
    const map: Record<string, NestedComment> = {};
    const roots: NestedComment[] = [];

    comments.forEach((comment) => {
      map[comment.id] = { ...comment, replies: [] };
    });

    comments.forEach((comment) => {
      if (comment.parent_comment && map[comment.parent_comment]) {
        map[comment.parent_comment].replies.push(map[comment.id]);
      } else {
        roots.push(map[comment.id]);
      }
    });

    return roots;
  };

  const CommentCard = ({ comment }: { comment: NestedComment }) => {
    const canDelete = user?._id === comment.userId;

    return (
      <div className="pl-4 border-l-2 border-border mb-4">
        <div className="bg-muted/40 p-3 rounded-md shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{comment.username}</span>
            <span className="text-xs text-muted-foreground">
              {comment.created_at &&
                new Date(comment.created_at).toLocaleString("en-US", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
            </span>
          </div>
          <p className="text-sm text-foreground">{comment.comment}</p>
          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
            {canDelete && (
              <Button
                size={"sm"}
                variant={"destructive"}
                onClick={() => handleCommentDelete(comment.id)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-[calc(100vh_-_64px)] flex"
    >
      <div className="md:w-[calc(100%-120px)] w-full h-full overflow-y-auto hide-scrollbar">
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-[calc(100vh_-_120px)] w-full">
              <IconLoader3 className="animate-spin" size={20} />
            </div>
          ) : data ? (
            <>
              <div className="w-full flex justify-center items-center flex-col">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={data.author.user.image}
                    alt={data.author.user.name}
                  />
                  <AvatarFallback>
                    {data.author.user.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-center">{data.author.user.name}</p>
                <p className="text-center text-xs mt-2">
                  {new Date(data.blog.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <h1 className="text-2xl font-semibold w-full text-center">
                {data.blog.title}
              </h1>
              <p className="w-full text-center text-xl">
                {data.blog.description}
              </p>

              <div className="w-full flex items-center justify-center">
                <div className="w-96 relative h-52">
                  <Image
                    src={data.blog.image}
                    alt={data.blog.title}
                    fill={true}
                    className="object-fill"
                  />
                </div>
              </div>

              <div
                className="prose max-w-full"
                dangerouslySetInnerHTML={{ __html: data.blog.blogcontent }}
              />

              {isAuth && (
                <Card>
                  <CardHeader>
                    <CardTitle>Leave a comment</CardTitle>
                  </CardHeader>
                  <CardContent className="gap-2 flex flex-col">
                    <Label htmlFor="comment">Comment</Label>
                    <Input
                      value={Comment}
                      onChange={(e) => setComment(e.target.value)}
                      id="comment"
                      placeholder="Type your thoughts.."
                    />
                    <Button onClick={makeComment}>Add Comment</Button>
                  </CardContent>
                </Card>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Comments</h3>
                {commentsLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading comments...
                  </p>
                ) : comments.length > 0 ? (
                  buildNestedComments(comments).map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No comments yet.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-red-500 text-center">
              Blog not found or error loading data.
            </div>
          )}
        </div>
      </div>

      <div className="w-[120px] h-full hidden md:flex flex-col justify-center items-center gap-3">
        <Button
          onClick={handleEdit}
          disabled={data?.author.user._id !== user?._id}
          size="icon"
          variant="outline"
          className="rounded-xl"
        >
          <IconPencil />
        </Button>

        <Dialog open={closeDialog} onOpenChange={setCloseDialog}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="rounded-xl"
              disabled={data?.author.user._id !== user?._id}
            >
              <IconTrash />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setCloseDialog(false)}
                size="sm"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button onClick={handleDelete} size="sm" variant="destructive">
                {deleting ? (
                  <>
                    <IconLoader3 className="animate-spin" />
                    Delete
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          disabled={!isAuth}
          size="icon"
          variant="outline"
          className="rounded-xl"
        >
          <IconMessage />
        </Button>
        <Button
          disabled={!isAuth}
          size="icon"
          variant="outline"
          className="rounded-xl"
          onClick={handleBookMark}
        >
          {bookmark ? (
            <IconBookmark color="#2563eb" fill="#2563eb" />
          ) : (
            <IconBookmarkPlus />
          )}
        </Button>
        <Button
          onClick={handleClick}
          size="icon"
          variant="outline"
          className="rounded-xl"
        >
          <IconLink />
        </Button>
      </div>
    </motion.div>
  );
};

export default Page;
