import { API_BASE_URL, deleteWithAuth, getPublic, getWithAuth, postFormWithAuth, postWithAuth } from "@/lib/authApi";

// ── Blog list ─────────────────────────────────────────────────────────────────

/**
 * Fetch blogs with optional filters.
 * @param {{ category?: string, sort?: string, search?: string, mine?: boolean }} params
 * @param {string|null} token
 */
export async function fetchBlogs({ category, sort, search, mine } = {}, token = null) {
  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  if (sort) qs.set("sort", sort);
  if (search) qs.set("search", search);
  if (mine) qs.set("mine", "true");

  const path = `/api/blog${qs.toString() ? `?${qs}` : ""}`;
  return token ? getWithAuth(path, token) : getPublic(path);
}

// ── Single blog ───────────────────────────────────────────────────────────────

export async function fetchBlog(id, token = null) {
  const path = `/api/blog/${id}`;
  return token ? getWithAuth(path, token) : getPublic(path);
}

// ── Create blog ───────────────────────────────────────────────────────────────

export async function createBlog(formData, token) {
  return postFormWithAuth("/api/blog", formData, token);
}

// ── Like toggle ───────────────────────────────────────────────────────────────

/**
 * Toggle like on a blog post. Returns { likeCount, isLikedByMe }.
 */
export async function toggleLike(blogId, token) {
  return postWithAuth(`/api/blog/${blogId}/like`, {}, token);
}

// ── Like summary ──────────────────────────────────────────────────────────────

export async function fetchLikes(blogId, token = null) {
  const path = `/api/blog/${blogId}/likes`;
  return token ? getWithAuth(path, token) : getPublic(path);
}

// ── Delete blog ───────────────────────────────────────────────────────────────

/**
 * Delete a blog post by id. Only the creator can delete their own blog.
 * Returns null on success (204 No Content).
 */
export async function deleteBlog(blogId, token) {
  return deleteWithAuth(`/api/blog/${blogId}`, token);
}

// ── Image helper ──────────────────────────────────────────────────────────────

export function getBlogImageSrc(image) {
  if (!image) return "/f4.png";
  if (image.startsWith("http") || image.startsWith("/f")) return image;
  return `${API_BASE_URL}${image}`;
}
