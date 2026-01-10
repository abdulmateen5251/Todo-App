/**
 * NextAuth Configuration
 * 
 * Centralized authentication configuration for the Todo application.
 */

import type { NextAuthOptions, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

// Define Credentials type
interface Credentials {
  email?: string;
  password?: string;
  name?: string;
}

/**
 * Generate a consistent user ID from email for development
 * Uses a simple hash to ensure same email = same ID
 */
async function generateUserIdFromEmail(email: string): Promise<string> {
  // For development, create a deterministic UUID based on email
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Format as UUID (take first 32 chars and format as UUID)
  return [
    hashHex.slice(0, 8),
    hashHex.slice(8, 12),
    hashHex.slice(12, 16),
    hashHex.slice(16, 20),
    hashHex.slice(20, 32)
  ].join('-');
}

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' }
      },
      async authorize(credentials: Credentials | undefined): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Development mode: Accept any credentials
        if (process.env.NODE_ENV === 'development') {
          // Generate consistent user ID based on email
          const userId = await generateUserIdFromEmail(credentials.email);
          
          return {
            id: userId,
            email: credentials.email,
            name: credentials.name || credentials.email.split('@')[0],
          };
        }

        // Production: Call backend API to validate credentials
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const user = await response.json();
          return user;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
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
