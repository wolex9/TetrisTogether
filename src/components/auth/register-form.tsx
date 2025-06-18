"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RegisterFormProps {
  username: string;
  onSubmit: (email: string, password: string) => void;
  onBack: () => void;
  onAnonymous: () => void;
  loading?: boolean;
  error?: string;
}

export function RegisterForm({ onSubmit, onBack, onAnonymous, loading, error }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    onSubmit(email, password);
  };

  return (
    <div className="space-y-4">
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            E-pasts
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ievadiet savu e-pastu"
            disabled={loading}
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-gray-700">
            Parole
          </label>
          <Input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Izveidojiet paroli (min 6 rakstzīmes)"
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !email || !password || password.length < 6}
          size="lg"
        >
          {loading ? "Izveido kontu..." : "Izveidot kontu"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Vai</span>
        </div>
      </div>

      <Button onClick={onAnonymous} variant="outline" className="w-full" disabled={loading}>
        Turpināt kā viesim
      </Button>

      <Button type="button" onClick={onBack} variant="ghost" className="w-full">
        Atpakaļ uz lietotājvārdu
      </Button>
    </div>
  );
}
