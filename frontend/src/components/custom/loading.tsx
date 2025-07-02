import { IconLoader3 } from "@tabler/icons-react";
import React from "react";

const Loading = () => {
  return (
    <div className="w-full h-[calc(100vh-64px)] items-center justify-center flex">
      <IconLoader3 className="w-5 h-5 animate-spin" />
    </div>
  );
};

export default Loading;
