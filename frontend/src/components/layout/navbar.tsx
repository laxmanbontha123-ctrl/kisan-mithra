"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CircleHelp,
  CloudSun,
  Grid2X2,
  History,
  House,
  LayoutDashboard,
  Leaf,
  LogOut,
  Mail,
  MapPinned,
  Menu,
  ScanSearch,
  Sprout,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type NavigationItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const links: NavigationItem[] = [
  {
    label: "Home",
    description: "Platform overview",
    href: "/home",
    icon: House,
  },
  {
    label: "Dashboard",
    description: "Farm command center",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Profile",
    description: "Account and preferences",
    href: "/profile",
    icon: UserRound,
  },  {
    label: "Farm Setup",
    description: "Add crop and land",
    href: "/farm-setup",
    icon: MapPinned,
  },
  {
    label: "Disease Scan",
    description: "Check leaf health",
    href: "/disease-scan",
    icon: ScanSearch,
  },
  {
    label: "Disease History",
    description: "Saved scan results",
    href: "/disease-history",
    icon: History,
  },
  {
    label: "Weather Alerts",
    description: "Live local weather",
    href: "/weather-alerts",
    icon: CloudSun,
  },
  {
    label: "Features",
    description: "All capabilities",
    href: "/home#features",
    icon: Grid2X2,
  },
  {
    label: "About",
    description: "About the platform",
    href: "/home#about",
    icon: CircleHelp,
  },
  {
    label: "Contact",
    description: "Help and support",
    href: "/home#contact",
    icon: Mail,
  },
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

  const currentPage =
    links.find(
      (link) => !link.href.includes("#") && link.href === pathname,
    ) ?? links[0];

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
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
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  function handleLogout() {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    setUserName("");
    setIsMenuOpen(false);
    router.push("/login");
  }

  function isActiveLink(href: string) {
    if (href.includes("#")) {
      return false;
    }

    return pathname === href;
  }

  function renderNavigationLinks(onNavigate?: () => void) {
    return links.map((link, index) => {
      const Icon = link.icon;
      const active = isActiveLink(link.href);

      return (
        <motion.div
          key={link.label}
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.035 }}
        >
          <Link
            href={link.href}
            onClick={onNavigate}
            className={
              active
                ? "group flex items-center gap-3 rounded-2xl border border-lime-200/25 bg-lime-300/15 px-3 py-3 text-lime-100 shadow-lg shadow-black/10"
                : "group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-emerald-50/75 transition hover:border-white/10 hover:bg-white/10 hover:text-white"
            }
          >
            <span
              className={
                active
                  ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-300 text-emerald-950 shadow-lg shadow-lime-300/20"
                  : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-100 transition group-hover:bg-white/15 group-hover:text-lime-300"
              }
            >
              <Icon className="h-5 w-5" />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-black">{link.label}</span>
              <span
                className={
                  active
                    ? "mt-0.5 block text-xs text-lime-100/65"
                    : "mt-0.5 block text-xs text-emerald-100/45"
                }
              >
                {link.description}
              </span>
            </span>
          </Link>
        </motion.div>
      );
    });
  }

  return (
    <>
      <aside className="km-desktop-sidebar fixed inset-y-0 left-0 z-[60] hidden w-72 flex-col overflow-hidden border-r border-white/15 bg-emerald-950/88 text-white shadow-2xl shadow-black/40 backdrop-blur-3xl lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(190,242,100,0.18),transparent_28%),radial-gradient(circle_at_85%_80%,rgba(14,165,233,0.12),transparent_30%)]" />
        <div className="km-moving-grid pointer-events-none absolute inset-0 opacity-10" />

        <Link
          href="/home"
          className="relative flex items-center gap-3 border-b border-white/10 px-5 py-5"
        >
          <motion.div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-lime-400 text-emerald-950 shadow-xl shadow-black/25"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Leaf className="h-6 w-6" />
          </motion.div>

          <div>
            <p className="text-lg font-black tracking-tight">Kisan Mithra</p>
            <p className="text-xs text-emerald-100/60">Smart farming platform</p>
          </div>
        </Link>

        <div className="relative flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-3 px-3 text-[11px] font-black uppercase tracking-[0.24em] text-lime-200/60">
            Farm tools
          </p>

          <nav className="grid gap-1.5">
            {renderNavigationLinks()}
          </nav>
        </div>

        <div className="relative border-t border-white/10 p-4">
          {userName ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-lime-200/15 bg-lime-300/10 px-3 py-3">
                <Sprout className="h-5 w-5 shrink-0 text-lime-300" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-lime-200/60">
                    Farmer
                  </p>
                  <p className="truncate text-sm font-black text-white">
                    {userName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200/20 bg-red-400/10 px-4 py-3 text-sm font-black text-red-100 transition hover:bg-red-400/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="block rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 px-4 py-3 text-center text-sm font-black text-white"
            >
              Login with OTP
            </Link>
          )}
        </div>
      </aside>

      <header className="sticky top-0 z-50 border-b border-white/15 bg-emerald-950/56 text-white shadow-xl shadow-black/15 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation-drawer"
              onClick={() => setIsMenuOpen(true)}
              className="rounded-full border border-white/20 bg-white/10 p-2.5 text-white transition hover:bg-white/20"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/home" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 text-emerald-950">
                <Leaf className="h-5 w-5" />
              </div>

              <div>
                <p className="font-black">Kisan Mithra</p>
                <p className="hidden text-xs text-emerald-100/60 sm:block">
                  Smart farming
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <currentPage.icon className="h-5 w-5 text-lime-300" />
            <div>
              <p className="text-sm font-black text-white">
                {currentPage.label}
              </p>
              <p className="text-xs text-emerald-100/55">
                {currentPage.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userName ? (
              <span className="rounded-full border border-lime-200/20 bg-lime-300/12 px-4 py-2 text-sm font-bold text-lime-100">
                Hi, {userName}
              </span>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 z-[60] cursor-default bg-black/55 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.aside
              id="mobile-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation"
              className="fixed inset-y-0 left-0 z-[70] flex w-[90%] max-w-sm flex-col overflow-hidden border-r border-white/15 bg-emerald-950/92 text-white shadow-2xl shadow-black/50 backdrop-blur-3xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(190,242,100,0.18),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(14,165,233,0.12),transparent_32%)]" />
              <div className="km-moving-grid pointer-events-none absolute inset-0 opacity-10" />

              <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 text-emerald-950">
                    <Sprout className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-black">All Farm Features</p>
                    <p className="text-xs text-emerald-100/60">
                      Select the tool you need
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full border border-white/15 bg-white/10 p-2.5 text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative flex-1 overflow-y-auto px-4 py-4">
                <nav className="grid gap-1.5">
                  {renderNavigationLinks(() => setIsMenuOpen(false))}
                </nav>
              </div>

              <div className="relative border-t border-white/10 p-4">
                {userName ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200/20 bg-red-400/10 px-4 py-3 text-sm font-black text-red-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 px-4 py-3 text-center text-sm font-black text-white"
                  >
                    Login with OTP
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

