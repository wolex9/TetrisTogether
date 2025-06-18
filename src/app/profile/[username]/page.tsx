import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trophy, Clock, Zap } from "lucide-react";
import { notFound } from "next/navigation";

// Simple Avatar components since we don't have them
function Avatar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-full bg-gray-200 ${className || "h-12 w-12"}`}>
      {children}
    </div>
  );
}

function AvatarFallback({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-bold ${className || "text-xl"}`}>{children}</span>;
}

// Mock profile data (expanded)
const playerProfiles = {
  SpeedDemon: {
    flag: "🇱🇻",
    username: "SpeedDemon",
    initials: "SD",
    joinDate: "2023-08-15",
    totalGames: 1247,
    blitz: {
      best: 98750,
      average: 72300,
      gamesPlayed: 423,
      rank: 1,
    },
    fortyLines: {
      best: "1:23.45",
      average: "1:45.23",
      gamesPlayed: 312,
      rank: 3,
    },
    quickPlay: {
      best: 87500,
      average: 65200,
      gamesPlayed: 512,
      survivals: 89,
    },
  },
  TetrisKing: {
    flag: "🇯🇵",
    username: "TetrisKing",
    initials: "TK",
    joinDate: "2023-06-22",
    totalGames: 2156,
    blitz: {
      best: 95200,
      average: 78900,
      gamesPlayed: 678,
      rank: 2,
    },
    fortyLines: {
      best: "1:18.92",
      average: "1:32.67",
      gamesPlayed: 891,
      rank: 1,
    },
    quickPlay: {
      best: 92300,
      average: 71800,
      gamesPlayed: 587,
      survivals: 134,
    },
  },
};

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const profile = playerProfiles[params.username as keyof typeof playerProfiles];

  if (!profile) {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left side - Profile Picture and Basic Info */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Avatar className="mx-auto mb-4 h-24 w-24">
                  <AvatarFallback className="text-3xl">{profile.initials}</AvatarFallback>
                </Avatar>
                <h1 className="mb-2 flex items-center justify-center gap-2 text-xl font-bold">
                  <span className="text-xl">{profile.flag}</span>
                  {profile.username}
                </h1>
                <p className="text-muted-foreground mb-3">Joined {profile.joinDate}</p>
                <p className="text-muted-foreground mb-4 text-sm">{profile.totalGames} total games</p>
                <Button className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Friend
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Stats Cards */}
          <div className="space-y-4 lg:col-span-2">
            {/* Blitz Stats */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-4 w-4 text-red-500" />
                    Blitz
                  </CardTitle>
                  <Badge className="bg-red-500 text-white">Rank #{profile.blitz.rank}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">{profile.blitz.best.toLocaleString()}</div>
                    <div className="text-muted-foreground text-xs">Best Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{profile.blitz.average.toLocaleString()}</div>
                    <div className="text-muted-foreground text-xs">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{profile.blitz.gamesPlayed}</div>
                    <div className="text-muted-foreground text-xs">Games Played</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 40 Lines Stats */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-4 w-4 text-blue-500" />
                    40 Lines
                  </CardTitle>
                  <Badge className="bg-blue-500 text-white">Rank #{profile.fortyLines.rank}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="font-mono text-xl font-bold text-blue-600">{profile.fortyLines.best}</div>
                    <div className="text-muted-foreground text-xs">Best Time</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-xl font-bold">{profile.fortyLines.average}</div>
                    <div className="text-muted-foreground text-xs">Average Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{profile.fortyLines.gamesPlayed}</div>
                    <div className="text-muted-foreground text-xs">Games Played</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Play Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-4 w-4 text-green-500" />
                  Quick Play
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{profile.quickPlay.best.toLocaleString()}</div>
                    <div className="text-muted-foreground text-xs">Best Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{profile.quickPlay.average.toLocaleString()}</div>
                    <div className="text-muted-foreground text-xs">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{profile.quickPlay.gamesPlayed}</div>
                    <div className="text-muted-foreground text-xs">Games Played</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{profile.quickPlay.survivals}</div>
                    <div className="text-muted-foreground text-xs">Long Survivals</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
