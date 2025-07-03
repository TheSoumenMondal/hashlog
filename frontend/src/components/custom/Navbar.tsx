"use client";

import React from "react";
import { Button } from "../ui/button";
import ModeToggle from "./Mode-Toggle";
import Link from "next/link";
import { useAppData } from "@/context/app-context";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { isAuth, user } = useAppData();

  const router = useRouter();

  return (
    <div className="w-full h-16 items-center flex justify-between">
      <Link href={"/"} className="text-sm font-semibold">
        hashlog
      </Link>
      <div className="flex gap-2 md:gap-4 h-full items-center">
        <ModeToggle />
        {isAuth ? (
          <Avatar
            className="w-8 h-8 cursor-pointer"
            onClick={() => router.push("/profile")}
          >
            <AvatarImage src={user?.image} alt={user?.name} />
            <AvatarFallback>{user?.name}</AvatarFallback>
          </Avatar>
        ) : (
          <Link href={"/login"}>
            <Button size={"sm"} variant={"outline"} className="cursor-pointer">
              Log In
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
