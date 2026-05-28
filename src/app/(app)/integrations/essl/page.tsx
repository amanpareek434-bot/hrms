"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { formatDate, useEmployees } from "@/lib/hrms";

interface Settings {
  deviceIp: string;
  devicePort: number;
  commPassword: string;
  enabled: boolean;
  autoCreateEmployees: boolean;
  lastSyncAt: string;
  lastSyncCount: number;
  lastError: string;
}

interface ImportResult {
  totalOnDevice: number;
  created: number;
  skipped: number;
  createdList: Array<{ esslUserId: string; name: string; employeeCode: string }>;
  skippedList: Array<{ esslUserId: string; reason: string }>;
}

interface DeviceInfo {
  users: number;
  logs: number;
  capacity: number;
  transport?: "tcp" | "udp";
  enrolledUsers: Array<{ userId: string; name: string }>;
}

interface SyncResult {
  inserted: number;
  updated: number;
  totalPunches: number;
  totalDays: number;
  unmappedUserIds: string[];
  autoCreatedCount?: number;
  autoCreatedList?: Array<{ esslUserId: string; name: string; employeeCode: string }>;
  lastSyncAt: string;
}

const DEFAULT: Settings = {
  deviceIp: "",
  devicePort: 4370,
  commPassword: "",
  enabled: false,
  autoCreateEmployees: false,
  lastSyncAt: "",
  lastSyncCount: 0,
  lastError: "",
};

