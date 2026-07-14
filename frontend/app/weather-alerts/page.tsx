"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, CloudSun, LoaderCircle, ShieldAlert } from "lucide-react";

import { Footer } from "@/src/components/layout/footer";
import { Navbar } from "@/src/components/layout/navbar";
import { api, type WeatherAlertsResponse } from "@/src/services/api";

const DEFAULT_LATITUDE = 17.3850;
const DEFAULT_LONGITUDE = 78.4867;

type LocationMode = "default" | "current";

function formatValue(value: number | null, suffix = ""): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return `${value}${suffix}`;
}

function severityClasses(severity: "high" | "medium"): string {
  if (severity === "high") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function WeatherAlertsPage() {
  const [weatherData, setWeatherData] = useState<WeatherAlertsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<LocationMode>("default");
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const subtitle =
    locationMode === "current"
      ? "Live weather conditions and farming advisories for your current location."
      : "Live weather conditions and farming advisories for Hyderabad using the default field coordinates.";

  async function fetchWeatherAlerts(latitude: number, longitude: number, mode: LocationMode, notice: string | null = null) {
    const response = await api.getWeatherAlerts(latitude, longitude);

    if (!response.success) {
      throw new Error("Failed to fetch weather alerts.");
    }

    if (isMountedRef.current) {
      setWeatherData(response);
      setLocationMode(mode);
      setLocationNotice(notice);
    }
  }

  async function loadDefaultWeather(notice: string | null = null) {
    try {
      await fetchWeatherAlerts(DEFAULT_LATITUDE, DEFAULT_LONGITUDE, "default", notice);
      if (isMountedRef.current) {
        setErrorMessage(null);
      }
    } catch (error) {
      if (isMountedRef.current) {
        const message = error instanceof Error ? error.message : "Failed to fetch weather alerts.";
        setErrorMessage(message);
      }
    }
  }

  async function handleUseMyLocation() {
    if (!navigator.geolocation) {
      const notice = "Location access is unavailable in this browser. Showing Hyderabad default weather instead.";
      setIsLoading(true);
      setErrorMessage(notice);
      await loadDefaultWeather(notice);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });

      await fetchWeatherAlerts(position.coords.latitude, position.coords.longitude, "current");
      if (isMountedRef.current) {
        setErrorMessage(null);
      }
    } catch (error) {
      const fallbackNotice =
        error instanceof GeolocationPositionError && error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Showing Hyderabad default weather instead."
          : "Unable to detect your location right now. Showing Hyderabad default weather instead.";

      if (isMountedRef.current) {
        setErrorMessage(fallbackNotice);
      }

      await loadDefaultWeather(fallbackNotice);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true;

    async function loadWeatherAlerts() {
      setIsLoading(true);
      setErrorMessage(null);
      await loadDefaultWeather();
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }

    void loadWeatherAlerts();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_42%),linear-gradient(180deg,_#f8fffb_0%,_#eef7f2_100%)] text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Weather Intelligence</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Weather Alerts</h1>
            <p className="mt-3 max-w-2xl text-slate-600">{subtitle}</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </Link>
        </div>

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.45)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Current Conditions</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Weather and Advisory Summary</h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  {locationMode === "current" ? "Your current location" : "Hyderabad default"}
                </span>
                <button
                  type="button"
                  onClick={() => void handleUseMyLocation()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CloudSun className="h-4 w-4" />
                  Use My Location
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-slate-500">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" />
                Detecting location and loading weather alerts...
              </span>
            </div>
          ) : locationNotice ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="inline-flex items-start gap-2 font-medium">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {locationNotice}
              </p>
            </div>
          ) : errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <p className="inline-flex items-start gap-2 font-medium">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {errorMessage}
              </p>
            </div>
          ) : weatherData ? (
            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <article className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-600 via-lime-500 to-emerald-900 p-6 text-white shadow-[0_30px_90px_-40px_rgba(5,150,105,0.55)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-emerald-100">Weather snapshot</p>
                    <h3 className="mt-2 text-2xl font-semibold">Current weather card</h3>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-3">
                    <CloudSun className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                    <p className="text-sm text-emerald-100">Temperature</p>
                    <p className="mt-1 text-xl font-semibold">{formatValue(weatherData.weather.temperature, "°C")}</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                    <p className="text-sm text-emerald-100">Humidity</p>
                    <p className="mt-1 text-xl font-semibold">{formatValue(weatherData.weather.humidity, "%")}</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                    <p className="text-sm text-emerald-100">Wind speed</p>
                    <p className="mt-1 text-xl font-semibold">{formatValue(weatherData.weather.windSpeed, " km/h")}</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                    <p className="text-sm text-emerald-100">Rain probability</p>
                    <p className="mt-1 text-xl font-semibold">{formatValue(weatherData.weather.rainProbability, "%")}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-sm text-emerald-100">Condition</p>
                  <p className="mt-1 text-xl font-semibold">{weatherData.weather.condition}</p>
                </div>
              </article>

              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Alerts</h3>
                  </div>

                  {weatherData.alerts.length > 0 ? (
                    <div className="mt-4 grid gap-4">
                      {weatherData.alerts.map((alert) => (
                        <article key={`${alert.type}-${alert.title}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${severityClasses(alert.severity)}`}>
                                {alert.severity}
                              </span>
                              <h4 className="mt-3 text-base font-semibold text-slate-900">{alert.title}</h4>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                              {alert.type}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600">{alert.message}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-600">
                      {weatherData.message || "No major weather alerts right now."}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 text-sm text-emerald-900">
                  <p className="font-semibold text-emerald-800">Advisory use</p>
                  <p className="mt-2 leading-6">
                    Use these alerts to decide when to spray, irrigate, or protect crops from stress conditions.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}