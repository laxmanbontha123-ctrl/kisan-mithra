import { ArrowRight, Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Kisan Mithra</p>
              <p className="text-sm text-slate-400">AI-powered smart farming</p>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
            Empowering farmers with practical insights, resilient planning, and intelligent support from sowing to harvest.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li>support@kisanmithra.ai</li>
              <li>+91 1800 123 456</li>
              <li>AgriTech Hub, Bengaluru</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Explore</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li><a href="#home" className="transition hover:text-white">Home</a></li>
              <li><a href="#features" className="transition hover:text-white">Features</a></li>
              <li><a href="#about" className="transition hover:text-white">About</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2026 Kisan Mithra. Built for resilient agriculture.</p>
          <a href="#home" className="inline-flex items-center gap-2 font-medium text-emerald-400 transition hover:text-emerald-300">
            Back to top
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
