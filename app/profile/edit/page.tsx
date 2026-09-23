"use client";

import { useRouter } from "next/dist/client/components/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  name: string;
  username: string;
};

const EditProfilePage = () => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState<Record<string, string[]>>({});

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  //   Fetch the user's profile on component mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/users/profile");
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to fetch profile.");
          return;
        }

        setUser(data.user);
        setName(data.user.name);
        setUsername(data.user.username);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage("An error occurred while fetching profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  //   Handle image file selection and preview
  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  //   Handle image upload
  async function uploadImage() {
    if (!imageFile) {
      return null;
    }

    setUploading(true);

    try {
      const signatureResponse = await fetch("/api/upload/signature", {
        credentials: "include",
        cache: "no-store",
      });

      const signatureData = await signatureResponse.json();

      if (!signatureResponse.ok) {
        throw new Error(
          signatureData.message || "Failed to get upload signature.",
        );
      }

      const formData = new FormData();

      formData.append("file", imageFile);

      formData.append("api_key", signatureData.apiKey);

      formData.append("timestamp", String(signatureData.timestamp));

      formData.append("signature", signatureData.signature);

      formData.append("folder", signatureData.folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error?.message || "Image upload failed.");
      }

      return {
        image: uploadData.secure_url as string,
        imagePublicId: uploadData.public_id as string,
      };
    } finally {
      setUploading(false);
    }
  }
  //   Handle form submission to update the user's profile
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError({});
    setSaving(true);

    try {
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update profile.");

        if (data.errors) {
          setError(data.errors);
        }
        return;
      }

      setUser(data.user);

      setMessage(data.message);

      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("An error occurred while updating profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{message || "User not found."}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="image" className="mb-1 block">
              Profile Image
            </label>

            <input
              type="file"
              id="image"
              accept="image/jpeg, image/png, image/gif, image/webp"
              onChange={handleImageChange}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2"
            />

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Profile Preview"
                className="mt-2 h-24 w-24 rounded-full object-cover"
              />
            )}
          </div>

          {/*  */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2"
            />
            {error.name?.map((error) => (
              <p key={error} className="mt-1 text-sm text-red-500">
                {error}
              </p>
            ))}
          </div>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2"
            />
            {error.username?.map((error) => (
              <p key={error} className="mt-1 text-sm text-red-500">
                {error}
              </p>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded bg-blue-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm">{message}</p>}

        <Link
          href="/profile"
          className="mt-6 inline-block text-sm text-blue-500 hover:underline"
        >
          Back to Profile
        </Link>
      </div>
    </main>
  );
};

export default EditProfilePage;
