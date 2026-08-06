"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBlogs, useCreateBlog, useDebounce, useToggleLike, useDeleteBlog } from "@/lib/hooks/useBlogs";
import { getBlogImageSrc } from "@/lib/blogApi";
import { PortfolioHeroCard } from "@/components/organisms";
import { SearchInput, SortToggle } from "@/components/molecules";
import { StatusBanner } from "@/components/atoms";

const CATEGORIES = [
  "All",
  "Budgeting",
  "Investing",
  "Income",
  "Saving",
  "Side Hustles",
  "Financial Independence",
  "Money Mindset",
  "General",
];

const initialForm = {
  title: "",
  category: "",
  image: null,
  excerpt: "",
  content: "",
};

export default function MyBlogs({ initialOpenComposer = false }) {
  const { user, token, loading: authLoading } = useAuth();

  // Filters state
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);

  // Composer modal state — open immediately if caller requested it
  const [showComposer, setShowComposer] = useState(initialOpenComposer);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch only my blogs (`mine: true`)
  const {
    data: posts = [],
    isLoading: isLoadingPosts,
    error: fetchError,
  } = useBlogs({
    category: category || undefined,
    sort,
    search: debouncedSearch || undefined,
    mine: true,
    token,
  });

  const createMutation = useCreateBlog(token);
  const likeMutation = useToggleLike(token);
  const deleteMutation = useDeleteBlog(token);

  // Id of the blog pending deletion confirmation (null = no dialog open)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const totalLikes = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);

  function handleChange(event) {
    const { name, value, files, type } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files?.[0] ?? null : value,
    }));
    setFormError("");
  }

  function handleCloseComposer() {
    setShowComposer(false);
    setForm(initialForm);
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setFormError("Title, excerpt, and content are required.");
      return;
    }
    if (!token) {
      setFormError("Log in before publishing a blog post.");
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("category", form.category.trim() || "General");
    payload.append("excerpt", form.excerpt.trim());
    payload.append("content", form.content.trim());
    if (form.image) payload.append("image", form.image);

    createMutation.mutate(payload, {
      onSuccess: () => {
        setForm(initialForm);
        setShowComposer(false);
        setSuccessMsg("Your new blog post has been published! 🎉");
        setTimeout(() => setSuccessMsg(""), 5000);
      },
      onError: (err) => {
        setFormError(err.message || "Could not publish your blog post.");
      },
    });
  }

  function handleLike(postId) {
    if (!token) return;
    likeMutation.mutate({ blogId: postId });
  }

  function handleDeleteConfirm() {
    if (!confirmDeleteId) return;
    deleteMutation.mutate(
      { blogId: confirmDeleteId },
      {
        onSuccess: () => {
          setSuccessMsg("Blog post deleted successfully.");
          setTimeout(() => setSuccessMsg(""), 4000);
        },
        onError: (err) => {
          setSuccessMsg("");
          setFormError(err.message || "Could not delete the blog post.");
        },
        onSettled: () => setConfirmDeleteId(null),
      }
    );
  }

  if (authLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
        Loading authentication...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-800">
        <p className="text-2xl mb-2">🔒</p>
        <h3 className="text-lg font-bold">Authentication Required</h3>
        <p className="mt-1 text-sm text-amber-700">
          Please log in to view and manage your personal blog posts.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-xl bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-900"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Hero / Header Card */}
      <PortfolioHeroCard
        title="My Blog Posts"
        description={`Manage and view articles written by ${user?.name || "you"}.`}
        backHref="/portfolio"
        backLabel="Personal Author Dashboard"
        stats={[
          { value: posts.length, label: "Articles Created", valueClassName: "text-emerald-300" },
          { value: totalLikes, label: "Total Likes Received", valueClassName: "text-rose-300" },
          { value: "Active", label: "Author Status", valueClassName: "text-cyan-300" },
        ]}
        actionLabel="Create New Blog"
        actionIcon="✍️"
        onAction={() => setShowComposer(true)}
      />

      {/* Success banner */}
      <StatusBanner type="success" message={successMsg} variant="blog" />

      {/* Search & Filter Toolbar */}
      <section className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <SearchInput
          id="my-blogs-search"
          placeholder="Search my posts..."
          value={searchInput}
          onChange={setSearchInput}
          className="flex-1 min-w-[200px]"
        />

        {/* Category filter */}
        <select
          id="my-blogs-category"
          value={category}
          onChange={(e) => setCategory(e.target.value === "All" ? "" : e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c === "All" ? "" : c}>{c}</option>
          ))}
        </select>

        {/* Sort toggle */}
        <SortToggle value={sort} onChange={setSort} />
      </section>

      {/* Error state */}
      {fetchError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {fetchError.message || "Could not load your blog posts."}
        </div>
      )}

      {/* Blog Posts Grid */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoadingPosts ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm animate-pulse"
            >
              <div className="h-48 bg-slate-100" />
              <div className="space-y-3 p-6">
                <div className="h-3 w-20 rounded bg-slate-100" />
                <div className="h-5 w-3/4 rounded bg-slate-100" />
                <div className="h-3 w-full rounded bg-slate-100" />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center text-slate-500">
            <p className="text-4xl mb-3">✏️</p>
            <h3 className="text-lg font-bold text-slate-800">No blog posts created yet</h3>
            <p className="mt-1 text-sm text-slate-600">
              You haven't written any posts matching your criteria. Start sharing your knowledge!
            </p>
            <button
              type="button"
              onClick={() => setShowComposer(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Write Your First Post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md flex flex-col"
            >
              {/* Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getBlogImageSrc(post.image)}
                  alt={post.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                  {post.category}
                </span>
                <span className="absolute top-3 right-3 rounded-full bg-emerald-900/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm">
                  My Post
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 space-y-3 p-6">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
                  Published: {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString()}
                </p>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">{post.title}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">by {post.author}</p>
                </div>

                <p className="text-sm leading-relaxed text-slate-600 flex-1 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Card footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-sm font-semibold text-sky-700 transition hover:text-sky-800"
                  >
                    Read article →
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      disabled={!token || likeMutation.isPending}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold transition ${
                        post.isLikedByMe
                          ? "bg-rose-50 text-rose-600"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <span>{post.isLikedByMe ? "❤️" : "🧡"}</span>
                      <span>{post.likeCount ?? 0}</span>
                    </button>

                    {/* Delete button — only visible to the creator */}
                    <button
                      type="button"
                      id={`delete-blog-${post.id}`}
                      onClick={() => setConfirmDeleteId(post.id)}
                      disabled={deleteMutation.isPending}
                      title="Delete this post"
                      className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
            <p className="text-2xl mb-2 text-center">🗑️</p>
            <h3 className="text-lg font-bold text-slate-900 text-center">Delete this post?</h3>
            <p className="mt-2 text-sm text-slate-600 text-center">
              This action cannot be undone. Your blog post will be permanently removed.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                id="confirm-delete-btn"
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                id="cancel-delete-btn"
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.3)] md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  New Blog Post
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Share a new article</h2>
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
                  <label htmlFor="title" className="mb-2 block text-sm font-semibold text-slate-800">
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Your post title"
                    className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label htmlFor="composer-category-my" className="mb-2 block text-sm font-semibold text-slate-800">
                    Category
                  </label>
                  <select
                    name="category"
                    id="composer-category-my"
                    value={form.category}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="image-my" className="mb-2 block text-sm font-semibold text-slate-800">
                  Image
                </label>
                <input
                  id="image-my"
                  name="image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label htmlFor="excerpt-my" className="mb-2 block text-sm font-semibold text-slate-800">
                  Excerpt
                </label>
                <textarea
                  id="excerpt-my"
                  name="excerpt"
                  value={form.excerpt}
                  onChange={handleChange}
                  rows={3}
                  placeholder="A brief summary of your post…"
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label htmlFor="content-my" className="mb-2 block text-sm font-semibold text-slate-800">
                  Full content
                </label>
                <textarea
                  id="content-my"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Write your full article here…"
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending || authLoading || !token}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {createMutation.isPending ? "Publishing…" : "Publish Post"}
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
    </div>
  );
}
