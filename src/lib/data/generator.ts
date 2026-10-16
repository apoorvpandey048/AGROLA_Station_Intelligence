import { DailyRecord, FuelType, Station } from "@/types";
import { STATIONS } from "./stations";

// Deterministic Mulberry32 PRNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 20261016; // Deterministic seed

export interface GenerationConfig {
  daysCount?: number;
  referenceDate?: Date;
}

// Generate the 365-day dataset deterministically
export function generateSyntheticDataset(
  config: GenerationConfig = {}
): DailyRecord[] {
  const days = config.daysCount ?? 365;
  // Use fixed reference date: 2026-10-15
  const refDate = config.referenceDate ?? new Date("2026-10-15T00:00:00Z");
  const rng = mulberry32(SEED);

  const records: DailyRecord[] = [];
  const fuelTypes: FuelType[] = ["Benzin 95", "Benzin 98", "Diesel"];

  for (let d = days - 1; d >= 0; d--) {
    const curDate = new Date(refDate.getTime() - d * 24 * 60 * 60 * 1000);
    const dateStr = curDate.toISOString().slice(0, 10);
    const dayOfWeek = curDate.getUTCDay(); // 0 is Sun, 6 is Sat
    const dayOfYear = Math.floor(
      (curDate.getTime() - new Date(curDate.getUTCFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Day of week seasonality
    let dayMultiplier = 1.0;
    if (dayOfWeek === 5) dayMultiplier = 1.18; // Friday traffic rush
    else if (dayOfWeek === 1) dayMultiplier = 1.08; // Monday commute
    else if (dayOfWeek === 6) dayMultiplier = 1.12; // Saturday leisure/shopping
    else if (dayOfWeek === 0) dayMultiplier = 0.82; // Sunday quiet
    else dayMultiplier = 1.02; // Tue-Thu

    // Annual seasonal trend (summer peak, winter dip with oil heating demand in diesel)
    const annualSeasonality =
      1.0 + 0.08 * Math.sin(((dayOfYear - 80) / 365) * 2 * Math.PI);

    // Global oil price index variation across the year (simulating crude oil market cycle)
    const crudeCycle =
      0.06 * Math.sin(((dayOfYear + 40) / 180) * Math.PI) +
      0.03 * Math.cos(((dayOfYear - 100) / 120) * Math.PI);

    for (const station of STATIONS) {
      // Station regional base pricing adjustment
      let regionPriceDelta = 0;
      if (station.region === "Romandie") regionPriceDelta = +0.025;
      else if (station.region === "Zürich / Ost") regionPriceDelta = +0.015;
      else if (station.region === "Tessin") regionPriceDelta = +0.01;
      else if (station.region === "Mittelland") regionPriceDelta = -0.015;

      // Station type pricing premium (Autobahn has higher margin and retail price)
      const stationTypePremium =
        station.type === "Autobahn"
          ? 0.05
          : station.type === "Stadt"
          ? 0.02
          : 0.0;

      // Station base daily volume (around 3,200 to 7,500 L total per day depending on pumps and location)
      const baseDailyTotal =
        (2800 + station.pumpsCount * 360) * station.baseVolumeFactor;

      // Station random day noise (±6%)
      const stationNoise = 0.94 + rng() * 0.12;
      const totalStationVolume =
        baseDailyTotal * dayMultiplier * annualSeasonality * stationNoise;

      // Split volume across products:
      // Diesel share varies by station
      const dieselShare = station.dieselShareFactor;
      // Remainder split: Benzin 95 takes ~75-80% of remaining, Benzin 98 takes ~20-25%
      const nonDieselShare = 1 - dieselShare;
      const b95Share = nonDieselShare * 0.78;
      const b98Share = nonDieselShare * 0.22;

      const productVolumes: Record<FuelType, number> = {
        Diesel: Math.round(totalStationVolume * dieselShare),
        "Benzin 95": Math.round(totalStationVolume * b95Share),
        "Benzin 98": Math.round(totalStationVolume * b98Share),
      };

      for (const fuel of fuelTypes) {
        const volumeLiters = productVolumes[fuel];

        // Realistic Swiss baseline prices (CHF / Litre)
        let baseCost = 1.54;
        let baseMarginSpread = 0.23;

        if (fuel === "Benzin 95") {
          baseCost = 1.52 + crudeCycle;
          baseMarginSpread = 0.22;
        } else if (fuel === "Benzin 98") {
          baseCost = 1.62 + crudeCycle * 1.05;
          baseMarginSpread = 0.27; // Premium fuel higher margin
        } else if (fuel === "Diesel") {
          baseCost = 1.58 + crudeCycle * 0.95;
          baseMarginSpread = 0.24;
        }

        // Noise on procurement cost (daily refinery spot variations)
        const dailyCostNoise = (rng() - 0.5) * 0.02;
        const procurementCostPerLiter = +(baseCost + dailyCostNoise).toFixed(4);

        // Retail price = procurement cost + margin spread + region/type adjustments + retail micro-variance
        const dailyMarginNoise = (rng() - 0.5) * 0.015;
        const targetMargin = Math.max(
          0.14,
          baseMarginSpread + stationTypePremium + dailyMarginNoise
        );
        const retailPricePerLiter = +(
          procurementCostPerLiter +
          targetMargin +
          regionPriceDelta
        ).toFixed(4);

        // Reconciled financial calculations
        const revenue = +(volumeLiters * retailPricePerLiter).toFixed(2);
        const procurementTotal = +(
          volumeLiters * procurementCostPerLiter
        ).toFixed(2);
        const grossMargin = +(revenue - procurementTotal).toFixed(2);
        const marginPercent =
          revenue > 0 ? +((grossMargin / revenue) * 100).toFixed(2) : 0;

        // Operating costs: fixed station overhead allocation + logistics/handling cost ~0.022 CHF/L
        const dailyFixedStationOverhead = (160 + station.pumpsCount * 18) / 3; // divided across 3 fuel streams
        const variableLogisticsCost = volumeLiters * 0.022;
        const operatingCost = +(
          dailyFixedStationOverhead + variableLogisticsCost
        ).toFixed(2);
        const netOperatingProfit = +(grossMargin - operatingCost).toFixed(2);

        records.push({
          date: dateStr,
          stationId: station.id,
          fuelType: fuel,
          volumeLiters,
          retailPricePerLiter,
          procurementCostPerLiter,
          revenue,
          grossMargin,
          marginPercent,
          operatingCost,
          netOperatingProfit,
        });
      }
    }
  }

  return records;
}

// In-memory cached dataset instance
let cachedDataset: DailyRecord[] | null = null;

export function getSyntheticDataset(): DailyRecord[] {
  if (!cachedDataset) {
    cachedDataset = generateSyntheticDataset();
  }
  return cachedDataset;
}
