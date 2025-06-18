"use client";

import Link from "next/link";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Līderu saraksts</h1>
          <Link href="/" className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700">
            ← Atpakaļ
          </Link>
        </div>

        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <h2 className="mb-4 text-2xl font-semibold text-gray-700">Līderu saraksts</h2>
          <p className="mb-8 text-gray-600">Šeit būs redzami labākie rezultāti un statistika.</p>
          <div className="text-gray-500">Funkcionalitāte tiks pievienota drīzumā...</div>
        </div>
      </div>
    </div>
  );
}
