import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionPayload } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const verifySession = cache(async () => {
  const session = await getSessionPayload();

  if (!session?.userId) {
    redirect("/dang-nhap");
  }

  return { isAuth: true, userId: session.userId };
});

export const getOptionalSession = cache(async () => {
  const session = await getSessionPayload();
  if (!session?.userId) return null;
  return { userId: session.userId };
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    redirect("/dang-nhap");
  }

  return user;
});
