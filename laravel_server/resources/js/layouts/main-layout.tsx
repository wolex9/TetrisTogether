import { useAuth } from '@/hooks/use-auth';
import { useInitials } from '@/hooks/use-initials';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import type { PropsWithChildren } from 'react';

export default function MainLayout({ children }: PropsWithChildren) {
    const { isAuthenticated, isAnonymous, username, user } = useAuth();
    const getInitials = useInitials();

    const renderUserBox = () => {
        if (isAnonymous) {
            return (
                <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                    <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                        <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                            {username ? getInitials(username) : 'A'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{username}</span>
                        <span className="text-xs text-red-500 font-bold">ANON</span>
                    </div>
                </div>
            );
        }

        if (isAuthenticated) {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-10 rounded-full p-1">
                            <Avatar className="size-8 overflow-hidden rounded-full">
                                <AvatarImage src={user.avatar} alt={user.username} />
                                <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                    {getInitials(user.username)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <UserMenuContent user={user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        return (
            <div className="flex gap-2">
                <Button variant="ghost" asChild>
                    <Link href={route('login')}>Log in</Link>
                </Button>
                <Button asChild>
                    <Link href={route('register')}>Register</Link>
                </Button>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="border-sidebar-border/80 border-b">
                <div className="mx-auto flex h-16 items-center justify-between px-4 md:max-w-7xl">
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <AppLogoIcon className="h-8 w-8 fill-current text-black dark:text-white" />
                            <span className="text-xl font-semibold">Tetris Together</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-2">
                        {renderUserBox()}
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4">
                {children}
            </main>
        </div>
    );
}