export default function EsslIntegrationPage() {
  const { data: employees } = useEmployees();

  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const r = await fetch("/api/integrations/essl");
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setSettings(d);
    } catch (e) {
      setErrorMsg((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setErrorMsg(null);
    setOkMsg(null);
    setSaving(true);
    try {
      const r = await fetch("/api/integrations/essl", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      setOkMsg("Settings saved.");
      setTimeout(() => setOkMsg(null), 2000);
    } catch (e) {
      setErrorMsg((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function test(transport: "auto" | "tcp" | "udp" = "auto") {
    setErrorMsg(null);
    setDevice(null);
    setTesting(true);
    try {
      const r = await fetch("/api/integrations/essl/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceIp: settings.deviceIp,
          devicePort: settings.devicePort,
          transport,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        throw new Error(d.hint ? `${d.error}\n\n💡 ${d.hint}` : d.error || "Connection failed");
      }
      setDevice(d);
      setOkMsg(
        `Connected over ${String(d.transport || "tcp").toUpperCase()}! ${d.users} users, ${d.logs} logs on device.`,
      );
    } catch (e) {
      setErrorMsg((e as Error).message);
    } finally {
      setTesting(false);
    }
  }

  async function importUsers() {
    setErrorMsg(null);
    setImportResult(null);
    setImporting(true);
    try {
      const r = await fetch("/api/integrations/essl/import", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Import failed");
      setImportResult(d);
      setOkMsg(`Imported ${d.created} employee${d.created === 1 ? "" : "s"} from device.`);
    } catch (e) {
      setErrorMsg((e as Error).message);
    } finally {
      setImporting(false);
    }
  }

  async function sync(full = false) {
    setErrorMsg(null);
    setResult(null);
    setSyncing(true);
    try {
      const r = await fetch("/api/integrations/essl/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Sync failed");
      setResult(d);
      setOkMsg(`Sync complete: ${d.inserted} new, ${d.updated} updated.`);
      await refresh();
    } catch (e) {
      setErrorMsg((e as Error).message);
    } finally {
      setSyncing(false);
    }
  }

  const mapped = employees.filter((e) => (e as unknown as { esslUserId?: string }).esslUserId).length;
  const unmapped = employees.length - mapped;

  return (
    <>
      <Header
        title="eSSL Integration"
        subtitle="Connect your biometric attendance machine"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {settings.lastSyncAt ? (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Last synced: {settings.lastSyncAt}
              </span>
            ) : null}
            <button className="btn-secondary" onClick={() => test("auto")} disabled={testing || !settings.deviceIp}>
              {testing ? "Testing…" : "Test Connection"}
            </button>
            <button
              className="btn-secondary"
              onClick={() => test("udp")}
              disabled={testing || !settings.deviceIp}
              title="Force UDP — many eSSL devices only listen on UDP 4370"
            >
              Try UDP
            </button>
            <button className="btn-secondary" onClick={importUsers} disabled={importing || !settings.deviceIp}>
              {importing ? "Importing…" : "Import Users"}
            </button>
            <button className="btn-primary" onClick={() => sync(false)} disabled={syncing || !settings.deviceIp}>
              {syncing ? "Syncing…" : "Sync Now"}
            </button>
          </div>
        }
      />

      <div className="mx-auto max-w-screen-2xl space-y-6 p-4 sm:p-6 lg:px-8">
        {errorMsg ? (
          <div className="whitespace-pre-line rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {errorMsg}
          </div>
        ) : null}
        {okMsg ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            {okMsg}
          </div>
        ) : null}

        {/* Device config */}
        <section className="card">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Device Configuration</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label">Device IP Address</label>
              <input
                className="input"
                placeholder="e.g. 192.168.1.201"
                value={settings.deviceIp}
                onChange={(e) => setSettings({ ...settings, deviceIp: e.target.value })}
              />
              <p className="mt-1 text-xs text-slate-500">On the machine: Menu → Comm → Network → IP</p>
            </div>
            <div>
              <label className="label">Port</label>
              <input
                type="number"
                className="input"
                value={settings.devicePort}
                onChange={(e) => setSettings({ ...settings, devicePort: Number(e.target.value) })}
              />
              <p className="mt-1 text-xs text-slate-500">Default ZKTeco port: 4370</p>
            </div>
            <div>
              <label className="label">Comm Password (optional)</label>
              <input
                className="input"
                placeholder="Leave blank if not set on device"
                value={settings.commPassword}
                onChange={(e) => setSettings({ ...settings, commPassword: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                />
                <span className="text-slate-700 dark:text-slate-300">Enable integration</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-white/5 dark:bg-white/[0.02]">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={settings.autoCreateEmployees}
                  onChange={(e) => setSettings({ ...settings, autoCreateEmployees: e.target.checked })}
                />
                <span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    Auto-create employees on every sync
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    Any user enrolled on the device but not in HRMS will be automatically created with
                    employee_code <code className="font-mono">ESSL-&lt;id&gt;</code> and a placeholder email.
                  </span>
                </span>
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="btn-primary" onClick={save} disabled={saving || loading}>
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </section>

        {/* Device info */}
        {device ? (
          <section className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Device Status</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Enrolled Users" value={device.users} />
              <Stat label="Stored Logs" value={device.logs} />
              <Stat label="Log Capacity" value={device.capacity} />
              <Stat label="Transport" value={(device.transport || "tcp").toUpperCase()} />
            </div>
            {device.enrolledUsers.length > 0 ? (
              <div className="mt-5">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Enrolled on Device</h3>
                <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 dark:border-white/5">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Device ID</th>
                        <th>Name on device</th>
                        <th>Mapped to</th>
                      </tr>
                    </thead>
                    <tbody>
                      {device.enrolledUsers.map((u) => {
                        const emp = employees.find(
                          (e) => (e as unknown as { esslUserId?: string }).esslUserId === u.userId,
                        );
                        return (
                          <tr key={u.userId}>
                            <td className="font-mono text-xs">{u.userId}</td>
                            <td>{u.name || <span className="text-slate-400">—</span>}</td>
                            <td>
                              {emp ? (
                                <Link href={`/employees/${emp.id}`} className="text-brand-600 hover:underline dark:text-brand-300">
                                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                                </Link>
                              ) : (
                                <span className="text-rose-600 dark:text-rose-400">⚠ Not mapped</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Import result */}
        {importResult ? (
          <section className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Last Import</h2>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="On Device" value={importResult.totalOnDevice} />
              <Stat label="Created" value={importResult.created} />
              <Stat label="Skipped" value={importResult.skipped} />
            </div>
            {importResult.createdList.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  ✓ Created
                </p>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-white/5">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Device ID</th>
                        <th>Name</th>
                        <th>Employee Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.createdList.map((c) => (
                        <tr key={c.esslUserId}>
                          <td className="font-mono text-xs">{c.esslUserId}</td>
                          <td>{c.name}</td>
                          <td className="font-mono text-xs">{c.employeeCode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  ⚠ Each created employee got a placeholder email like <code className="font-mono">essl-&lt;id&gt;@imported.local</code>.
                  Open them on the <Link href="/employees" className="underline">Employees</Link> page and update with real email, phone, department, designation, salary.
                </p>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Last sync result */}
        {result ? (
          <section className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">Last Sync</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Inserted" value={result.inserted} />
              <Stat label="Updated" value={result.updated} />
              <Stat label="Punches" value={result.totalPunches} />
              <Stat label="Days" value={result.totalDays} />
            </div>
            {result.autoCreatedCount && result.autoCreatedCount > 0 ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                  ✓ Auto-created {result.autoCreatedCount} new employee{result.autoCreatedCount === 1 ? "" : "s"}
                </p>
                {result.autoCreatedList && result.autoCreatedList.length > 0 ? (
                  <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-200">
                    {result.autoCreatedList.map((c) => `${c.name} (${c.employeeCode})`).join(", ")}
                  </p>
                ) : null}
              </div>
            ) : null}
            {result.unmappedUserIds.length > 0 ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
                <p className="font-semibold text-amber-700 dark:text-amber-300">
                  ⚠ {result.unmappedUserIds.length} unmapped device user{result.unmappedUserIds.length === 1 ? "" : "s"}:
                </p>
                <p className="mt-1 font-mono text-xs text-amber-800 dark:text-amber-200">
                  {result.unmappedUserIds.join(", ")}
                </p>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  Open the employee on the <Link href="/employees" className="underline">Employees</Link> page and set their
                  <strong> eSSL User ID</strong> to match the device ID.
                </p>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Mapping summary */}
        <section className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Employee → Device mapping</h2>
            <Link href="/employees" className="text-xs text-brand-600 hover:underline dark:text-brand-300">
              Edit employees →
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="Mapped" value={mapped} />
            <Stat label="Unmapped" value={unmapped} />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Mapping is by <code className="rounded bg-slate-100 px-1 dark:bg-white/5">essl_user_id</code> column on the
            employee. Match the User ID enrolled on the device.
          </p>
        </section>

        {/* Help */}
        <section className="card">
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">How it works</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
            <li>Connect the eSSL machine to the same WiFi/LAN as this server.</li>
            <li>Find the device IP from the machine&apos;s menu (Comm → Network).</li>
            <li>Enter the IP above and click <strong>Test Connection</strong> — you&apos;ll see enrolled users.</li>
            <li>
              <strong>Click &quot;Import Users&quot;</strong> to one-shot create HRMS employees from everyone enrolled on the device.
              Each gets <code className="font-mono">ESSL-&lt;id&gt;</code> employee code and a placeholder email — fill in real details from the
              <Link href="/employees" className="ml-1 text-brand-600 hover:underline dark:text-brand-300">Employees</Link> page later.
            </li>
            <li>
              Or, turn on <strong>&quot;Auto-create employees on every sync&quot;</strong> so newly enrolled device users are
              created automatically the next time you click Sync Now.
            </li>
            <li>
              Click <strong>Sync Now</strong>. The app pulls all new punches, groups them per employee per day, and writes
              check-in / check-out into the attendance table.
            </li>
            <li>Run a sync at the end of each day, or set up a Windows scheduled task to POST to <code>/api/integrations/essl/sync</code>.</li>
          </ol>
        </section>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-white/5">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
