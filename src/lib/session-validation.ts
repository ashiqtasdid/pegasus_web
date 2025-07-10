import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server-side session validation for protected pages
 * Call this in server components or page components to ensure user is authenticated
 */
export async function validateSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || !session?.session) {
      redirect('/auth');
    }

    // Check if user is banned
    if (session.user.isBanned) {
      redirect('/banned');
    }

    return session;
  } catch (error) {
    console.error('Session validation error:', error);
    redirect('/auth');
  }
}

/**
 * Get session without redirecting (for components that need to handle auth state)
 */
export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error('Session get error:', error);
    return null;
  }
}
