"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mockFetch } from "@/lib/api/client";
import {
  deleteBlog,
  duplicateBlog,
  listBlogs,
  touchBlog,
  updateBlogStatus,
} from "@/lib/api/blog-store";
import type { Blog, BlogStatus } from "@/types/blog";

const BLOGS_KEY = ["blogs"];

export function useBlogs() {
  return useQuery({
    queryKey: BLOGS_KEY,
    queryFn: () => mockFetch(listBlogs),
  });
}

function useBlogAction<TArgs extends unknown[]>(
  action: (...args: TArgs) => Blog[],
  successMessage: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: TArgs) => mockFetch(() => action(...args)),
    onSuccess: (blogs) => {
      queryClient.setQueryData(BLOGS_KEY, blogs);
      toast.success(successMessage);
    },
  });
}

export function useBlogMutations() {
  const setStatus = useBlogAction(
    (id: string, status: BlogStatus) => updateBlogStatus(id, status),
    "Updated."
  );
  const duplicate = useBlogAction((id: string) => duplicateBlog(id), "Duplicated as a new draft.");
  const remove = useBlogAction((id: string) => deleteBlog(id), "Deleted.");
  const restoreVersion = useBlogAction((id: string) => touchBlog(id), "Version restored.");

  return {
    archive: (id: string) => setStatus.mutate([id, "archived"]),
    restore: (id: string) => setStatus.mutate([id, "draft"]),
    unpublish: (id: string) => setStatus.mutate([id, "draft"]),
    publish: (id: string) => setStatus.mutate([id, "published"]),
    duplicate: (id: string) => duplicate.mutate([id]),
    remove: (id: string) => remove.mutate([id]),
    restoreVersion: (id: string) => restoreVersion.mutate([id]),
  };
}
