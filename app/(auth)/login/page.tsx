"use client";

import { useRouter } from "next/dist/client/components/navigation";
import Link from "next/dist/client/link";
import { useState } from "react";

const LoginPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      setMessage(data.message);

      // Handle successful login (e.g., redirect to dashboard)
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className=" flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold">Welcome Back</h1>

        <p className="mt-2 text-gray-600">Login to your account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2"
            />

            <Link
              href="/forgot-password"
              className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-medium text-blue-500 hover:text-blue-600"
          >
            Sign up
          </a>
        </p>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </main>
  );
};

export default LoginPage;
