"use client";

import { db } from "@/lib/instant";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MemeFeed from "@/components/MemeFeed";

export default function Home() {
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-[#1e1e1e] shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Meme Generator
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">
              {user.email}
            </span>
            <button
              onClick={() => router.push("/create")}
              className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
            >
              Create Meme
            </button>
            <button
              onClick={() => db.auth.signOut()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <MemeFeed currentUserId={user.id} />
      </main>
    </div>
  );
}
