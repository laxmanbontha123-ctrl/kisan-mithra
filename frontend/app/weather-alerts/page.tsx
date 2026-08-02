"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, CloudSun, LoaderCircle, ShieldAlert } from "lucide-react";

import { Footer } from "@/src/components/layout/footer";
import { Navbar } from "@/src/components/layout/navbar";
import { api, type WeatherAlertsResponse, type WeatherForecastResponse } from "@/src/services/api";

type LocationMode = "saved" | "current";

type Coordinates = {
  latitude: number;
  longitude: number;
};

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

function formatForecastTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getForecastRisks(hour: { rainProbability: number | null; temperature: number | null; windSpeed: number | null }) {
  return [
    ...(hour.rainProbability !== null && hour.rainProbability >= 70
      ? [{ key: "rain", label: "Rain risk", className: "border-rose-200 bg-rose-50 text-rose-700" }]
      : []),
    ...(hour.temperature !== null && hour.temperature >= 38
      ? [{ key: "heat", label: "Heat risk", className: "border-amber-200 bg-amber-50 text-amber-700" }]
      : []),
    ...(hour.windSpeed !== null && hour.windSpeed >= 30
      ? [{ key: "wind", label: "Wind risk", className: "border-sky-200 bg-sky-50 text-sky-700" }]
      : []),
  ];
}

