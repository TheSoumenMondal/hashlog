import { blogType } from "@/types/type";
import Image from "next/image";

import React from "react";
import { IconMessageCircle, IconTag } from "@tabler/icons-react";

type Props = blogType;

const BlogCard = ({
  id,
  title,
  description,
  image,
  category,
  createdAt,
}: Props) => {
  return (
    <div
      key={id}
      className="w-full flex items-center justify-between gap-4 border-b border-muted pb-4 hover:bg-muted/20 transition-all px-2 py-3 rounded-md"
    >
      <div className="flex-1 space-y-1">
        <div className="text-sm text-muted-foreground">
          <span>{createdAt}</span>
        </div>

        <h2 className="text-lg font-semibold line-clamp-1">{title}</h2>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <IconMessageCircle className="w-4 h-4" /> 0
          </div>
          <span className="ml-2 flex gap-1.5 justify-center items-center">
            <IconTag className="w-4 h-4 rotate-90" /> {category}
          </span>
        </div>
      </div>

      <div className="w-[100px] h-[70px] shrink-0 rounded-md overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={100}
          height={70}
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
};

export default BlogCard;
