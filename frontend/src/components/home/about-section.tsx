"use client";

import { ArrowRight, Compass, Sprout } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/src/components/ui/button";

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75 }}
          className="relative isolate grid gap-10 overflow-hidden rounded-[2.5rem] border border-lime-200/20 bg-[#04150c]/90 p-8 text-white shadow-2xl shadow-emerald-950/25 backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr] lg:p-12"
        >
          <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,rgba(34,197,94,0.28),transparent_34%),radial-gradient(circle_at_85%_70%,rgba(14,165,233,0.15),transparent_30%),linear-gradient(135deg,#031108_0%,#07351c_55%,#06111f_100%)]" />
          <div className="km-moving-grid pointer-events-none absolute inset-0 -z-10 opacity-20" />
          <div className="km-data-beam pointer-events-none absolute left-0 top-0 z-0 h-full w-1/3 bg-gradient-to-r from-transparent via-lime-200/10 to-transparent blur-xl" />

          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -right-28 -top-28 -z-10 h-72 w-72 rounded-full border border-lime-200/20"
            animate={{ rotate: 360, scale: [1, 1.12, 1] }}
            transition={{
              rotate: { duration: 28, repeat: Infinity, ease: "linear" },
              scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }}
          />

          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 -z-10 h-44 w-44 rounded-full border border-emerald-200/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          <div>
            <motion.p
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-sm font-black uppercase tracking-[0.3em] text-lime-300"
            >
              Why farmers choose us
            </motion.p>

            <h2 className="km-shimmer-text mt-4 text-3xl font-black tracking-tight text-transparent sm:text-5xl">
              Better decisions, healthier farms, stronger livelihoods
            </h2>

            <p className="mt-5 text-lg leading-8 text-emerald-50/80">
              From crop monitoring to market readiness, Kisan Mithra brings
              actionable intelligence to every stage of farm management.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="#contact" className="min-w-[180px]">
                <span className="flex items-center gap-2">
                  Start your journey
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>

              <Button
                href="#features"
                variant="secondary"
                className="min-w-[180px]"
              >
                View solutions
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Sprout,
                title: "Adaptive guidance",
                description:
                  "Receive recommendations that evolve with seasonal conditions and local patterns.",
                delay: 0.12,
              },
              {
                icon: Compass,
                title: "Clear direction",
                description:
                  "Navigate farm planning and agricultural decisions with practical, easy-to-follow insights.",
                delay: 0.24,
              },
            ].map(({ icon: Icon, title, description, delay }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: 22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="km-dark-glow-card group relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl shadow-black/20 backdrop-blur-2xl"
              >
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-emerald-950 shadow-xl shadow-lime-300/20"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </motion.div>

                <h3 className="mt-4 text-lg font-black text-white">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-emerald-50/75">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
