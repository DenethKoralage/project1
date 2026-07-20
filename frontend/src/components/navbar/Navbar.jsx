"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const links = [
  { id: 1, name: "Home", href: "/" },
  { id: 2, name: "About", href: "/about" },
  { id: 3, name: "Blog", href: "/blog" },
  { id: 4, name: "Contact", href: "/contacts" },
  { id: 5, name: "Portfolio", href: "/portfolio" },
  { id: 6, name: "Profile", href: "/profile" }
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <nav className="fixed left-1/2 top-4 z-50 w-[min(92%,900px)] -translate-x-1/2 rounded-2xl border border-white/25 bg-white/15 px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center justify-center gap-2 md:justify-start md:gap-4">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition md:text-base text-teal-300 ${
                pathname === link.href
                  ? "bg-white/40 text-slate-900"
                  : "text-teal-700 hover:bg-white/30 hover:text-teal-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth area — hidden while rehydrating to avoid flash */}
        {!loading && (
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Logged-in: show user name + logout */}
                <Link
                  href="/profile"
                  className="rounded-xl border border-emerald-700/20 bg-white/60 px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-white"
                >
                  👤 {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Logged-out: show Login + Sign Up */}
                <Link
                  href="/login"
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition md:text-base border border-emerald-700/20 bg-white/60 text-emerald-800 hover:bg-white`}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition md:text-base ${
                    pathname === "/signup"
                      ? "bg-slate-900 text-white"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}