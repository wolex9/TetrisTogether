"use client";

import { useState, useEffect, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkUserExists, loginUser, registerUser, getCurrentUser, logout } from "@/auth/actions";
import { AuthProvider, type User } from "@/lib/auth-context";
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
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [existingUser, setExistingUser] = useState<User | null>(null);

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
        setIsGuest(false);
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
        setIsGuest(false);
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
    setUser({ id: Date.now(), username }); // assign a temporary id
    setIsGuest(true);
  };

  const handleContinueExisting = () => {
    if (existingUser) {
      setUser(existingUser);
      setIsGuest(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logout();
      setExistingUser(null);
      setIsGuest(false);
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
    return (
      <AuthProvider user={user} isGuest={isGuest}>
        {children}
      </AuthProvider>
    );
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
