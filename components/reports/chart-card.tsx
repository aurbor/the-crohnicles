import type { ReactNode } from "react";

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-bold">{title}</h3>
      {subtitle && <p className="mb-2 text-xs text-muted">{subtitle}</p>}
      <div className="mt-2 h-64 w-full">{children}</div>
    </div>
  );
}
