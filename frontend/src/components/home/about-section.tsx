import { ArrowRight, Compass, Sprout } from "lucide-react";

import { Button } from "@/src/components/ui/button";

export function AboutSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="grid gap-10 rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-sm lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Why farmers choose us</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Better decisions, healthier farms, stronger livelihoods
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            From crop monitoring to market readiness, Kisan Mithra brings actionable intelligence to every stage of farm management.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="#contact" className="min-w-[180px]">
              <span className="flex items-center gap-2">
                Start your journey
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
            <Button href="#features" variant="secondary" className="min-w-[180px]">
              View solutions
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Sprout className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Adaptive guidance</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">Receive recommendations that evolve with seasonal conditions and local patterns.</p>
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Clear direction</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">Navigate markets, policies, and crop planning with practical, easy-to-follow insights.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
