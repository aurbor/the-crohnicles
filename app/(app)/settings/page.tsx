import { db } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";
import { DietSettingsForm } from "@/components/settings/diet-settings-form";
import { ImportBackupForm } from "@/components/settings/import-backup-form";

export default async function SettingsPage() {
  const [settingsRow] = await db.select().from(settings).limit(1);
  const currentDate = settingsRow?.dietStartDate ?? new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-muted">The boring-but-important stuff.</p>
      </div>

      <div className="card p-4">
        <h2 className="mb-1 text-sm font-bold">Diet period &amp; calorie targets</h2>
        <p className="mb-3 text-xs text-muted">
          The start date drives the Day X/56 progress bar and the default report range. The
          calorie figures drive the daily deficit shown on the calendar and reports.
        </p>
        <DietSettingsForm
          currentDate={currentDate}
          suggestedCalories={settingsRow?.suggestedCalories ?? null}
          bmr={settingsRow?.bmr ?? null}
        />
      </div>

      <div className="card p-4">
        <h2 className="mb-1 text-sm font-bold">Backup</h2>
        <p className="mb-3 text-xs text-muted">
          Everything is stored in a single SQLite file, but a JSON export is cheap insurance —
          take one before any risky changes.
        </p>
        <div className="flex flex-col gap-4">
          <div>
            <a href="/settings/export" className="btn-primary inline-block">
              ⬇ Export all data (JSON)
            </a>
          </div>
          <hr className="border-card-border" />
          <ImportBackupForm />
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-1 text-sm font-bold">Access</h2>
        <p className="text-xs text-muted">
          Admin and Consultant passwords are set via environment variables (
          <code>ADMIN_PASSWORD</code> / <code>CONSULTANT_PASSWORD</code>) at deploy time — change
          them there, not here.
        </p>
      </div>
    </div>
  );
}
