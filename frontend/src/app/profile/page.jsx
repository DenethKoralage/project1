"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/**
 * A single ledger-style row: label on the left, dotted leader, value on the right.
 * Values render in monospace so the whole block reads like a passbook entry.
 */
function LedgerRow({ label, value, accent = false }) {
  return (
    <div className="flex items-baseline gap-3 py-3">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
        {label}
      </span>
      <span
        aria-hidden="true"
        className="h-px flex-1 border-b border-dotted border-stone-300"
      />
      <span
        className={`shrink-0 break-all font-mono text-sm ${
          accent ? "font-semibold text-emerald-700" : "text-stone-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, logout, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    designation: "",
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: "",
      portfolio: ""
    }
  });
  const [updateStatus, setUpdateStatus] = useState({ type: "", message: "" });

  // Redirect to login if not authenticated after rehydration
  useEffect(() => {
    if (!loading && !authUser) {
      router.replace("/login");
    }
  }, [loading, authUser, router]);

  // Fetch profile data from API
  useEffect(() => {
    if (!loading && authUser) {
      fetchProfile();
    }
  }, [loading, authUser]);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await fetch("/api/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      if (data.success && data.user) {
        setProfile(data.user);
        // Initialize edit form with current profile data
        setEditForm({
          name: data.user.name || "",
          bio: data.user.bio || "",
          designation: data.user.designation || "",
          socialLinks: {
            github: data.user.socialLinks?.github || "",
            linkedin: data.user.socialLinks?.linkedin || "",
            twitter: data.user.socialLinks?.twitter || "",
            portfolio: data.user.socialLinks?.portfolio || ""
          }
        });
      } else {
        // Fallback to auth user data if API fails
        setProfile(authUser);
        setEditForm({
          name: authUser.name || "",
          bio: authUser.bio || "",
          designation: authUser.designation || "",
          socialLinks: {
            github: "",
            linkedin: "",
            twitter: "",
            portfolio: ""
          }
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to auth user data
      setProfile(authUser);
      setEditForm({
        name: authUser.name || "",
        bio: authUser.bio || "",
        designation: authUser.designation || "",
        socialLinks: {
          github: "",
          linkedin: "",
          twitter: "",
          portfolio: ""
        }
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("socialLinks.")) {
      const [, key] = name.split(".");
      setEditForm(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [key]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateStatus({ type: "pending", message: "Updating profile..." });
    
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editForm.name,
          bio: editForm.bio,
          designation: editForm.designation,
          socialLinks: editForm.socialLinks
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      if (data.success) {
        setProfile(data.user);
        setEditMode(false);
        setUpdateStatus({ type: "success", message: "Profile updated successfully!" });
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setUpdateStatus({ type: "", message: "" });
        }, 3000);
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateStatus({ type: "error", message: error.message || "Failed to update profile" });
    }
  };

  // While loading, show skeleton
  if (loading || (!authUser && !profile)) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-6 py-10">
        <div className="h-40 animate-pulse rounded-3xl bg-stone-100 motion-reduce:animate-none" />
        <div className="h-56 animate-pulse rounded-3xl bg-stone-100 motion-reduce:animate-none" />
      </main>
    );
  }

  // Use profile data if available, otherwise fall back to auth user
  const displayUser = profile || authUser;
  if (!displayUser) {
    return <div>Loading...</div>;
  }

  const formattedIncome = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(displayUser.avgIncome ?? displayUser.AVGIncome ?? 0);

  const initials = displayUser.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 py-10">
      {/* Badge header */}
      <section className="relative rounded-3xl border border-stone-200 bg-stone-900 px-8 pb-9 pt-8 text-stone-50">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-lg font-bold tracking-wide text-emerald-400 ring-1 ring-inset ring-emerald-400/30">
              {initials}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                Profile
              </p>
              <h1 className="text-2xl font-bold leading-tight md:text-3xl">
                {displayUser.name}
              </h1>
              <p className="mt-0.5 font-mono text-xs text-stone-400">
                {displayUser.designation}
              </p>
            </div>
          </div>

          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="rounded-xl border border-stone-700 bg-stone-800 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 active:scale-95"
            >
              Edit Profile
            </button>
          )}

          <button
            onClick={handleLogout}
            className="rounded-xl border border-stone-700 bg-stone-800 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 active:scale-95"
          >
            Log out
          </button>
        </div>

        {/* Ticket-stub perforation between badge and ledger */}
        <div className="pointer-events-none absolute -bottom-3 left-0 right-0 flex justify-between px-4">
          <span className="h-6 w-6 -translate-x-1/2 rounded-full bg-stone-50" />
          <span className="h-6 w-6 translate-x-1/2 rounded-full bg-stone-50" />
        </div>
      </section>

      {/* Profile Form (Edit Mode) */}
      {editMode && (
        <section className="rounded-3xl border border-stone-200 bg-white px-8 py-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Edit Profile
          </h2>
          
          {updateStatus.message && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
              updateStatus.type === "success" 
                ? "bg-emerald-100 text-emerald-800" 
                : updateStatus.type === "error"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-blue-100 text-blue-800"
            }`}
            >
              {updateStatus.message}
            </div>
          )}
          
          <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={editForm.bio}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={editForm.designation}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Social Links
              </label>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      GitHub
                    </label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      name="socialLinks.github"
                      value={editForm.socialLinks.github}
                      onChange={handleInputChange}
                      placeholder="https://github.com/username"
                      className="w-full px-3 py-2 border border-stone-200 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      LinkedIn
                    </label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      name="socialLinks.linkedin"
                      value={editForm.socialLinks.linkedin}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 border border-stone-200 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Twitter
                    </label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      name="socialLinks.twitter"
                      value={editForm.socialLinks.twitter}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/username"
                      className="w-full px-3 py-2 border border-stone-200 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Portfolio
                    </label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      name="socialLinks.portfolio"
                      value={editForm.socialLinks.portfolio}
                      onChange={handleInputChange}
                      placeholder="https://yourportfolio.com"
                      className="w-full px-3 py-2 border border-stone-200 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={profileLoading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {profileLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Profile View Mode */}
      {!editMode && (
        <>
          {/* Ledger (Account Details) */}
          <section className="rounded-3xl border border-stone-200 bg-white px-8 py-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
              Account details
            </h2>
            <div className="mt-2 divide-y divide-stone-100">
              <LedgerRow label="Full name" value={displayUser.name} />
              <LedgerRow label="Email" value={displayUser.email} />
              <LedgerRow label="Designation" value={displayUser.designation} />
              <LedgerRow
                label="Avg. monthly income"
                value={formattedIncome}
                accent
              />
              {displayUser.createdAt && (
                <LedgerRow label="Member since" value={new Date(displayUser.createdAt).toLocaleDateString()} />
              )}
              {displayUser.lastLogin && (
                <LedgerRow label="Last login" value={new Date(displayUser.lastLogin).toLocaleString()} />
              )}
            </div>
          </section>

          {/* Skills Section */}
          {displayUser.skills && displayUser.skills.length > 0 && (
            <section className="rounded-3xl border border-stone-200 bg-white px-8 py-6 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                Skills
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {displayUser.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-full border border-emerald-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Bio Section */}
          {displayUser.bio && (
            <section className="rounded-3xl border border-stone-200 bg-white px-8 py-6 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                About Me
              </h2>
              <p className="mt-4 text-stone-700 leading-relaxed">
                {displayUser.bio}
              </p>
            </section>
          )}

          {/* Social Links Section */}
          {(displayUser.socialLinks && Object.values(displayUser.socialLinks).some(v => v)) && (
            <section className="rounded-3xl border border-stone-200 bg-white px-8 py-6 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                Connect With Me
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {Object.entries(displayUser.socialLinks || {}).map(([platform, url]) => {
                  if (!url) return null;
                  
                  let icon = "🔗";
                  let bgColor = "blue";
                  switch (platform) {
                    case "github":
                      icon = "⚫";
                      bgColor = "gray";
                      break;
                    case "linkedin":
                      icon = "🔵";
                      bgColor = "blue";
                      break;
                    case "twitter":
                      icon = "🐦";
                      bgColor = "blue";
                      break;
                    case "portfolio":
                      icon = "🌐";
                      bgColor = "green";
                      break;
                  }

                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center px-4 py-3 bg-${bgColor}-50 text-${bgColor}-800 text-xs font-medium rounded-lg border border-${bgColor}-200`}
                    >
                      <span className="mb-2 text-2xl">{icon}</span>
                      <span className="text-center">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                    </a>
                  );
                }).filter(Boolean)}
              </div>
            </section>
          )}

          {/* Quick actions */}
          <section className="rounded-3xl border border-stone-200 bg-white px-8 py-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
              Quick actions
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { href: "/blog", label: "Latest articles" },
                { href: "/portfolio", label: "Portfolio" },
                { href: "/about", label: "About" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                >
                  {label}
                </Link>
              ))}
            </div>
          </section>

          {/* Footer note */}
          <p className="px-2 text-xs text-stone-400">
            Signed in as <span className="font-mono text-stone-500">{displayUser.email}</span>.
            Your session is stored locally in your browser.{" "}
            <button
              onClick={handleLogout}
              className="font-semibold text-rose-500 underline-offset-4 hover:underline"
            >
              Sign out
            </button>
          </p>
        </>
      )}
    </main>
  );
}