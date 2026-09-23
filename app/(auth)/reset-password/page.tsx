"use client";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
          confirmNewPassword: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Password reset failed.");
        return;
      }

      setMessage(data.message);
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage("An error occurred while resetting the password.");
    }
  }
  return (
    <main className=" flex min-h-screen items-center justify-center px-4">
      <div className="w-full man-w-md">
        <h1 className="text-2xl font-bold">Reset Password</h1>

        <p className="mt-2 text-gray-600">Enter your new password bellow</p>

        {!token && (
          <p className="mt-4 text-red-500">Reset token is missing or invalid</p>
        )}

        {token && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="newPassword" className="mb-1 block">
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block">
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded"
            >
              Reset Password
            </button>
          </form>
        )}

        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </main>
  );
};

export default ResetPasswordPage;
