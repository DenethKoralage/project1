"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL, getPublic } from "@/lib/authApi";

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadPost() {
      try {
        setIsLoading(true);
        const data = await getPublic(`/api/blog/${params.id}`);
        if (!ignore) setPost(data);
      } catch {
        if (!ignore) setPost(null);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadPost();
    return () => {
      ignore = true;
    };
  }, [params.id]);

  function getImageSrc(image) {
    if (!image) return "/f4.png";
    if (image.startsWith("http") || image.startsWith("/f")) return image;
    return `${API_BASE_URL}${image}`;
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-600">Loading post...</p>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Post not found
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            This article is not available right now.
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 pb-16">
      <section className="overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100 p-8 shadow-[0_20px_70px_rgba(13,38,76,0.12)] md:p-10">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          <span>{post.category}</span>
          <span className="h-1 w-1 rounded-full bg-slate-400" />
          <span>{new Date(post.publishedAt ?? post.createdAt).toLocaleDateString()}</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-700 md:text-lg">
          {post.excerpt}
        </p>
        <p className="mt-4 text-sm font-medium text-slate-600">
          Written by {post.author}
        </p>
      </section>

      <div className="relative h-[320px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm md:h-[420px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageSrc(post.image)}
          alt={post.title}
          className="h-full w-full object-cover"
        />
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="whitespace-pre-line text-base leading-8 text-slate-700">
          {post.content}
        </div>
      </article>

      <div className="flex justify-start">
        <Link
          href="/blog"
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back to Blog
        </Link>
      </div>
    </main>
  );
}
