"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { allNavItems } from "./nav-items";
import { logout } from "@/lib/actions/auth";

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:border-r md:border-gray-200 md:bg-white">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary-600 text-white">
          <Leaf className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold leading-tight text-gray-900">28 Ngày Cắt Liều</p>
          <p className="text-xs text-gray-500">Thử thách thực chiến</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {allNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="size-4.5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center justify-between rounded-xl px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">Học viên</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Đăng xuất"
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
