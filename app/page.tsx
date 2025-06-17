"use client";

import { useState } from "react";
import TetrisGame from "../tetris-game-oop";
import AuthGateway from "../components/auth-gateway";

export default function Home() {
  const [user, setUser] = useState<{ username: string; email?: string } | null>(null);

  const handleAuthenticated = (authenticatedUser: { username: string; email?: string }) => {
    setUser(authenticatedUser);
  };

  if (!user) {
    return <AuthGateway onAuthenticated={handleAuthenticated} />;
  }

  return (
    <main className="min-h-screen">
      <div className="p-4 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Welcome, {user.username}!</h1>
            {user.email && <p className="text-sm text-gray-600">{user.email}</p>}
          </div>
          <button
            onClick={() => setUser(null)}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
      <TetrisGame />
    </main>
  );
}
