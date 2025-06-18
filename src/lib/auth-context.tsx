"use client";

import { createContext, useContext, ReactNode } from "react";
import { logout as serverLogout } from "@/auth/actions";

export interface User {
  id: number;
  username: string;
  country_code?: string;
}

interface AuthContextType {
  user: User;
  isGuest: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  user: User;
  isGuest: boolean;
  children: ReactNode;
}

export function AuthProvider({ user, isGuest, children }: AuthProviderProps) {
  const handleLogout = async () => {
    if (!isGuest) {
      await serverLogout();
    }
    window.location.reload();
  };

  return <AuthContext.Provider value={{ user, isGuest, logout: handleLogout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
