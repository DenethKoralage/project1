"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBlogs, fetchBlog, createBlog, toggleLike, deleteBlog } from "@/lib/blogApi";

// ── Debounce helper ───────────────────────────────────────────────────────────

import { useEffect, useState } from "react";

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── useBlogs ──────────────────────────────────────────────────────────────────

/**
 * Fetches the blog list with optional filters.
 * @param {{ category: string, sort: string, search: string, mine: boolean, token: string|null }} params
 */
export function useBlogs({ category, sort, search, mine = false, token = null } = {}) {
  return useQuery({
    queryKey: ["blogs", { category, sort, search, mine }],
    queryFn: () => fetchBlogs({ category, sort, search, mine }, token),
    staleTime: 30_000,
  });
}

// ── useBlog ───────────────────────────────────────────────────────────────────

export function useBlog(id, token = null) {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: () => fetchBlog(id, token),
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ── useCreateBlog ─────────────────────────────────────────────────────────────

export function useCreateBlog(token) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => createBlog(formData, token),
    onSuccess: () => {
      // Invalidate all blog list queries so the new post appears
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}

// ── useToggleLike ─────────────────────────────────────────────────────────────

/**
 * Optimistic like toggle. Immediately flips the like state in the cache,
 * rolls back if the server request fails.
 */
export function useToggleLike(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ blogId }) => toggleLike(blogId, token),

    onMutate: async ({ blogId }) => {
      // Cancel any in-flight refetches
      await queryClient.cancelQueries({ queryKey: ["blogs"] });

      // Snapshot previous state for rollback
      const previousBlogs = queryClient.getQueriesData({ queryKey: ["blogs"] });

      // Optimistically update every cached blogs list
      queryClient.setQueriesData({ queryKey: ["blogs"] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((post) => {
          if (post.id !== blogId) return post;
          const wasLiked = post.isLikedByMe;
          return {
            ...post,
            isLikedByMe: !wasLiked,
            likeCount: wasLiked ? post.likeCount - 1 : post.likeCount + 1,
          };
        });
      });

      return { previousBlogs };
    },

    onError: (_err, _vars, context) => {
      // Roll back on failure
      if (context?.previousBlogs) {
        for (const [queryKey, data] of context.previousBlogs) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    onSettled: () => {
      // Always re-sync from server after mutation settles
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}

// ── useDeleteBlog ─────────────────────────────────────────────────────────────

/**
 * Deletes the caller's own blog post. Optimistically removes it from the cache
 * and rolls back if the request fails.
 */
export function useDeleteBlog(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ blogId }) => deleteBlog(blogId, token),

    onMutate: async ({ blogId }) => {
      await queryClient.cancelQueries({ queryKey: ["blogs"] });
      const previousBlogs = queryClient.getQueriesData({ queryKey: ["blogs"] });

      // Optimistically remove the deleted post from every cached list
      queryClient.setQueriesData({ queryKey: ["blogs"] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter((post) => post.id !== blogId);
      });

      return { previousBlogs };
    },

    onError: (_err, _vars, context) => {
      // Roll back on failure
      if (context?.previousBlogs) {
        for (const [queryKey, data] of context.previousBlogs) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}
