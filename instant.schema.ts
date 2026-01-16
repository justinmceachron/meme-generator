// InstantDB Schema Definition
// This file documents the expected schema structure for the InstantDB database
// Schema is automatically created when data is first written

/*
Database Schema:

memes
├── id (auto-generated UUID)
├── imageBase64 (string) - base64 encoded image data
├── topText (string) - top caption text
├── bottomText (string) - bottom caption text
├── authorId (string) - user ID who created the meme
├── authorEmail (string) - email of the author for display
├── createdAt (number) - Unix timestamp of creation

upvotes
├── id (auto-generated UUID)
├── memeId (string) - ID of the meme being upvoted
├── oderId (string) - user ID who upvoted

Relationships:
- memes.authorId -> users.id (implicit via InstantDB auth)
- upvotes.memeId -> memes.id
- upvotes.oderId -> users.id (implicit via InstantDB auth)
*/

export {};
