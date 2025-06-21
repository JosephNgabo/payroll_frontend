export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    username: string;
    email: string;
    title: string;
    user_profile: string;
    language: string;
    is_active: number;
    token: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  title: string;
  user_profile: string;
  language: string;
  is_active: number;
  first_name?: string;
  last_name?: string;
  role?: string;
  department?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
} 