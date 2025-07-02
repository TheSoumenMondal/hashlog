'use client'

import { IconBrightness } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import React from "react";

type Props = {
  className?: string;
};

const ModeToggle = ({ className }: Props) => {
  const { theme, setTheme } = useTheme();
  const handleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  return (
    <IconBrightness onClick={handleTheme} className={`w-4 h-4 cursor-pointer ${className}`} />
  );
};

export default ModeToggle;
