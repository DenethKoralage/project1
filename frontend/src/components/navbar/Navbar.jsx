"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const links = [
  { id: 1, name: "Home", href: "/" },
  { id: 2, name: "About", href: "/about" },
  { id: 3, name: "Blog", href: "/blog" },
  { id: 4, name: "Contact", href: "/contacts" },
  { id: 5, name: "Portfolio", href: "/portfolio" },
  { id: 6, name: "Profile", href: "/profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handleLogout() {
    logout();
    router.push("/");
    setMenuOpen(false);
  }

  return (
    <>
      <nav className="fixed left-1/2 top-4 z-50 w-[min(92%,900px)] -translate-x-1/2 rounded-2xl border border-white/25 bg-white/15 px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">

          {/* ── Brand / Logo ─────────────────────────────── */}
          <Link
            href="/"
            className="shrink-0 rounded-xl px-3 py-2 text-sm font-extrabold tracking-tight text-emerald-700 transition hover:text-emerald-600 md:hidden"
          >
            💰 TFF
          </Link>

          {/* ── Desktop nav links (md+) ──────────────────── */}
          <div className="hidden md:flex flex-1 items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  pathname === link.href
                    ? "bg-white/40 text-slate-900"
                    : "text-teal-700 hover:bg-white/30 hover:text-teal-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* ── Desktop auth area (md+) ──────────────────── */}
          {!loading && (
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="rounded-xl border border-emerald-700/20 bg-white/60 px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-white"
                  >
                    👤 {user.name.split(" ")[0]}
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
                  <Link
                    href="/login"
                    className="rounded-xl border border-emerald-700/20 bg-white/60 px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
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

          {/* ── Hamburger button (mobile only) ───────────── */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-slate-800 transition hover:bg-white/40 active:scale-95"
          >
            {menuOpen ? (
              /* Close icon */
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer overlay ──────────────────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer panel ────────────────────────────── */}
      <div
        className={`fixed left-0 top-0 z-40 h-full w-72 max-w-[80vw] bg-white/95 shadow-[4px_0_40px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-base font-extrabold tracking-tight text-emerald-700">
            💰 The Financial Freedom
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-4 py-4">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                pathname === link.href
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        {!loading && (
          <div className="border-t border-slate-100 px-4 py-4 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
                >
                  👤 {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-xl border border-emerald-700/20 bg-white px-4 py-3 text-center text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}