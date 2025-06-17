"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { logout as serverLogout } from "@/auth/actions";
import type { AuthUser } from "@/lib/auth-types";

interface AuthContextType {
  user: AuthUser;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  user: AuthUser;
  children: ReactNode;
}

export function AuthProvider({ user, children }: AuthProviderProps) {
  const handleLogout = async () => {
    if (user?.id !== "anonymous") {
      await serverLogout();
    }
    // After logout, the parent (AuthGateway) will handle the redirect
    window.location.reload();
  };

  return <AuthContext.Provider value={{ user, logout: handleLogout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
