/**
 * NextAuth.js Route Handler
 * 
 * This file configures NextAuth for authentication in the Todo application.
 * It handles sign in, sign out, and session management.
 */

import NextAuth, { NextAuthOptions } from 'next-auth';
import type { User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

// Define Credentials type
interface Credentials {
  email?: string;
  password?: string;
}

/**
 * NextAuth configuration options
 * 
 * For Better Auth integration, this should be updated to use Better Auth's
 * authentication flow. Current implementation provides a basic setup that
 * can be extended.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Credentials | undefined): Promise<User | null> {
        // TODO: Integrate with Better Auth backend
        // This is a placeholder implementation for development
        
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // In production, validate credentials against Better Auth
        // For now, allow any credentials in development mode
        if (process.env.NODE_ENV === 'development') {
          return {
            id: crypto.randomUUID(),
            email: credentials.email,
            name: credentials.email.split('@')[0],
          };
        }

        // Production: Call Better Auth API to validate credentials
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     email: credentials.email,
        //     password: credentials.password,
        //   }),
        // });
        //
        // if (!response.ok) {
        //   return null;
        // }
        //
        // const user = await response.json();
        // return user;

        return null;
      }
    }
  ],
  
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      // Add user ID to token on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    
    async session({ session, token }: { session: any; token: JWT }) {
      // Add user ID to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
