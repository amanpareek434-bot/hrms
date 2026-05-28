// eSSL / ZKTeco device wrapper around node-zklib.
// Used only by server-side API routes — DO NOT import in client code.

// node-zklib has no types — declare a minimal interface.
// We also expose the internal tcp/udp handles + connectionType so we can
// force a UDP attempt ourselves (the library only auto-falls-back on ECONNREFUSED).
interface ZKTransport {
  socket: unknown;
  createSocket: (cbErr?: (e: Error) => void, cbClose?: () => void) => Promise<unknown>;
  connect: () => Promise<unknown>;
  disconnect: () => Promise<unknown>;
}

type ZK = {
  connectionType: "tcp" | "udp" | null;
  zklibTcp: ZKTransport;
  zklibUdp: ZKTransport;
  createSocket: (cbErr?: (e: Error) => void, cbClose?: () => void) => Promise<unknown>;
  disconnect: () => Promise<unknown>;
  getInfo: () => Promise<{ userCounts?: number; logCounts?: number; logCapacity?: number }>;
  getUsers: () => Promise<{ data: Array<{ userId: string; name: string; uid: number; role: number; cardno?: number }> }>;
  getAttendances: () => Promise<{
    data: Array<{ userSn: number; deviceUserId: string; recordTime: string | Date; ip: string }>;
  }>;
};

interface EsslConfig {
  ip: string;
  port?: number;
  timeoutMs?: number;
  inportMs?: number;
  /** Force a specific transport. Default: try TCP then UDP. */
  transport?: "tcp" | "udp" | "auto";
}

export type EsslTransport = "tcp" | "udp";

// Holds the transport that the most recent connect() actually used.
let lastTransport: EsslTransport | null = null;
export function getLastTransport(): EsslTransport | null {
  return lastTransport;
}

// Pick a fresh, high local UDP port for each connection. Using a fixed port
// (the old default 4000) caused `EADDRINUSE` when a prior socket lingered
// across requests / dev hot-reloads. The device replies to whatever source
// port we send from, so any free local port works.
function randomInport(): number {
  return 50000 + Math.floor(Math.random() * 15000);
}

async function newZk(cfg: EsslConfig): Promise<ZK> {
  // Dynamic import so the module is only required when used (cleaner cold-start)
  const ZKLibMod = await import("node-zklib");
  const ZKLib = (ZKLibMod.default || ZKLibMod) as unknown as new (
    ip: string,
    port: number,
    timeout: number,
    inport: number,
  ) => ZK;
  // Shorter per-transport timeout so TCP-fail → UDP completes well within HTTP limits.
  return new ZKLib(cfg.ip, cfg.port ?? 4370, cfg.timeoutMs ?? 5000, cfg.inportMs ?? randomInport());
}

function isAddrInUse(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  const msg = (err as Error)?.message || "";
  return code === "EADDRINUSE" || msg.includes("EADDRINUSE");
}

async function tryUdp(zk: ZK): Promise<void> {
  if (!zk.zklibUdp.socket) {
    try {
      await zk.zklibUdp.createSocket();
    } catch (err) {
      // A bind clash on the local port doesn't mean the device is unreachable —
      // the socket object still exists and can send. node-zklib itself treats
      // EADDRINUSE as "connected", so mirror that. Re-throw anything else.
      if (!isAddrInUse(err)) throw err;
    }
    await zk.zklibUdp.connect();
  }
  zk.connectionType = "udp";
}

async function connect(cfg: EsslConfig): Promise<ZK> {
  const zk = await newZk(cfg);
  const mode = cfg.transport ?? "auto";

  // Caller explicitly wants UDP — skip TCP entirely.
  if (mode === "udp") {
    await tryUdp(zk);
    lastTransport = "udp";
    return zk;
  }

  try {
    // node-zklib's createSocket tries TCP, and only falls back to UDP on ECONNREFUSED.
    await zk.createSocket();
    lastTransport = zk.connectionType === "udp" ? "udp" : "tcp";
    return zk;
  } catch (tcpErr) {
    if (mode === "tcp") {
      throw tcpErr;
    }
    // TCP failed for a reason that did NOT auto-trigger UDP (e.g. timeout / host
    // unreachable). Many eSSL/ZKTeco units only listen on UDP 4370, so try it.
    try {
      await tryUdp(zk);
      lastTransport = "udp";
      return zk;
    } catch (udpErr) {
      const t = (tcpErr as Error)?.message || String(tcpErr);
      const u = (udpErr as Error)?.message || String(udpErr);
      throw new Error(
        `Could not reach the device on ${cfg.ip}:${cfg.port ?? 4370} over TCP or UDP. ` +
          `TCP: ${t} | UDP: ${u}`,
      );
    }
  }
}

export interface EsslPunch {
  userId: string;
  time: Date;
}

export interface EsslDeviceInfo {
  users: number;
  logs: number;
  capacity: number;
  transport: EsslTransport;
  enrolledUsers: Array<{ userId: string; name: string }>;
}

export async function getDeviceInfo(cfg: EsslConfig): Promise<EsslDeviceInfo> {
  const zk = await connect(cfg);
  try {
    const info = await zk.getInfo();
    const users = await zk.getUsers();
    return {
      users: info.userCounts ?? 0,
      logs: info.logCounts ?? 0,
      capacity: info.logCapacity ?? 0,
      transport: lastTransport ?? "tcp",
      enrolledUsers: users.data.map((u) => ({ userId: u.userId, name: u.name || "" })),
    };
  } finally {
    try {
      await zk.disconnect();
    } catch {
      // ignore
    }
  }
}

export async function fetchAttendance(cfg: EsslConfig, sinceIso?: string): Promise<EsslPunch[]> {
  const zk = await connect(cfg);
  try {
    const res = await zk.getAttendances();
    const since = sinceIso ? new Date(sinceIso).getTime() : 0;
    const punches: EsslPunch[] = [];
    for (const row of res.data) {
      const t = row.recordTime instanceof Date ? row.recordTime : new Date(row.recordTime);
      if (Number.isNaN(t.getTime())) continue;
      if (since && t.getTime() <= since) continue;
      punches.push({ userId: String(row.deviceUserId), time: t });
    }
    punches.sort((a, b) => a.time.getTime() - b.time.getTime());
    return punches;
  } finally {
    try {
      await zk.disconnect();
    } catch {
      // ignore
    }
  }
}

// Aggregate raw punches into per-employee-per-day records.
// First punch of the day = check-in, last = check-out.
// All dates and times are normalised to IST.
import { dateIST, timeIST } from "./datetime";

export interface AggregatedDay {
  userId: string;          // device user id
  date: string;            // YYYY-MM-DD (IST)
  checkIn: string;         // HH:MM:SS (IST)
  checkOut: string;        // HH:MM:SS (IST, same as checkIn if only one punch)
  punches: number;
}

export function aggregateByDay(punches: EsslPunch[]): AggregatedDay[] {
  const buckets = new Map<string, EsslPunch[]>();
  for (const p of punches) {
    const key = `${p.userId}|${dateIST(p.time)}`;
    const arr = buckets.get(key) ?? [];
    arr.push(p);
    buckets.set(key, arr);
  }
  const out: AggregatedDay[] = [];
  for (const [key, arr] of buckets) {
    const [userId, date] = key.split("|");
    arr.sort((a, b) => a.time.getTime() - b.time.getTime());
    out.push({
      userId,
      date,
      checkIn: timeIST(arr[0].time),
      checkOut: timeIST(arr[arr.length - 1].time),
      punches: arr.length,
    });
  }
  return out;
}
