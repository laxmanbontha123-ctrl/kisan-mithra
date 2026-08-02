"use client";

import {
  ArrowRight,
  BrainCircuit,
  CloudSun,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/src/components/ui/button";

const capabilities = [
  {
    icon: ScanSearch,
    title: "Crop monitoring",
  },
  {
    icon: BrainCircuit,
    title: "AI guidance",
  },
  {
    icon: CloudSun,
    title: "Weather intelligence",
  },
];

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-[#03150b] text-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,197,94,0.25),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(190,242,100,0.16),transparent_30%),linear-gradient(135deg,#020b05_0%,#07351c_48%,#07150c_100%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(190,242,100,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(190,242,100,0.05)_1px,transparent_1px)] bg-[size:58px_58px] opacity-50" />

      <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-200/20 bg-white/10 px-4 py-2 text-sm font-semibold text-lime-200 shadow-xl shadow-black/20 backdrop-blur-xl">
            <Sparkles className="h-4 w-4" />
            Smart farming technology for every farmer
          </div>

          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-7xl">
            Grow smarter with
            <span className="block bg-gradient-to-r from-emerald-300 via-lime-200 to-green-400 bg-clip-text text-transparent">
              Kisan Mithra
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-emerald-50/80 sm:text-lg">
            Detect crop diseases, understand weather conditions, and receive
            intelligent farming guidance through one simple platform built for
            Indian farmers.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/disease-scan" className="min-w-44">
              <span className="flex items-center gap-2">
                Scan Crop
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>

            <Button href="/weather-alerts" variant="secondary" className="min-w-44">
              <span className="flex items-center gap-2">
                Weather Alerts
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-emerald-50 backdrop-blur-xl">
              <ShieldCheck className="h-4 w-4 text-lime-300" />
              Farmer-focused guidance
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-emerald-50 backdrop-blur-xl">
              <Sprout className="h-4 w-4 text-lime-300" />
              Easy crop monitoring
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.12 }}
          className="relative z-10"
        >
          <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-emerald-400/25 via-lime-300/10 to-sky-400/15 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-black/30 p-2 shadow-[0_35px_100px_-25px_rgba(34,197,94,0.55)] backdrop-blur-2xl">
            <div className="relative aspect-video overflow-hidden rounded-[2rem] bg-emerald-950">
              <video
                aria-label="Indian farmer using smart farming technology"
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source
                  src="/videos/home-smart-farming.mp4"
                  type="video/mp4"
                />
              </video>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020b05]/85 via-transparent to-black/10" />

              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-lime-200 backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-lime-300 shadow-[0_0_15px_rgba(190,242,100,0.9)]" />
                Smart Farm Live
              </div>

              <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-3">
                {capabilities.map(({ icon: Icon, title }, index) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 + index * 0.12 }}
                    className="flex items-center gap-2 rounded-2xl border border-white/15 bg-black/35 px-3 py-3 text-xs font-semibold text-white shadow-xl backdrop-blur-xl"
                  >
                    <span className="rounded-xl bg-emerald-400/20 p-2 text-lime-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    {title}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
