import type { SharedData } from "@/types";
import { router, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import axios from 'axios';
import { useAuth } from "@/hooks/use-auth";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";

// Card wrapper component
const LoginCard = ({ title, description, children }) => (
    <Card className="w-[350px] mx-auto mt-8">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

// Component for logged-in users
const LoggedInView = ({ onJoin, onLogout }) => (
    <LoginCard title="Welcome back to TetrisTogether!" description="">
        <div className="flex items-center gap-4">
            <Button
                variant="outline"
                onClick={onLogout}
                className="w-1/4"
            >
                Log out
            </Button>
            <Button
                onClick={onJoin}
                className="flex-1"
            >
                Join
            </Button>
        </div>
    </LoginCard>
);

// Username input form
const UsernameForm = ({ data, setData, processing, errors, onSubmit }) => (
    <LoginCard
        title="Welcome to TetrisTogether!"
        description="Enter your username to continue"
    >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    type="text"
                    required
                    autoFocus
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value)}
                    disabled={processing}
                    placeholder="Enter your username"
                />
                <InputError message={errors.username} />
            </div>

            <Button
                type="submit"
                className="w-full mt-4"
                disabled={processing}
            >
                {processing && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
                Next
            </Button>
        </form>
    </LoginCard>
);

// Password input form
const PasswordForm = ({ data, setData, processing, errors, onSubmit, onBack, onForgot }) => (
    <LoginCard
        title="Good to see you again!"
        description="Enter your password to continue"
    >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    required
                    autoFocus
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    disabled={processing}
                    placeholder="Enter your password"
                />
                <InputError message={errors.password} />
            </div>

            <div className="flex flex-col gap-2 mt-4">
                <Button
                    type="submit"
                    className="w-full"
                    disabled={processing}
                >
                    {processing && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
                    Login
                </Button>

                <div className="flex justify-between mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                    >
                        Back
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onForgot}
                    >
                        I forgot
                    </Button>
                </div>
            </div>
        </form>
    </LoginCard>
);

// Component for when username isn't found
const UserNotFoundView = ({ username, onBack, onAnonymous, onRegister }) => (
    <LoginCard
        title="Username not found"
        description={`We couldn't find '${username}'. What would you like to do?`}
    >
        <div className="flex flex-col gap-3">
            <Button
                onClick={onRegister}
                className="w-full"
            >
                Register
            </Button>

            <Button
                onClick={onAnonymous}
                variant="outline"
                className="w-full"
            >
                Stay anonymous
            </Button>

            <Button
                onClick={onBack}
                variant="ghost"
                className="w-full"
            >
                Back
            </Button>
        </div>
    </LoginCard>
);

// New registration form component
const RegisterForm = ({ username, registerData, setRegisterData, processing, errors, onSubmit, onBack }) => (
    <LoginCard
        title="Create an account"
        description="Just a few more details to set up your account"
    >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    type="text"
                    value={registerData.username}
                    disabled
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    value={registerData.email}
                    onChange={(e) => setRegisterData('email', e.target.value)}
                    disabled={processing}
                    placeholder="your@email.com"
                />
                <InputError message={errors.email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="register_password">Password</Label>
                <Input
                    id="register_password"
                    type="password"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData('password', e.target.value)}
                    disabled={processing}
                    placeholder="Create a password"
                />
                <InputError message={errors.password} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input
                    id="password_confirmation"
                    type="password"
                    required
                    value={registerData.password_confirmation}
                    onChange={(e) => setRegisterData('password_confirmation', e.target.value)}
                    disabled={processing}
                    placeholder="Confirm your password"
                />
                <InputError message={errors.password_confirmation} />
            </div>

            {/* Hidden field for country code */}
            <input type="hidden" name="country_code" value={registerData.country_code} />

            <div className="flex flex-col gap-2 mt-4">
                <Button
                    type="submit"
                    className="w-full"
                    disabled={processing}
                >
                    {processing && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
                    Register
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    onClick={onBack}
                    className="mt-2"
                >
                    Back
                </Button>
            </div>
        </form>
    </LoginCard>
);

export default function ConfirmLogin({ children }) {
    const { isAuthenticated, user, setAnonymous } = useAuth();
    const [confirmedLogin, setConfirmedLogin] = useState(false);
    const [step, setStep] = useState("username"); // "username", "password", "not-found", or "register"

    // Form for login
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
    });

    // Separate form for registration
    const {
        data: registerData,
        setData: setRegisterData,
        post: postRegister,
        processing: registerProcessing,
        errors: registerErrors
    } = useForm({
        username: '', // Initialize username (will be set when moving to register step)
        email: '',
        password: '',
        password_confirmation: '',
        country_code: 'US', // Set default country code
    });

    const handleLoginConfirmation = () => {
        setConfirmedLogin(true);
    }

    const handleLogout = () => {
        router.post('/logout');
    }

    const checkUsername = (e) => {
        e.preventDefault();

        axios.post(route('check-username'), {
            username: data.username
        }).then(response => {
            if (response.data.userExists) {
                setStep("password");
            } else {
                setStep("not-found");
            }
        })
    }

    const handleLogin = (e) => {
        e.preventDefault();
        post(route('login'), {
            onSuccess: () => {
                handleLoginConfirmation();
            },
        });
    }

    const goBackToUsername = () => {
        setStep("username");
        reset('password');
    }

    const goBackToNotFound = () => {
        setStep("not-found");
    }

    const handleForgotPassword = () => {
        // Dummy function for now
        console.log("Forgot password");
    }

    const showRegisterForm = () => {
        // Set the username from the first form to the registration form
        setRegisterData('username', data.username);
        setStep("register");
    }

    const handleRegister = (e) => {
        e.preventDefault();

        // No need to manually construct payload - the username is already in registerData
        postRegister(route('register'), {
            onSuccess: () => {
                // After successful registration, user is logged in
                handleLoginConfirmation();
            },
        });
    }

    const stayAnonymous = () => {
        // Set the anonymous username and continue
        setAnonymous(data.username);
        handleLoginConfirmation();
    }

    if (confirmedLogin) return <div>{children}</div>;

    // Use the appropriate component based on state
    if (isAuthenticated) {
        return (
            <LoggedInView
                onJoin={handleLoginConfirmation}
                onLogout={handleLogout}
            />
        );
    }

    if (step === "password") {
        return (
            <PasswordForm
                data={data}
                setData={setData}
                processing={processing}
                errors={errors}
                onSubmit={handleLogin}
                onBack={goBackToUsername}
                onForgot={handleForgotPassword}
            />
        );
    }

    if (step === "not-found") {
        return (
            <UserNotFoundView
                username={data.username}
                onBack={goBackToUsername}
                onAnonymous={stayAnonymous}
                onRegister={showRegisterForm}
            />
        );
    }

    if (step === "register") {
        return (
            <RegisterForm
                username={data.username}
                registerData={registerData}
                setRegisterData={setRegisterData}
                processing={registerProcessing}
                errors={registerErrors}
                onSubmit={handleRegister}
                onBack={goBackToNotFound}
            />
        );
    }

    return (
        <UsernameForm
            data={data}
            setData={setData}
            processing={processing}
            errors={errors}
            onSubmit={checkUsername}
        />
    );
}
