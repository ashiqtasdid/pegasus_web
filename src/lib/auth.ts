import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Initialize MongoDB client and database
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("pegasus_auth");

export const auth = betterAuth({
  database: mongodbAdapter(db),
    // Frontend (with auth) runs on port 3000, external API runs on port 3001
  baseURL: process.env.NODE_ENV === 'production' 
    ? "http://37.114.41.124:3000" 
    : "http://localhost:3000",
  trustedOrigins: [
    "http://37.114.41.124:3000",
    "http://localhost:3000",
    "http://0.0.0.0:3000",
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
