import { NextRequest, NextResponse } from "next/server";
import { FilterState, FuelType, SwissRegion } from "@/types";
import { getSyntheticDataset } from "@/lib/data/generator";
import { computeNetworkSummary, filterDataset } from "@/lib/analytics/calculations";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const region = (searchParams.get("region") as SwissRegion | "all") || "all";
  const stationId = searchParams.get("stationId") || "all";
  const fuelType = (searchParams.get("fuelType") as FuelType | "all") || "all";
  const period = (searchParams.get("period") as "30" | "90" | "365") || "30";
  const metricMode = (searchParams.get("metricMode") as any) || "revenue";

  const filters: FilterState = {
    region,
    stationId,
    fuelType,
    period,
    metricMode,
  };

  const allRecords = getSyntheticDataset();
  const { currentRecords, prevRecords } = filterDataset(allRecords, filters);
  const summary = computeNetworkSummary(currentRecords, prevRecords, filters);

  return NextResponse.json({
    status: "success",
    timestamp: new Date().toISOString(),
    filters,
    summary,
  });
}
