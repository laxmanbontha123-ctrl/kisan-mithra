"use client";

import { BarChart3, BellRing, CloudSun, Leaf, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { SectionHeading } from "@/src/components/ui/section-heading";

const features = [
  {
    title: "Crop Disease Detection",
    description: "Identify early signs of disease from field images and receive practical treatment guidance.",
    icon: Leaf,
  },
  {
    title: "Weather Forecast",
    description: "Plan irrigation, spraying, and harvesting with accurate local weather predictions.",
    icon: CloudSun,
  },
  {
    title: "Market Prices",
    description: "Track live pricing trends and decide the best time to sell your produce.",
    icon: TrendingUp,
  },
  {
    title: "AI Farming Assistant",
    description: "Get instant answers to field questions using conversational AI tailored for agriculture.",
    icon: Sparkles,
  },
  {
    title: "Government Schemes",
    description: "Discover subsidies, credits, and support programs that fit your farm profile.",
    icon: BellRing,
  },
  {
    title: "Farm Analytics",
    description: "Monitor crop performance, costs, and productivity with clear weekly insight dashboards.",
    icon: BarChart3,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Core capabilities"
        title="Everything a modern farm needs in one intelligent workspace"
        description="Kisan Mithra combines predictive insights, advisory support, and operational guidance to help farmers work smarter every day."
        center
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-base leading-7 text-slate-600">{feature.description}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
