import { usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import type { SharedData } from "@/types";

export function useAuth() {
    const { auth } = usePage<SharedData>().props;
    const [anonymousUsername, setAnonymousUsername] = useState<string | null>(null);

    // Load anonymous username from localStorage on mount
    useEffect(() => {
        const storedUsername = localStorage.getItem('anonymousUsername');
        if (storedUsername) {
            setAnonymousUsername(storedUsername);
        }
    }, []);

    // Helper functions
    const setAnonymous = (username: string) => {
        setAnonymousUsername(username);
        localStorage.setItem('anonymousUsername', username);
    };

    const clearAnonymous = () => {
        setAnonymousUsername(null);
        localStorage.removeItem('anonymousUsername');
    };

    return {
        user: auth.user,
        isAuthenticated: !!auth.user,
        isAnonymous: !auth.user && !!anonymousUsername,
        username: auth.user ? auth.user.username : anonymousUsername,
        anonymousUsername,
        setAnonymous,
        clearAnonymous,
    };
}
