import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { ensureUserExists } from "@/lib/ensure-user"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Anonymous users can't save experiences
    if (session.user.isAnonymous) {
      return NextResponse.json({ error: "Anonymous users cannot save experiences" }, { status: 403 })
    }

    const userId = await ensureUserExists(session.user)
    if (!userId) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    const experienceId = await params.id
    if (!experienceId) {
      return NextResponse.json({ error: "Experience ID is required" }, { status: 400 })
    }

    // Check if experience exists
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
    })

    if (!experience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 })
    }

    const existingSave = await prisma.save.findUnique({
      where: {
        userId_experienceId: {
          userId,
          experienceId,
        },
      },
    })

    if (existingSave) {
      await prisma.save.delete({
        where: { id: existingSave.id },
      })
      return NextResponse.json({ saved: false })
    } else {
      await prisma.save.create({
        data: {
          userId,
          experienceId,
        },
      })
      return NextResponse.json({ saved: true })
    }
  } catch (error) {
    console.error("Failed to toggle save:", error)
    return NextResponse.json({ error: "Failed to toggle save" }, { status: 500 })
  }
}
