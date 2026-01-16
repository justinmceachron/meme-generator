"use client";

import { useState } from "react";
import { db, Meme } from "@/lib/instant";
import { id } from "@instantdb/react";

interface MemeCardProps {
  meme: Meme;
  upvoteCount: number;
  hasUpvoted: boolean;
  currentUserId: string;
  userUpvoteId?: string;
}

export default function MemeCard({
  meme,
  upvoteCount,
  hasUpvoted,
  currentUserId,
  userUpvoteId,
}: MemeCardProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = meme.authorId === currentUserId;

  const handleUpvote = async () => {
    try {
      if (hasUpvoted && userUpvoteId) {
        // Remove upvote
        await db.transact(db.tx.upvotes[userUpvoteId].delete());
      } else {
        // Add upvote
        await db.transact(
          db.tx.upvotes[id()].update({
            memeId: meme.id,
            oderId: currentUserId,
          })
        );
      }
    } catch (err) {
      console.error("Failed to update upvote:", err);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete all upvotes for this meme first
      const { data } = await db.queryOnce({ upvotes: {} });
      const memeUpvotes = data?.upvotes?.filter((u) => u.memeId === meme.id) || [];
      
      // Delete upvotes and meme in a transaction
      const transactions = [
        ...memeUpvotes.map((u) => db.tx.upvotes[u.id].delete()),
        db.tx.memes[meme.id].delete(),
      ];
      
      await db.transact(transactions);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Failed to delete meme:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
        {/* Meme Image */}
        <div className="relative group">
          <img
            src={meme.imageUrl}
            alt={meme.topText || meme.bottomText || "Meme"}
            className="w-full h-auto object-contain bg-black cursor-pointer"
            loading="lazy"
            onClick={() => setShowLightbox(true)}
          />
          {/* View overlay on hover */}
          <div 
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={() => setShowLightbox(true)}
          >
            <span className="text-white font-semibold flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              View
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-4">
          {/* Author & Time */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-400 truncate max-w-[60%]">
              {meme.authorEmail}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(meme.createdAt)}
            </div>
          </div>

          {/* Caption if exists */}
          {(meme.topText || meme.bottomText) && (
            <div className="text-gray-300 text-sm mb-3 line-clamp-2">
              {meme.topText && <span>{meme.topText}</span>}
              {meme.topText && meme.bottomText && <span> / </span>}
              {meme.bottomText && <span>{meme.bottomText}</span>}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Upvote Button */}
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                hasUpvoted
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-[#333] text-gray-300 hover:bg-[#444]"
              }`}
            >
              <svg
                className={`w-5 h-5 transition-transform ${hasUpvoted ? "scale-110" : ""}`}
                fill={hasUpvoted ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              <span className="font-semibold">{upvoteCount}</span>
            </button>

            {/* View Button */}
            <button
              onClick={() => setShowLightbox(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-full bg-[#333] text-gray-300 hover:bg-[#444] transition-colors"
              title="View larger"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            {/* Delete Button - only for owner */}
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-full bg-[#333] text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors ml-auto"
                title="Delete meme"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Image */}
          <img
            src={meme.imageUrl}
            alt={meme.topText || meme.bottomText || "Meme"}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Info bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 rounded-full px-6 py-3 flex items-center gap-4 text-white">
            <span className="text-sm">{meme.authorEmail}</span>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-300">{formatDate(meme.createdAt)}</span>
            <span className="text-gray-400">|</span>
            <span className="text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 15l7-7 7 7" />
              </svg>
              {upvoteCount}
            </span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-[#1e1e1e] rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-white mb-2">Delete Meme?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this meme? This action cannot be undone.
            </p>
            
            {/* Preview thumbnail */}
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={meme.imageUrl}
                alt="Meme to delete"
                className="w-full h-32 object-cover"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 rounded-lg bg-[#333] text-white hover:bg-[#444] transition-colors font-medium"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
