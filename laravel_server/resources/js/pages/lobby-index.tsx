import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MainLayout from '@/layouts/main-layout';

// Generate a random room ID (4 alphanumeric characters)
function generateRoomId() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

export default function LobbyIndex() {
  const [customRoomId, setCustomRoomId] = useState('');

  return (
    <MainLayout>
      <Head title="Lobbies" />

      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Tetris Together Lobbies</h1>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Lobby</CardTitle>
              <CardDescription>
                Create a new lobby and invite friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={route('lobby-room', { roomId: generateRoomId() })}>
                <Button className="w-full">Create New Lobby</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join Lobby</CardTitle>
              <CardDescription>
                Join an existing lobby using a 4-character code
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                value={customRoomId}
                onChange={(e) => setCustomRoomId(e.target.value.slice(0, 4).toUpperCase())}
                placeholder="Enter room code"
                maxLength={4}
                className="uppercase"
              />
              <Link href={customRoomId.length === 4 ? route('lobby-room', { roomId: customRoomId }) : '#'}>
                <Button disabled={customRoomId.length !== 4}>
                  Join
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