export default function WeatherAlertsPage() {
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);
  const [weatherData, setWeatherData] = useState<WeatherAlertsResponse | null>(null);
  const [forecastData, setForecastData] = useState<WeatherForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [forecastErrorMessage, setForecastErrorMessage] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<LocationMode>("current");
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const subtitle =
    locationMode === "saved"
      ? "Live weather conditions and farming advisories for your saved farm location."
      : "Live weather conditions and farming advisories for your current location.";

  async function loadWeatherData(coordinates: Coordinates, mode: LocationMode, notice: string | null = null) {
    if (!isMountedRef.current) {
      return;
    }

    setIsLoading(true);
    setForecastLoading(true);
    setErrorMessage(null);
    setForecastErrorMessage(null);

    const alertsPromise = api.getWeatherAlerts(coordinates.latitude, coordinates.longitude);
    const forecastPromise = api.getWeatherForecast(coordinates.latitude, coordinates.longitude);

    const [alertsResult, forecastResult] = await Promise.allSettled([alertsPromise, forecastPromise]);

    if (!isMountedRef.current) {
      return;
    }

    if (alertsResult.status === "fulfilled") {
      if (!alertsResult.value.success) {
        setErrorMessage("Failed to fetch weather alerts.");
      } else {
        setWeatherData(alertsResult.value);
        setLocationMode(mode);
        setLocationNotice(notice);
      }
    } else {
      setErrorMessage(alertsResult.reason instanceof Error ? alertsResult.reason.message : "Failed to fetch weather alerts.");
    }

    if (forecastResult.status === "fulfilled") {
      if (!forecastResult.value.success) {
        setForecastErrorMessage("Failed to fetch weather forecast.");
      } else {
        setForecastData(forecastResult.value);
      }
    } else {
      setForecastErrorMessage(forecastResult.reason instanceof Error ? forecastResult.reason.message : "Failed to fetch weather forecast.");
    }

    setIsLoading(false);
    setForecastLoading(false);
  }

  async function handleUseMyLocation() {
    setLocationNotice(null);
    setErrorMessage(null);

    if (!navigator.geolocation) {
      setIsLoading(false);
      setForecastLoading(false);
      setErrorMessage(
        "Location access is unavailable in this browser. Add a farm location or enable GPS to load real weather data.",
      );
      return;
    }

    setIsLoading(true);
    setForecastLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });

      await loadWeatherData(
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        "current",
        null,
      );
    } catch (error) {
      setIsLoading(false);
      setForecastLoading(false);

      const message =
        error instanceof GeolocationPositionError &&
        error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Allow GPS access or add your farm coordinates in Farm Setup."
          : "Unable to detect your current location. Add your farm coordinates or try GPS again.";

      setErrorMessage(message);
    }
  }

  useEffect(() => {
    isMountedRef.current = true;

    async function loadRealWeatherLocation() {
      try {
        const cropsResponse = await api.getCrops();
        const savedFarm = cropsResponse.data.find(
          (crop) =>
            Number.isFinite(crop.latitude) &&
            Number.isFinite(crop.longitude),
        );

        if (savedFarm) {
          await loadWeatherData(
            {
              latitude: savedFarm.latitude,
              longitude: savedFarm.longitude,
            },
            "saved",
            null,
          );
          return;
        }
      } catch {
        // If no saved farm can be loaded, request the device's real location.
      }

      await handleUseMyLocation();
    }

    void loadRealWeatherLocation();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#020b05] text-slate-900">
      <video
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover opacity-100 brightness-105 saturate-125"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/videos/weather-alerts-background.mp4" type="video/mp4" />
      </video>

      <div className="pointer-events-none fixed inset-0 z-10 bg-[linear-gradient(135deg,rgba(2,11,5,0.22)_0%,rgba(4,47,24,0.08)_48%,rgba(2,11,5,0.28)_100%)]" />
      <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(14,165,233,0.12),transparent_32%),radial-gradient(circle_at_82%_20%,rgba(250,204,21,0.10),transparent_28%)]" />

      <div className="relative z-30">
        <Navbar />
      </div>
      <main className="relative z-20 mx-auto w-full max-w-7xl flex-1 px-6 py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Weather Intelligence</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">Weather Alerts</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/90">{subtitle}</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur-xl transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </Link>
        </div>

        <section className="space-y-6 rounded-3xl border border-white/30 bg-white/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Current Conditions</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Weather and Advisory Summary</h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  {locationMode === "saved" ? "Saved farm location" : "Your current location"}
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
            <div className="flex min-h-60 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-slate-500">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" />
                Detecting location and loading weather alerts...
              </span>
            </div>
          ) : locationNotice ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="inline-flex items-start gap-2 font-medium">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {locationNotice}
              </p>
            </div>
          ) : errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <p className="inline-flex items-start gap-2 font-medium">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {errorMessage}
              </p>
            </div>
          ) : weatherData ? (
            <>
              <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                <article className="rounded-3xl border border-emerald-100 bg-linear-to-br from-emerald-600 via-lime-500 to-emerald-900 p-6 text-white shadow-[0_30px_90px_-40px_rgba(5,150,105,0.55)]">
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

              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">24-hour outlook</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">Forecast and farming advisory</h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Next 24 hours
                  </span>
                </div>

                {forecastLoading ? (
                  <div className="mt-5 flex min-h-45 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-slate-500">
                    <span className="inline-flex items-center gap-2 text-sm font-medium">
                      <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" />
                      Loading 24-hour forecast...
                    </span>
                  </div>
                ) : forecastErrorMessage ? (
                  <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <p className="inline-flex items-start gap-2 font-medium">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      {forecastErrorMessage}
                    </p>
                  </div>
                ) : forecastData ? (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
                      <p className="font-semibold text-emerald-800">Advisory</p>
                      <p className="mt-2">{forecastData.advisory}</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {forecastData.forecast.map((hour) => (
                        <article
                          key={hour.time}
                          className={`rounded-2xl border p-4 shadow-sm transition ${
                            getForecastRisks(hour).length > 0
                              ? "border-amber-200 bg-amber-50/70 shadow-[0_20px_50px_-35px_rgba(217,119,6,0.45)]"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Time</p>
                              <h4 className="mt-2 text-sm font-semibold text-slate-900">{formatForecastTime(hour.time)}</h4>
                            </div>
                            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                              1h
                            </div>
                          </div>

                          {getForecastRisks(hour).length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {getForecastRisks(hour).map((risk) => (
                                <span
                                  key={risk.key}
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${risk.className}`}
                                >
                                  {risk.label}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl bg-slate-50 px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Temp</p>
                              <p className="mt-1 font-semibold text-slate-900">{formatValue(hour.temperature, "°C")}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Humidity</p>
                              <p className="mt-1 font-semibold text-slate-900">{formatValue(hour.humidity, "%")}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rain</p>
                              <p className="mt-1 font-semibold text-slate-900">{formatValue(hour.rainProbability, "%")}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Wind</p>
                              <p className="mt-1 font-semibold text-slate-900">{formatValue(hour.windSpeed, " km/h")}</p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            </>
          ) : null}
        </section>
      </main>
      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
