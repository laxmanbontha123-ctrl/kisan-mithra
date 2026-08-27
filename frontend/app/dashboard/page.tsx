"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, CalendarClock, CloudSun, History, LoaderCircle, ScanSearch, ShieldCheck, Wind } from "lucide-react";

import { Footer } from "@/src/components/layout/footer";
import { Navbar } from "@/src/components/layout/navbar";
import { api, type AuthUser, type Crop, type DiseaseScanHistoryItem, type WeatherAlertsResponse } from "@/src/services/api";

function formatConfidence(value: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatWeatherValue(value: number | null, suffix = ""): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return `${value}${suffix}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [latestScan, setLatestScan] = useState<DiseaseScanHistoryItem | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyErrorMessage, setHistoryErrorMessage] = useState<string | null>(null);

  const [weatherData, setWeatherData] = useState<WeatherAlertsResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherErrorMessage, setWeatherErrorMessage] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const [farmRecords, setFarmRecords] = useState<Crop[]>([]);
  const [farmLoading, setFarmLoading] = useState(true);
  const [farmErrorMessage, setFarmErrorMessage] = useState<string | null>(null);
  const primaryFarm = farmRecords[0] ?? null;

  useEffect(() => {
    const token = window.localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    let isMounted = true;

    async function loadProfile() {
      setProfileLoading(true);

      try {
        const result = await api.getProfile();

        if (!isMounted) {
          return;
        }

        setProfile(result.user);
        window.localStorage.setItem("user", JSON.stringify(result.user));
      } catch {
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("user");
        router.push("/login");
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setHistoryLoading(true);
      setWeatherLoading(true);
      setFarmLoading(true);
      setHistoryErrorMessage(null);
      setWeatherErrorMessage(null);
      setFarmErrorMessage(null);

      const [historyResult, farmResult] = await Promise.allSettled([
        api.getDiseaseHistory(),
        api.getCrops(),
      ]);

      if (!isMounted) {
        return;
      }

      if (historyResult.status === "fulfilled" && historyResult.value.success) {
        setLatestScan(historyResult.value.scans[0] ?? null);
      } else {
        const historyError =
          historyResult.status === "rejected"
            ? historyResult.reason
            : new Error(historyResult.value.message || "Failed to fetch disease scan history.");

        setHistoryErrorMessage(
          historyError instanceof Error ? historyError.message : "Failed to fetch disease scan history.",
        );
      }

      let farmForWeather: Crop | null = null;

      if (farmResult.status === "fulfilled" && farmResult.value.success) {
        const records = farmResult.value.data;
        setFarmRecords(records);
        farmForWeather = records[0] ?? null;
      } else {
        const farmError =
          farmResult.status === "rejected"
            ? farmResult.reason
            : new Error(farmResult.value.message || "Unable to load farm details.");

        setFarmErrorMessage(
          farmError instanceof Error ? farmError.message : "Unable to load farm details.",
        );
      }

      setHistoryLoading(false);
      setFarmLoading(false);

      if (
        !farmForWeather ||
        !Number.isFinite(farmForWeather.latitude) ||
        !Number.isFinite(farmForWeather.longitude)
      ) {
        setWeatherErrorMessage("Add a farm with a valid location to view local weather alerts.");
        setWeatherLoading(false);
        return;
      }

      try {
        const weatherResult = await api.getWeatherAlerts(
          farmForWeather.latitude,
          farmForWeather.longitude,
        );

        if (!isMounted) {
          return;
        }

        if (!weatherResult.success) {
          setWeatherErrorMessage("Weather data is currently unavailable for your farm.");
        } else {
          setWeatherData(weatherResult);
          setLastUpdatedAt(new Date().toISOString());
        }
      } catch (error) {
        if (isMounted) {
          setWeatherErrorMessage(
            error instanceof Error ? error.message : "Failed to fetch weather alerts.",
          );
        }
      } finally {
        if (isMounted) {
          setWeatherLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#031108] text-slate-900">
      <style>{`
        @keyframes dashboardAurora {
          0%, 100% { transform: translate3d(-4%, -2%, 0) scale(1); opacity: 0.8; }
          50% { transform: translate3d(5%, 4%, 0) scale(1.12); opacity: 1; }
        }

        @keyframes dashboardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes dashboardSweep {
          0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
          25% { opacity: 0.9; }
          100% { transform: translateX(120%) skewX(-18deg); opacity: 0; }
        }

        @keyframes fieldMove {
          0% { transform: translateY(-18px) scaleX(0.82); opacity: 0; }
          30% { opacity: 0.75; }
          100% { transform: translateY(38px) scaleX(1.18); opacity: 0; }
        }

        @keyframes pulseWeather {
          0%, 100% { box-shadow: 0 24px 80px -48px rgba(34,197,94,0.7); }
          50% { box-shadow: 0 34px 110px -42px rgba(190,242,100,0.85); }
        }

        .dashboard-hero {
          animation: dashboardFloat 6s ease-in-out infinite;
        }

        .dashboard-card {
          position: relative;
          overflow: hidden;
        }

        .dashboard-card::after {
          content: "";
          position: absolute;
          inset: 0;
          width: 45%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          transform: translateX(-120%) skewX(-18deg);
          animation: dashboardSweep 4.5s ease-in-out infinite;
          pointer-events: none;
        }

        .dashboard-panel {
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(22px);
        }

        .weather-pulse {
          animation: pulseWeather 4s ease-in-out infinite;
        }

        .crop-lines {
          transform: perspective(900px) rotateX(62deg);
          transform-origin: bottom center;
        }

        @keyframes scannerPulse {
          0%, 100% { transform: scale(0.85); opacity: 0.35; }
          50% { transform: scale(1.1); opacity: 0.9; }
        }

        @keyframes videoFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(1deg); }
        }

        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 28px 90px -58px rgba(16,185,129,0.55); }
          50% { box-shadow: 0 34px 120px -46px rgba(190,242,100,0.75); }
        }

        .cinematic-tile {
          animation: videoFloat 6s ease-in-out infinite, cardGlow 4.5s ease-in-out infinite;
        }

        .scanner-ring {
          animation: scannerPulse 2.6s ease-in-out infinite;
        }

        .feature-card {
          animation: cardGlow 5s ease-in-out infinite;
        }

        @keyframes radarPulse {
          0% { transform: translate(-50%, -50%) scale(0.55); opacity: 0.85; }
          100% { transform: translate(-50%, -50%) scale(1.55); opacity: 0; }
        }

        @keyframes droneTravel {
          0%, 100% { transform: translate(0, 0) rotate(-8deg); }
          25% { transform: translate(110px, -42px) rotate(12deg); }
          50% { transform: translate(210px, 18px) rotate(4deg); }
          75% { transform: translate(95px, 70px) rotate(-14deg); }
        }

        @keyframes dataBeam {
          0% { transform: translateX(-120%); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @keyframes meterGlow {
          0%, 100% { width: 42%; opacity: 0.65; }
          50% { width: 92%; opacity: 1; }
        }

        @keyframes statusBlink {
          0%, 100% { opacity: 0.45; box-shadow: 0 0 0 rgba(190,242,100,0); }
          50% { opacity: 1; box-shadow: 0 0 22px rgba(190,242,100,0.85); }
        }

        @keyframes panelEnter {
          from { opacity: 0; transform: translateY(22px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .command-panel {
          animation: panelEnter 700ms ease both;
        }

        .radar-ring {
          animation: radarPulse 2.8s ease-out infinite;
        }

        .drone-dot {
          animation: droneTravel 7s ease-in-out infinite;
        }

        .data-beam {
          animation: dataBeam 3.8s ease-in-out infinite;
        }

        .meter-line {
          animation: meterGlow 3.2s ease-in-out infinite;
        }

        .live-dot {
          animation: statusBlink 1.8s ease-in-out infinite;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(34,197,94,0.34),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.20),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(190,242,100,0.16),transparent_32%),linear-gradient(135deg,#020b05_0%,#052b18_48%,#06111f_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(132,204,22,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(132,204,22,0.08)_1px,transparent_1px)] bg-[size:54px_54px] opacity-45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.42)_76%)]" />
      <div className="pointer-events-none absolute left-[-15%] top-[-20%] h-[34rem] w-[34rem] rounded-full bg-emerald-400/20 blur-3xl" style={{ animation: "dashboardAurora 10s ease-in-out infinite" }} />
      <div className="pointer-events-none absolute bottom-[-20%] right-[-12%] h-[38rem] w-[38rem] rounded-full bg-lime-300/20 blur-3xl" style={{ animation: "dashboardAurora 12s ease-in-out infinite reverse" }} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:80px_80px] opacity-50" />

      <div className="crop-lines pointer-events-none absolute bottom-[-20%] left-[-10%] h-[45vh] w-[120%] overflow-hidden opacity-70">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="absolute left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-lime-200/45 to-transparent"
            style={{
              top: `${index * 5}%`,
              animation: `fieldMove ${3.4 + index * 0.06}s linear infinite`,
              animationDelay: `${index * 0.14}s`,
            }}
          />
        ))}
      </div>

      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-6 py-12 lg:px-8">
        <div className="command-panel relative mb-8 overflow-hidden rounded-[2.6rem] border border-lime-200/20 bg-[#04130b]/82 p-6 shadow-2xl shadow-black/35 backdrop-blur-2xl lg:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(34,197,94,0.20),transparent_35%,rgba(59,130,246,0.12)_65%,transparent)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-200/70 to-transparent" />
          <div className="data-beam absolute left-0 top-16 h-24 w-1/2 bg-gradient-to-r from-transparent via-lime-200/18 to-transparent blur-md" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-lime-200/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-lime-200">
                <span className="live-dot h-2.5 w-2.5 rounded-full bg-lime-300" />
                AI Farm Command Center
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl">
                {profile ? `Welcome, ${profile.fullName}` : "Dashboard"}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50/82 sm:text-lg">
                {profileLoading
                  ? "Loading your farmer profile..."
                  : "Monitor farm records, local weather, saved disease scans, and available advisories from one dashboard."}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/disease-scan"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-green-400 to-lime-400 px-5 py-3 text-sm font-black text-white shadow-xl shadow-emerald-700/30 transition hover:scale-[1.03]"
                >
                  Start AI Scan
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/weather-alerts"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/20 backdrop-blur-xl transition hover:bg-white/22"
                >
                  Weather Control
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                {[
                  ["Farm", primaryFarm ? primaryFarm.cropName : "Not configured"],
                  ["Weather", weatherLoading ? "Loading" : weatherData ? "Live data" : "Unavailable"],
                  ["Disease history", historyLoading ? "Loading" : latestScan ? "Available" : "No scans yet"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/14 bg-white/10 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-200">{label}</p>
                    <p className="mt-2 text-lg font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden min-h-[360px] overflow-hidden rounded-[2rem] border border-lime-200/20 bg-[#061b10]/80 p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl lg:block">
              <video
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-85 brightness-90 saturate-150"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/videos/dashboard-animation.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-[#020b05]/90 via-[#031108]/35 to-[#020b05]/20" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(190,242,100,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(190,242,100,0.06)_1px,transparent_1px)] bg-[size:34px_34px] opacity-50" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.10),transparent_52%)]" />

              <div className="radar-ring absolute left-1/2 top-1/2 h-40 w-40 rounded-full border border-lime-200/45" />
              <div className="radar-ring absolute left-1/2 top-1/2 h-56 w-56 rounded-full border border-emerald-200/35" style={{ animationDelay: "650ms" }} />
              <div className="radar-ring absolute left-1/2 top-1/2 h-72 w-72 rounded-full border border-sky-200/20" style={{ animationDelay: "1300ms" }} />

              <div className="drone-dot absolute left-[18%] top-[48%] z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-lime-200/40 bg-lime-300 text-emerald-950 shadow-2xl shadow-lime-300/30">
                <ScanSearch className="h-6 w-6" />
              </div>

              <div className="absolute left-[12%] top-[58%] h-px w-[72%] -rotate-12 bg-gradient-to-r from-transparent via-lime-200/45 to-transparent" />
              <div className="absolute left-[24%] top-[35%] h-px w-[52%] rotate-[18deg] bg-gradient-to-r from-transparent via-sky-200/35 to-transparent" />

              <div className="absolute left-5 top-5 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-lime-200">Data policy</p>
                <p className="mt-2 text-2xl font-black text-white">Source-based</p>
              </div>

              <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-3">
                {[
                  ["Satellite", "Unavailable"],
                  ["Soil data", "Unavailable"],
                  ["Risk score", "Unavailable"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/15 bg-black/25 p-3 text-center backdrop-blur-xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-200">{label}</p>
                    <p className="mt-1 text-sm font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "AI Disease Scan",
              description: "Upload leaf images and get AI disease prediction with guidance.",
              icon: ScanSearch,
              href: "/disease-scan",
              label: "Scan now",
            },
            {
              title: "Disease History",
              description: "View and manage saved disease scans.",
              icon: History,
              href: "/disease-history",
              label: "View records",
            },
            {
              title: "Weather Alerts",
              description: "View current and forecast weather for your saved farm location.",
              icon: CloudSun,
              href: "/weather-alerts",
              label: "Check weather",
            },
            {
              title: "24-hour Forecast",
              description: "See hourly forecast, rain risk, wind risk, and advisory.",
              icon: Wind,
              href: "/weather-alerts",
              label: "Open forecast",
            },
          ].map((card, index) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                href={card.href}
                className="feature-card group relative min-h-72 overflow-hidden rounded-[2rem] border border-white/18 bg-white/12 p-6 shadow-2xl shadow-black/25 backdrop-blur-2xl transition hover:-translate-y-2 hover:border-lime-200/40 hover:bg-white/18"
                style={{ animationDelay: `${index * 250}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/14 via-emerald-400/10 to-black/30" />
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-lime-300/20 blur-2xl transition group-hover:scale-125" />
                <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-emerald-950/70 to-transparent" />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 text-white shadow-xl shadow-emerald-700/30">
                    <Icon className="h-7 w-7" />
                  </div>

                  <h2 className="mt-8 text-2xl font-black text-white">{card.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-emerald-50/78">{card.description}</p>

                  <div className="mt-auto flex items-center justify-between pt-8">
                    <span className="text-sm font-black text-lime-200">{card.label}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition group-hover:translate-x-1 group-hover:bg-lime-300 group-hover:text-emerald-950">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/disease-scan"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 via-green-500 to-lime-500 px-5 py-3 text-sm font-black text-white shadow-xl shadow-emerald-600/25 transition hover:scale-[1.02]"
          >
            Scan Disease
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/disease-history"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/12 px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/20 backdrop-blur-xl transition hover:bg-white/22"
          >
            View History
          </Link>
          <Link
            href="/weather-alerts"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/12 px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/20 backdrop-blur-xl transition hover:bg-white/22"
          >
            Weather Alerts
          </Link>
        </section>

        <section className="dashboard-panel mt-8 rounded-3xl border border-white/18 bg-white/88 p-6 shadow-2xl shadow-black/25">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Farm profile
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                {primaryFarm ? primaryFarm.cropName : "Set up your farm"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {primaryFarm
                  ? "Your saved farm details will power future fertilizer, soil, weather, and market recommendations."
                  : "Add your first farm profile to personalize recommendations for your crop and location."}
              </p>
            </div>

            <Link
              href="/farm-setup"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              Farm Setup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {farmLoading ? (
            <div className="mt-6 flex min-h-28 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
              Loading farm profile...
            </div>
          ) : farmErrorMessage ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {farmErrorMessage}
            </div>
          ) : primaryFarm ? (
            <div className="mt-6 grid gap-4 md:grid-cols-5">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Crop</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{primaryFarm.cropName}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Land</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{primaryFarm.landArea} acres</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Soil</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{primaryFarm.soilType}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Irrigation</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{primaryFarm.irrigationMethod}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{primaryFarm.location}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
              No farm profile found. Create one from Farm Setup.
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="dashboard-panel rounded-3xl border border-white/18 bg-white/88 p-6 shadow-2xl shadow-black/25">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Latest scan</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Recent disease activity</h2>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>

            {historyLoading ? (
              <div className="mt-6 flex min-h-60 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-slate-500">
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" />
                  Loading latest scan...
                </span>
              </div>
            ) : historyErrorMessage ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <p className="inline-flex items-start gap-2 font-medium">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {historyErrorMessage}
                </p>
              </div>
            ) : latestScan ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Crop</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{latestScan.crop || "-"}</p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    {formatConfidence(latestScan.confidence)}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Disease</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{latestScan.disease || "-"}</p>
                  </div>
                  <div className="rounded-2xl border border-white bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confidence</p>
                    <p className="mt-2 text-sm font-semibold text-emerald-700">{formatConfidence(latestScan.confidence)}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <CalendarClock className="h-4 w-4 text-emerald-600" />
                  {formatDateTime(latestScan.createdAt)}
                </div>

                <div className="mt-3 text-xs font-medium text-slate-500">
                  Last updated: <span className="text-slate-700">{formatDateTime(latestScan.createdAt)}</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/disease-history" className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50">
                    Open history
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-700">No disease scans have been saved yet.</p>
                    <p className="mt-1 max-w-md leading-6">Start with a leaf scan to see your latest prediction, confidence, and crop guidance here.</p>
                  </div>
                  <Link
                    href="/disease-scan"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Scan Disease
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </article>

          <article className="dashboard-panel rounded-3xl border border-white/18 bg-white/88 p-6 shadow-2xl shadow-black/25">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Weather summary</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {primaryFarm ? `${primaryFarm.location || "Your farm"} field conditions` : "Farm weather unavailable"}
                </h2>
              </div>
              <CloudSun className="h-5 w-5 text-emerald-600" />
            </div>

            {weatherLoading ? (
              <div className="mt-6 flex min-h-60 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-slate-500">
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" />
                  Loading weather summary...
                </span>
              </div>
            ) : weatherErrorMessage ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <p className="inline-flex items-start gap-2 font-medium">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {weatherErrorMessage}
                </p>
              </div>
            ) : weatherData ? (
              <>
                <div className="weather-pulse mt-6 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-600 via-lime-500 to-emerald-900 p-5 text-white shadow-[0_30px_90px_-40px_rgba(5,150,105,0.55)]">
                  <p className="text-sm text-emerald-100">Current weather</p>
                  <p className="mt-2 text-2xl font-semibold">{formatWeatherValue(weatherData.weather.temperature, "°C")}</p>
                  <p className="mt-2 text-sm text-emerald-100">{weatherData.weather.condition}</p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Temperature</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatWeatherValue(weatherData.weather.temperature, "°C")}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Condition</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{weatherData.weather.condition}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Alerts</p>
                    <p className="mt-2 text-sm font-semibold text-emerald-700">{weatherData.alerts.length} active</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
                  <p className="font-semibold text-emerald-800">Advisory</p>
                  <p className="mt-2 leading-6">
                    {weatherData.alerts.length > 0 ? weatherData.message || "Weather alerts are active for this location." : "No major weather alerts right now."}
                  </p>
                </div>

                <div className="mt-3 text-xs font-medium text-slate-500">
                  Last updated: <span className="text-slate-700">{lastUpdatedAt ? formatDateTime(lastUpdatedAt) : "Just now"}</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/weather-alerts" className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50">
                    Open weather alerts
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </>
            ) : null}
          </article>
        </section>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}


