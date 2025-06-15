import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Initialize MongoDB client and database
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("pegasus_auth");

export const auth = betterAuth({
  database: mongodbAdapter(db),
  
  // Configure base URL and trusted origins for production
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3001",
    "http://localhost:3001",
    "http://0.0.0.0:3001",
    // Add your production domain here if needed
    ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(',') : [])
  ],
  
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Auto sign in after successful registration
  },
  
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
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
    },
  },
  
  plugins: [
    nextCookies(), // Automatically handle cookies in Next.js
  ],
});

// Export types for TypeScript
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
