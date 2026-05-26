export default function StatCard({
  label,
  value,
  delta,
  tone = "brand",
  icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  tone?: "brand" | "emerald" | "amber" | "rose";
  icon?: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="card flex items-start gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        {delta ? <p className="mt-0.5 text-xs text-slate-500">{delta}</p> : null}
      </div>
    </div>
  );
}
