import type { SharedData } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { useState } from "react";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";

export default function ConfirmLogin({ children }) {
    const { auth } = usePage<SharedData>().props;
    const [confirmedLogin, setConfirmedLogin] = useState(false);

    const handleLoginConfirmation = () => {
        setConfirmedLogin(true);
    }

    const handleLogout = () => {
        router.post('/logout');
    }

    if (confirmedLogin) return <div>{children}</div>;

    if (auth.user) {
        return (
            <Card className="w-[350px] mx-auto mt-8">
                <CardHeader>
                    <CardTitle>Welcome back to TetrisTogether!</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="w-1/4"
                        >
                            Log out
                        </Button>
                        <Button
                            onClick={handleLoginConfirmation}
                            className="flex-1"
                        >
                            Join
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return <button onClick={handleLoginConfirmation}>login</button>;
}
