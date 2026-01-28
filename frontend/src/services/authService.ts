/**
 * Better Auth service for authentication management.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
  };
}

/**
 * Login with email and password.
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  
  // Store token in localStorage
  localStorage.setItem('auth_token', data.access_token);
  
  return data;
}

/**
 * Register a new user account.
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Registration failed');
  }

  const authData = await response.json();
  
  // Store token in localStorage
  localStorage.setItem('auth_token', authData.access_token);
  
  return authData;
}

/**
 * Logout and clear authentication token.
 */
export function logout(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Get current authentication token.
 */
export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Check if user is authenticated.
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}
