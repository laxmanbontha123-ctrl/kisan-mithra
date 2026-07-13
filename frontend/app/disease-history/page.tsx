"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, CalendarClock, Leaf, LoaderCircle } from "lucide-react";

import { Footer } from "@/src/components/layout/footer";
import { Navbar } from "@/src/components/layout/navbar";

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

function formatConfidence(value: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function formatDiseaseLabel(label: string | null | undefined): string {
  if (!label) {
    return "-";
  }

  return label.replace(/___/g, " - ").replace(/_/g, " ");
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

export default function DiseaseHistoryPage() {
  const [scans, setScans] = useState<DiseaseScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch("http://localhost:5000/api/disease/history");
        const payload = (await response.json()) as DiseaseHistoryResponse;

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Failed to fetch disease scan history.");
        }

        if (isMounted) {
          setScans(payload.scans ?? []);
        }
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : "Failed to fetch disease scan history.";
          setErrorMessage(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_42%),linear-gradient(180deg,_#f8fffb_0%,_#eef7f2_100%)] text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Plant Health AI</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Disease Scan History</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Review recent saved plant disease scans with confidence, crop details, and treatment summaries.
            </p>
          </div>
          <Link
            href="/disease-scan"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scan
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.45)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Saved Records</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Latest Scan Results</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              {isLoading ? "Loading" : `${scans.length} Records`}
            </span>
          </div>

          {isLoading ? (
            <div className="mt-6 flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-slate-500">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" />
                Loading scan history...
              </span>
            </div>
          ) : errorMessage ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <p className="inline-flex items-start gap-2 font-medium">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {errorMessage}
              </p>
            </div>
          ) : scans.length === 0 ? (
            <div className="mt-6 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
              <Leaf className="h-10 w-10 text-emerald-500" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No scan history yet</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Saved disease scans will appear here after you run a prediction.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {scans.map((scan) => (
                <article key={scan.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Predicted Disease</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">{formatDiseaseLabel(scan.prediction)}</h3>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                      {formatConfidence(scan.confidence)}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Crop</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{scan.crop || "-"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Disease</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{formatDiseaseLabel(scan.disease)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Severity</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{scan.severity || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
                    <p className="font-semibold text-emerald-800">Summary</p>
                    <p className="mt-2 leading-6">{scan.summary || "No summary available."}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <CalendarClock className="h-4 w-4 text-emerald-600" />
                    {formatDateTime(scan.createdAt)}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}