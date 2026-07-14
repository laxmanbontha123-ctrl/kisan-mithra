"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, CalendarClock, CloudSun, History, LoaderCircle, ScanSearch, ShieldCheck, Wind } from "lucide-react";

import { Footer } from "@/src/components/layout/footer";
import { Navbar } from "@/src/components/layout/navbar";
import { api, type WeatherAlertsResponse } from "@/src/services/api";

type DiseaseScanHistoryItem = {
  id: string;
  prediction: string;
  confidence: number;
  crop: string | null;
  disease: string | null;
  severity: string | null;
  summary: string | null;
  imageUrl: string | null;
  createdAt: string;
};

type DiseaseHistoryResponse = {
  success: boolean;
  scans?: DiseaseScanHistoryItem[];
  message?: string;
};

const DEFAULT_LATITUDE = 17.3850;
const DEFAULT_LONGITUDE = 78.4867;

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
  const [scans, setScans] = useState<DiseaseScanHistoryItem[]>([]);
  const [latestScan, setLatestScan] = useState<DiseaseScanHistoryItem | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyErrorMessage, setHistoryErrorMessage] = useState<string | null>(null);

  const [weatherData, setWeatherData] = useState<WeatherAlertsResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherErrorMessage, setWeatherErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setHistoryLoading(true);
      setWeatherLoading(true);
      setHistoryErrorMessage(null);
      setWeatherErrorMessage(null);

      const historyPromise = fetch("http://localhost:5000/api/disease/history").then(async (response) => {
        const payload = (await response.json()) as DiseaseHistoryResponse;

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Failed to fetch disease scan history.");
        }

        return payload;
      });

      const weatherPromise = api.getWeatherAlerts(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);

      const [historyResult, weatherResult] = await Promise.allSettled([historyPromise, weatherPromise]);

      if (!isMounted) {
        return;
      }

      if (historyResult.status === "fulfilled") {
        const historyScans = historyResult.value.scans ?? [];
        setScans(historyScans);
        setLatestScan(historyScans[0] ?? null);
      } else {
        setHistoryErrorMessage(
          historyResult.reason instanceof Error ? historyResult.reason.message : "Failed to fetch disease scan history.",
        );
      }

      if (weatherResult.status === "fulfilled") {
        if (!weatherResult.value.success) {
          setWeatherErrorMessage("Failed to fetch weather alerts.");
        } else {
          setWeatherData(weatherResult.value);
        }
      } else {
        setWeatherErrorMessage(
          weatherResult.reason instanceof Error ? weatherResult.reason.message : "Failed to fetch weather alerts.",
        );
      }

      setHistoryLoading(false);
      setWeatherLoading(false);
    }

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_42%),linear-gradient(180deg,#f8fffb_0%,#eef7f2_100%)] text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 lg:px-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Farm Operations</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Dashboard</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              A quick view of the live modules already working in Kisan Mithra, with recent disease scans and current weather advisories.
            </p>
          </div>
          <Link
            href="/weather-alerts"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Weather Alerts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "AI Disease Scan",
              description: "Upload leaf images and get AI disease prediction with guidance.",
              icon: ScanSearch,
              href: "/disease-scan",
            },
            {
              title: "Disease History",
              description: "View and manage saved disease scans.",
              icon: History,
              href: "/disease-history",
            },
            {
              title: "Weather Alerts",
              description: "Get real-time farming weather alerts using your location.",
              icon: CloudSun,
              href: "/weather-alerts",
            },
            {
              title: "24-hour Forecast",
              description: "See hourly forecast, rain risk, wind risk, and advisory.",
              icon: Wind,
              href: "/weather-alerts",
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.title} className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-slate-900">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                <Link href={card.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800">
                  Open
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </section>

        <section className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/disease-scan"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            Scan Disease
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/disease-history"
            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            View History
          </Link>
          <Link
            href="/weather-alerts"
            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Weather Alerts
          </Link>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.45)]">
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

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/disease-history" className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50">
                    Open history
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                No disease scans have been saved yet.
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Weather summary</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Hyderabad field conditions</h2>
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
                <div className="mt-6 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-600 via-lime-500 to-emerald-900 p-5 text-white shadow-[0_30px_90px_-40px_rgba(5,150,105,0.55)]">
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
      <Footer />
    </div>
  );
}