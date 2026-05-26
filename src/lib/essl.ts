// eSSL / ZKTeco device wrapper around node-zklib.
// Used only by server-side API routes — DO NOT import in client code.

// node-zklib has no types — declare a minimal interface.
type ZK = {
  createSocket: () => Promise<unknown>;
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
}

async function connect(cfg: EsslConfig): Promise<ZK> {
  // Dynamic import so the module is only required when used (cleaner cold-start)
  const ZKLibMod = await import("node-zklib");
  const ZKLib = (ZKLibMod.default || ZKLibMod) as unknown as new (
    ip: string,
    port: number,
    timeout: number,
    inport: number,
  ) => ZK;
  const zk = new ZKLib(cfg.ip, cfg.port ?? 4370, cfg.timeoutMs ?? 10000, cfg.inportMs ?? 4000);
  await zk.createSocket();
  return zk;
}

export interface EsslPunch {
  userId: string;
  time: Date;
}

export interface EsslDeviceInfo {
  users: number;
  logs: number;
  capacity: number;
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
export interface AggregatedDay {
  userId: string;          // device user id
  date: string;            // YYYY-MM-DD (local)
  checkIn: string;         // HH:MM:SS
  checkOut: string;        // HH:MM:SS (same as checkIn if only one punch)
  punches: number;
}

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localTimeStr(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function aggregateByDay(punches: EsslPunch[]): AggregatedDay[] {
  const buckets = new Map<string, EsslPunch[]>();
  for (const p of punches) {
    const key = `${p.userId}|${localDateStr(p.time)}`;
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
      checkIn: localTimeStr(arr[0].time),
      checkOut: localTimeStr(arr[arr.length - 1].time),
      punches: arr.length,
    });
  }
  return out;
}
