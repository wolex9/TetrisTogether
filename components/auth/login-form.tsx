"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  username: string;
  onSubmit: (password: string) => void;
  onBack: () => void;
  loading?: boolean;
  error?: string;
}

export function LoginForm({ onSubmit, onBack, loading, error }: LoginFormProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
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
      <Button type="submit" className="w-full" disabled={loading || !password} size="lg">
        {loading ? "Signing In..." : "Sign In"}
      </Button>
      <Button type="button" onClick={onBack} variant="outline" className="w-full">
        Back to Username
      </Button>
    </form>
  );
}
