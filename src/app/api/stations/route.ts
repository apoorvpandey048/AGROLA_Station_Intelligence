import { NextResponse } from "next/server";
import { STATIONS } from "@/lib/data/stations";

export async function GET() {
  return NextResponse.json({
    status: "success",
    timestamp: new Date().toISOString(),
    count: STATIONS.length,
    stations: STATIONS,
  });
}
