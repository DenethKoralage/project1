"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault(); // prevent page reload

    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    // 🔐 Replace this with real API call
    if (username === "admin" && password === "1234") {
      alert("Login successful");
      router.push("/dashboard"); // redirect after login
    } else {
      alert("Invalid credentials");
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
            htmlFor="username"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="mb-6">
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

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded"
          >
            Sign In
          </button>

          <button
            type="button"
            className="text-sm text-emerald-500 hover:text-emerald-800"
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}
