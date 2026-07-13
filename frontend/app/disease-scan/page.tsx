"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, LoaderCircle, ScanSearch, ShieldCheck, Info } from "lucide-react";

import { Footer } from "@/src/components/layout/footer";
import { Navbar } from "@/src/components/layout/navbar";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/services/api";
import type { DiseaseAiResponse } from "@/src/types";

function formatConfidence(value: number | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return `${(value * 100).toFixed(2)}%`;
}

export default function DiseaseScanPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseAiResponse | null>(null);
  const showLowConfidenceWarning =
    typeof result?.confidence === "number" && !Number.isNaN(result.confidence) && result.confidence < 0.6;

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return null;
    }
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please upload a leaf image before scanning.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const response = await api.detectDisease(selectedFile);
      if (!response.success || !response.aiResponse) {
        throw new Error(response.message || "Disease scan failed.");
      }
      setResult(response.aiResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to scan image.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_42%),linear-gradient(180deg,_#f8fffb_0%,_#eef7f2_100%)] text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Plant Health AI</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Disease Scan</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Upload a clear leaf image to get AI-powered disease detection and practical treatment guidance.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-3xl border border-emerald-100 bg-white/85 p-6 shadow-[0_20px_70px_-40px_rgba(16,185,129,0.6)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="leaf-image" className="mb-2 block text-sm font-semibold text-slate-700">
                  Leaf Image
                </label>
                <input
                  id="leaf-image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setSelectedFile(file);
                    setErrorMessage(null);
                  }}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:font-semibold file:text-emerald-700 hover:file:bg-emerald-200"
                />
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <p className="inline-flex items-start gap-2 font-medium">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    Current AI model supports Pepper, Potato, Tomato, and Rice/Paddy leaves.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Selected leaf preview"
                    width={1000}
                    height={700}
                    className="h-72 w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-72 flex-col items-center justify-center gap-3 text-slate-500">
                    <ScanSearch className="h-10 w-10 text-emerald-500" />
                    <p className="text-sm">Image preview will appear here</p>
                  </div>
                )}
              </div>

              <Button className="w-full" type="submit">
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Scanning...
                  </span>
                ) : (
                  "Scan Leaf"
                )}
              </Button>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <p className="inline-flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    {errorMessage}
                  </p>
                </div>
              ) : null}
            </form>
          </section>

          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Scan Result</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Prediction & Guidance</h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                {result?.modelReady ? "Model Ready" : "Awaiting Scan"}
              </span>
            </div>

            {!result ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                Submit an image to view prediction confidence, treatment summary, immediate actions, and prevention tips.
              </div>
            ) : (
              <>
                {!result.modelReady ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                    {result.message || "Model is not ready for prediction."}
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Predicted Disease</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{result.prediction || "-"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confidence</p>
                    <p className="mt-2 text-base font-semibold text-emerald-700">{formatConfidence(result.confidence)}</p>
                  </div>
                </div>

                {showLowConfidenceWarning ? (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
                    <p className="inline-flex items-start gap-2 font-medium">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                      Prediction confidence is low. Please retake the image in good lighting or consult a local agriculture officer before taking action.
                    </p>
                  </div>
                ) : null}

                {result.recommendation ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                      <p className="text-sm font-semibold text-emerald-800">Recommendation Summary</p>
                      <p className="mt-2 text-sm leading-6 text-emerald-900">{result.recommendation.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white px-3 py-1 font-semibold text-emerald-700">Crop: {result.recommendation.crop}</span>
                        <span className="rounded-full bg-white px-3 py-1 font-semibold text-emerald-700">Disease: {result.recommendation.disease}</span>
                        <span className="rounded-full bg-white px-3 py-1 font-semibold text-emerald-700">Severity: {result.recommendation.severity}</span>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <h3 className="text-sm font-semibold text-slate-900">Immediate Actions</h3>
                        <ul className="mt-3 space-y-2 text-sm text-slate-600">
                          {result.recommendation.immediateActions.map((action) => (
                            <li key={action} className="flex items-start gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <h3 className="text-sm font-semibold text-slate-900">Prevention Tips</h3>
                        <ul className="mt-3 space-y-2 text-sm text-slate-600">
                          {result.recommendation.preventionTips.map((tip) => (
                            <li key={tip} className="flex items-start gap-2">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                      <p className="inline-flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 h-4 w-4" />
                        {result.recommendation.advisoryNote}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Top Predictions</h3>
                  {result.allPredictions && result.allPredictions.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {result.allPredictions.slice(0, 5).map((prediction) => (
                        <li
                          key={`${prediction.label}-${prediction.confidence}`}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-slate-700">{prediction.label}</span>
                          <span className="font-semibold text-emerald-700">{formatConfidence(prediction.confidence)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No alternate predictions available.</p>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
