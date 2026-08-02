"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, MapPin, Navigation, Save, Sprout, Trash2 } from "lucide-react";

import { Footer } from "@/src/components/layout/footer";
import { Navbar } from "@/src/components/layout/navbar";
import { api, type Crop } from "@/src/services/api";

const initialForm = {
  cropName: "",
  cropVariety: "",
  landArea: "",
  soilType: "Red soil",
  irrigationMethod: "Drip irrigation",
  location: "",
  latitude: "",
  longitude: "",
  sowingDate: "",
  expectedHarvestDate: "",
};

export default function FarmSetupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadCrops() {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const result = await api.getCrops();
      setCrops(result.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load farm details.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const token = window.localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    void loadCrops();
  }, [router]);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setErrorMessage("Location is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField("latitude", position.coords.latitude.toFixed(6));
        updateField("longitude", position.coords.longitude.toFixed(6));
        setMessage("Current location added successfully.");
        setErrorMessage("");
      },
      () => {
        setErrorMessage("Unable to access location. Please enter latitude and longitude manually.");
      },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    const landArea = Number(form.landArea);
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (!Number.isFinite(landArea) || landArea <= 0) {
      setErrorMessage("Please enter a valid land area.");
      return;
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setErrorMessage("Please enter valid latitude and longitude.");
      return;
    }

    try {
      setIsSaving(true);

      await api.createCrop({
        cropName: form.cropName.trim(),
        cropVariety: form.cropVariety.trim(),
        landArea,
        soilType: form.soilType.trim(),
        irrigationMethod: form.irrigationMethod.trim(),
        location: form.location.trim(),
        latitude,
        longitude,
        sowingDate: form.sowingDate,
        expectedHarvestDate: form.expectedHarvestDate || null,
      });

      setMessage("Farm details saved successfully.");
      setForm(initialForm);
      await loadCrops();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save farm details.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(cropId: string) {
    try {
      setDeletingId(cropId);
      setErrorMessage("");
      await api.deleteCrop(cropId);
      setCrops((current) => current.filter((crop) => crop.id !== cropId));
      setMessage("Farm record deleted successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete farm record.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#020b05] text-slate-900">
      <video
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-30 h-full w-full object-cover opacity-90 brightness-100 saturate-125"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/videos/farm-setup-background.mp4" type="video/mp4" />
      </video>

      <div className="pointer-events-none fixed inset-0 -z-20 bg-[linear-gradient(135deg,rgba(2,11,5,0.48)_0%,rgba(4,47,24,0.28)_48%,rgba(2,11,5,0.55)_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(34,197,94,0.20),transparent_32%),radial-gradient(circle_at_85%_25%,rgba(190,242,100,0.12),transparent_28%)]" />

      <div className="relative z-30">
        <Navbar />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-6 py-12 lg:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-lime-300">
              Farmer Profile
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Farm Setup
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-emerald-50/85">
              Add your crop, soil, land, irrigation, and location details. These details will power future fertilizer, soil, weather, and market recommendations.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur-xl transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/25 bg-white/92 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Add farm details</h2>
                <p className="text-sm text-slate-500">Create your first crop profile.</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Crop name</label>
                <input
                  required
                  value={form.cropName}
                  onChange={(event) => updateField("cropName", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Rice"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Crop variety</label>
                <input
                  required
                  value={form.cropVariety}
                  onChange={(event) => updateField("cropVariety", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="BPT 5204"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Land area</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.landArea}
                  onChange={(event) => updateField("landArea", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="2.5"
                />
                <p className="mt-1 text-xs text-slate-500">Enter area in acres.</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Soil type</label>
                <select
                  value={form.soilType}
                  onChange={(event) => updateField("soilType", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  <option>Red soil</option>
                  <option>Black soil</option>
                  <option>Alluvial soil</option>
                  <option>Sandy soil</option>
                  <option>Clay soil</option>
                  <option>Loamy soil</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Irrigation method</label>
                <select
                  value={form.irrigationMethod}
                  onChange={(event) => updateField("irrigationMethod", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  <option>Drip irrigation</option>
                  <option>Sprinkler irrigation</option>
                  <option>Canal irrigation</option>
                  <option>Borewell irrigation</option>
                  <option>Rainfed</option>
                  <option>Flood irrigation</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Village / Location</label>
                <input
                  required
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Khammam, Telangana"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Latitude</label>
                <input
                  required
                  type="number"
                  step="0.000001"
                  value={form.latitude}
                  onChange={(event) => updateField("latitude", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Longitude</label>
                <input
                  required
                  type="number"
                  step="0.000001"
                  value={form.longitude}
                  onChange={(event) => updateField("longitude", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Sowing date</label>
                <input
                  required
                  type="date"
                  value={form.sowingDate}
                  onChange={(event) => updateField("sowingDate", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Expected harvest date</label>
                <input
                  type="date"
                  value={form.expectedHarvestDate}
                  onChange={(event) => updateField("expectedHarvestDate", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            {message ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                {message}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={useCurrentLocation}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                <Navigation className="h-4 w-4" />
                Use current location
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? "Saving..." : "Save farm details"}
              </button>
            </div>
          </form>

          <section className="rounded-3xl border border-white/25 bg-white/92 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Saved farms</h2>
                <p className="text-sm text-slate-500">Your crop profiles will appear here.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                {crops.length} records
              </span>
            </div>

            {isLoading ? (
              <div className="flex min-h-60 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
                Loading farms...
              </div>
            ) : crops.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                No farm records yet. Add your first crop profile to personalize recommendations.
              </div>
            ) : (
              <div className="space-y-4">
                {crops.map((crop) => (
                  <article key={crop.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{crop.cropName}</p>
                        <p className="mt-1 text-sm text-slate-600">{crop.cropVariety}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDelete(crop.id)}
                        disabled={deletingId === crop.id}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        {deletingId === crop.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white px-4 py-3 text-sm">
                        <p className="text-xs font-semibold uppercase text-slate-500">Land</p>
                        <p className="mt-1 font-semibold text-slate-900">{crop.landArea} acres</p>
                      </div>
                      <div className="rounded-xl bg-white px-4 py-3 text-sm">
                        <p className="text-xs font-semibold uppercase text-slate-500">Soil</p>
                        <p className="mt-1 font-semibold text-slate-900">{crop.soilType}</p>
                      </div>
                      <div className="rounded-xl bg-white px-4 py-3 text-sm">
                        <p className="text-xs font-semibold uppercase text-slate-500">Irrigation</p>
                        <p className="mt-1 font-semibold text-slate-900">{crop.irrigationMethod}</p>
                      </div>
                      <div className="rounded-xl bg-white px-4 py-3 text-sm">
                        <p className="text-xs font-semibold uppercase text-slate-500">Location</p>
                        <p className="mt-1 inline-flex items-center gap-1 font-semibold text-slate-900">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          {crop.location}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>

      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}

