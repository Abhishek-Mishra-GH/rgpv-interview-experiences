import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureUserExists } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";

const DEFAULT_RESPONSE = {
  experiences: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(
      1,
      Math.min(50, Number.parseInt(searchParams.get("limit") || "10"))
    );
    const sortBy = searchParams.get("sortBy") || "recent";

    const skip = (page - 1) * limit;

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "popular") {
      orderBy = { likes: { _count: "desc" } };
    }

    // Get current user session to check like/save status
    const session = await getServerSession(authOptions);
    let currentUserId: string | null = null;

    if (session?.user) {
      currentUserId = await ensureUserExists(session.user);
    }

    // Get total count and experiences
    const [total, experiences] = await Promise.all([
      prisma.experience.count(),
      prisma.experience.findMany({
        skip,
        take: limit,
        orderBy,
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
      }),
    ]);

    // Transform experiences to include user's like/save status
    const transformedExperiences = experiences.map((exp) => ({
      ...exp,
      isLikedByUser: currentUserId ? exp.likes.length > 0 : false,
      isSavedByUser: currentUserId ? exp.saves.length > 0 : false,
      likes: undefined, // Remove the likes array from response
      saves: undefined, // Remove the saves array from response
    }));

    const response = {
      experiences: transformedExperiences,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch experiences:", error);
    return NextResponse.json(
      {
        ...DEFAULT_RESPONSE,
        error: "Failed to fetch experiences",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the user exists in the database
    const userId = await ensureUserExists(session.user);

    if (!userId) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      title,
      company,
      position,
      content,
      salary,
      location,
      difficulty,
      outcome,
      tips,
      isAnonymous,
    } = body;

    // Validate required fields
    const requiredFields = {
      title,
      company,
      position,
      content,
      difficulty,
      outcome,
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value?.trim())
      .map(([key, _]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const experience = await prisma.experience.create({
      data: {
        title: title.trim(),
        company: company.trim(),
        position: position.trim(),
        content: content.trim(),
        salary: salary?.trim() || null,
        location: location?.trim() || null,
        difficulty: difficulty.trim(),
        outcome: outcome.trim(),
        tips: tips?.trim() || null,
        authorId: userId,
        isAnonymous: Boolean(isAnonymous) || session.user.isAnonymous,
      },
      include: {
        author: {
          select: { name: true, isAnonymous: true },
        },
        _count: {
          select: { likes: true, saves: true },
        },
      },
    });

    return NextResponse.json(experience);
  } catch (error) {
    console.error("Failed to create experience:", error);
    return NextResponse.json(
      { error: "Failed to create experience" },
      { status: 500 }
    );
  }
}
