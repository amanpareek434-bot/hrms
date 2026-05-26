"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { formatDate, useAttendance } from "@/lib/hrms";

interface Me {
  uid: string;
  role: string;
  name: string;
  employeeId?: string;
}

interface EnrolledDevice {
  id: string;
  deviceName: string;
  transports: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface PunchResult {
  action: "in" | "out";
  date: string;
  time: string;
}

function detectDeviceName(): string {
  if (typeof navigator === "undefined") return "Unknown device";
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android phone";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  return "Device";
}

export default function PunchPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [devices, setDevices] = useState<EnrolledDevice[]>([]);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [insecure, setInsecure] = useState(false);
  const [currentHost, setCurrentHost] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<PunchResult | null>(null);

  const { data: attendance, refresh: refreshAttendance } = useAttendance();

  const today = new Date().toISOString().slice(0, 10);
  const myToday = me?.employeeId
    ? attendance.find((a) => a.employeeId === me.employeeId && a.date === today)
    : undefined;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setMe(d.user);
        setLoadingMe(false);
      });
    if (typeof window !== "undefined") {
      const isSecure = window.isSecureContext;
      const hasApi = typeof window.PublicKeyCredential !== "undefined";
      setSupported(hasApi);
      setInsecure(!isSecure);
      setCurrentHost(window.location.host);
    }
    refreshDevices();
  }, []);

  async function refreshDevices() {
    try {
      const r = await fetch("/api/webauthn/credentials");
      const d = await r.json();
      setDevices(Array.isArray(d) ? d : []);
    } catch {
      setDevices([]);
    }
  }

  async function enroll() {
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      const { startRegistration } = await import("@simplewebauthn/browser");
      const optsRes = await fetch("/api/webauthn/register/options", { method: "POST" });
      const opts = await optsRes.json();
      if (!optsRes.ok) throw new Error(opts.error || "Failed to start enrollment");

      const attResp = await startRegistration({ optionsJSON: opts });

      const verifyRes = await fetch("/api/webauthn/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attResp, deviceName: detectDeviceName() }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || "Enrollment failed");

      setMsg(`✓ ${verifyData.deviceName} enrolled. You can now mark attendance with your fingerprint / Face ID.`);
      await refreshDevices();
    } catch (e) {
      const msg = (e as Error).message;
      // Common: user cancels the prompt → InvalidStateError or "The operation either timed out…"
      setErr(msg.includes("InvalidState") || msg.includes("already registered") ? "This device is already enrolled." : msg);
    } finally {
      setBusy(false);
    }
  }

  async function punch(action: "in" | "out") {
    setErr(null);
    setMsg(null);
    setResult(null);
    setBusy(true);
    try {
      const { startAuthentication } = await import("@simplewebauthn/browser");
      const optsRes = await fetch("/api/webauthn/auth/options", { method: "POST" });
      const opts = await optsRes.json();
      if (!optsRes.ok) throw new Error(opts.error || "Failed to start authentication");

      const authResp = await startAuthentication({ optionsJSON: opts });

      const verifyRes = await fetch("/api/webauthn/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authResp, action }),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(data.error || "Punch failed");

      setResult({ action: data.action, date: data.date, time: data.time });
      setMsg(`✓ ${action === "in" ? "Checked in" : "Checked out"} at ${data.time}`);
      await refreshAttendance();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function removeDevice(id: string) {
    if (!confirm("Remove this device? You won't be able to punch from it anymore.")) return;
    setBusy(true);
    try {
      await fetch(`/api/webauthn/credentials/${id}`, { method: "DELETE" });
      await refreshDevices();
    } finally {
      setBusy(false);
    }
  }

  if (loadingMe) return <Status msg="Loading…" />;
  if (!me?.employeeId) return <Status msg="Your account is not linked to an employee record." back />;
  if (supported === false) {
    return (
      <>
        <Header title="Punch In" subtitle="Mark attendance with your fingerprint" />
        <div className="p-6">
          <div className="card border-amber-200 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-500/10">
            {insecure ? (
              <>
                <h2 className="text-base font-semibold text-amber-800 dark:text-amber-200">
                  ⚠ Insecure connection — fingerprint blocked
                </h2>
                <p className="mt-2 text-sm text-amber-900 dark:text-amber-100">
                  You opened the app on <code className="font-mono">{currentHost}</code> over plain HTTP.
                  Browsers (Safari, Chrome, etc.) only allow fingerprint / Face ID over <strong>https://</strong> or
                  <strong> localhost</strong>. This is a hard security rule — nothing wrong with your phone.
                </p>
                <div className="mt-4 rounded-lg border border-amber-300 bg-white/60 p-3 text-xs text-slate-700 dark:border-amber-500/40 dark:bg-ink-800/60 dark:text-slate-300">
                  <p className="font-semibold">Fix — get an HTTPS URL for your laptop:</p>
                  <ol className="mt-1 list-decimal space-y-1 pl-5">
                    <li>On the laptop, install <a className="underline" href="https://ngrok.com/download" target="_blank" rel="noopener noreferrer">ngrok</a> (free).</li>
                    <li>Run <code className="font-mono">ngrok http 3000</code> in PowerShell.</li>
                    <li>Copy the <code className="font-mono">https://&lt;…&gt;.ngrok-free.app</code> URL it prints.</li>
                    <li>Open that URL on this phone instead — fingerprint will work.</li>
                  </ol>
                </div>
              </>
            ) : (
              <p className="text-sm text-amber-900 dark:text-amber-100">
                Your browser doesn&apos;t expose WebAuthn. Use a modern Chrome, Safari, Edge or Firefox on a device with
                fingerprint / Face ID.
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  const hasDevices = devices.length > 0;

  return (
    <>
      <Header
        title="Punch In / Out"
        subtitle="Use your phone fingerprint or Face ID"
      />

      <div className="space-y-6 p-6">
        {err ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {err}
          </div>
        ) : null}
        {msg ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            {msg}
          </div>
        ) : null}

        {/* Today's status */}
        <section className="card text-center">
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Today</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{formatDate(today)}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-left sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-3 dark:border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Check-in</p>
              <p className="mt-1 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {myToday?.checkIn || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Check-out</p>
              <p className="mt-1 font-mono text-lg font-bold text-rose-600 dark:text-rose-400">
                {myToday?.checkOut || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-white/5 sm:col-span-1 col-span-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{myToday?.status || "Not marked"}</p>
            </div>
          </div>
        </section>

        {/* Action area */}
        {!hasDevices ? (
          <section className="card text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-10 w-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">First time — enroll your device</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
              Save your phone&apos;s fingerprint / Face ID once. After that you can punch in/out with one tap.
            </p>
            <button onClick={enroll} disabled={busy} className="btn-primary mt-5 px-6 py-3 text-base">
              {busy ? "Waiting for your biometric…" : "Enroll This Device"}
            </button>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              ⚠ Your fingerprint stays on your phone. Only a cryptographic public key is sent to the server.
            </p>
          </section>
        ) : (
          <section className="card text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18a6 6 0 016-6m0-3a3 3 0 11-6 0 3 3 0 016 0zM5 9a7 7 0 1114 0v3M5 14v3a4 4 0 008 0M19 14v3M9 21v-3M3 13l1-1 1 1M20 13l1-1 1 1" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Tap to {!myToday?.checkIn ? "punch in" : !myToday?.checkOut ? "punch out" : "update"}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Use your fingerprint or Face ID</p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => punch("in")}
                disabled={busy || !!myToday?.checkIn}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-base font-semibold text-white shadow-glow transition hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40"
              >
                {busy ? "…" : "🔵 Punch In"}
              </button>
              <button
                onClick={() => punch("out")}
                disabled={busy || !myToday?.checkIn}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-4 text-base font-semibold text-white shadow-glow transition hover:from-rose-400 hover:to-pink-400 disabled:opacity-40"
              >
                {busy ? "…" : "🔴 Punch Out"}
              </button>
            </div>

            {result ? (
              <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">
                ✓ {result.action === "in" ? "Checked in" : "Checked out"} at {result.time}
              </p>
            ) : null}
          </section>
        )}

        {/* Devices list */}
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Enrolled devices</h2>
            {hasDevices ? (
              <button className="btn-secondary text-xs" onClick={enroll} disabled={busy}>
                + Add another device
              </button>
            ) : null}
          </div>
          {devices.length === 0 ? (
            <p className="text-sm text-slate-500">No devices enrolled.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/5">
              {devices.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17a4 4 0 11.001-7.999A4 4 0 0112 17zM6 12a6 6 0 1112 0M3 12a9 9 0 1118 0" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{d.deviceName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Enrolled {formatDate(d.createdAt?.slice(0, 10))}
                        {d.lastUsedAt ? ` · Last used ${formatDate(d.lastUsedAt.slice(0, 10))}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn-ghost text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    onClick={() => removeDevice(d.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div>
          <Link href="/me" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
            ← Back to profile
          </Link>
        </div>
      </div>
    </>
  );
}

function Status({ msg, back }: { msg: string; back?: boolean }) {
  return (
    <>
      <Header title="Punch In" />
      <div className="p-6 text-sm text-slate-500">
        <p>{msg}</p>
        {back ? <Link href="/me" className="mt-2 inline-block text-brand-600 hover:underline">← Back</Link> : null}
      </div>
    </>
  );
}
