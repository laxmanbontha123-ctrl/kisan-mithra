"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { api } from "@/src/services/api";

type LoginMode = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const shouldShowDevOtp = process.env.NODE_ENV !== "production";

  const [mode, setMode] = useState<LoginMode>("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function saveSession(result: Awaited<ReturnType<typeof api.login>>) {
    window.localStorage.setItem("token", result.token);
    window.localStorage.setItem("user", JSON.stringify(result.user));
    router.push("/dashboard");
  }

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const result = await api.login({ email, password });
      saveSession(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setDevOtp("");
    setIsLoading(true);

    try {
      const result = await api.requestPhoneOtp({ phone });
      setOtpSent(true);
      setMessage(result.message);
      setDevOtp(shouldShowDevOtp ? result.devOtp || "" : "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const result = await api.verifyPhoneOtp({ phone, code: otp });
      saveSession(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-16">
      <section className="mx-auto max-w-md rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-100/60">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
            Welcome back
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Login to Kisan Mithra</h1>
          <p className="mt-2 text-sm text-slate-500">
            Access your farm dashboard, scan history, and smart advisories.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("email");
              setError("");
              setMessage("");
            }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === "email"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            Email Login
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("phone");
              setError("");
              setMessage("");
            }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === "phone"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            Mobile OTP
          </button>
        </div>

        {mode === "email" ? (
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="farmer@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Logging in..." : "Login with Email"}
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">Mobile number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="Enter registered mobile number"
              />
            </div>

            {otpSent ? (
              <div>
                <label className="text-sm font-medium text-slate-700">6-digit OTP</label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  minLength={6}
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Enter OTP"
                />
              </div>
            ) : null}

            {shouldShowDevOtp && devOtp ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Development OTP: <span className="font-bold">{devOtp}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading
                ? otpSent
                  ? "Verifying OTP..."
                  : "Sending OTP..."
                : otpSent
                  ? "Verify OTP & Login"
                  : "Send OTP"}
            </button>

            {otpSent ? (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setDevOtp("");
                  setMessage("");
                  setError("");
                }}
                className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Change mobile number
              </button>
            ) : null}
          </form>
        )}

        {message ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <p className="mt-6 text-center text-sm text-slate-600">
          New to Kisan Mithra?{" "}
          <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}
