"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkUserExists, loginUser, registerUser, getCurrentUser, logout } from "@/lib/auth";
import { createAnonymousUser, type AuthUser } from "@/lib/auth-types";
import { AuthProvider } from "@/lib/auth-context";
import { UsernameForm } from "@/components/auth/username-form";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { ExistingSession } from "@/components/auth/existing-session";

type AuthStep = "checking" | "username" | "login" | "register" | "existing";

export default function AuthGateway({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<AuthStep>("checking");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [existingUser, setExistingUser] = useState<AuthUser | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    getCurrentUser().then((userData) => {
      if (userData) {
        setExistingUser(userData);
        setStep("existing");
      } else {
        setStep("username");
      }
    });
  }, []);

  const handleUsernameSubmit = async (submittedUsername: string) => {
    setUsername(submittedUsername);
    setLoading(true);
    setError("");

    try {
      const userExists = await checkUserExists(submittedUsername);
      if (userExists) {
        setStep("login");
      } else {
        setStep("register");
      }
    } catch {
      setError("Failed to check user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (password: string) => {
    setLoading(true);
    setError("");

    try {
      const result = await loginUser(username, password);
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await registerUser(username, email, password);
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        setError("Registration failed. Username may already exist.");
      }
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = () => {
    const anonymousUser = createAnonymousUser(username);
    setUser(anonymousUser);
  };

  const handleContinueExisting = () => {
    if (existingUser) {
      setUser(existingUser);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logout();
      setExistingUser(null);
      setStep("username");
      setUsername("");
      setError("");
    } catch {
      setError("Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError("");
    if (step === "login" || step === "register") {
      setStep("username");
    }
  };

  const getTitle = () => {
    switch (step) {
      case "checking":
        return "Loading...";
      case "username":
        return "Welcome to Tetris";
      case "login":
        return `Welcome back, ${username}!`;
      case "register":
        return `Create account for ${username}`;
      case "existing":
        return "Continue Playing";
      default:
        return "Welcome";
    }
  };

  const getDescription = () => {
    switch (step) {
      case "checking":
        return "Please wait...";
      case "username":
        return "Enter your username to get started";
      case "login":
        return "Enter your password to continue";
      case "register":
        return "Create a new account or continue as guest";
      case "existing":
        return "You have an active session";
      default:
        return "";
    }
  };

  // If user is authenticated, render the app with AuthProvider
  if (user) {
    return <AuthProvider user={user}>{children}</AuthProvider>;
  }

  if (step === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>

        <CardContent>
          {step === "username" && <UsernameForm onSubmit={handleUsernameSubmit} loading={loading} error={error} />}

          {step === "login" && (
            <LoginForm username={username} onSubmit={handleLogin} onBack={goBack} loading={loading} error={error} />
          )}

          {step === "register" && (
            <RegisterForm
              username={username}
              onSubmit={handleRegister}
              onBack={goBack}
              onAnonymous={handleAnonymous}
              loading={loading}
              error={error}
            />
          )}

          {step === "existing" && existingUser && (
            <ExistingSession
              user={existingUser}
              onContinue={handleContinueExisting}
              onSignOut={handleSignOut}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
