"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/instant";
import MemeCreator from "@/components/MemeCreator";

export default function CreateMemePage() {
  const { isLoading, user } = db.useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleMemePosted = () => {
    router.push("/");
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#1e1e1e] shadow-lg flex-none">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Feed
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Create Meme
          </h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content - fills remaining height */}
      <main className="flex-1 overflow-hidden p-4 lg:p-6">
        <div className="max-w-7xl mx-auto h-full">
          <MemeCreator
            userId={user.id}
            userEmail={user.email}
            onMemePosted={handleMemePosted}
          />
        </div>
      </main>
    </div>
  );
}
