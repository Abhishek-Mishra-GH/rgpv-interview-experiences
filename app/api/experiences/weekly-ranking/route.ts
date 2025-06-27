import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureUserExists } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get current user session to check like/save status
    const session = await getServerSession(authOptions);
    let currentUserId: string | null = null;

    if (session?.user) {
      currentUserId = await ensureUserExists(session.user);
    }

    const topExperiences = await prisma.experience.findMany({
      where: {
        createdAt: {
          gte: oneWeekAgo,
        },
      },
      include: {
        author: {
          select: { name: true, isAnonymous: true },
        },
        _count: {
          select: { likes: true, saves: true },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
        saves: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
      orderBy: {
        likes: {
          _count: "desc",
        },
      },
      take: 10,
    });

    // Transform experiences to include user's like/save status
    const transformedExperiences = topExperiences.map((exp) => ({
      ...exp,
      isLikedByUser: currentUserId ? exp.likes.length > 0 : false,
      isSavedByUser: currentUserId ? exp.saves.length > 0 : false,
      likes: undefined, // Remove the likes array from response
      saves: undefined, // Remove the saves array from response
    }));

    return NextResponse.json(transformedExperiences || []);
  } catch (error) {
    console.error("Failed to fetch weekly ranking:", error);
    return NextResponse.json([], { status: 500 });
  }
}
