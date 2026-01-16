"use client";

import { useState } from "react";
import { db } from "@/lib/instant";
import MemeCard from "./MemeCard";

type SortOption = "newest" | "popular";

interface MemeFeedProps {
  currentUserId: string;
}

export default function MemeFeed({ currentUserId }: MemeFeedProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  
  // Query all memes and upvotes with real-time subscription
  const { isLoading, error, data } = db.useQuery({
    memes: {},
    upvotes: {},
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-400">Loading memes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-red-400">Error loading memes: {error.message}</div>
      </div>
    );
  }

  const memes = data?.memes || [];
  const upvotes = data?.upvotes || [];

  // Calculate upvote counts and user's upvotes for each meme
  const memeData = memes.map((meme) => {
    const memeUpvotes = upvotes.filter((u) => u.memeId === meme.id);
    const userUpvote = memeUpvotes.find((u) => u.oderId === currentUserId);
    
    return {
      meme,
      upvoteCount: memeUpvotes.length,
      hasUpvoted: !!userUpvote,
      userUpvoteId: userUpvote?.id,
    };
  });

  // Sort memes
  const sortedMemes = [...memeData].sort((a, b) => {
    if (sortBy === "newest") {
      return b.meme.createdAt - a.meme.createdAt;
    } else {
      // Popular - sort by upvote count, then by newest
      if (b.upvoteCount !== a.upvoteCount) {
        return b.upvoteCount - a.upvoteCount;
      }
      return b.meme.createdAt - a.meme.createdAt;
    }
  });

  if (memes.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 text-xl mb-4">No memes yet!</div>
        <p className="text-gray-500">Be the first to create and share a meme.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Meme Feed</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("newest")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              sortBy === "newest"
                ? "bg-primary text-white"
                : "bg-[#333] text-gray-300 hover:bg-[#444]"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy("popular")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              sortBy === "popular"
                ? "bg-primary text-white"
                : "bg-[#333] text-gray-300 hover:bg-[#444]"
            }`}
          >
            Popular
          </button>
        </div>
      </div>

      {/* Meme Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedMemes.map(({ meme, upvoteCount, hasUpvoted, userUpvoteId }) => (
          <MemeCard
            key={meme.id}
            meme={meme}
            upvoteCount={upvoteCount}
            hasUpvoted={hasUpvoted}
            currentUserId={currentUserId}
            userUpvoteId={userUpvoteId}
          />
        ))}
      </div>
    </div>
  );
}
