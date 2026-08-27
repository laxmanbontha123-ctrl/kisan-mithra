"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  Languages,
  LoaderCircle,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { signOut } from "firebase/auth";

import { Footer } from "@/src/components/layout/footer";
import { Navbar } from "@/src/components/layout/navbar";
import { api, type AuthUser } from "@/src/services/api";
import { firebaseAuth } from "@/src/services/firebase";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [language, setLanguage] = useState<"en" | "te">("en");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    let isMounted = true;

    const loadTimer = window.setTimeout(() => {
      void (async () => {
        try {
          const result = await api.getProfile();

          if (!isMounted) {
            return;
          }

          setProfile(result.user);
          setFullName(result.user.fullName);
          setLanguage(result.user.language === "te" ? "te" : "en");
          window.localStorage.setItem(
            "user",
            JSON.stringify(result.user),
          );
        } catch (error) {
          if (!isMounted) {
            return;
          }

          window.localStorage.removeItem("token");
          window.localStorage.removeItem("user");
          setErrorMessage(
            error instanceof Error ?
              error.message :
              "Unable to load your farmer profile.",
          );
          router.replace("/login");
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      })();
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(loadTimer);
    };
  }, [router]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = fullName.trim().replace(/\s+/g, " ");

    if (normalizedName.length < 2 || normalizedName.length > 80) {
      setErrorMessage(
        "Farmer full name must contain 2 to 80 characters.",
      );
      return;
    }

    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const result = await api.updateProfile({
        fullName: normalizedName,
        language,
      });

      setProfile(result.user);
      setFullName(result.user.fullName);
      window.localStorage.setItem(
        "user",
        JSON.stringify(result.user),
      );
      setMessage("Profile settings saved successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ?
          error.message :
          "Unable to save profile settings.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteAccount() {
    if (deleteConfirmation !== "DELETE") {
      setErrorMessage(
        "Type DELETE exactly to confirm permanent account deletion.",
      );
      return;
    }

    const confirmed = window.confirm(
      "Permanently delete your account, farm records, and disease history?",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setMessage("");
    setErrorMessage("");

    try {
      await api.deleteAccount();
      await signOut(firebaseAuth).catch(() => undefined);
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("user");
      router.replace("/home");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ?
          error.message :
          "Account deletion could not be completed.",
      );
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-200">
                Farmer profile
              </p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Profile & Settings
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80">
                Manage farmer-entered details, language preference,
                and account privacy controls.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950 shadow-xl shadow-lime-300/20">
              <UserRound className="h-8 w-8" />
            </div>
          </div>
        </div>

        {message ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mb-6 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center rounded-3xl border border-white/15 bg-white/95 text-slate-600">
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className="h-5 w-5 animate-spin text-emerald-600" />
              Loading farmer profile...
            </span>
          </div>
        ) : profile ? (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <form
              onSubmit={saveProfile}
              className="rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl shadow-black/20 sm:p-8"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Personal details
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Name and language are farmer-entered information.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="fullName"
                  className="text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  maxLength={80}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
                <p className="mt-2 text-xs font-semibold text-emerald-700">
                  Data category: Farmer Entered
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                    {profile.email || "Not connected"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {profile.emailVerified ?
                      "Verified by authentication provider" :
                      "Not verified"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Phone
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {profile.phone || "Not connected"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {profile.phoneVerified ?
                      "Verified by authentication provider" :
                      "Not verified"}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="flex items-start gap-3">
                  <Languages className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Preferred language
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Saves your preference for future advisories.
                      Full Telugu translation is being added progressively.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { value: "en", label: "English" },
                    { value: "te", label: "Telugu" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <input
                        type="radio"
                        name="language"
                        value={option.value}
                        checked={language === option.value}
                        onChange={() => {
                          setLanguage(option.value as "en" | "te");
                        }}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      <span className="font-semibold text-slate-800">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? "Saving..." : "Save profile"}
              </button>
            </form>

            <div className="space-y-6">
              <section className="rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl shadow-black/20">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Data & privacy
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Your profile, farm records, and saved disease
                      history are linked to your authenticated account.
                    </p>
                  </div>
                </div>

                <Link
                  href="/farm-setup"
                  className="mt-5 inline-flex text-sm font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Review saved farm records
                </Link>
              </section>

              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-2xl shadow-black/15">
                <div className="flex items-start gap-3">
                  <Trash2 className="mt-0.5 h-5 w-5 text-rose-600" />
                  <div>
                    <h2 className="font-bold text-rose-950">
                      Delete account
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-rose-800">
                      Permanently deletes your profile, farm records,
                      saved disease history, and login account.
                      This action cannot be reversed.
                    </p>
                  </div>
                </div>

                <label
                  htmlFor="deleteConfirmation"
                  className="mt-5 block text-sm font-semibold text-rose-900"
                >
                  Type DELETE to confirm
                </label>
                <input
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(event) => {
                    setDeleteConfirmation(event.target.value);
                  }}
                  autoComplete="off"
                  className="mt-2 w-full rounded-2xl border border-rose-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                />

                <button
                  type="button"
                  onClick={() => void deleteAccount()}
                  disabled={
                    deleteConfirmation !== "DELETE" || isDeleting
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {isDeleting ? "Deleting..." : "Delete permanently"}
                </button>
              </section>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
