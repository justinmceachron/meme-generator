import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meme Generator",
  description: "Create and share memes with the community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
