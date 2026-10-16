import { NextRequest, NextResponse } from "next/server";
import { STATIONS } from "@/lib/data/stations";
import { getSyntheticDataset } from "@/lib/data/generator";
import { computeNetworkSummary, filterDataset } from "@/lib/analytics/calculations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const stationId = params.id;
  const station = STATIONS.find((s) => s.id === stationId);

  if (!station) {
    return NextResponse.json(
      { status: "error", message: `Station ${stationId} not found` },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") as "30" | "90" | "365") || "30";

  const allRecords = getSyntheticDataset();
  const { currentRecords, prevRecords } = filterDataset(allRecords, {
    region: "all",
    stationId,
    fuelType: "all",
    period,
    metricMode: "revenue",
  });

  const summary = computeNetworkSummary(currentRecords, prevRecords, {
    region: "all",
    stationId,
    fuelType: "all",
    period,
    metricMode: "revenue",
  });

  const stationMetric = summary.rankings.find((r) => r.station.id === stationId);

  return NextResponse.json({
    status: "success",
    timestamp: new Date().toISOString(),
    station,
    period,
    metrics: stationMetric || null,
    timeSeries: summary.timeSeries,
  });
}
