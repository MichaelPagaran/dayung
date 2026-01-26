"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth-context";

export function LoginForm() {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        const success = await login({ username, password });

        if (success) {
            router.push("/dashboard");
        }
    };

    return (
        <div className="w-full max-w-md mx-auto px-6 py-12 md:px-8">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-12">
                <Home className="h-8 w-8 text-brand" />
                <span className="text-2xl font-heading font-bold text-brand">
                    Dayung
                </span>
            </div>

            {/* Heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-brand mb-2">
                    Log in to your Account
                </h1>
                <p className="text-gray-500 font-body">
                    Enter your details to access your account.
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-body">{error}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username */}
                <div className="space-y-2">
                    <label
                        htmlFor="username"
                        className="block text-sm font-body font-semibold text-gray-900"
                    >
                        Username
                    </label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="Enter Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full"
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <label
                        htmlFor="password"
                        className="block text-sm font-body font-semibold text-gray-900"
                    >
                        Password
                    </label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full"
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Remember Me + Forgot Password */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(checked) =>
                                setRememberMe(checked as boolean)
                            }
                            disabled={isLoading}
                        />
                        <label
                            htmlFor="remember"
                            className="text-sm font-body text-gray-600 cursor-pointer"
                        >
                            Remember Me
                        </label>
                    </div>
                    <Link
                        href="/forgot-password"
                        className="text-sm font-body text-brand hover:underline"
                    >
                        Forgot Password?
                    </Link>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full bg-brand hover:bg-brand-hover text-white font-heading font-semibold py-6"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                        </>
                    ) : (
                        "Log In"
                    )}
                </Button>
            </form>

            {/* Create Account Link */}
            <p className="mt-8 text-center text-sm font-body text-gray-500">
                Don&apos;t have an Account?{" "}
                <Link
                    href="/register"
                    className="text-brand hover:underline font-semibold"
                >
                    Create an account
                </Link>
            </p>
        </div>
    );
}
