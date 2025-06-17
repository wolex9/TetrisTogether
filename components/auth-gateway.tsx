"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// In-memory store for users
let users: Map<string, { email: string; password: string }> = new Map();
let currentUser: { username: string; email?: string } | null = null;

type AuthStep = "initial" | "username" | "login" | "register" | "anonymous-confirm" | "authenticated";

interface AuthGatewayProps {
    onAuthenticated: (user: { username: string; email?: string }) => void;
}

export default function AuthGateway({ onAuthenticated }: AuthGatewayProps) {
    const [step, setStep] = useState<AuthStep>(currentUser ? "initial" : "username");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Server actions
    const checkUserExists = async (username: string): Promise<boolean> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return users.has(username);
    };

    const loginUser = async (username: string, password: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const user = users.get(username);
        return user ? user.password === password : false;
    };

    const registerUser = async (username: string, email: string, password: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (users.has(username)) {
            return false; // User already exists
        }
        users.set(username, { email, password });
        return true;
    };

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
            const success = await loginUser(username, password);
            if (success) {
                const user = users.get(username)!;
                currentUser = { username, email: user.email };
                onAuthenticated(currentUser);
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
            const success = await registerUser(username, email, password);
            if (success) {
                currentUser = { username, email };
                onAuthenticated(currentUser);
            } else {
                setError("Registration failed. Username may already exist.");
            }
        } catch (err) {
            setError("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnonymousLogin = () => {
        currentUser = { username };
        onAuthenticated(currentUser);
    };

    const handleContinueAsUser = () => {
        if (currentUser) {
            onAuthenticated(currentUser);
        }
    };

    const handleLogout = () => {
        currentUser = null;
        setStep("username");
        setUsername("");
        setPassword("");
        setEmail("");
        setError("");
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

    // If user is already authenticated, show continue option
    if (step === "initial" && currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                        <CardDescription>
                            You're already signed in as <strong>{currentUser.username}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={handleContinueAsUser} className="w-full" size="lg">
                            Continue to App
                        </Button>
                        <Button onClick={handleLogout} variant="outline" className="w-full">
                            Sign Out & Use Different Account
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Username Step */}
                    {step === "username" && (
                        <form onSubmit={handleUsernameSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
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
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
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

                            <Button
                                onClick={() => setStep("anonymous-confirm")}
                                variant="outline"
                                className="w-full"
                            >
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
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Your progress and data won't be saved when continuing anonymously.
                                </p>
                            </div>
                            <Button onClick={handleAnonymousLogin} className="w-full" size="lg">
                                Yes, Continue as {username}
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
