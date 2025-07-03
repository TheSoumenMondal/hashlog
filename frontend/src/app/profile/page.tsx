"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAppData, user_service } from "@/context/app-context";
import React, { useRef, useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/icons/github";
import { LinkedinIcon } from "@/icons/linkedin";
import { InstagramIcon } from "@/icons/instagram";
import { FacebookIcon } from "@/icons/facebook";
import { YoutubeIcon } from "@/icons/youtube";
import { IconTagFilled } from "@tabler/icons-react";
import EditorSheet from "@/components/custom/sheet-editor";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);
  const { user, setUser, LogoutUser } = useAppData();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [socials, setSocials] = useState({
    instagram: "",
    linkedin: "",
    github: "",
    facebook: "",
    youtube: "",
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setSocials({
        instagram: user.instagram || "",
        linkedin: user.linkedin || "",
        github: user.github || "",
        facebook: user.facebook || "",
        youtube: user.youtube || "",
      });
    }
  }, [user]);

  const logoutHandler = () => {
    LogoutUser();
  };

  const changeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        setLoading(true);
        const token = Cookies.get("token");
        const { data } = await axios.post(
          `${user_service}/api/v1/user/update/pic`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Success", {
          description: data.message,
        });

        Cookies.set("token", data.token, {
          expires: 5,
          secure: true,
          path: "/",
        });
        setUser(data.user);
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error.message ||
          "Internal server error";
        toast.error("Error", { description: message });
      } finally {
        setLoading(false);
      }
    }
  };

  const clickHandler = () => {
    imageRef.current?.click();
  };

  const SOCIALS_MAP = {
    instagram: {
      icon: <InstagramIcon size={20} />,
      base: "https://instagram.com/",
    },
    linkedin: {
      icon: <LinkedinIcon size={20} />,
      base: "https://linkedin.com/in/",
    },
    github: {
      icon: <GithubIcon size={20} />,
      base: "https://github.com/",
    },
    facebook: {
      icon: <FacebookIcon size={20} />,
      base: "https://facebook.com/",
    },
    youtube: {
      icon: <YoutubeIcon size={20} />,
      base: "https://youtube.com/",
    },
  };

  const openSocial = (value: string, base: string) => {
    if (!value) return;
    const isFullUrl = value.startsWith("http");
    const href = isFullUrl ? value : `${base}${value}`;
    window.open(href, "_blank");
  };

  if (!user) return null;

  return (
    <div className="w-full h-[calc(100vh_-_64px)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-center">
            Update Your Profile
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          <div onClick={clickHandler}>
            <Avatar className="w-28 h-28 cursor-pointer">
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                ref={imageRef}
                onChange={changeHandler}
              />
            </Avatar>
          </div>

          <div className="text-base font-medium px-3 py-2 rounded-md bg-muted border w-full text-center">
            {name || "Add Name"}
          </div>

          <div className="text-base px-3 py-2 rounded-md bg-muted border w-full text-center">
            {email || "Add Email"}
          </div>

          <p className="text-xs px-3 py-2 border rounded-md bg-muted w-full text-center">
            {user?.bio?.trim() || "Add your Bio"}
          </p>

          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(SOCIALS_MAP).map(([key, { icon, base }]) => (
              <Button
                key={key}
                size="icon"
                variant="ghost"
                onClick={() =>
                  openSocial(socials[key as keyof typeof socials], base)
                }
              >
                {icon}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center w-full mt-4">
            <Button variant="default" onClick={() => router.push("/blog/new")}>
              Add Blog
            </Button>
            <Button variant="destructive" onClick={logoutHandler}>
              Log Out
            </Button>
            <EditorSheet />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => router.push("/saved")}
            >
              <IconTagFilled size={18} />
            </Button>
            <Button variant="outline" onClick={clickHandler} disabled={loading}>
              {loading ? "Uploading..." : "Upload New Profile Photo"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
