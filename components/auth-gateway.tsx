"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkUserExists, loginUser, registerUser, type User } from "@/lib/auth";

type AuthStep = "username" | "login" | "register";

interface AuthGatewayProps {
  onAuthenticated: (user: User) => void;
}

export default function AuthGateway({ onAuthenticated }: AuthGatewayProps) {
  const [step, setStep] = useState<AuthStep>("username");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userExists = await checkUserExists(username);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await loginUser(username, password);
      if (result.success && result.user) {
        onAuthenticated(result.user);
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await registerUser(username, email, password);
      if (result.success && result.user) {
        onAuthenticated(result.user);
      } else {
        setError("Registration failed. Username may already exist.");
      }
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError("");
    setPassword("");
    setEmail("");
    if (step === "login" || step === "register") {
      setStep("username");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {step === "username" && "Welcome to Tetris"}
            {step === "login" && `Welcome back, ${username}!`}
            {step === "register" && `Create account for ${username}`}
          </CardTitle>
          <CardDescription>
            {step === "username" && "Enter your username to get started"}
            {step === "login" && "Enter your password to continue"}
            {step === "register" && "Create a new account to save your progress"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          {/* Username Step */}
          {step === "username" && (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? "Checking..." : "Continue"}
              </Button>
            </form>
          )}

          {/* Login Step */}
          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? "Signing In..." : "Sign In"}
              </Button>
              <Button type="button" onClick={goBack} variant="outline" className="w-full">
                Back to Username
              </Button>
            </form>
          )}

          {/* Register Step */}
          {step === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 6 characters)"
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
              <Button type="button" onClick={goBack} variant="outline" className="w-full">
                Back to Username
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
