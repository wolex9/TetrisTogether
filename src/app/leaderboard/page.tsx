"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

// Faux data for Blitz leaderboard
const blitzLeaderboard = [
  { id: 1, flag: "🇱🇻", username: "SpeedDemon", date: "2024-01-15", score: 98750 },
  { id: 2, flag: "🇯🇵", username: "TetrisKing", date: "2024-01-14", score: 95200 },
  { id: 3, flag: "🇰🇷", username: "BlockMaster", date: "2024-01-13", score: 92800 },
  { id: 4, flag: "🇩🇪", username: "QuickDrop", date: "2024-01-12", score: 89500 },
  { id: 5, flag: "🇫🇷", username: "LineClearing", date: "2024-01-11", score: 87300 },
  { id: 6, flag: "🇬🇧", username: "TetrisAce", date: "2024-01-10", score: 85600 },
  { id: 7, flag: "🇨🇦", username: "BlockBuster", date: "2024-01-09", score: 83400 },
  { id: 8, flag: "🇦🇺", username: "FastFaller", date: "2024-01-08", score: 81200 },
  { id: 9, flag: "🇧🇷", username: "TetrisNinja", date: "2024-01-07", score: 79800 },
  { id: 10, flag: "🇷🇺", username: "BlockWizard", date: "2024-01-06", score: 77500 },
];

// Mock profile data for first two players
const playerProfiles = {
  SpeedDemon: {
    blitzBest: 98750,
    fortyLinesBest: "1:23.45",
    quickPlayBest: 87500,
    joinDate: "2023-08-15",
    initials: "SD",
  },
  TetrisKing: {
    blitzBest: 95200,
    fortyLinesBest: "1:18.92",
    quickPlayBest: 92300,
    joinDate: "2023-06-22",
    initials: "TK",
  },
};

function Avatar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xl font-bold">
      {children}
    </div>
  );
}

function AvatarFallback({ children }: { children: React.ReactNode }) {
  return <span>{children}</span>;
}

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
        <main className="flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <CardTitle className="text-center">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="blitz" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="40lines">40 Lines</TabsTrigger>
                  <TabsTrigger value="blitz">Blitz</TabsTrigger>
                  <TabsTrigger value="quickplay">Quick Play</TabsTrigger>
                </TabsList>

                <TabsContent value="40lines">
                  <div className="text-muted-foreground py-8 text-center">40 Lines leaderboard coming soon...</div>
                </TabsContent>

                <TabsContent value="blitz">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-center">Date</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blitzLeaderboard.map((entry, index) => (
                        <TableRow key={entry.id}>
                          <TableCell className="flex items-center gap-2">
                            <span className="text-lg">{entry.flag}</span>
                            {/* Only add hover cards for the first two players */}
                            {index < 2 ? (
                              <HoverCard>
                                <HoverCardTrigger className="cursor-pointer font-medium hover:underline">
                                  {entry.username}
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="flex justify-between space-x-4">
                                    <Avatar>
                                      <AvatarFallback>
                                        {playerProfiles[entry.username as keyof typeof playerProfiles]?.initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                      <h4 className="flex items-center gap-2 text-sm font-semibold">
                                        {entry.flag} {entry.username}
                                      </h4>
                                      <div className="text-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                          <div className="text-muted-foreground">Blitz Best:</div>
                                          <div className="text-right font-mono">
                                            {playerProfiles[
                                              entry.username as keyof typeof playerProfiles
                                            ]?.blitzBest.toLocaleString()}
                                          </div>
                                          <div className="text-muted-foreground">40 Lines Best:</div>
                                          <div className="text-right font-mono">
                                            {
                                              playerProfiles[entry.username as keyof typeof playerProfiles]
                                                ?.fortyLinesBest
                                            }
                                          </div>
                                          <div className="text-muted-foreground">Quick Play Best:</div>
                                          <div className="text-right font-mono">
                                            {playerProfiles[
                                              entry.username as keyof typeof playerProfiles
                                            ]?.quickPlayBest.toLocaleString()}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-muted-foreground flex justify-between border-t pt-2 text-xs">
                                        <span>Joined:</span>
                                        <span>
                                          {playerProfiles[entry.username as keyof typeof playerProfiles]?.joinDate}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            ) : (
                              <span className="font-medium">{entry.username}</span>
                            )}
                            {index < 3 && (
                              <span className="text-xs">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{entry.date}</TableCell>
                          <TableCell className="text-right font-mono">{entry.score.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="quickplay">
                  <div className="text-muted-foreground py-8 text-center">Quick Play leaderboard coming soon...</div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
