"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { api } from "@/src/services/api";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [registeredEmail, setRegisteredEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function saveSession(result: Awaited<ReturnType<typeof api.verifyEmailOtp>>) {
    window.localStorage.setItem("token", result.token);
    window.localStorage.setItem("user", JSON.stringify(result.user));
    router.push("/dashboard");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.register({ fullName, email, phone, password });
      setRegisteredEmail(result.user.email);

      const otpResult = await api.requestEmailVerification({ email: result.user.email });
      setDevOtp(otpResult.devOtp || "");
      setShowEmailVerification(true);
      setMessage(otpResult.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const result = await api.verifyEmailOtp({
        email: registeredEmail,
        code: emailOtp,
      });

      saveSession(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email verification failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendOtp() {
    setError("");
    setMessage("");
    setDevOtp("");
    setIsLoading(true);

    try {
      const otpResult = await api.requestEmailVerification({ email: registeredEmail });
      setDevOtp(otpResult.devOtp || "");
      setMessage(otpResult.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-16">
      <section className="mx-auto max-w-md rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-100/60">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
            Farmer account
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            {showEmailVerification ? "Verify your email" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {showEmailVerification
              ? `Enter the OTP generated for ${registeredEmail}.`
              : "Register to save scans, farm data, alerts, and future recommendations."}
          </p>
        </div>

        {!showEmailVerification ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">Full name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="B Laxman"
              />
            </div>

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
              <label className="text-sm font-medium text-slate-700">Phone number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="9876543210"
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
                placeholder="Minimum 8 characters"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Confirm password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="Re-enter password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyEmail} className="space-y-5">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
              Account created. Verify your email to continue to dashboard.
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">6-digit email OTP</label>
              <input
                type="text"
                required
                inputMode="numeric"
                minLength={6}
                maxLength={6}
                value={emailOtp}
                onChange={(event) => setEmailOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="Enter OTP"
              />
            </div>

            {devOtp ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Development OTP: <span className="font-bold">{devOtp}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Verifying email..." : "Verify Email & Continue"}
            </button>

            <button
              type="button"
              onClick={() => void handleResendOtp()}
              disabled={isLoading}
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Resend OTP
            </button>
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
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
