export type BlogStatus = "draft" | "scheduled" | "published" | "archived";

export type Blog = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  tokensUsed: number;
  readingTime: number;
  seoScore: number;
  views: number;
};

export type ActivityEvent = {
  id: string;
  type: "generated" | "edited" | "published" | "connected";
  text: string;
  at: string;
};

export type DashboardStats = {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  tokensUsed: number;
  deltas: {
    totalBlogs: number;
    publishedBlogs: number;
    draftBlogs: number;
    tokensUsed: number;
  };
};
