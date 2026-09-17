import type { ReactNode } from "react";

export function ChartCard({
  title,
  subtitle,
  wide = false,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Span the full grid width — for charts with a lot of points or series. */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`card p-4 ${wide ? "lg:col-span-2" : ""}`}>
      <h3 className="text-sm font-bold">{title}</h3>
      {subtitle && <p className="mb-2 text-xs text-muted">{subtitle}</p>}
      <div className={`mt-2 w-full ${wide ? "h-72" : "h-64"}`}>{children}</div>
    </div>
  );
}
