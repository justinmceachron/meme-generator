"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/instant";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  const { isLoading, user } = db.useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-2">
            Meme Generator
          </h1>
          <p className="text-gray-400">
            Create, share, and upvote memes
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#1e1e1e] rounded-2xl p-8 shadow-xl border border-[#333]">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Sign In / Sign Up
          </h2>
          <AuthForm />
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Enter your email to receive a login code
        </p>
      </div>
    </div>
  );
}
