"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkUserExists, loginUser, registerUser, createAnonymousSession, logout } from "@/lib/auth-actions";

type AuthStep = "username" | "login" | "register" | "anonymous-confirm" | "existing-session";

interface AuthGatewayProps {
  onAuthenticated: (user: { username: string; email?: string }) => void;
  existingSession?: { username: string; email?: string } | null;
}

export default function AuthGateway({ onAuthenticated, existingSession }: AuthGatewayProps) {
  const [step, setStep] = useState<AuthStep>("username");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingSession) {
      setStep("existing-session");
    }
  }, [existingSession]);

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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      const result = await createAnonymousSession(username);
      onAuthenticated(result.user);
    } catch (err) {
      setError("Failed to create session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithExistingSession = () => {
    if (existingSession) {
      onAuthenticated(existingSession);
    }
  };

  const handleSignOutAndUseNew = async () => {
    try {
      await logout();
      setStep("username");
      setUsername("");
      setPassword("");
      setEmail("");
      setError("");
    } catch (err) {
      setError("Failed to sign out. Please try again.");
    }
  };

  const goBack = () => {
    setError("");
    setPassword("");
    setEmail("");
    if (step === "login" || step === "register") {
      setStep("username");
    } else if (step === "anonymous-confirm") {
      setStep("register");
    }
  };

  // If user has existing session, show continue options
  if (step === "existing-session" && existingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription>
              You're already signed in as <strong>{existingSession.username}</strong>
              {existingSession.email && (
                <>
                  <br />
                  <span className="text-sm text-gray-500">{existingSession.email}</span>
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleContinueWithExistingSession} className="w-full" size="lg">
              Continue to App
            </Button>
            <Button onClick={handleSignOutAndUseNew} variant="outline" className="w-full">
              Sign Out & Use Different Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {step === "username" && "Enter Username"}
            {step === "login" && "Welcome Back"}
            {step === "register" && "Create Account"}
            {step === "anonymous-confirm" && "Continue Anonymously"}
          </CardTitle>
          <CardDescription>
            {step === "username" && "Enter your username to continue"}
            {step === "login" && `Hi ${username}! Please enter your password`}
            {step === "register" && `Hi ${username}! Let's create your account`}
            {step === "anonymous-confirm" && `Continue as ${username} without saving your data?`}
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
            <div className="space-y-4">
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
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button onClick={() => setStep("anonymous-confirm")} variant="outline" className="w-full">
                Continue Without Account
              </Button>

              <Button type="button" onClick={goBack} variant="ghost" className="w-full">
                Back to Username
              </Button>
            </div>
          )}

          {/* Anonymous Confirmation Step */}
          {step === "anonymous-confirm" && (
            <div className="space-y-4">
              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Your progress and data won't be saved when continuing anonymously.
                </p>
              </div>
              <Button onClick={handleAnonymousLogin} className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating Session..." : `Yes, Continue as ${username}`}
              </Button>
              <Button onClick={goBack} variant="outline" className="w-full">
                Back to Registration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
