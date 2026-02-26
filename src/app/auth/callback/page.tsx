"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function CallbackHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
            router.push(`/signin?error=${error}`);
            return;
        }

        if (token) {
            // Store token from Google OAuth callback
            localStorage.setItem("token", token);
            // Redirect to generator — AuthContext will pick up the token on mount
            router.push("/generator");
        } else {
            router.push("/signin");
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-accent-purple/30 animate-spin" />
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-accent-purple to-accent-indigo" />
                </div>
                <p className="text-text-secondary">Completing sign in...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <p className="text-text-secondary">Loading...</p>
                </div>
            }
        >
            <CallbackHandler />
        </Suspense>
    );
}
