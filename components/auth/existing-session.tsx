"use client";

import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/auth-types";

interface ExistingSessionProps {
  user: AuthUser;
  onContinue: () => void;
  onSignOut: () => void;
  loading?: boolean;
}

export function ExistingSession({ user, onContinue, onSignOut, loading }: ExistingSessionProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="mb-2 text-sm text-gray-600">You&apos;re already signed in as</p>
        <p className="text-lg font-semibold">{user.username}</p>
        {user.id !== "anonymous" && user.email && <p className="text-sm text-gray-500">{user.email}</p>}
        {user.id === "anonymous" && <p className="text-sm text-yellow-600">(Guest mode)</p>}
      </div>

      <Button onClick={onContinue} className="w-full" size="lg" disabled={loading}>
        Continue
      </Button>

      <Button onClick={onSignOut} variant="outline" className="w-full" disabled={loading}>
        Sign Out & Use Different Account
      </Button>
    </div>
  );
}
