"use client";

import { useState } from "react";
import TetrisGame from "../tetris-game-oop";
import AuthGateway from "../components/auth-gateway";
import { logout } from "../lib/auth-actions";

export default function Home() {
  const [user, setUser] = useState<{ username: string; email?: string } | null>(null);

  const handleAuthenticated = (authenticatedUser: { username: string; email?: string }) => {
    setUser(authenticatedUser);
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
  };

  if (!user) {
    return <AuthGateway onAuthenticated={handleAuthenticated} />;
  }

  return (
    <main className="min-h-screen">
      <div className="border-b bg-gray-50 p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Welcome, {user.username}!</h1>
            {user.email && <p className="text-sm text-gray-600">{user.email}</p>}
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm transition-colors hover:bg-gray-300"
          >
            Sign Out
          </button>
        </div>
      </div>
      <TetrisGame />
    </main>
  );
}
