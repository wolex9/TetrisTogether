"use client";

import TetrisGame from "@/tetris-game-oop";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen">
      <div className="border-b bg-gray-50 p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Welcome, {user.username}!</h1>
            {user.email && <p className="text-sm text-gray-600">{user.email}</p>}
          </div>
          <button
            onClick={logout}
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
