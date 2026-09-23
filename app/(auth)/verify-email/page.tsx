"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const VerifyEmailPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("Verifying your email ........");

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("Invalid or missing token");
      return;
    }

    async function verifyEmail() {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus(data.message || "Email verification failed");
          return;
        }

        setSuccess(true);
        setStatus(data.message);
      } catch (error) {
        console.error("Error verifying email:", error);
        setStatus("Something went wrong. Please try again later.");
      }
    }
    verifyEmail();
  }, [token]);
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Email Verification</h1>

        <p className="mt-4">{status}</p>

        {success && (
          <Link href="/login" className="text-blue-500 hover:underline">
            Go to Login
          </Link>
        )}
      </div>
    </main>
  );
};

export default VerifyEmailPage;
