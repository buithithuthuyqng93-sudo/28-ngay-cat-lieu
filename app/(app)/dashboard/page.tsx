import Link from "next/link";
import type { Metadata } from "next";
import { Flame, ArrowRight, CalendarCheck, FolderOpen, Users, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/dal";
import { getDashboardStats, getBadges } from "@/lib/progress";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LinkButton } from "@/components/ui/Button";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { BadgeChip } from "@/components/ui/BadgeChip";
import { PaywallBanner } from "@/components/lessons/PaywallBanner";

export const metadata: Metadata = { title: "Trang chủ | 28 Ngày Thử Thách Cắt Liều" };

const quickLinks = [
  { href: "/lo-trinh", label: "Lộ trình 28 ngày", icon: CalendarCheck, color: "bg-primary-50 text-primary-600" },
  { href: "/tai-nguyen", label: "Tài nguyên", icon: FolderOpen, color: "bg-mint-50 text-mint-700" },
  { href: "/cong-dong", label: "Cộng đồng", icon: Users, color: "bg-amber-50 text-amber-600" },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const stats = await getDashboardStats(user.id);
  const badges = getBadges(stats);

  const todayChallenge = stats.nextLesson
    ? await prisma.challenge.findFirst({ where: { day: stats.nextLesson.day } })
    : null;

  const firstName = user.name.split(" ").slice(-1)[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500">Chào mừng quay lại,</p>
        <h1 className="text-2xl font-bold text-gray-900">{firstName}</h1>
      </div>

      {!stats.hasPaid && <PaywallBanner />}

      {/* Overall progress */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Tiến độ tổng</p>
            <p className="text-xs text-gray-500">
              {stats.completedCount}/{stats.totalCount} ngày đã hoàn thành
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-primary-600">{stats.percent}%</p>
            {stats.streak > 0 && (
              <p className="flex items-center justify-end gap-1 text-xs font-medium text-amber-600">
                <Flame className="size-3.5" />
                Streak {stats.streak} ngày
              </p>
            )}
          </div>
        </div>
        <ProgressBar percent={stats.percent} className="mt-4" />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Continue learning */}
        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold text-gray-900">Bài học đang học tiếp</p>
          {stats.nextLesson ? (
            <div>
              <p className="text-xs font-semibold text-primary-600">Ngày {stats.nextLesson.day}</p>
              <p className="mt-1 text-base font-bold text-gray-900">{stats.nextLesson.title}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <Clock className="size-3.5" />
                {stats.nextLesson.duration} phút
              </p>
              <LinkButton href={`/bai-hoc/${stats.nextLesson.day}`} size="sm" className="mt-4">
                Tiếp tục học
                <ArrowRight className="size-3.5" />
              </LinkButton>
            </div>
          ) : stats.hasPaid ? (
            <p className="text-sm text-gray-500">
              Bạn đã hoàn thành toàn bộ 28 ngày. Ghé lộ trình để ôn lại bất kỳ bài nào!
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Bạn đã học xong Ngày 1. Mở khóa toàn bộ chương trình để tiếp tục hành trình!
            </p>
          )}
        </Card>

        {/* Today's challenge */}
        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold text-gray-900">Thử thách hôm nay</p>
          {todayChallenge ? (
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <LevelBadge level={todayChallenge.level} />
                <span className="text-xs text-gray-400">{todayChallenge.estimatedTime}</span>
              </div>
              <p className="text-base font-bold text-gray-900">{todayChallenge.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-gray-500">{todayChallenge.description}</p>
              <LinkButton href="/thu-thach" size="sm" variant="secondary" className="mt-4">
                Làm thử thách
                <ArrowRight className="size-3.5" />
              </LinkButton>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có thử thách mới — hãy khám phá thư viện thử thách.</p>
          )}
        </Card>
      </div>

      {/* Badges */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Badge / Thành tích</p>
          <Link href="/tien-do" className="text-xs font-medium text-primary-600 hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {badges.slice(0, 4).map((badge) => (
            <BadgeChip key={badge.code} badge={badge} />
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <p className="mb-3 text-sm font-semibold text-gray-900">Truy cập nhanh</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickLinks.map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-card transition hover:border-primary-200"
            >
              <span className={`flex size-10 items-center justify-center rounded-xl ${color}`}>
                <Icon className="size-5" />
              </span>
              <span className="text-sm font-semibold text-gray-900">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
