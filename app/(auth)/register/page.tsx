"use client";
import { useState } from "react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className=" flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold">Register</h1>

        <p className="mt-2 text-gray-600">
          Create your account to get started.
        </p>

        <form className="mt-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="mb-1 block">
              Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2"
            />
          </div>
          {/* username */}
          <div>
            <label htmlFor="username" className="mb-1 block">
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1 block">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2"
            />
          </div>
          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1 block">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Create Account
          </button>
        </form>
      </div>
    </main>
  );
};

export default RegisterPage;
