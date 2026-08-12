import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import { format } from "date-fns";
import { getReportsData } from "@/lib/reports/aggregate";
import { ReportPdfDocument } from "@/lib/reports/pdf-document";
import { getRole } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const role = await getRole();
  if (!role) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const start = searchParams.get("start") ?? format(new Date(), "yyyy-MM-dd");
  const end = searchParams.get("end") ?? format(new Date(), "yyyy-MM-dd");

  const data = await getReportsData(start, end);
  const buffer = await renderToBuffer(<ReportPdfDocument data={data} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="crohnicles-report-${start}-to-${end}.pdf"`,
    },
  });
}
