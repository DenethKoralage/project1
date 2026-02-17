"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { setAuth } from "@/lib/auth";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      setAuth(response.token, response.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 flex flex-col items-center gap-4">
      <span className="text-2xl font-bold">Welcome back</span>
      <span className="text-slate-500 text-sm">
        Please enter your credentials to continue.
      </span>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/register")}
            className="text-sm text-emerald-700 hover:text-emerald-900"
          >
            Create account
          </button>
        </div>
      </form>
    </div>
  );
}
