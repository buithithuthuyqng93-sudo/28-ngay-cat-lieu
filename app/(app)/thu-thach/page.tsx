import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/dal";
import { getLessonsWithStatus } from "@/lib/progress";
import { prisma } from "@/lib/prisma";
import { WEEKS } from "@/lib/weeks";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { PaywallBanner } from "@/components/lessons/PaywallBanner";

export const metadata: Metadata = { title: "Thử thách | 28 Ngày Thử Thách Cắt Liều" };

export default async function ChallengesPage() {
  const user = await getCurrentUser();

  const [lessons, challenges, submissions] = await Promise.all([
    getLessonsWithStatus(user.id),
    prisma.challenge.findMany({ orderBy: { day: "asc" } }),
    prisma.submission.findMany({ where: { userId: user.id } }),
  ]);

  const lockedDays = new Set(lessons.filter((l) => l.status === "locked").map((l) => l.day));
  const hasPaid = !lessons.some((l) => l.requiresPayment);
  const submissionByChallenge = new Map(submissions.map((s) => [s.challengeId, s]));
  const submittedCount = submissions.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thử thách 28 ngày</h1>
        <p className="mt-1 text-sm text-gray-600">
          Bạn đã nộp {submittedCount}/{challenges.length} thử thách. Mỗi thử thách gắn với bài học cùng ngày.
        </p>
      </div>

      {!hasPaid && <PaywallBanner />}

      {WEEKS.map((week) => {
        const weekChallenges = challenges.filter((c) => c.day >= week.startDay && c.day <= week.endDay);
        if (weekChallenges.length === 0) return null;

        return (
          <section key={week.number}>
            <div className="mb-3">
              <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-bold text-primary-700">
                Tuần {week.number}
              </span>
              <h2 className="mt-1.5 text-lg font-bold text-gray-900">{week.title}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {weekChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  locked={lockedDays.has(challenge.day)}
                  existingSubmission={submissionByChallenge.get(challenge.id) ?? null}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
