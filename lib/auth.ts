/**
 * NextAuth Configuration for V0 Clone
 * Handles user authentication, session management, and guest access
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query, queryOne } from "./neon";

const ANONYMOUS_CHAT_DAILY_LIMIT = 3;

let ensureAnonymousChatLogTablePromise: Promise<void> | null = null;

async function ensureAnonymousChatLogTable() {
  if (!ensureAnonymousChatLogTablePromise) {
    ensureAnonymousChatLogTablePromise = (async () => {
      await query(
        `CREATE TABLE IF NOT EXISTS anonymous_chat_log (
          id SERIAL PRIMARY KEY,
          ip_address VARCHAR(45) NOT NULL,
          v0_chat_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )`
      );

      await query(
        `CREATE INDEX IF NOT EXISTS idx_anonymous_chat_log_ip ON anonymous_chat_log(ip_address)`
      );
      await query(
        `CREATE INDEX IF NOT EXISTS idx_anonymous_chat_log_created_at ON anonymous_chat_log(created_at)`
      );
    })().catch((error) => {
      ensureAnonymousChatLogTablePromise = null;
      throw error;
    });
  }

  return ensureAnonymousChatLogTablePromise;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  user_type: "anonymous" | "guest" | "registered";
  daily_chat_limit: number;
}

/**
 * NextAuth configuration
 * 
 * Note: For production, ensure NEXTAUTH_SECRET and NEXTAUTH_URL are set in environment variables.
 * For development, defaults are provided to reduce warnings.
 */
// Set environment variables if not already set (development only)
if (process.env.NODE_ENV !== 'production') {
  if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = 'development-secret-change-in-production';
  }
  if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
  }
}

const getNextAuthSecret = (): string => {
  // In production, secret must be set
  if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is required in production');
  }
  return process.env.NEXTAUTH_SECRET!;
};

const getNextAuthUrl = (): string | undefined => {
  return process.env.NEXTAUTH_URL;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await queryOne<User>(
          `SELECT id, email, name, user_type, daily_chat_limit, password_hash
           FROM users
           WHERE email = $1`,
          [credentials.email]
        );

        if (!user || !("password_hash" in user)) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash as string
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          user_type: user.user_type,
          daily_chat_limit: user.daily_chat_limit,
        };
      },
    }),
    // Guest provider - auto-creates temporary accounts
    CredentialsProvider({
      id: "guest",
      name: "Guest",
      credentials: {},
      async authorize() {
        // Generate a unique guest email
        const guestEmail = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}@v0.local`;
        const guestPassword = Math.random().toString(36).substring(2, 15);
        const passwordHash = await bcrypt.hash(guestPassword, 10);

        const result = await query<User>(
          `INSERT INTO users (email, password_hash, name, user_type, daily_chat_limit)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, email, name, user_type, daily_chat_limit`,
          [guestEmail, passwordHash, "Guest User", "guest", 5]
        );

        const user = result[0];
        if (!user) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          user_type: user.user_type,
          daily_chat_limit: user.daily_chat_limit,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.user_type = (user as any).user_type;
        token.daily_chat_limit = (user as any).daily_chat_limit;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).user_type = token.user_type;
        (session.user as any).daily_chat_limit = token.daily_chat_limit;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: getNextAuthSecret(),
};

/**
 * Helper functions for user management
 */

/**
 * Create a new registered user
 */
export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<User | null> {
  try {
    // Check if user already exists
    const existing = await queryOne<User>(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing) {
      throw new Error("User already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await query<User>(
      `INSERT INTO users (email, password_hash, name, user_type, daily_chat_limit)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, user_type, daily_chat_limit`,
      [email, passwordHash, name || null, "registered", 50]
    );

    return result[0] || null;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<User | null> {
  return queryOne<User>(
    `SELECT id, email, name, user_type, daily_chat_limit
     FROM users
     WHERE id = $1`,
    [userId]
  );
}

/**
 * Check daily chat limit for a user
 */
export async function checkChatLimit(
  userId: number,
  date: Date = new Date()
): Promise<{ allowed: boolean; count: number; limit: number }> {
  const user = await getUserById(userId);
  if (!user) {
    return { allowed: false, count: 0, limit: 0 };
  }

  // Get chat count for today
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const result = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM chat_ownership
     WHERE user_id = $1 AND created_at >= $2`,
    [userId, startOfDay.toISOString()]
  );

  const count = parseInt(result?.count || "0");
  const allowed = count < user.daily_chat_limit;

  return {
    allowed,
    count,
    limit: user.daily_chat_limit,
  };
}

/**
 * Check anonymous chat limit by IP address
 */
export async function checkAnonymousChatLimit(
  ipAddress: string,
  date: Date = new Date()
): Promise<{ allowed: boolean; count: number; limit: number }> {
  const limit = ANONYMOUS_CHAT_DAILY_LIMIT;

  try {
    await ensureAnonymousChatLogTable();

    // Get chat count for today
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const result = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM anonymous_chat_log
       WHERE ip_address = $1 AND created_at >= $2`,
      [ipAddress, startOfDay.toISOString()]
    );

    const count = parseInt(result?.count || "0");
    const allowed = count < limit;

    return {
      allowed,
      count,
      limit,
    };
  } catch (error) {
    console.error(
      "Failed to enforce anonymous chat limit, allowing request by default:",
      error
    );

    return {
      allowed: true,
      count: 0,
      limit,
    };
  }
}

/**
 * Log an anonymous chat creation
 */
export async function logAnonymousChat(
  ipAddress: string,
  chatId: string
): Promise<void> {
  try {
    await ensureAnonymousChatLogTable();
    await query(
      `INSERT INTO anonymous_chat_log (ip_address, v0_chat_id)
       VALUES ($1, $2)`,
      [ipAddress, chatId]
    );
  } catch (error) {
    console.error("Failed to log anonymous chat creation:", error);
  }
}
