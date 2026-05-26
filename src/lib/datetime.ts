// Timezone helpers. The server runs in UTC on Vercel,
// so we explicitly format / compute in Asia/Kolkata everywhere.

export const APP_TZ = "Asia/Kolkata";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TZ,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// "DD/MM/YYYY" → "YYYY-MM-DD"
function flipISO(d: string): string {
  const [day, month, year] = d.split("/");
  return `${year}-${month}-${day}`;
}

export function todayIST(): string {
  return flipISO(dateFmt.format(new Date()));
}

export function dateIST(d: Date): string {
  return flipISO(dateFmt.format(d));
}

export function nowTimeIST(): string {
  // "HH:MM:SS" with 24-hour clock
  return timeFmt.format(new Date()).replace(/^24:/, "00:");
}

export function timeIST(d: Date): string {
  return timeFmt.format(d).replace(/^24:/, "00:");
}
