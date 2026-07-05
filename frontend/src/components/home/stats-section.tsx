const stats = [
  { value: "120K+", label: "Farmers Helped" },
  { value: "40+", label: "Crops Supported" },
  { value: "96%", label: "AI Accuracy" },
  { value: "22", label: "States Covered" },
];

export function StatsSection() {
  return (
    <section id="about" className="bg-emerald-950 py-20 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/30 p-6 text-center">
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-200">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
