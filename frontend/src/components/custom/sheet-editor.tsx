"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IconLoader3, IconPencil } from "@tabler/icons-react";
import { LinkedinIcon } from "@/icons/linkedin";
import { InstagramIcon } from "@/icons/instagram";
import { FacebookIcon } from "@/icons/facebook";
import { GithubIcon } from "@/icons/github";
import { YoutubeIcon } from "@/icons/youtube";
import { useAppData, user_service } from "@/context/app-context";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const EditorSheet = () => {
  const { user, setUser } = useAppData();

  const [updating, setUpdating] = useState(false);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [instagram, setInstagram] = useState(user?.instagram || "");
  const [facebook, setFacebook] = useState(user?.facebook || "");
  const [linkedin, setLinkedin] = useState(user?.linkedin || "");
  const [github, setGithub] = useState(user?.github || "");
  const [youtube, setYoutube] = useState(user?.youtube || "");

  const handleChange = async () => {
    try {
      setUpdating(true);
      const token = Cookies.get("token");

      // Only include non-empty trimmed fields
      const payload: Record<string, string> = {};
      if (name.trim()) payload.name = name.trim();
      if (bio.trim()) payload.bio = bio.trim();
      if (instagram.trim()) payload.instagram = instagram.trim();
      if (facebook.trim()) payload.facebook = facebook.trim();
      if (linkedin.trim()) payload.linkedin = linkedin.trim();
      if (github.trim()) payload.github = github.trim();
      if (youtube.trim()) payload.youtube = youtube.trim();

      const { data } = await axios.post(
        `${user_service}/api/v1/user/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Profile Updated Successfully");
      Cookies.set("token", data.token, {
        expires: 5,
        secure: true,
        path: "/",
      });
      setUser(data?.user);
      setOpen(false);
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon">
            <IconPencil />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="min-h-[80%] max-w-xl w-full left-1/2 -translate-x-1/2 rounded-t-lg pb-4"
        >
          <SheetHeader>
            <SheetTitle className="text-xl">
              Enter the basic details to change
            </SheetTitle>
            <SheetDescription>
              Fill out the following fields to update your profile.
            </SheetDescription>
          </SheetHeader>

          <div className="px-5 h-full flex flex-col justify-center space-y-4 mt-4">
            {[
              { label: "Name", icon: null, value: name, setValue: setName },
              { label: "Bio", icon: null, value: bio, setValue: setBio },
              {
                label: "Instagram",
                icon: <InstagramIcon size={20} />,
                value: instagram,
                setValue: setInstagram,
              },
              {
                label: "Facebook",
                icon: <FacebookIcon size={20} />,
                value: facebook,
                setValue: setFacebook,
              },
              {
                label: "LinkedIn",
                icon: <LinkedinIcon size={20} />,
                value: linkedin,
                setValue: setLinkedin,
              },
              {
                label: "Github",
                icon: <GithubIcon size={20} />,
                value: github,
                setValue: setGithub,
              },
              {
                label: "Youtube",
                icon: <YoutubeIcon size={20} />,
                value: youtube,
                setValue: setYoutube,
              },
            ].map((field) => (
              <div
                key={field.label}
                className="grid grid-cols-3 items-center gap-4"
              >
                <div className="flex items-center gap-2">
                  {field.icon}
                  <Label className="text-sm font-medium">{field.label}</Label>
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    value={field.value}
                    onChange={(e) => field.setValue(e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="w-full flex justify-end px-5 mt-6 gap-2">
            <Button size={"sm"} onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button size="sm" disabled={updating} onClick={handleChange}>
              {updating && <IconLoader3 className="animate-spin mr-2" />}
              Update Profile
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EditorSheet;
