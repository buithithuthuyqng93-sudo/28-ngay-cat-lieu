import Link from "next/link";
import type { Metadata } from "next";
import { Leaf } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Đăng nhập | 28 Ngày Thử Thách Cắt Liều" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-card">
            <Leaf className="size-6" />
          </span>
          <h1 className="text-xl font-bold text-gray-900">Chào bạn quay lại</h1>
          <p className="mt-1 text-sm text-gray-500">
            Đăng nhập để tiếp tục 28 Ngày Thử Thách Cắt Liều
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link href="/dang-ky" className="font-semibold text-primary-600 hover:underline">
            Đăng ký tham gia
          </Link>
        </p>
      </div>
    </div>
  );
}
