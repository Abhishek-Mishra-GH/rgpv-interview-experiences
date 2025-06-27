import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureUserExists } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get current user session to check like/save status
    const session = await getServerSession(authOptions);
    let currentUserId: string | null = null;

    if (session?.user) {
      currentUserId = await ensureUserExists(session.user);
    }

    const experience = await prisma.experience.findUnique({
      where: { id },
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
    });

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    // Transform experience to include user's like/save status
    const transformedExperience = {
      ...experience,
      isLikedByUser: currentUserId ? experience.likes.length > 0 : false,
      isSavedByUser: currentUserId ? experience.saves.length > 0 : false,
      likes: undefined, // Remove the likes array from response
      saves: undefined, // Remove the saves array from response
    };

    return NextResponse.json(transformedExperience);
  } catch (error) {
    console.error("Failed to fetch experience:", error);
    return NextResponse.json(
      { error: "Failed to fetch experience" },
      { status: 500 }
    );
  }
}
