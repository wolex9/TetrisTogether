import { Head } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import MainLayout from '@/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';

export default function MainPage() {
    const { isAuthenticated, isAnonymous, username } = useAuth();

    return (
        <MainLayout>
            <Head title="Tetris Together" />

            <div className="mx-auto max-w-4xl py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-2">Welcome to Tetris Together</h1>
                    <p className="text-muted-foreground text-lg">Play Tetris with friends in real-time</p>
                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>
                            {isAnonymous
                                ? `Playing anonymously as ${username}`
                                : isAuthenticated
                                    ? `Welcome back, ${username}!`
                                    : 'Get started with Tetris Together'}
                        </CardTitle>
                        <CardDescription>
                            {isAnonymous
                                ? 'Create an account to save your progress and compete on leaderboards'
                                : isAuthenticated
                                    ? 'Jump back into the action or start a new game'
                                    : 'Create an account or play anonymously'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            {isAuthenticated ? (
                                <>
                                    <Button size="lg">Start Game</Button>
                                    <Button size="lg" variant="outline">View Leaderboard</Button>
                                </>
                            ) : isAnonymous ? (
                                <>
                                    <Button size="lg">Continue Playing</Button>
                                    <Button size="lg" variant="outline" asChild>
                                        <Link href={route('register')}>Create Account</Link>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button size="lg" asChild>
                                        <Link href={route('register')}>Create Account</Link>
                                    </Button>
                                    <Button size="lg" variant="outline" onClick={() => {
                                        const username = prompt('Enter a username to play anonymously:');
                                        if (username) {
                                            useAuth().setAnonymous(username);
                                            window.location.reload();
                                        }
                                    }}>
                                        Play Anonymously
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Real-time Multiplayer</CardTitle>
                            <CardDescription>Challenge friends to Tetris battles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Compete in real-time with friends or random opponents. Send garbage lines, perform combos, and climb the global leaderboards.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Custom Game Modes</CardTitle>
                            <CardDescription>Play the way you want</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Choose from various game modes including Marathon, Sprint, Ultra, and custom rule sets that change how the game is played.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
