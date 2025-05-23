import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth';
import { useInitials } from '@/hooks/use-initials';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Copy, Send, Users } from 'lucide-react';

interface LobbyUser {
    id: string;
    username: string;
    isAnonymous: boolean;
    avatar?: string | null;
    joinedAt: Date;
}

interface Message {
    id: string;
    userId: string;
    username: string;
    isAnonymous: boolean;
    text: string;
    timestamp: Date;
}

interface LobbyProps {
    roomId: string;
}

export function Lobby({ roomId }: LobbyProps) {
    const [users, setUsers] = useState<LobbyUser[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isAnonymous, username, user } = useAuth();
    const getInitials = useInitials();
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Connect to the socket
    useEffect(() => {
        if (!roomId || roomId.length !== 4) {
            setError('Invalid room ID. Room ID must be 4 characters.');
            setIsConnecting(false);
            return;
        }

        // Connect to the proper namespace
        const socket = io(`http://localhost:4987/${roomId}`, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
        });
        socketRef.current = socket;

        // Set up event listeners
        socket.on('connect', () => {
            setIsConnected(true);
            setIsConnecting(false);
            setError(null);

            // Join with user data
            socket.emit('join', {
                username: username || 'Guest',
                isAnonymous: isAnonymous,
                avatar: user?.avatar || null
            });
        });

        socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
            setError('Failed to connect to server. Please try again later.');
            setIsConnecting(false);
            setIsConnected(false);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            setIsConnecting(false);
        });

        // Handle user list updates
        socket.on('users', (userList) => {
            setUsers(userList.map(u => ({
                ...u,
                joinedAt: new Date(u.joinedAt)
            })));
        });

        // Handle new user joined
        socket.on('userJoined', (newUser) => {
            setUsers(prev => {
                // Check if user already exists (avoid duplicates)
                const exists = prev.some(u => u.id === newUser.id);
                if (exists) return prev;

                return [...prev, {
                    ...newUser,
                    joinedAt: new Date(newUser.joinedAt)
                }];
            });

            // Add system message
            setMessages(prev => [...prev, {
                id: Math.random().toString(36).substring(2, 15),
                userId: 'system',
                username: 'System',
                isAnonymous: false,
                text: `${newUser.username} has joined the lobby`,
                timestamp: new Date()
            }]);
        });

        // Handle user left
        socket.on('userLeft', (leftUser) => {
            setUsers(prev => {
                const user = prev.find(u => u.id === leftUser.id);
                const filteredUsers = prev.filter(u => u.id !== leftUser.id);

                // Add system message if we found the user
                if (user) {
                    setMessages(prevMsgs => [...prevMsgs, {
                        id: Math.random().toString(36).substring(2, 15),
                        userId: 'system',
                        username: 'System',
                        isAnonymous: false,
                        text: `${user.username} has left the lobby`,
                        timestamp: new Date()
                    }]);
                }

                return filteredUsers;
            });
        });

        // Handle messages
        socket.on('message', (message) => {
            setMessages(prev => [...prev, {
                ...message,
                timestamp: new Date(message.timestamp)
            }]);
        });

        // Clean up on unmount
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [roomId, isAuthenticated, isAnonymous, username, user]);

    // Send a message
    const sendMessage = () => {
        if (!messageText.trim() || !isConnected || !socketRef.current) return;

        socketRef.current.emit('message', { text: messageText.trim() });
        setMessageText('');
    };

    // Handle pressing Enter in the message input
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Copy room link to clipboard
    const copyRoomLink = () => {
        const link = `${window.location.origin}/lobby/${roomId}`;
        navigator.clipboard.writeText(link);
        // Optionally show a toast notification here
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Users list */}
            <Card className="md:col-span-1">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users size={18} />
                            Players
                        </CardTitle>
                        <Badge variant="outline">
                            {users.length} {users.length === 1 ? 'user' : 'users'}
                        </Badge>
                    </div>
                    {!isConnected && !error && (
                        <CardDescription>
                            {isConnecting ? 'Connecting to server...' : 'Disconnected'}
                        </CardDescription>
                    )}
                    {error && (
                        <CardDescription className="text-red-500">
                            {error}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Room ID: {roomId}</span>
                            <Button variant="ghost" size="sm" onClick={copyRoomLink}>
                                <Copy size={14} />
                            </Button>
                        </div>
                        <Separator className="my-2" />

                        <div className="space-y-4">
                            {users.length > 0 ? (
                                <div className="divide-y">
                                    {users.map((lobbyUser) => (
                                        <div key={lobbyUser.id} className="flex items-center py-3">
                                            <Avatar className="h-10 w-10 mr-3">
                                                {lobbyUser.avatar ? (
                                                    <AvatarImage src={lobbyUser.avatar} alt={lobbyUser.username} />
                                                ) : (
                                                    <AvatarFallback className={lobbyUser.isAnonymous ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}>
                                                        {getInitials(lobbyUser.username)}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center">
                                                    <p className="font-medium">
                                                        {lobbyUser.username}
                                                        {lobbyUser.id === socketRef.current?.id && " (You)"}
                                                    </p>
                                                    {lobbyUser.isAnonymous && (
                                                        <span className="ml-2 text-xs text-red-500 font-bold">ANON</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Joined {lobbyUser.joinedAt.toISOString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    {isConnected ? 'No users online' : 'Connecting to lobby...'}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Chat/Game area */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Lobby Chat</CardTitle>
                    <CardDescription>
                        Chat with other players in the lobby
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-[400px]">
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                        {messages.length > 0 ? (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.userId === 'system' ? 'justify-center' : message.userId === socketRef.current?.id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.userId === 'system'
                                        ? 'bg-slate-100 dark:bg-slate-800 text-center text-xs text-muted-foreground'
                                        : message.userId === socketRef.current?.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                        }`}>
                                        {message.userId !== 'system' && message.userId !== socketRef.current?.id && (
                                            <p className="text-sm font-semibold">
                                                {message.username}
                                                {message.isAnonymous && <span className="ml-1 text-xs text-red-500">(ANON)</span>}
                                            </p>
                                        )}
                                        <p>{message.text}</p>
                                        <p className="text-xs opacity-70 text-right mt-1">
                                            {message.timestamp.toISOString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No messages yet. Be the first to say hello!
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="flex gap-2 mt-auto">
                        <Input
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            disabled={!isConnected}
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={!isConnected || !messageText.trim()}
                        >
                            <Send size={18} />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
