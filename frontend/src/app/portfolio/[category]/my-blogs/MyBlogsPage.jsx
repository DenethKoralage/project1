"use client";

import { useSearchParams } from "next/navigation";
import MyBlogs from "@/components/blog/MyBlogs";

export function MyBlogsPage() {
  const searchParams = useSearchParams();
  const openComposer = searchParams.get("compose") === "1";

  return (
    <main className="w-full pb-24 pt-4">
      <MyBlogs initialOpenComposer={openComposer} />
    </main>
  );
}
