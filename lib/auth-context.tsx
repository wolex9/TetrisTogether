"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getCurrentUser, logout as serverLogout } from "./auth-actions";
import AuthGateway from "../components/auth-gateway";

interface User {
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then((userData) => {
      setCurrentSession(userData);
      setIsLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await serverLogout();
    setUser(null);
    setCurrentSession(null);
  };

  const handleAuthenticated = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthGateway onAuthenticated={handleAuthenticated} existingSession={currentSession} />;
  }

  return <AuthContext.Provider value={{ user, logout: handleLogout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
