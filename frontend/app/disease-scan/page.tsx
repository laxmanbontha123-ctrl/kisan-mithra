"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, LoaderCircle, ScanSearch, ShieldCheck, Info } from "lucide-react";

import { Footer } from "@/src/components/layout/footer";
import { Navbar } from "@/src/components/layout/navbar";
import { Button } from "@/src/components/ui/button";
import { api, type AgriProductRecommendation } from "@/src/services/api";
import type { DiseaseAiResponse } from "@/src/types";

function formatConfidence(value: number | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function formatDiseaseLabel(label: string | undefined): string {
  if (!label) {
    return "-";
  }

  return label.replace(/___/g, " - ").replace(/_/g, " ");
}

export default function DiseaseScanPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseAiResponse | null>(null);
  const [agriProducts, setAgriProducts] = useState<AgriProductRecommendation[]>([]);
  const [agriDisclaimer, setAgriDisclaimer] = useState("");
  const [agriLoading, setAgriLoading] = useState(false);
  const [agriErrorMessage, setAgriErrorMessage] = useState<string | null>(null);
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
    setAgriProducts([]);
    setAgriDisclaimer("");
    setAgriErrorMessage(null);
    setAgriLoading(false);

    try {
      const response = await api.detectDisease(selectedFile);
      if (!response.success || !response.aiResponse) {
        throw new Error(response.message || "Disease scan failed.");
      }
      setResult(response.aiResponse);

      const crop = response.aiResponse.recommendation?.crop;
      const problem = response.aiResponse.recommendation?.disease;

      if (crop && problem && problem.toLowerCase() !== "healthy") {
        setAgriLoading(true);

        try {
          const productResponse = await api.getAgriProductRecommendations(crop, problem);
          setAgriProducts(productResponse.data);
          setAgriDisclaimer(productResponse.disclaimer || productResponse.message);
        } catch (productError) {
          setAgriErrorMessage(
            productError instanceof Error
              ? productError.message
              : "Unable to load local product suggestions.",
          );
        } finally {
          setAgriLoading(false);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to scan image.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_42%),linear-gradient(180deg,#f8fffb_0%,#eef7f2_100%)] text-slate-900">
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
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
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

            {result ? (
              <Link
                href="/disease-history"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
              >
                View Scan History
              </Link>
            ) : null}

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
                    <p className="mt-2 text-base font-semibold text-slate-900">{formatDiseaseLabel(result.prediction)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confidence</p>
                    <p className="mt-2 text-base font-semibold text-emerald-700">{formatConfidence(result.confidence)}</p>
                  </div>
                </div>

                {showLowConfidenceWarning ? (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
                    <p className="inline-flex items-start gap-2 font-medium">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
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

                    {result.recommendation.treatmentCategory ||
                    result.recommendation.suggestedProducts?.length ||
                    result.recommendation.dosageGuide?.length ||
                    result.recommendation.applicationTiming?.length ||
                    result.recommendation.safetyPrecautions?.length ||
                    result.recommendation.organicOptions?.length ? (
                      <div className="rounded-2xl border border-lime-200 bg-lime-50/70 p-4">
                        <h3 className="text-sm font-semibold text-lime-950">Treatment & Dosage Guide</h3>

                        {result.recommendation.treatmentCategory ? (
                          <p className="mt-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-lime-900">
                            {result.recommendation.treatmentCategory}
                          </p>
                        ) : null}

                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          {result.recommendation.suggestedProducts?.length ? (
                            <div className="rounded-2xl bg-white p-4">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Suggested product category</p>
                              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                                {result.recommendation.suggestedProducts.map((item) => (
                                  <li key={item} className="flex items-start gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-lime-500" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {result.recommendation.dosageGuide?.length ? (
                            <div className="rounded-2xl bg-white p-4">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Dosage guide</p>
                              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                                {result.recommendation.dosageGuide.map((item) => (
                                  <li key={item} className="flex items-start gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {result.recommendation.applicationTiming?.length ? (
                            <div className="rounded-2xl bg-white p-4">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Application timing</p>
                              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                                {result.recommendation.applicationTiming.map((item) => (
                                  <li key={item} className="flex items-start gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-500" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {result.recommendation.organicOptions?.length ? (
                            <div className="rounded-2xl bg-white p-4">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Organic / non-chemical options</p>
                              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                                {result.recommendation.organicOptions.map((item) => (
                                  <li key={item} className="flex items-start gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>

                        {result.recommendation.safetyPrecautions?.length ? (
                          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Safety precautions</p>
                            <ul className="mt-3 space-y-2 text-sm text-amber-950">
                              {result.recommendation.safetyPrecautions.map((item) => (
                                <li key={item} className="flex items-start gap-2">
                                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-orange-950">
                            Local Product & Shop Suggestions
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-orange-900">
                            Demo local product data is shown for testing. Verify brand, price, dosage, and availability locally before use.
                          </p>
                        </div>
                        <Link
                          href="/farm-setup"
                          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-700"
                        >
                          Use farm location
                        </Link>
                      </div>

                      {agriLoading ? (
                        <div className="mt-4 flex items-center rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-orange-600" />
                          Loading local product suggestions...
                        </div>
                      ) : agriErrorMessage ? (
                        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {agriErrorMessage}
                        </div>
                      ) : agriProducts.length > 0 ? (
                        <div className="mt-4 space-y-4">
                          {agriProducts.map((product) => (
                            <article key={product.id} className="rounded-2xl border border-orange-100 bg-white p-4">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                                    {product.category}
                                  </p>
                                  <h4 className="mt-1 text-base font-bold text-slate-900">
                                    {product.brandName} - {product.productName}
                                  </h4>
                                  <p className="mt-1 text-sm text-slate-600">
                                    Target: {product.crop} / {product.targetProblem}
                                  </p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                  {product.isVerified ? "Verified" : "Demo / Unverified"}
                                </span>
                              </div>

                              <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Active ingredient
                                  </p>
                                  <p className="mt-1 font-medium text-slate-800">
                                    {product.activeIngredient || "Verify locally"}
                                  </p>
                                </div>
                                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Formulation
                                  </p>
                                  <p className="mt-1 font-medium text-slate-800">
                                    {product.formulation || "Verify locally"}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                                <p className="font-semibold">Dosage note</p>
                                <p className="mt-1 leading-6">{product.dosageNote}</p>
                              </div>

                              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                                <p className="font-semibold">Safety note</p>
                                <p className="mt-1 leading-6">{product.safetyNote}</p>
                              </div>

                              {product.shops.length > 0 ? (
                                <div className="mt-4 space-y-3">
                                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Available / nearby shops
                                  </p>

                                  {product.shops.slice(0, 3).map((shopItem) => (
                                    <div
                                      key={shopItem.shopProductId}
                                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                    >
                                      <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                          <p className="font-semibold text-slate-900">{shopItem.shop.name}</p>
                                          <p className="mt-1 text-sm text-slate-600">{shopItem.shop.address}</p>
                                          <p className="mt-1 text-xs text-slate-500">
                                            Price:{" "}
                                            {shopItem.approximatePrice
                                              ? `₹${shopItem.approximatePrice} ${shopItem.priceUnit || ""}`
                                              : shopItem.priceUnit || "Verify at shop"}
                                          </p>
                                        </div>

                                        <a
                                          href={shopItem.shop.mapsUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                        >
                                          Open Maps
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </article>
                          ))}

                          {agriDisclaimer ? (
                            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                              {agriDisclaimer}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-dashed border-orange-200 bg-white px-4 py-3 text-sm text-slate-600">
                          No verified local products found yet for this crop and problem.
                        </div>
                      )}
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
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    These are AI probability matches across supported crops. Use the main prediction and confidence warning for guidance.
                  </p>
                  {result.allPredictions && result.allPredictions.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {result.allPredictions.slice(0, 5).map((prediction) => (
                        <li
                          key={`${prediction.label}-${prediction.confidence}`}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-slate-700">{formatDiseaseLabel(prediction.label)}</span>
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

