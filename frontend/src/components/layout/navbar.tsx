"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/src/components/ui/button";

const links = [
  { label: "Home", href: "/home" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Farm Setup", href: "/farm-setup" },
  { label: "Disease Scan", href: "/disease-scan" },
  { label: "Disease History", href: "/disease-history" },
  { label: "Weather Alerts", href: "/weather-alerts" },
  { label: "Features", href: "/home#features" },
  { label: "About", href: "/home#about" },
  { label: "Contact", href: "/home#contact" },
];

type StoredUser = {
  fullName?: string;
  email?: string;
};

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);

    const storedUser = window.localStorage.getItem("user");

    if (!storedUser) {
      setUserName("");
      return;
    }

    try {
      const user = JSON.parse(storedUser) as StoredUser;
      setUserName(user.fullName || user.email || "");
    } catch {
      setUserName("");
    }
  }, [pathname]);

  function handleLogout() {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    setUserName("");
    setIsMenuOpen(false);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">Kisan Mithra</p>
            <p className="text-sm text-slate-500">Smart farming platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition hover:text-emerald-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {userName ? (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                Hi, {userName.split(" ")[0]}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <Button href="/login" variant="secondary" className="hidden sm:inline-flex">
              Login
            </Button>
          )}

          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((current) => !current)}
            className="rounded-full border border-emerald-200 p-2 text-slate-700 transition hover:bg-emerald-50 md:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-emerald-100 bg-white px-6 py-4 shadow-xl shadow-emerald-900/5 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 border-t border-slate-100 pt-4">
              {userName ? (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    Hi, {userName.split(" ")[0]}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-2xl border border-red-200 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
