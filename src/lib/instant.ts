import { init } from "@instantdb/react";

// InstantDB App ID
const APP_ID = "6d681699-395b-421c-95dc-8ea3506dd553";

// Define the schema types
interface Meme {
  id: string;
  imageUrl: string;
  topText: string;
  bottomText: string;
  authorId: string;
  authorEmail: string;
  createdAt: number;
}

interface Upvote {
  id: string;
  memeId: string;
  oderId: string;
}

// Schema type definition for InstantDB
type Schema = {
  memes: Meme;
  upvotes: Upvote;
};

// Initialize the database
export const db = init<Schema>({ appId: APP_ID });

// Export types for use in components
export type { Meme, Upvote };
