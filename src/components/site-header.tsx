"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { UserHoverCard } from "@/components/user-hover-card";
import { User as UserIcon, LogOut as LogOutIcon } from "lucide-react";

export function SiteHeader() {
  const { user, logout } = useAuth();

  return (
    <div className="border-b bg-gray-50 p-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">tg</h1>
        </div>
        <UserHoverCard user={user} triggerClassName="flex items-center gap-2">
          <div className="space-y-1">
            <Link
              href={`/profile/${user.username}`}
              className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-100"
            >
              <UserIcon className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded px-2 py-1 text-red-400 hover:bg-gray-100"
            >
              <LogOutIcon className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </UserHoverCard>
      </div>
    </div>
  );
}
