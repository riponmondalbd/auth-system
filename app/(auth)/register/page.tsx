"use client";
import { useState } from "react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");

        if (data.errors) {
          setErrors(data.errors);
        }
        return;
      }
      setErrors({});
      setMessage(data.message);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className=" flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold">Register</h1>

        <p className="mt-2 text-gray-600">
          Create your account to get started.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            {errors.name?.map((error) => {
              return (
                <p key={error} className="mt-1 text-sm text-red-500">
                  {error}
                </p>
              );
            })}
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
            {errors.username?.map((error) => {
              return (
                <p key={error} className="mt-1 text-sm text-red-500">
                  {error}
                </p>
              );
            })}
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
            {errors.email?.map((error) => {
              return (
                <p key={error} className="mt-1 text-sm text-red-500">
                  {error}
                </p>
              );
            })}
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
            {errors.password?.map((error) => {
              return (
                <p key={error} className="mt-1 text-sm text-red-500">
                  {error}
                </p>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </main>
  );
};

export default RegisterPage;
