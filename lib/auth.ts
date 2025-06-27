import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: "anonymous",
      name: "Anonymous",
      credentials: {
        anonymous: { label: "Anonymous", type: "hidden", value: "true" },
      },
      async authorize(credentials) {
        if (credentials?.anonymous === "true") {
          try {
            // Create anonymous user in database with auto-generated ID
            const user = await prisma.user.create({
              data: {
                name: "Anonymous User",
                email: null,
                isAnonymous: true,
              },
            });

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              isAnonymous: user.isAnonymous,
            };
          } catch (error) {
            console.error("Failed to create anonymous user:", error);
            return null;
          }
        }
        return null;
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "hidden" }, // "signin" or "signup"
        name: { label: "Name", type: "text" }, // Only for signup
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          return null;
        }

        try {
          const action = credentials.action || "signin";

          if (action === "signup") {
            // Sign up - Create new user
            if (!credentials.name?.trim()) {
              return null;
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
              where: { email: credentials.email },
            });

            if (existingUser) {
              return null; // User already exists
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(credentials.password, 12);

            // Create new user
            const user = await prisma.user.create({
              data: {
                name: credentials.name.trim(),
                email: credentials.email,
                password: hashedPassword,
                isAnonymous: false,
              },
            });

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              isAnonymous: user.isAnonymous,
            };
          } else {
            // Sign in - Verify existing user
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
            });

            if (!user || !user.password) {
              return null; // User not found or no password set
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            );
            if (!isPasswordValid) {
              return null; // Invalid password
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              isAnonymous: user.isAnonymous,
            };
          }
        } catch (error) {
          console.error("Authentication failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.isAnonymous = user.isAnonymous;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.isAnonymous = token.isAnonymous as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
  },
};
