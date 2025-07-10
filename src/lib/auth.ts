import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Initialize MongoDB client and database
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("pegasus_auth");

export const auth = betterAuth({
  database: mongodbAdapter(db),
    // Frontend (with auth) runs on port 3000, backend API runs on port 3001
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
  ],
  
  // Disable Better Auth's built-in CORS - we handle it in the route handler
  cors: false,
  
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Auto sign in after successful registration
  },
  
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    // Temporarily disabled - uncomment when credentials are ready
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // },
    // microsoft: {
    //   clientId: process.env.MICROSOFT_CLIENT_ID!,
    //   clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    // },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true, // Enable cookie caching for better performance
      maxAge: 60 * 5, // 5 minutes cache
    },
  },
  
  advanced: {
    cookiePrefix: "better-auth", // Explicit prefix for clarity
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
  
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string", 
        required: false,
      },
      avatar: {
        type: "string",
        required: false,
      },
      tokensUsed: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
      tokenLimit: {
        type: "number",
        required: false,
        defaultValue: 10000, // Default token limit for new users
      },
      isAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      isBanned: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      bannedAt: {
        type: "date",
        required: false,
      },
      banReason: {
        type: "string",
        required: false,
      },
    },
  },
  
  plugins: [
    nextCookies(), // Automatically handle cookies in Next.js
  ],
});

// Export types for TypeScript
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
