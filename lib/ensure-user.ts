import prisma from "./prisma";

export async function ensureUserExists(sessionUser: any) {
  if (!sessionUser?.id) {
    return null;
  }

  try {
    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (existingUser) {
      return existingUser.id;
    }

    // If user doesn't exist, create them
    // This can happen if the session exists but the database record was lost
    const newUser = await prisma.user.create({
      data: {
        id: sessionUser.id,
        name:
          sessionUser.name ||
          (sessionUser.isAnonymous ? "Anonymous User" : "Unknown User"),
        email: sessionUser.email || null,
        isAnonymous: Boolean(sessionUser.isAnonymous),
      },
    });

    return newUser.id;
  } catch (error) {
    // If creation fails due to ID constraint, try without custom ID
    try {
      const fallbackUser = await prisma.user.create({
        data: {
          name:
            sessionUser.name ||
            (sessionUser.isAnonymous ? "Anonymous User" : "Unknown User"),
          email: sessionUser.email || null,
          isAnonymous: Boolean(sessionUser.isAnonymous),
        },
      });
      return fallbackUser.id;
    } catch (fallbackError) {
      console.error("Failed to ensure user exists:", fallbackError);
      return null;
    }
  }
}
