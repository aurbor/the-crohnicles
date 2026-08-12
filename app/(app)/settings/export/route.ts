import { format } from "date-fns";
import { requireAdmin } from "@/lib/auth/session";
import { exportAllData } from "@/lib/settings/backup";

export async function GET() {
  await requireAdmin();
  const data = await exportAllData();

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="crohnicles-backup-${format(new Date(), "yyyy-MM-dd")}.json"`,
    },
  });
}
