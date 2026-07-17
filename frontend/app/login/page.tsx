"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import {
  RecaptchaVerifier,
  type ConfirmationResult,
  signInWithPhoneNumber,
} from "firebase/auth";

import { api } from "@/src/services/api";
import { firebaseAuth } from "@/src/services/firebase";

type LoginMode = "email" | "phone";

function formatPhoneForFirebase(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.startsWith("91") && digits.length === 12) {
    return `+${digits}`;
  }

  return phone.startsWith("+") ? phone : `+${digits}`;
}

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>("phone");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

  function resetFlow(nextMode: LoginMode) {
    setMode(nextMode);
    setIdentifier("");
    setOtp("");
    setOtpSent(false);
    setMessage("");
    setError("");
    confirmationResultRef.current = null;
  }

  function saveSession(result: Awaited<ReturnType<typeof api.verifyEmailOtp>>) {
    window.localStorage.setItem("token", result.token);
    window.localStorage.setItem("user", JSON.stringify(result.user));
    router.push("/dashboard");
  }

  function getRecaptchaVerifier() {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        firebaseAuth,
        "firebase-recaptcha-container",
        {
          size: "invisible",
        },
      );
    }

    return recaptchaVerifierRef.current;
  }

  async function handleRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setOtp("");
    setIsLoading(true);

    try {
      if (mode === "email") {
        const result = await api.requestEmailOtp({ email: identifier });
        setOtpSent(true);
        setMessage(result.message);
      } else {
        const formattedPhone = formatPhoneForFirebase(identifier);
        const verifier = getRecaptchaVerifier();
        const confirmationResult = await signInWithPhoneNumber(
          firebaseAuth,
          formattedPhone,
          verifier,
        );

        confirmationResultRef.current = confirmationResult;
        setOtpSent(true);
        setMessage("OTP sent successfully to your mobile number.");
      }
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
      if (mode === "email") {
        const result = await api.verifyEmailOtp({ email: identifier, code: otp });
        saveSession(result);
      } else {
        if (!confirmationResultRef.current) {
          throw new Error("Please request phone OTP again.");
        }

        const firebaseResult = await confirmationResultRef.current.confirm(otp);
        const idToken = await firebaseResult.user.getIdToken();
        const result = await api.loginWithFirebasePhone({ idToken });
        saveSession(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-16">
      <section className="mx-auto max-w-md rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-100/60">
        <div id="firebase-recaptcha-container" />

        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
            Kisan Mithra Login
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Login with OTP</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your mobile number or email. New farmers will be registered automatically after OTP verification.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => resetFlow("phone")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === "phone"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            Mobile OTP
          </button>

          <button
            type="button"
            onClick={() => resetFlow("email")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === "email"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            Email OTP
          </button>
        </div>

        <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">
              {mode === "email" ? "Email address" : "Mobile number"}
            </label>
            <input
              type={mode === "email" ? "email" : "tel"}
              required
              value={identifier}
              disabled={otpSent}
              onChange={(event) => setIdentifier(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500"
              placeholder={mode === "email" ? "farmer@example.com" : "9876543210"}
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
                ? "Verify OTP & Continue"
                : mode === "email"
                  ? "Send Email OTP"
                  : "Send Mobile OTP"}
          </button>

          {otpSent ? (
            <button
              type="button"
              onClick={() => resetFlow(mode)}
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Change {mode === "email" ? "email" : "mobile number"}
            </button>
          ) : null}
        </form>

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

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          No password needed. OTP verification will create or open your farmer account.
        </p>
      </section>
    </main>
  );
}
