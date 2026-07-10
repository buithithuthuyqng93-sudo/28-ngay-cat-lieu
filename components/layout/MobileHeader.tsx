"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Leaf, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { allNavItems } from "./nav-items";
import { logout } from "@/lib/actions/auth";

export function MobileHeader({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white">
          <Leaf className="size-4.5" />
        </span>
        <span className="text-sm font-bold text-gray-900">28 Ngày Cắt Liều</span>
      </Link>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở menu"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Xin chào, {userName}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng menu"
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {allNavItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                      active ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="size-4.5" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="size-4.5" />
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
