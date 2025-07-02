import React from "react";
import { SpringElement } from "@/components/spring-element";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";

const Homepage = () => {
  return (
    <div className="w-full relative h-[70vh] pt-16 overflow-hidden">
      <div className="absolute right-40 top-32 w-fit h-fit hidden md:flex">
        <SpringElement>
          <Avatar className="size-15">
            <AvatarImage
              draggable={false}
              src="https://pbs.twimg.com/profile_images/1897311929028255744/otxpL-ke_400x400.jpg"
            />
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
        </SpringElement>
      </div>
      <div className="w-full h-full items-center justify-center flex flex-col space-y-5 ">
        <h1 className="text-5xl font-bold tracking-tight">
          Publish your passions, your way
        </h1>
        <p className="font-serif">Create a unique and beautiful blog easily.</p>
        <Button variant={"outline"} size={"sm"}>
          Create your first blog
        </Button>
      </div>

      <div className="absolute left-0 md:left-40 bottom-10 w-fit h-fit">
        <SpringElement>
          <Avatar className="size-15">
            <AvatarImage
              draggable={false}
              src="https://pbs.twimg.com/profile_images/1897311929028255744/otxpL-ke_400x400.jpg"
            />
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
        </SpringElement>
      </div>
    </div>
  );
};

export default Homepage;
