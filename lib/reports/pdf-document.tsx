import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format, parseISO } from "date-fns";
import { ACTIVITY_LABELS } from "@/lib/activity/estimate";
import type { CalorieTargets } from "@/lib/calorie-targets";
import type { ReportsData } from "./aggregate";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#241b2f" },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#6b6178", marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 6 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  statTile: {
    borderWidth: 1,
    borderColor: "#ece2f7",
    borderRadius: 6,
    padding: 8,
    width: "31%",
    marginBottom: 8,
  },
  statLabel: { fontSize: 8, color: "#6b6178" },
  statValue: { fontSize: 14, fontWeight: 700, marginTop: 2 },
  table: { borderWidth: 1, borderColor: "#ece2f7", borderRadius: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ece2f7" },
  tableRowLast: { flexDirection: "row" },
  tableCellName: { flex: 1, padding: 6 },
  tableCellValue: { width: 70, padding: 6, textAlign: "right" },
  tableHeaderCell: { padding: 6, fontWeight: 700, fontSize: 9 },
  footer: { position: "absolute", bottom: 24, left: 36, right: 36, fontSize: 8, color: "#6b6178" },
});

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function NameCountTable({ rows }: { rows: { name: string; count: number }[] }) {
  if (rows.length === 0) return <Text style={{ color: "#6b6178" }}>None logged in this period.</Text>;
  return (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <Text style={[styles.tableCellName, styles.tableHeaderCell]}>Name</Text>
        <Text style={[styles.tableCellValue, styles.tableHeaderCell]}>Count</Text>
      </View>
      {rows.map((row, i) => (
        <View key={row.name} style={i === rows.length - 1 ? styles.tableRowLast : styles.tableRow}>
          <Text style={styles.tableCellName}>{row.name}</Text>
          <Text style={styles.tableCellValue}>{row.count}</Text>
        </View>
      ))}
    </View>
  );
}

export function ReportPdfDocument({
  data,
  targets,
}: {
  data: ReportsData;
  targets: CalorieTargets;
}) {
  const avgDeficit =
    targets.bmr === null
      ? null
      : Math.round(targets.bmr + data.averages.avgBurned - data.averages.avgCalories);
  const moodLabel: Record<string, string> = { happy: "Good", content: "Okay", unhappy: "Rough" };
  const symptomsWithBristol = data.symptomSeries.filter((s) => s.bristolScale !== null);
  const avgBristol = symptomsWithBristol.length
    ? (
        symptomsWithBristol.reduce((sum, s) => sum + (s.bristolScale ?? 0), 0) /
        symptomsWithBristol.length
      ).toFixed(1)
    : "—";
  const symptomsWithSeverity = data.symptomSeries.filter((s) => s.severity !== null);
  const avgSeverity = symptomsWithSeverity.length
    ? (
        symptomsWithSeverity.reduce((sum, s) => sum + (s.severity ?? 0), 0) /
        symptomsWithSeverity.length
      ).toFixed(1)
    : "—";

  const firstWeight = data.weightSeries[0];
  const lastWeight = data.weightSeries[data.weightSeries.length - 1];

  return (
    <Document title="The Crohnicles - Progress Report">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>The Crohnicles — Progress Report</Text>
        <Text style={styles.subtitle}>
          {format(parseISO(data.rangeStart), "d MMM yyyy")} — {format(parseISO(data.rangeEnd), "d MMM yyyy")} (
          {data.totalDays} days)
        </Text>

        <Text style={styles.sectionTitle}>Daily averages</Text>
        <View style={styles.statsRow}>
          <StatTile label="Calories / day" value={`${data.averages.avgCalories} kcal`} />
          <StatTile label="Protein / day" value={`${data.averages.avgProtein} g`} />
          <StatTile label="Sugar / day" value={`${data.averages.avgSugar} g`} />
          <StatTile label="Drinks / day" value={`${data.averages.avgDrinksPerDay}`} />
          <StatTile label="Food pieces / day" value={`${data.averages.avgFoodPerDay}`} />
          <StatTile label="Active days" value={`${data.activeDayCount} / ${data.totalDays}`} />
        </View>

        <Text style={styles.sectionTitle}>Activity &amp; energy balance</Text>
        <View style={styles.statsRow}>
          <StatTile label="Burned / day" value={`${data.averages.avgBurned} kcal`} />
          <StatTile label="Net / day" value={`${data.averages.avgNet} kcal`} />
          {avgDeficit !== null && (
            <StatTile
              label={avgDeficit >= 0 ? "Avg deficit / day" : "Avg surplus / day"}
              value={`${Math.abs(avgDeficit)} kcal`}
            />
          )}
          <StatTile label="Miles logged" value={`${data.activity.totalMiles}`} />
          <StatTile label="Total burned" value={`${data.activity.totalBurned} kcal`} />
          {targets.suggestedCalories !== null && (
            <StatTile label="Daily target" value={`${targets.suggestedCalories} kcal`} />
          )}
        </View>
        {data.activity.byType.length > 0 && (
          <NameCountTable
            rows={data.activity.byType.map((a) => ({
              name: `${ACTIVITY_LABELS[a.type]} — ${a.miles} miles, ${a.burned} kcal`,
              count: a.count,
            }))}
          />
        )}

        <Text style={styles.sectionTitle}>Drink preference</Text>
        <NameCountTable rows={data.drinkFrequency} />

        <Text style={styles.sectionTitle}>Food consumed</Text>
        <NameCountTable rows={data.foodFrequency} />

        <Text style={styles.sectionTitle}>Mood</Text>
        <View style={styles.statsRow}>
          {(["happy", "content", "unhappy"] as const).map((mood) => (
            <StatTile
              key={mood}
              label={moodLabel[mood]}
              value={`${data.moodCounts.find((m) => m.mood === mood)?.count ?? 0}`}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Symptoms</Text>
        <View style={styles.statsRow}>
          <StatTile label="Entries logged" value={`${data.symptomSeries.length}`} />
          <StatTile label="Avg Bristol type" value={avgBristol} />
          <StatTile label="Avg severity (0-5)" value={avgSeverity} />
        </View>

        <Text style={styles.sectionTitle}>Weight</Text>
        {firstWeight && lastWeight ? (
          <View style={styles.statsRow}>
            <StatTile label="Start" value={`${firstWeight.weightKg} kg`} />
            <StatTile label="Latest" value={`${lastWeight.weightKg} kg`} />
            <StatTile
              label="Change"
              value={`${(lastWeight.weightKg - firstWeight.weightKg > 0 ? "+" : "") + round1(lastWeight.weightKg - firstWeight.weightKg)} kg`}
            />
          </View>
        ) : (
          <Text style={{ color: "#6b6178" }}>No weigh-ins logged in this period.</Text>
        )}

        <Text style={styles.sectionTitle}>Medication doses logged</Text>
        <NameCountTable rows={data.medicationCounts} />

        <Text style={styles.footer}>
          Generated by The Crohnicles on {format(new Date(), "d MMM yyyy 'at' HH:mm")}.
        </Text>
      </Page>
    </Document>
  );
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
