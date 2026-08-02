"use client";

import {
  BarChart3,
  BellRing,
  CloudSun,
  Leaf,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

import { SectionHeading } from "@/src/components/ui/section-heading";

const features = [
  {
    title: "Crop Disease Detection",
    description:
      "Identify early signs of disease from field images and receive practical treatment guidance.",
    icon: Leaf,
    color: "from-emerald-400 to-lime-300",
  },
  {
    title: "Weather Forecast",
    description:
      "Plan irrigation, spraying, and harvesting with accurate local weather predictions.",
    icon: CloudSun,
    color: "from-sky-400 to-cyan-300",
  },
  {
    title: "Market Intelligence",
    description:
      "Prepare for live pricing insights and make better produce-selling decisions.",
    icon: TrendingUp,
    color: "from-amber-400 to-orange-300",
  },
  {
    title: "AI Farming Assistant",
    description:
      "Receive intelligent agricultural guidance through a simple farmer-focused experience.",
    icon: Sparkles,
    color: "from-violet-400 to-fuchsia-300",
  },
  {
    title: "Government Support",
    description:
      "Access verified scheme and farmer-support information as integrations become available.",
    icon: BellRing,
    color: "from-rose-400 to-orange-300",
  },
  {
    title: "Farm Analytics",
    description:
      "Build useful crop records that will power future performance and productivity insights.",
    icon: BarChart3,
    color: "from-teal-400 to-emerald-300",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative isolate overflow-hidden px-6 py-24 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.12),transparent_30%),linear-gradient(180deg,#f4fff8_0%,#eaf8f0_100%)]" />
      <div className="km-moving-grid pointer-events-none absolute inset-0 -z-10 opacity-45" />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-20 -z-10 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl"
        animate={{
          x: [0, 80, 0],
          y: [0, 50, 0],
          scale: [1, 1.18, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-10 -z-10 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl"
        animate={{
          x: [0, -70, 0],
          y: [0, -40, 0],
          scale: [1, 1.14, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Core capabilities"
          title="Everything a modern farm needs in one intelligent workspace"
          description="Kisan Mithra combines working farm tools with carefully planned integrations that will grow into a complete farmer platform."
          center
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 28, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.07,
                  ease: "easeOut",
                }}
                whileHover={{ y: -9, scale: 1.015 }}
                className="km-glow-card group relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 p-7 shadow-xl shadow-emerald-950/10 backdrop-blur-2xl"
              >
                <motion.div
                  aria-hidden="true"
                  className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${feature.color} opacity-15 blur-3xl`}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{
                    duration: 4 + index * 0.35,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  aria-hidden="true"
                  className={`absolute left-0 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100`}
                  animate={{ x: ["-100%", "240%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                <motion.div
                  className={`relative flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-emerald-950 shadow-lg`}
                  animate={{
                    y: [0, -6, 0],
                    rotate: [0, -2, 2, 0],
                    boxShadow: [
                      "0 10px 25px rgba(5,150,105,0.12)",
                      "0 16px 38px rgba(5,150,105,0.30)",
                      "0 10px 25px rgba(5,150,105,0.12)",
                    ],
                  }}
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.12 }}
                  transition={{
                    duration: 3.2 + index * 0.25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.16,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </motion.div>

                <span
                  aria-hidden="true"
                  className="km-orbit-ring pointer-events-none absolute right-5 top-5 h-14 w-14 rounded-full border border-emerald-400/25"
                  style={{ animationDelay: `${index * 180}ms` }}
                />

                <h3 className="relative mt-5 text-xl font-black text-slate-900">
                  {feature.title}
                </h3>

                <p className="relative mt-3 text-base leading-7 text-slate-600">
                  {feature.description}
                </p>

                <div className="relative mt-6 h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${feature.color}`}
                    initial={{ width: "15%" }}
                    whileInView={{ width: "82%" }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.1,
                      delay: 0.25 + index * 0.08,
                    }}
                  />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
