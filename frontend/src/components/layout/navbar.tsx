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

  function isActiveLink(href: string) {
    const cleanHref = href.split("#")[0];

    if (href.includes("#")) {
      return false;
    }

    return pathname === cleanHref;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-emerald-950/56 text-white shadow-2xl shadow-black/20 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-8">
        <Link href="/home" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lime-200/25 bg-gradient-to-br from-emerald-400 via-green-500 to-lime-500 text-white shadow-lg shadow-emerald-950/30 transition group-hover:scale-105">
            <Leaf className="h-5 w-5" />
          </div>

          <div>
            <p className="text-lg font-black tracking-tight text-white">
              Kisan Mithra
            </p>
            <p className="text-sm text-emerald-100/70">
              Smart farming platform
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-semibold lg:flex">
          {links.map((link) => {
            const active = isActiveLink(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                className={
                  active
                    ? "rounded-full border border-lime-200/25 bg-lime-300/15 px-3.5 py-2 text-lime-200 shadow-lg shadow-black/10 backdrop-blur-xl"
                    : "rounded-full px-3.5 py-2 text-emerald-50/75 transition hover:bg-white/10 hover:text-white"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {userName ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded-full border border-lime-200/20 bg-lime-300/12 px-4 py-2 text-sm font-bold text-lime-100 backdrop-blur-xl">
                Hi, {userName.split(" ")[0]}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-red-200/25 bg-red-400/10 px-5 py-2.5 text-sm font-bold text-red-100 transition hover:bg-red-400/20"
              >
                Logout
              </button>
            </div>
          ) : (
            <Button
              href="/login"
              variant="secondary"
              className="hidden border-white/25 bg-white/10 text-white hover:bg-white/20 sm:inline-flex"
            >
              Login
            </Button>
          )}

          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((current) => !current)}
            className="rounded-full border border-white/20 bg-white/10 p-2.5 text-white transition hover:bg-white/20 lg:hidden"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-white/10 bg-emerald-950/72 px-6 py-4 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2">
            {links.map((link) => {
              const active = isActiveLink(link.href);

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={
                    active
                      ? "rounded-2xl border border-lime-200/20 bg-lime-300/15 px-4 py-3 text-sm font-bold text-lime-100"
                      : "rounded-2xl px-4 py-3 text-sm font-semibold text-emerald-50/80 transition hover:bg-white/10 hover:text-white"
                  }
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="mt-3 border-t border-white/10 pt-4">
              {userName ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-lime-200/20 bg-lime-300/10 px-4 py-3 text-sm font-bold text-lime-100">
                    Hi, {userName.split(" ")[0]}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-2xl border border-red-200/25 bg-red-400/10 px-4 py-3 text-left text-sm font-bold text-red-100 transition hover:bg-red-400/20"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 px-4 py-3 text-center text-sm font-black text-white"
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

