import { Head, Link } from '@inertiajs/react';
import { Lobby } from '@/components/lobby';
import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/main-layout';

export default function LobbyRoom({ roomId }) {
  return (
    <MainLayout>
      <Head title={`Lobby ${roomId}`} />

      <div className="container mx-auto py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Lobby: {roomId}</h1>
          <Link href={route('lobby-index')}>
            <Button variant="outline">Leave Lobby</Button>
          </Link>
        </div>

        <Lobby roomId={roomId} />
      </div>
    </MainLayout>
  );
}
