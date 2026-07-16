import { mockBlogs } from "@/lib/api/mock-data";
import type { Blog, BlogStatus } from "@/types/blog";

// Mutable mock store backed by localStorage so list actions (duplicate,
// archive, delete…) survive reloads. Phase 7 swaps the hooks in
// hooks/use-blogs.ts to real endpoints and this file disappears.

const STORE_KEY = "inkwell.blogs";

function read(): Blog[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as Blog[];
  } catch {
    // fall through to seed
  }
  localStorage.setItem(STORE_KEY, JSON.stringify(mockBlogs));
  return [...mockBlogs];
}

function write(blogs: Blog[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(blogs));
}

export function listBlogs(): Blog[] {
  return read();
}

export function updateBlogStatus(id: string, status: BlogStatus): Blog[] {
  const blogs = read().map((b) =>
    b.id === id
      ? {
          ...b,
          status,
          updatedAt: new Date().toISOString(),
          publishedAt: status === "published" ? new Date().toISOString() : b.publishedAt,
        }
      : b
  );
  write(blogs);
  return blogs;
}

export function duplicateBlog(id: string): Blog[] {
  const blogs = read();
  const source = blogs.find((b) => b.id === id);
  if (!source) return blogs;
  const copy: Blog = {
    ...source,
    id: `b${Date.now()}`,
    title: `${source.title} (copy)`,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    views: 0,
  };
  const next = [copy, ...blogs];
  write(next);
  return next;
}

export function deleteBlog(id: string): Blog[] {
  const next = read().filter((b) => b.id !== id);
  write(next);
  return next;
}

export function touchBlog(id: string): Blog[] {
  const next = read().map((b) =>
    b.id === id ? { ...b, updatedAt: new Date().toISOString() } : b
  );
  write(next);
  return next;
}
