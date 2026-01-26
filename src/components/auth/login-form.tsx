"use client";

import { useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual login logic
        console.log({ email, password, rememberMe });
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="block text-sm font-body font-semibold text-gray-900"
                    >
                        Email Address
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                        required
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
                >
                    Log In
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
