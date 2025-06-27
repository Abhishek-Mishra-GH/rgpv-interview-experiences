import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureUserExists } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Anonymous users can't have saved experiences
    if (session.user.isAnonymous) {
      return NextResponse.json({
        experiences: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      });
    }

    const userId = await ensureUserExists(session.user);
    if (!userId) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(
      1,
      Math.min(50, Number.parseInt(searchParams.get("limit") || "10"))
    );

    const skip = (page - 1) * limit;

    // Get saved experiences for the user
    const [total, savedExperiences] = await Promise.all([
      prisma.save.count({
        where: { userId },
      }),
      prisma.save.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { experience: { createdAt: "desc" } },
        include: {
          experience: {
            include: {
              author: {
                select: { name: true, isAnonymous: true },
              },
              _count: {
                select: { likes: true, saves: true },
              },
              likes: {
                where: { userId },
                select: { id: true },
              },
              saves: {
                where: { userId },
                select: { id: true },
              },
            },
          },
        },
      }),
    ]);

    // Transform the data to match the expected format
    const experiences = savedExperiences.map((save) => ({
      ...save.experience,
      isLikedByUser: save.experience.likes.length > 0,
      isSavedByUser: true, // Always true for saved experiences
      likes: undefined,
      saves: undefined,
    }));

    const response = {
      experiences,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch saved experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved experiences" },
      { status: 500 }
    );
  }
}
