import Link from "next/link";
import { getRole } from "@/lib/auth/session";
import { logout } from "@/lib/auth/actions";
import { db } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";
import { getDietProgress } from "@/lib/diet-period";
import { NAV_LINKS } from "./nav-links";
import { NavBar } from "./nav-bar";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const role = await getRole();
  const links = NAV_LINKS.filter((link) => !link.adminOnly || role === "admin");

  const [settingsRow] = await db.select().from(settings).limit(1);
  const progress = settingsRow ? getDietProgress(settingsRow.dietStartDate) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-card-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/calendar" className="flex items-center gap-2">
              <span className="text-xl">🧪</span>
              <span className="gradient-text text-lg font-extrabold tracking-tight">
                The Crohnicles
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {progress && !progress.isBeforeStart && (
                <div className="hidden items-center gap-2 sm:flex" title={`Day ${progress.dayNumber} of 56`}>
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-brand-violet/10">
                    <div
                      className="brand-gradient h-full rounded-full transition-all"
                      style={{ width: `${progress.percentComplete}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted">
                    {progress.isComplete ? "Day 56/56 🎉" : `Day ${progress.dayNumber}/56`}
                  </span>
                </div>
              )}
              <span className="rounded-full bg-brand-teal/15 px-2.5 py-1 text-xs font-semibold capitalize text-brand-teal">
                {role}
              </span>
              <form action={logout}>
                <button type="submit" className="btn-secondary text-xs">
                  Log out
                </button>
              </form>
            </div>
          </div>
          <NavBar links={links} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
