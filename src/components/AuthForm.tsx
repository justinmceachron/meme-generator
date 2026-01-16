"use client";

import { useState } from "react";
import { db } from "@/lib/instant";

type AuthState = "email" | "code" | "success";

export default function AuthForm() {
  const [authState, setAuthState] = useState<AuthState>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await db.auth.sendMagicCode({ email });
      setAuthState("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await db.auth.signInWithMagicCode({ email, code });
      setAuthState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setIsLoading(false);
    }
  };

  if (authState === "email") {
    return (
      <form onSubmit={handleSendCode} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 bg-[#333] border border-[#444] rounded-lg text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send Login Code"}
        </button>
      </form>
    );
  }

  if (authState === "code") {
    return (
      <form onSubmit={handleVerifyCode} className="space-y-6">
        <p className="text-gray-400 text-sm text-center">
          We sent a code to <span className="text-white font-medium">{email}</span>
        </p>

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            required
            className="w-full px-4 py-3 bg-[#333] border border-[#444] rounded-lg text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-center text-xl tracking-widest"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthState("email");
            setCode("");
            setError("");
          }}
          className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="text-green-400 text-lg font-medium">
        Successfully signed in!
      </div>
      <p className="text-gray-400">Redirecting...</p>
    </div>
  );
}
