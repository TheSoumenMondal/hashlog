"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppData, user_service } from "@/context/app-context";
import React, { useRef, useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Icons
import { GithubIcon } from "@/icons/github";
import { LinkedinIcon } from "@/icons/linkedin";
import { InstagramIcon } from "@/icons/instagram";
import { FacebookIcon } from "@/icons/facebook";
import { YoutubeIcon } from "@/icons/youtube";
import { IconRefresh, IconTagFilled } from "@tabler/icons-react";

const Page = () => {
  const imageRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useAppData();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [socials, setSocials] = useState({
    instagram: "",
    linkedin: "",
    github: "",
    facebook: "",
    youtube: "",
    twitter: "",
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setSocials({
        instagram: "",
        linkedin: "",
        github: "",
        facebook: "",
        youtube: "",
        twitter: "",
      });
    }
  }, [user]);

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
        console.warn("Upload Error:", message);
        toast.error("Error", { description: message });
      } finally {
        setLoading(false);
      }
    }
  };

  const clickHandler = () => {
    imageRef.current?.click();
  };

  return (
    <div className="w-full h-[calc(100vh_-_64px)] flex items-center justify-center">
      <Card className="w-full md:w-2/3 md:h-2/3">
        <CardHeader>
          <CardTitle className="hidden md:flex">Update Your Profile</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col-reverse md:flex-row gap-4">
          <div className="w-full flex flex-col gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />

            <div className="w-full flex gap-2 items-center">
              <InstagramIcon size={20} />
              <Input
                value={socials.instagram}
                onChange={(e) =>
                  setSocials({ ...socials, instagram: e.target.value })
                }
                placeholder="Instagram"
              />
            </div>

            <div className="w-full flex gap-2 items-center">
              <LinkedinIcon size={20} />
              <Input
                value={socials.linkedin}
                onChange={(e) =>
                  setSocials({ ...socials, linkedin: e.target.value })
                }
                placeholder="LinkedIn"
              />
            </div>

            <div className="w-full flex gap-2 items-center">
              <GithubIcon size={20} />
              <Input
                value={socials.github}
                onChange={(e) =>
                  setSocials({ ...socials, github: e.target.value })
                }
                placeholder="GitHub"
              />
            </div>

            <div className="w-full flex gap-2 items-center">
              <FacebookIcon size={20} />
              <Input
                value={socials.facebook}
                onChange={(e) =>
                  setSocials({ ...socials, facebook: e.target.value })
                }
                placeholder="Facebook"
              />
            </div>

            <div className="w-full flex gap-2 items-center">
              <YoutubeIcon size={20} />
              <Input
                value={socials.youtube}
                onChange={(e) =>
                  setSocials({ ...socials, youtube: e.target.value })
                }
                placeholder="YouTube"
              />
            </div>
          </div>

          <div className="flex w-full h-full items-center justify-between gap-2 flex-col">
            <Avatar className="w-32 h-32" onClick={clickHandler}>
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback>{user?.name}</AvatarFallback>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                ref={imageRef}
                onChange={changeHandler}
              />
            </Avatar>

            <Input
              value={user?.bio ? user.bio : "Add your Bio"}
              className="text-center text-xs"
              readOnly
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1 ">
                <Button variant="default" className="w-full">
                  {loading ? "Uploading..." : "Add Blog"}
                </Button>
              </div>
              <Button size="default" className=" w-full" variant="destructive">
                Log Out
              </Button>

              <div className="col-span-2 flex gap-2">
                <Button size={"icon"} variant={"outline"}>
                  <IconTagFilled />
                </Button>
                <Button size={"icon"} variant={"outline"}>
                  <IconRefresh />
                </Button>
                <Button size={"default"} className="">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;