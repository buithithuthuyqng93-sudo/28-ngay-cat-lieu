import {
  LayoutDashboard,
  CalendarCheck,
  Target,
  Stethoscope,
  FolderOpen,
  Users,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const primaryNavItems: NavItem[] = [
  { href: "/dashboard", label: "Trang chủ", icon: LayoutDashboard },
  { href: "/lo-trinh", label: "Lộ trình", icon: CalendarCheck },
  { href: "/thu-thach", label: "Thử thách", icon: Target },
  { href: "/tai-nguyen", label: "Tài nguyên", icon: FolderOpen },
  { href: "/cong-dong", label: "Cộng đồng", icon: Users },
];

export const allNavItems: NavItem[] = [
  ...primaryNavItems.slice(0, 3),
  { href: "/tinh-huong", label: "Tình huống thực chiến", icon: Stethoscope },
  ...primaryNavItems.slice(3),
  { href: "/tien-do", label: "Tiến độ cá nhân", icon: TrendingUp },
];
