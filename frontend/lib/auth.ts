/**
 * NextAuth Configuration
 * 
 * Centralized authentication configuration for the Todo application.
 */

import type { NextAuthOptions, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { Session } from 'next-auth';

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text', required: false }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        console.log('Authorizing user:', credentials.email);

        // Call backend API to validate credentials
        try {
          // Use API_URL for server-side calls (inside Docker), fallback to NEXT_PUBLIC for dev
          const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            console.log('Login failed:', response.status);
            return null;
          }

          const data = await response.json();
          console.log('Login successful:', data.id);
          
          // Store JWT token in localStorage for API calls
          if (typeof window !== 'undefined' && data.access_token) {
            localStorage.setItem('auth_token', data.access_token);
          }
          
          return {
            id: data.id,
            email: data.email,
            name: data.name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user }) {
      // Add user ID to token on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Add user ID to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string | null | undefined;
        session.user.name = token.name as string | null | undefined;
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
