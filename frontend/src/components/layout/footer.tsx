"use client";

import { ArrowRight, Leaf, Mail, Radio, Sprout } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative isolate overflow-hidden border-t border-white/10 bg-slate-950 text-slate-300"
    >
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_25%,rgba(16,185,129,0.22),transparent_32%),radial-gradient(circle_at_82%_40%,rgba(14,165,233,0.13),transparent_28%),linear-gradient(135deg,#020617_0%,#032b1a_52%,#020617_100%)]" />
      <div className="km-moving-grid pointer-events-none absolute inset-0 -z-10 opacity-15" />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 -z-10 h-px w-1/3 bg-gradient-to-r from-transparent via-lime-300 to-transparent"
        animate={{ x: ["-100%", "400%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 -z-10 h-80 w-80 rounded-full border border-emerald-200/10"
        animate={{ rotate: 360, scale: [1, 1.12, 1] }}
        transition={{
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          scale: { duration: 7, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 text-emerald-950 shadow-xl shadow-emerald-950/30"
              animate={{ y: [0, -5, 0], rotate: [0, -4, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Leaf className="h-5 w-5" />
            </motion.div>

            <div>
              <p className="text-xl font-black text-white">Kisan Mithra</p>
              <p className="text-sm text-emerald-100/65">
                AI-powered smart farming
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300/80">
            Empowering farmers with practical insights, resilient planning,
            and intelligent support from sowing to harvest.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-emerald-100 backdrop-blur-xl">
              <Sprout className="h-4 w-4 text-lime-300" />
              Farmer focused
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-emerald-100 backdrop-blur-xl">
              <Radio className="h-4 w-4 text-cyan-300" />
              Growing platform
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="grid gap-8 sm:grid-cols-2"
        >
          <div className="km-dark-glow-card rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-lime-300" />
              <h3 className="text-lg font-black text-white">Contact</h3>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300/75">
              Official farmer-support contact details will be published after
              verification and before the public production launch.
            </p>
          </div>

          <div className="km-dark-glow-card rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <h3 className="text-lg font-black text-white">Explore</h3>

            <ul className="mt-4 space-y-3 text-sm text-slate-300/75">
              <li>
                <a
                  href="/home#home"
                  className="transition hover:text-lime-300"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/home#features"
                  className="transition hover:text-lime-300"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/home#about"
                  className="transition hover:text-lime-300"
                >
                  About
                </a>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© 2026 Kisan Mithra. Built for resilient agriculture.</p>

          <a
            href="/home#home"
            className="inline-flex items-center gap-2 font-semibold text-emerald-300 transition hover:text-lime-300"
          >
            Back to top
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
