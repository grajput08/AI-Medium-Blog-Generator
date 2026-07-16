import {
  BarChart3,
  BookOpenCheck,
  CreditCard,
  FileText,
  Gauge,
  LayoutDashboard,
  LayoutTemplate,
  Link2,
  Settings,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Generate Blog", href: "/generate", icon: Sparkles },
      { title: "Drafts", href: "/drafts", icon: FileText },
      { title: "Published Blogs", href: "/published", icon: BookOpenCheck },
      { title: "Templates", href: "/templates", icon: LayoutTemplate },
    ],
  },
  {
    label: "Growth",
    items: [
      { title: "SEO Tools", href: "/seo", icon: Gauge },
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
      { title: "Medium Integration", href: "/medium", icon: Link2 },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Billing", href: "/billing", icon: CreditCard },
      { title: "Profile", href: "/profile", icon: UserRound },
    ],
  },
];
