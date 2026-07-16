"use client";

import { useQuery } from "@tanstack/react-query";
import { mockFetch } from "@/lib/api/client";
import { mockActivity, mockBlogs } from "@/lib/api/mock-data";
import type { DashboardStats } from "@/types/blog";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () =>
      mockFetch<DashboardStats>(() => {
        const published = mockBlogs.filter((b) => b.status === "published");
        const drafts = mockBlogs.filter((b) => b.status === "draft");
        return {
          totalBlogs: mockBlogs.length,
          publishedBlogs: published.length,
          draftBlogs: drafts.length,
          tokensUsed: mockBlogs.reduce((sum, b) => sum + b.tokensUsed, 0),
          deltas: { totalBlogs: 12, publishedBlogs: 8, draftBlogs: -3, tokensUsed: 21 },
        };
      }),
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: () => mockFetch(() => mockActivity),
  });
}
