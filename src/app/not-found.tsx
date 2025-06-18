"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Gamepad2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 text-6xl">🧩</div>
          <CardTitle className="text-3xl font-bold text-gray-800">404</CardTitle>
          <p className="text-xl text-gray-600">Lapa nav atrasta</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-gray-600">
              Šķiet, ka šī lapa ir pazudusi kā Tetris gabals, kas nokrita ārpus spēles laukuma!
            </p>
            <div className="mx-auto flex justify-center space-x-1 text-4xl">
              <span>🟦</span>
              <span>🟨</span>
              <span>🟪</span>
              <span>🟩</span>
            </div>
            <p className="text-sm text-gray-500">Bet neuztraucieties - mēs varam jūs nogādāt atpakaļ drošībā!</p>
          </div>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full bg-blue-600 transition-all duration-200 hover:scale-105 hover:bg-blue-700">
                <Home className="mr-2 h-4 w-4" />
                Atpakaļ uz sākumu
              </Button>
            </Link>

            <Link href="/singleplayer" className="block">
              <Button variant="outline" className="w-full">
                <Gamepad2 className="mr-2 h-4 w-4" />
                Spēlēt vienam
              </Button>
            </Link>

            <Button variant="ghost" onClick={() => window.history.back()} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atpakaļ uz iepriekšējo lapu
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-400">TetrisTogether • Spēlē kopā, uzvaréiet kopā</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
