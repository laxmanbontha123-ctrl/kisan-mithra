"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CloudSun, History, Leaf, ScanSearch } from "lucide-react";

import { SectionHeading } from "@/src/components/ui/section-heading";

const modules = [
  {
    title: "AI Disease Scan",
    description: "Upload crop leaf image and get AI disease prediction with guidance.",
    href: "/disease-scan",
    icon: ScanSearch,
    accent: "from-emerald-500 to-emerald-700",
  },
  {
    title: "Disease History",
    description: "View and manage saved disease scans.",
    href: "/disease-history",
    icon: History,
    accent: "from-lime-500 to-emerald-600",
  },
  {
    title: "Weather Alerts",
    description: "Get real-time farming weather alerts using your location.",
    href: "/weather-alerts",
    icon: CloudSun,
    accent: "from-teal-500 to-emerald-600",
  },
  {
    title: "24-hour Forecast",
    description: "See hourly forecast, rain risk, wind risk, and farming advisory.",
    href: "/weather-alerts",
    icon: Leaf,
    accent: "from-emerald-600 to-lime-600",
  },
];

export function WorkingModulesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Working modules"
        title="Production-ready tools already live in Kisan Mithra"
        description="These modules are built, connected, and ready to guide daily farm decisions with clear, practical output."
        center
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((module, index) => {
          const Icon = module.icon;

          return (
            <motion.article
              key={module.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="group rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${module.accent} text-white shadow-sm transition group-hover:scale-110`}>
                <Icon className="h-6 w-6" />
              </div>

              <div className="mt-5 flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                  Live
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Module</span>
              </div>

              <h3 className="mt-4 text-xl font-semibold text-slate-900">{module.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{module.description}</p>

              <Link
                href={module.href}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-800"
              >
                Open module
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </motion.article>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/disease-scan"
          className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          Scan Disease
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/disease-history"
          className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          View History
        </Link>
        <Link
          href="/weather-alerts"
          className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          Weather Alerts
        </Link>
      </div>
    </section>
  );
}