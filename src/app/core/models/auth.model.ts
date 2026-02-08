export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: any;
  success: boolean;
  message: string;
  token: string;
  customer: Customer;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  credit_limit?: number;
  created_at: string;
}

export interface AuthState {
  token: string | null;
  customer: Customer | null;
  isAuthenticated: boolean;
}
