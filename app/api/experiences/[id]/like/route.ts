import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ensureUserExists } from "@/lib/ensure-user";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await ensureUserExists(session.user);
    if (!userId) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    const { id: experienceId } = await params;
    if (!experienceId) {
      return NextResponse.json(
        { error: "Experience ID is required" },
        { status: 400 }
      );
    }

    // Check if experience exists
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
    });

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_experienceId: {
          userId,
          experienceId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({
        data: {
          userId,
          experienceId,
        },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
