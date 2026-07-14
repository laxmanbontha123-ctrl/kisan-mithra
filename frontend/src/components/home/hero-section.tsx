"use client";

import { ArrowRight, BrainCircuit, CloudSun, ShieldCheck, Sprout } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/src/components/ui/button";

export function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_42%),linear-gradient(135deg,#f8fff9_0%,#eefbf3_100%)]">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
            <Sprout className="h-4 w-4" />
            Trusted by modern farming cooperatives
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            AI Powered Smart Farming for Every Farmer
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Kisan Mithra helps farmers detect crop issues early, plan with weather intelligence,
            and access market insights in one simple experience.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/disease-scan" className="min-w-45">
              <span className="flex items-center gap-2">
                Scan Disease
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
            <Button href="/weather-alerts" className="min-w-45">
              <span className="flex items-center gap-2">
                Weather Alerts
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
            <Button href="/disease-history" variant="secondary" className="min-w-45">
              Disease History
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Real-time insights
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-2">
              <BrainCircuit className="h-4 w-4 text-emerald-600" />
              AI guidance
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-2">
              <CloudSun className="h-4 w-4 text-emerald-600" />
              Weather awareness
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-4xl bg-emerald-500/20 blur-3xl" />
          <div className="relative rounded-4xl border border-emerald-100 bg-white p-6 shadow-[0_30px_90px_-30px_rgba(5,150,105,0.45)]">
            <div className="rounded-3xl bg-linear-to-br from-emerald-600 via-lime-500 to-emerald-900 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-100">Today&apos;s farm outlook</p>
                  <p className="mt-2 text-2xl font-semibold">Healthy growth forecast</p>
                </div>
                <div className="rounded-2xl bg-white/15 p-3">
                  <Sprout className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-sm text-emerald-100">Disease risk</p>
                  <p className="mt-1 text-xl font-semibold">Low</p>
                </div>
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-sm text-emerald-100">Rain chance</p>
                  <p className="mt-1 text-xl font-semibold">72%</p>
                </div>
              </div>
            </div>
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Recommended action</p>
                  <p className="text-lg font-semibold text-slate-900">Apply irrigation at 6 PM</p>
                </div>
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                  AI Suggestion
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
