"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ApplicationRoutes } from "@/lib/applicationRoutes";
import { ApiRoutes } from "@/lib/apiRoutes";

export default function ChangePasswordClient() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: changeError } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (changeError) {
      setIsSubmitting(false);
      setError(changeError.message ?? "Could not change password");
      return;
    }

    await fetch(ApiRoutes.completePasswordChange, { method: "POST" });

    setIsSubmitting(false);
    router.push(ApplicationRoutes.home);
  }

  return (
    <main style={{ padding: 32, maxWidth: 400, margin: "0 auto" }}>
      <h1>Set a new password</h1>
      <p>You must set a new password before continuing.</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Temporary password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save password"}
        </button>
      </form>
    </main>
  );
}
