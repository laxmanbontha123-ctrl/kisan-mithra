"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import {
  RecaptchaVerifier,
  type ConfirmationResult,
  signInWithPhoneNumber,
  signInWithCustomToken,
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

  const [fullName, setFullName] = useState("");
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
        const result = await api.verifyEmailOtp({
          fullName: fullName.trim().replace(/\s+/g, " "),
          email: identifier,
          code: otp,
        });
        const firebaseResult = await signInWithCustomToken(
          firebaseAuth,
          result.token,
        );
        const idToken = await firebaseResult.user.getIdToken();

        saveSession({
          ...result,
          token: idToken,
        });
      } else {
        if (!confirmationResultRef.current) {
          throw new Error("Please request phone OTP again.");
        }

        const firebaseResult = await confirmationResultRef.current.confirm(otp);
        const idToken = await firebaseResult.user.getIdToken();
        const result = await api.loginWithFirebasePhone({
          idToken,
          fullName: fullName.trim().replace(/\s+/g, " "),
        });
        saveSession(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020b05] px-4 py-6 text-white sm:px-8">
      <style>{`
        @keyframes auroraMove {
          0%, 100% { transform: translate3d(-4%, -2%, 0) scale(1); filter: hue-rotate(0deg); }
          50% { transform: translate3d(5%, 4%, 0) scale(1.12); filter: hue-rotate(25deg); }
        }

        @keyframes fieldSlide {
          0% { transform: translateY(-24px) scaleX(0.82); opacity: 0; }
          30% { opacity: 0.95; }
          100% { transform: translateY(42px) scaleX(1.22); opacity: 0; }
        }

        @keyframes particleRise {
          0% { transform: translateY(40px) translateX(0) scale(0.7); opacity: 0; }
          20% { opacity: 0.75; }
          100% { transform: translateY(-120vh) translateX(46px) scale(1.15); opacity: 0; }
        }

        @keyframes scanSweep {
          0% { transform: translateX(-130%) rotate(12deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(130%) rotate(12deg); opacity: 0; }
        }

        @keyframes cardFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(1.5deg); }
        }

        @keyframes phoneGlow {
          0%, 100% { box-shadow: 0 0 32px rgba(34, 197, 94, 0.28), inset 0 0 0 rgba(255,255,255,0); }
          50% { box-shadow: 0 0 70px rgba(132, 204, 22, 0.42), inset 0 0 28px rgba(16,185,129,0.08); }
        }

        @keyframes titleIn {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes buttonShine {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }

        @keyframes orbitRing {
          0% { transform: rotate(0deg) scale(1); opacity: 0.45; }
          50% { transform: rotate(180deg) scale(1.08); opacity: 0.9; }
          100% { transform: rotate(360deg) scale(1); opacity: 0.45; }
        }

        @keyframes dataFlow {
          0% { transform: translateX(-100%) skewX(-18deg); opacity: 0; }
          30% { opacity: 0.9; }
          100% { transform: translateX(100%) skewX(-18deg); opacity: 0; }
        }

        @keyframes spotlightPan {
          0%, 100% { transform: translateX(-35%) rotate(10deg); opacity: 0.18; }
          50% { transform: translateX(35%) rotate(10deg); opacity: 0.42; }
        }

        .video-bg {
          background:
            radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.38), transparent 30%),
            radial-gradient(circle at 78% 30%, rgba(163, 230, 53, 0.28), transparent 28%),
            radial-gradient(circle at 50% 95%, rgba(20, 83, 45, 0.72), transparent 34%),
            linear-gradient(135deg, #021107 0%, #06351d 42%, #0a1f11 100%);
        }

        .crop-field {
          transform: perspective(900px) rotateX(62deg);
          transform-origin: bottom center;
        }

        .login-card {
          animation: titleIn 700ms ease both, phoneGlow 4.8s ease-in-out infinite;
        }

        .shine-button {
          position: relative;
          overflow: hidden;
        }

        .shine-button::after {
          content: "";
          position: absolute;
          inset: 0;
          width: 45%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent);
          animation: buttonShine 2.8s ease-in-out infinite;
        }

        .glass-panel {
          animation: cardFloat 5.5s ease-in-out infinite;
        }
      `}</style>

      <video
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-75 brightness-110 saturate-150"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/farm-login.webm" type="video/webm" />
        <source src="/videos/farm-login.mp4" type="video/mp4" />
      </video>

      <div className="video-bg pointer-events-none absolute inset-0 opacity-55 mix-blend-overlay" />

      <div className="pointer-events-none absolute inset-0 opacity-80" style={{ animation: "auroraMove 10s ease-in-out infinite" }}>
        <div className="absolute left-[-15%] top-[-18%] h-[34rem] w-[34rem] rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-14%] h-[38rem] w-[38rem] rounded-full bg-lime-300/20 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-50" />

      <div className="crop-field pointer-events-none absolute bottom-[-18%] left-[-8%] h-[55vh] w-[116%] overflow-hidden">
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            key={index}
            className="absolute left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-emerald-300/55 to-transparent"
            style={{
              top: `${index * 4.2}%`,
              animation: `fieldSlide ${3.2 + index * 0.05}s linear infinite`,
              animationDelay: `${index * 0.12}s`,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 34 }).map((_, index) => (
          <span
            key={index}
            className="absolute h-1.5 w-1.5 rounded-full bg-lime-200/60 blur-[0.5px]"
            style={{
              left: `${(index * 17) % 100}%`,
              top: `${80 + ((index * 13) % 25)}%`,
              animation: `particleRise ${7 + (index % 7)}s linear infinite`,
              animationDelay: `${index * 0.42}s`,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/25 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/15 to-transparent" />

      <div className="pointer-events-none absolute left-[-20%] top-0 h-full w-[48%] bg-gradient-to-r from-transparent via-emerald-200/10 to-transparent blur-sm" style={{ animation: "scanSweep 5.8s ease-in-out infinite" }} />

      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/10 lg:block" style={{ animation: "orbitRing 14s linear infinite" }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime-200/10 lg:block" style={{ animation: "orbitRing 10s linear infinite reverse" }} />

      <div className="pointer-events-none absolute left-0 top-[22%] h-24 w-full overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-lime-200/20 to-transparent blur-md" style={{ animation: "dataFlow 4.2s ease-in-out infinite" }} />
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-80 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl" style={{ animation: "spotlightPan 7s ease-in-out infinite" }} />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_450px]">
          <div className="hidden lg:block">
            <div className="max-w-2xl" style={{ animation: "titleIn 750ms ease both" }}>
              <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-emerald-300/20 bg-white/10 px-5 py-3 text-sm font-bold text-emerald-100 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl">
                <span className="h-2.5 w-2.5 rounded-full bg-lime-300 shadow-[0_0_16px_rgba(190,242,100,0.8)]" />
                Live AI Farming Platform
              </div>

              <h1 className="max-w-2xl text-6xl font-black leading-[1.02] tracking-tight text-white xl:text-7xl">
                Smart farming,
                <span className="block bg-gradient-to-r from-emerald-200 via-lime-200 to-yellow-100 bg-clip-text text-transparent">
                  cinematic care.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50/78">
                A premium farmer app experience with secure OTP login,
                AI crop care, smart weather intelligence, and animated field insights.
              </p>

              <div className="mt-9 grid max-w-xl grid-cols-3 gap-4">
                {[
                  ["01", "Disease Scan"],
                  ["02", "Weather Alerts"],
                  ["03", "Farm Records"],
                ].map(([number, label]) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
                    <p className="text-xs font-black tracking-[0.3em] text-lime-200">{number}</p>
                    <p className="mt-2 text-sm font-black text-white">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel pointer-events-none absolute left-[6%] top-[13%] rounded-3xl border border-emerald-200/15 bg-white/10 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-200">
                Disease scan
              </p>
              <p className="mt-3 text-lg font-black text-white">Photo-based guidance</p>
              <p className="mt-1 text-sm font-semibold text-white/70">Available after login</p>
            </div>

            <div className="glass-panel pointer-events-none absolute bottom-[14%] left-[42%] rounded-3xl border border-lime-200/15 bg-white/10 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl" style={{ animationDelay: "900ms" }}>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-200">
                Weather
              </p>
              <p className="mt-3 text-lg font-black text-white">Farm-location based</p>
              <p className="mt-1 text-sm font-semibold text-white/70">Shown only when data is available</p>
            </div>
          </div>

          <section className="login-card relative mx-auto w-full max-w-md overflow-hidden rounded-[2.2rem] border border-white/25 bg-white/92 p-7 text-slate-950 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-8">
            <div id="firebase-recaptcha-container" />

            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-lime-300 to-yellow-200" />
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/20 blur-2xl" />

            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-600 to-lime-400 shadow-xl shadow-emerald-500/30">
                <svg viewBox="0 0 64 64" className="h-9 w-9 text-white" fill="none" aria-hidden="true">
                  <path d="M13 41C28 39 38 27 44 13C48 29 41 48 18 52" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                  <path d="M18 51C26 39 33 31 45 23" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <path d="M39 37C47 37 52 41 55 48C47 49 41 46 39 37Z" fill="currentColor" opacity="0.9" />
                </svg>
              </div>

              <p className="text-sm font-black uppercase tracking-[0.35em] text-emerald-700">
                Kisan Mithra Login
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                Login with OTP
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Enter your mobile number or email. New farmers will be registered
                automatically after OTP verification.
              </p>
            </div>

            <div className="mb-6">
              <label className="text-sm font-bold text-slate-700">
                Farmer full name
              </label>
              <input
                form="otp-login-form"
                type="text"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                value={fullName}
                disabled={otpSent}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="Example: B. Laxman"
              />
              <p className="mt-2 text-xs font-medium text-slate-500">
                This name will appear in your Kisan Mithra greeting and farmer profile.
              </p>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => resetFlow("phone")}
                className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                  mode === "phone"
                    ? "bg-white text-emerald-700 shadow-lg shadow-slate-200"
                    : "text-slate-500 hover:text-emerald-700"
                }`}
              >
                Mobile OTP
              </button>

              <button
                type="button"
                onClick={() => resetFlow("email")}
                className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                  mode === "email"
                    ? "bg-white text-emerald-700 shadow-lg shadow-slate-200"
                    : "text-slate-500 hover:text-emerald-700"
                }`}
              >
                Email OTP
              </button>
            </div>

            <form id="otp-login-form" onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700">
                  {mode === "email" ? "Email address" : "Mobile number"}
                </label>
                <input
                  type={mode === "email" ? "email" : "tel"}
                  required
                  value={identifier}
                  disabled={otpSent}
                  onChange={(event) => setIdentifier(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder={mode === "email" ? "farmer@example.com" : "9876543210"}
                />
              </div>

              {otpSent ? (
                <div>
                  <label className="text-sm font-bold text-slate-700">6-digit OTP</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    minLength={6}
                    maxLength={6}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Enter OTP"
                  />
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="shine-button w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-green-500 to-lime-500 px-5 py-4 text-base font-black text-white shadow-xl shadow-emerald-600/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
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
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Change {mode === "email" ? "email" : "mobile number"}
                </button>
              ) : null}
            </form>

            {message ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <p className="mt-6 text-center text-xs leading-5 text-slate-500">
              No password needed. OTP verification will create or open your farmer account.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
