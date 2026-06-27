import { createContext } from "react";
import type { ApiAdmin, ApiUser } from "@/api/types";

export interface AuthContextValue {
  user: ApiUser | null;
  admin: ApiAdmin | null;
  userReady: boolean;
  adminReady: boolean;
  refreshUser: () => Promise<ApiUser | null>;
  refreshAdmin: () => Promise<ApiAdmin | null>;
  loginByPassword: (email: string, password: string) => Promise<ApiUser>;
  loginByCode: (email: string, code: string) => Promise<ApiUser>;
  logout: () => Promise<void>;
  logoutAdminSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
