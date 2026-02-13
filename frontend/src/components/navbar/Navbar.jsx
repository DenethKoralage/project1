"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const links = [
  { id: 1, name: "Home", href: "/" },
  { id: 2, name: "About", href: "/about" },
  { id: 3, name: "Blog", href: "/blog" },
  { id: 4, name: "Contact", href: "/contacts" },
  { id: 5, name: "Portfolio", href: "/portfolio" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-1/2 top-4 z-50 w-[min(92%,900px)] -translate-x-1/2 rounded-2xl border border-white/25 bg-white/15 px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
        {links.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition md:text-base text-emerald-600 ${
              pathname === link.href
                ? "bg-white/40 text-slate-900"
                : "text-emerald-700 hover:bg-white/30 hover:text-slate-700"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
