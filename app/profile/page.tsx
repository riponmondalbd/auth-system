"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/dist/client/components/navigation";
import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await apiFetch("/api/users/profile");

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to fetch profile.");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage("An error occurred while fetching profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading profile...</p>
      </main>
    );
  }

  if (message) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{message}</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to logout.");
        return;
      }

      // Redirect to login page or home page
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      setMessage("An error occurred while logging out.");
    }
  }

  return (
    <main className="mt-6 space-y-4 rounded-lg border p-6">
      {user.image && (
        <div className="flex items-center space-x-4">
          <img
            src={user.image}
            alt="Profile"
            className="h-16 w-16 rounded-full object-cover"
          />
        </div>
      )}
      {/* Profile Information name */}
      <div>
        <p className="text-sm text-gray-600">Name</p>

        <p className="font-medium">{user.name}</p>
      </div>

      {/* Profile Information username */}
      <div>
        <p className="text-sm text-gray-600">Username</p>

        <p className="font-medium">@{user.username}</p>
      </div>

      {/* Profile Information email */}
      <div>
        <p className="text-sm text-gray-600">Email</p>

        <p className="font-medium">{user.email}</p>
      </div>

      {/* Profile Information role */}
      <div>
        <p className="text-sm text-gray-600">Role</p>

        <p className="font-medium">{user.role}</p>
      </div>

      {/* Profile Information email status */}
      <div>
        <p className="text-sm text-gray-600">Email Status</p>
        <p className="font-medium">
          {user.isVerified ? "Verified" : "Not Verified"}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Logout
      </button>
    </main>
  );
};

export default ProfilePage;
