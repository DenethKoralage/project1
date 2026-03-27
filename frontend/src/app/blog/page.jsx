"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addBlogPost, ensureSeededPosts } from "@/lib/blogs";
import { getUser } from "@/lib/auth";

const initialForm = {
  title: "",
  category: "",
  image: "",
  excerpt: "",
  content: "",
};

export default function BlogPage() {
  const [posts, setPosts] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    return ensureSeededPosts();
  });
  const [showComposer, setShowComposer] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return getUser();
  });

  useEffect(() => {
    function handleStorageRefresh() {
      setPosts(ensureSeededPosts());
      setCurrentUser(getUser());
    }

    window.addEventListener("storage", handleStorageRefresh);
    return () => window.removeEventListener("storage", handleStorageRefresh);
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setMessage("");
  }

  function handleCloseComposer() {
    setShowComposer(false);
    setForm(initialForm);
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setError("Title, excerpt, and content are required.");
      return;
    }

    const newPost = addBlogPost({
      title: form.title.trim(),
      category: form.category.trim() || "General",
      image: form.image.trim() || "/f4.png",
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      author: currentUser?.fullName || "Community Writer",
    });

    setPosts((previous) => [newPost, ...previous]);
    setForm(initialForm);
    setShowComposer(false);
    setError("");
    setMessage("Your new blog post has been published.");
  }

  return (
    <main className="relative w-full space-y-10 pb-24">
      <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100 p-8 shadow-[0_20px_70px_rgba(13,38,76,0.12)] md:p-12">
        <div className="absolute -right-12 top-8 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-56 w-56 rounded-full bg-emerald-300/30 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <p className="inline-flex rounded-full border border-emerald-900/10 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                Blog
              </p>
              <p className="inline-flex rounded-full bg-slate-900/10 px-3 py-1 text-xs font-semibold text-slate-800">
                Reader ideas, investing notes, and money systems
              </p>
            </div>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Read practical money insights and publish your own blog posts.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-700 md:text-lg">
              Explore featured guides from the site and add your own post with
              the floating action button whenever you are ready to share.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/50 bg-white/70 p-4">
                <p className="text-2xl font-bold text-slate-900">
                  {posts.length}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                  Total Posts
                </p>
              </div>
              <div className="rounded-2xl border border-white/50 bg-white/70 p-4">
                <p className="text-2xl font-bold text-slate-900">3 min</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                  Quick Reads
                </p>
              </div>
              <div className="rounded-2xl border border-white/50 bg-white/70 p-4">
                <p className="text-2xl font-bold text-slate-900">
                  {currentUser?.fullName ? "Member" : "Guest"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                  Publishing Mode
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/50 bg-slate-900 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Publish from the floating button
            </p>
            <h2 className="mt-3 text-2xl font-bold">
              Tap the button in the bottom-right corner to add a new post.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              You can write a title, category, image URL, excerpt, and full
              article. New posts are saved in your browser so the list stays
              available when you come back.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              {currentUser?.fullName
                ? `Posting as ${currentUser.fullName}.`
                : "Posting as Community Writer until you log in."}
            </div>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative h-52 w-full overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>{post.category}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>
                  {new Date(post.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  by {post.author}
                </p>
              </div>
              <p className="text-sm leading-7 text-slate-600">{post.excerpt}</p>
              <Link
                href={`/blog/${post.id}`}
                className="inline-flex text-sm font-semibold text-sky-700 transition hover:text-sky-800"
              >
                Read full post
              </Link>
            </div>
          </article>
        ))}
      </section>

      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.3)] md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  New Blog Post
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Share a new article
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseComposer}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Category
                  </label>
                  <input
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Budgeting, Investing, Income"
                    className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="image"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Image URL
                </label>
                <input
                  id="image"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="/f4.png"
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="excerpt"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={form.excerpt}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Full content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={8}
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Publish Post
                </button>
                <button
                  type="button"
                  onClick={handleCloseComposer}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label="Add new blog post"
        onClick={() => {
          setShowComposer(true);
          setError("");
          setMessage("");
        }}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-3xl font-light text-white shadow-[0_20px_45px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:bg-slate-800"
      >
        +
      </button>
    </main>
  );
}
