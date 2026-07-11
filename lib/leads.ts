import "server-only";
import { prisma } from "@/lib/prisma";
import type { Lead } from "@/generated/prisma/client";

export async function getLeadForUser(userId: string): Promise<Lead | null> {
  return prisma.lead.findUnique({ where: { userId } });
}
