"use client";

import Blogs from "@/components/custom/blog";
import Homepage from "@/components/custom/home-page";
import Loading from "@/components/custom/loading";
import { useAppData } from "@/context/app-context";

export default function Home() {
  const { loading } = useAppData();

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full flex items-center justify-center flex-col">
      <Homepage />
      <Blogs />
    </div>
  );
}
