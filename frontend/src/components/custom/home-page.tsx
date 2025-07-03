"use client";

import React, { useEffect, useState } from "react";
import { SpringElement } from "@/components/spring-element";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { IconSearch, IconX } from "@tabler/icons-react";
import { Badge } from "../ui/badge";
import { blogCategory } from "@/app/blog/new/page";
import { useAppData } from "@/context/app-context";

const Homepage = () => {
  const { setSearchQuery, searchQuery, setCategory, category } = useAppData();
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [inputValue, setSearchQuery]);

  const handleClearFilters = () => {
    setInputValue("");
    setCategory("");
  };

  return (
    <div className="w-full relative h-[70vh] pt-16 overflow-hidden">
      <div className="absolute right-32 top-16 w-fit h-fit hidden md:flex">
        <SpringElement>
          <Avatar className="size-16">
            <AvatarImage
              draggable={false}
              src="https://pbs.twimg.com/profile_images/1897311929028255744/otxpL-ke_400x400.jpg"
              alt="Avatar"
            />
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
        </SpringElement>
      </div>

      <div className="w-full h-full items-center justify-center flex flex-col space-y-5">
        <h1 className="text-5xl font-bold tracking-tight text-center">
          Publish your passions, your way
        </h1>
        <p className="font-serif">Create a unique and beautiful blog easily.</p>

        <div className="w-full max-w-md flex flex-row gap-1 items-center">
          <Input
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInputValue(e.target.value)
            }
            className="w-full"
            placeholder="Search blogs..."
          />
          <Button size="icon" variant="outline">
            <IconSearch />
          </Button>
        </div>

        <div className="w-full max-w-md flex flex-wrap gap-2 justify-center">
          <Badge
            variant="outline"
            onClick={handleClearFilters}
            className="rounded-full cursor-pointer group"
          >
            Clear filter
            <IconX className="transition-transform duration-200 group-hover:-rotate-90 ml-1" />
          </Badge>

          {blogCategory.map((bg, ind) => (
            <Badge
              onClick={() => setCategory(bg)}
              variant={category === bg ? "default" : "secondary"}
              key={ind}
              className="cursor-pointer"
            >
              {bg}
            </Badge>
          ))}
        </div>
      </div>

      <div className="absolute left-0 md:left-40 bottom-10 w-fit h-fit hidden md:flex">
        <SpringElement>
          <Avatar className="size-16">
            <AvatarImage
              draggable={false}
              src="https://pbs.twimg.com/profile_images/1897311929028255744/otxpL-ke_400x400.jpg"
              alt="Avatar"
            />
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
        </SpringElement>
      </div>
    </div>
  );
};

export default Homepage;
