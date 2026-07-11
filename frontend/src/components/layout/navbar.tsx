import { Leaf, Menu } from "lucide-react";

import { Button } from "@/src/components/ui/button";

const links = [
  { label: "Home", href: "#home" },
  { label: "Disease Scan", href: "/disease-scan" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#home" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">Kisan Mithra</p>
            <p className="text-sm text-slate-500">Smart farming platform</p>
          </div>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="transition hover:text-emerald-600">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button href="#contact" variant="secondary" className="hidden sm:inline-flex">
            Login
          </Button>
          <button className="rounded-full border border-emerald-200 p-2 text-slate-700 md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
