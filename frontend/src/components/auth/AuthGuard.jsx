"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PROTECTED_PREFIXES = ["/portfolio", "/blog", "/profile", "/my-blogs"];

export default function AuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // If loading session state, show a smooth loading indicator on protected routes
  if (loading && isProtectedRoute) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-slate-600">Verifying session...</p>
      </div>
    );
  }

  // If unauthenticated and accessing a protected route, show the access restriction modal
  if (!loading && !user && isProtectedRoute) {
    const pageName = pathname.startsWith("/portfolio")
      ? "Portfolio"
      : pathname.startsWith("/blog") || pathname.startsWith("/my-blogs")
      ? "Blog"
      : pathname.startsWith("/profile")
      ? "Profile"
      : "Protected";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white p-6 shadow-2xl md:p-8 text-center animate-in fade-in zoom-in duration-200">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl ring-8 ring-emerald-50/50">
            🔒
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Access Restricted
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            You need to be logged in or signed up to access the{" "}
            <span className="font-semibold text-emerald-700">{pageName}</span> section.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              Log In to Continue
            </button>

            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="w-full rounded-xl border border-emerald-600/30 bg-emerald-50/50 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100/60 active:scale-[0.98]"
            >
              Create an Account (Sign Up)
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-1 text-xs font-semibold text-slate-500 transition hover:text-slate-800 hover:underline"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
