export type Role = "USER" | "ADMIN";

export interface UserResponse {
  userId: string;
  displayName: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  displayName: string;
  password: string;
}
