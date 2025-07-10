import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Initialize MongoDB client and database
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("pegasus_auth");

// Get the base URL for production vs development
const getBaseURL = () => {
  // Production: Use the public app URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }
  
  // Development: Use localhost
  return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
};

const baseURL = getBaseURL();

// Build trusted origins list
const getTrustedOrigins = () => {
  const origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
  ];
  
  // Add Vercel preview URLs
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  
  // Add production URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }
  
  // Add Better Auth URL if different
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL && process.env.NEXT_PUBLIC_BETTER_AUTH_URL !== process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_BETTER_AUTH_URL);
  }
  
  return [...new Set(origins)].filter(Boolean); // Remove duplicates and falsy values
};

export const auth = betterAuth({
  database: mongodbAdapter(db),
  baseURL,
  trustedOrigins: getTrustedOrigins(),
  
  // Enable CORS with proper configuration
  cors: {
    origin: getTrustedOrigins(),
    credentials: true,
  },
  
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
    crossSubDomainCookies: {
      enabled: false, // Disable unless you need cross-subdomain auth
    },
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
