import {
  AggregatedStationMetrics,
  DailyRecord,
  FilterState,
  ForecastPoint,
  ForecastScenarioConfig,
  FuelProductMetric,
  FuelType,
  NetworkSummary,
  PerformanceException,
  PeriodFilter,
  RegionalBenchmark,
  Station,
  SwissRegion,
  TimeSeriesPoint,
} from "@/types";
import { STATIONS } from "../data/stations";

// Helper to filter raw daily records based on FilterState
export function filterDataset(
  records: DailyRecord[],
  filters: FilterState
): { currentRecords: DailyRecord[]; prevRecords: DailyRecord[] } {
  // Sort dates descending to identify reference period
  // We know the dataset has 365 days up to 2026-10-15
  const uniqueDates = Array.from(new Set(records.map((r) => r.date))).sort(
    (a, b) => b.localeCompare(a)
  );

  const periodDays = parseInt(filters.period, 10) || 30;
  const currentDates = uniqueDates.slice(0, periodDays);
  const prevDates = uniqueDates.slice(periodDays, periodDays * 2);

  const currentDateSet = new Set(currentDates);
  const prevDateSet = new Set(prevDates);

  // Map station to region for fast lookup
  const stationMap = new Map<string, Station>();
  STATIONS.forEach((s) => stationMap.set(s.id, s));

  const matchFilter = (r: DailyRecord): boolean => {
    if (filters.stationId !== "all" && r.stationId !== filters.stationId) {
      return false;
    }
    if (filters.region !== "all") {
      const station = stationMap.get(r.stationId);
      if (!station || station.region !== filters.region) {
        return false;
      }
    }
    if (filters.fuelType !== "all" && r.fuelType !== filters.fuelType) {
      return false;
    }
    return true;
  };

  const currentRecords = records.filter(
    (r) => currentDateSet.has(r.date) && matchFilter(r)
  );
  const prevRecords = records.filter(
    (r) => prevDateSet.has(r.date) && matchFilter(r)
  );

  return { currentRecords, prevRecords };
}

// Compute comprehensive network summary
export function computeNetworkSummary(
  currentRecords: DailyRecord[],
  prevRecords: DailyRecord[],
  filters: FilterState
): NetworkSummary {
  // Active stations based on current filters
  const stationMap = new Map<string, Station>();
  STATIONS.forEach((s) => stationMap.set(s.id, s));

  const activeStationIds = new Set(currentRecords.map((r) => r.stationId));
  const activeStations = STATIONS.filter((s) => {
    if (filters.stationId !== "all" && s.id !== filters.stationId) return false;
    if (filters.region !== "all" && s.region !== filters.region) return false;
    return activeStationIds.has(s.id) || filters.stationId === s.id;
  });

  // Current aggregate sums
  let totalRevenue = 0;
  let totalVolume = 0;
  let totalGrossMargin = 0;
  let totalOperatingCost = 0;

  for (const r of currentRecords) {
    totalRevenue += r.revenue;
    totalVolume += r.volumeLiters;
    totalGrossMargin += r.grossMargin;
    totalOperatingCost += r.operatingCost;
  }

  // Prior period aggregate sums
  let prevRevenue = 0;
  let prevVolume = 0;
  let prevGrossMargin = 0;

  for (const r of prevRecords) {
    prevRevenue += r.revenue;
    prevVolume += r.volumeLiters;
    prevGrossMargin += r.grossMargin;
  }

  const weightedAvgPrice = totalVolume > 0 ? totalRevenue / totalVolume : 0;
  const avgMarginPercent =
    totalRevenue > 0 ? (totalGrossMargin / totalRevenue) * 100 : 0;
  const netOperatingProfit = totalGrossMargin - totalOperatingCost;

  const revenueGrowthPct =
    prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const volumeGrowthPct =
    prevVolume > 0 ? ((totalVolume - prevVolume) / prevVolume) * 100 : 0;
  const marginGrowthPct =
    prevGrossMargin > 0
      ? ((totalGrossMargin - prevGrossMargin) / prevGrossMargin) * 100
      : 0;

  // Station Level Aggregation
  const stationMetricsMap = new Map<
    string,
    {
      station: Station;
      volume: number;
      revenue: number;
      margin: number;
      operatingCost: number;
      prevVolume: number;
      prevRevenue: number;
      prevMargin: number;
      products: Record<
        FuelType,
        { volume: number; revenue: number; margin: number; costSum: number }
      >;
    }
  >();

  for (const s of activeStations) {
    stationMetricsMap.set(s.id, {
      station: s,
      volume: 0,
      revenue: 0,
      margin: 0,
      operatingCost: 0,
      prevVolume: 0,
      prevRevenue: 0,
      prevMargin: 0,
      products: {
        "Benzin 95": { volume: 0, revenue: 0, margin: 0, costSum: 0 },
        "Benzin 98": { volume: 0, revenue: 0, margin: 0, costSum: 0 },
        Diesel: { volume: 0, revenue: 0, margin: 0, costSum: 0 },
      },
    });
  }

  for (const r of currentRecords) {
    const entry = stationMetricsMap.get(r.stationId);
    if (entry) {
      entry.volume += r.volumeLiters;
      entry.revenue += r.revenue;
      entry.margin += r.grossMargin;
      entry.operatingCost += r.operatingCost;

      const p = entry.products[r.fuelType];
      if (p) {
        p.volume += r.volumeLiters;
        p.revenue += r.revenue;
        p.margin += r.grossMargin;
        p.costSum += r.volumeLiters * r.procurementCostPerLiter;
      }
    }
  }

  for (const r of prevRecords) {
    const entry = stationMetricsMap.get(r.stationId);
    if (entry) {
      entry.prevVolume += r.volumeLiters;
      entry.prevRevenue += r.revenue;
      entry.prevMargin += r.grossMargin;
    }
  }

  // Calculate regional totals for relative benchmarks
  const regionStats = new Map<
    SwissRegion,
    { revenue: number; volume: number; count: number }
  >();
  for (const val of Array.from(stationMetricsMap.values())) {
    const reg = val.station.region;
    const existing = regionStats.get(reg) || { revenue: 0, volume: 0, count: 0 };
    existing.revenue += val.revenue;
    existing.volume += val.volume;
    existing.count += 1;
    regionStats.set(reg, existing);
  }

  const rankings: AggregatedStationMetrics[] = [];

  for (const val of Array.from(stationMetricsMap.values())) {
    const regAvg = regionStats.get(val.station.region);
    const avgStationRevInRegion =
      regAvg && regAvg.count > 0 ? regAvg.revenue / regAvg.count : val.revenue;
    const avgStationVolInRegion =
      regAvg && regAvg.count > 0 ? regAvg.volume / regAvg.count : val.volume;

    const weightedAvgPrice = val.volume > 0 ? val.revenue / val.volume : 0;
    const totalCost = val.revenue - val.margin;
    const weightedAvgCost = val.volume > 0 ? totalCost / val.volume : 0;
    const avgSpread = weightedAvgPrice - weightedAvgCost;
    const avgMarginPercent =
      val.revenue > 0 ? (val.margin / val.revenue) * 100 : 0;

    const volumeGrowthPct =
      val.prevVolume > 0
        ? ((val.volume - val.prevVolume) / val.prevVolume) * 100
        : 0;
    const revenueGrowthPct =
      val.prevRevenue > 0
        ? ((val.revenue - val.prevRevenue) / val.prevRevenue) * 100
        : 0;
    const marginGrowthPct =
      val.prevMargin > 0
        ? ((val.margin - val.prevMargin) / val.prevMargin) * 100
        : 0;

    const revenueVsRegionAvgPct =
      avgStationRevInRegion > 0
        ? ((val.revenue - avgStationRevInRegion) / avgStationRevInRegion) * 100
        : 0;
    const volumeVsRegionAvgPct =
      avgStationVolInRegion > 0
        ? ((val.volume - avgStationVolInRegion) / avgStationVolInRegion) * 100
        : 0;

    const products: Record<FuelType, FuelProductMetric> = {} as any;
    const fTypes: FuelType[] = ["Benzin 95", "Benzin 98", "Diesel"];
    for (const f of fTypes) {
      const p = val.products[f];
      const avgRetail = p.volume > 0 ? p.revenue / p.volume : 0;
      const avgProcure = p.volume > 0 ? p.costSum / p.volume : 0;
      const marginPct = p.revenue > 0 ? (p.margin / p.revenue) * 100 : 0;

      products[f] = {
        fuelType: f,
        volume: p.volume,
        revenue: p.revenue,
        grossMargin: p.margin,
        marginPercent: marginPct,
        avgRetailPrice: avgRetail,
        avgProcurementCost: avgProcure,
        spread: avgRetail - avgProcure,
        volumeShare: val.volume > 0 ? (p.volume / val.volume) * 100 : 0,
        revenueShare: val.revenue > 0 ? (p.revenue / val.revenue) * 100 : 0,
      };
    }

    rankings.push({
      station: val.station,
      totalVolume: val.volume,
      totalRevenue: val.revenue,
      totalGrossMargin: val.margin,
      avgMarginPercent,
      weightedAvgPrice,
      weightedAvgCost,
      avgSpread,
      operatingCost: val.operatingCost,
      netOperatingProfit: val.margin - val.operatingCost,
      prevVolume: val.prevVolume,
      prevRevenue: val.prevRevenue,
      prevGrossMargin: val.prevMargin,
      volumeGrowthPct,
      revenueGrowthPct,
      marginGrowthPct,
      products,
      revenueVsRegionAvgPct,
      volumeVsRegionAvgPct,
    });
  }

  // Sort rankings descending by revenue by default
  rankings.sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Regional Benchmarks
  const regionalBenchmarks: RegionalBenchmark[] = [];
  const allRegions: SwissRegion[] = [
    "Nordwestschweiz",
    "Mittelland",
    "Zürich / Ost",
    "Zentralschweiz",
    "Romandie",
    "Tessin",
  ];

  for (const reg of allRegions) {
    const regStations = rankings.filter((r) => r.station.region === reg);
    if (regStations.length === 0) continue;

    const rRevenue = regStations.reduce((acc, s) => acc + s.totalRevenue, 0);
    const rVolume = regStations.reduce((acc, s) => acc + s.totalVolume, 0);
    const rMargin = regStations.reduce((acc, s) => acc + s.totalGrossMargin, 0);
    const avgPrice = rVolume > 0 ? rRevenue / rVolume : 0;
    const avgMargin = rRevenue > 0 ? (rMargin / rRevenue) * 100 : 0;

    regionalBenchmarks.push({
      region: reg,
      stationCount: regStations.length,
      totalRevenue: rRevenue,
      totalVolume: rVolume,
      totalGrossMargin: rMargin,
      avgMarginPercent: avgMargin,
      avgRetailPrice: avgPrice,
      shareOfNetworkRevenue:
        totalRevenue > 0 ? (rRevenue / totalRevenue) * 100 : 0,
      shareOfNetworkVolume: totalVolume > 0 ? (rVolume / totalVolume) * 100 : 0,
    });
  }

  // Product Mix
  const productMixMap: Record<
    FuelType,
    { volume: number; revenue: number; margin: number; costSum: number }
  > = {
    "Benzin 95": { volume: 0, revenue: 0, margin: 0, costSum: 0 },
    "Benzin 98": { volume: 0, revenue: 0, margin: 0, costSum: 0 },
    Diesel: { volume: 0, revenue: 0, margin: 0, costSum: 0 },
  };

  for (const r of currentRecords) {
    const p = productMixMap[r.fuelType];
    if (p) {
      p.volume += r.volumeLiters;
      p.revenue += r.revenue;
      p.margin += r.grossMargin;
      p.costSum += r.volumeLiters * r.procurementCostPerLiter;
    }
  }

  const productMix: FuelProductMetric[] = (
    ["Benzin 95", "Benzin 98", "Diesel"] as FuelType[]
  ).map((fuel) => {
    const p = productMixMap[fuel];
    const avgRetail = p.volume > 0 ? p.revenue / p.volume : 0;
    const avgProcure = p.volume > 0 ? p.costSum / p.volume : 0;
    return {
      fuelType: fuel,
      volume: p.volume,
      revenue: p.revenue,
      grossMargin: p.margin,
      marginPercent: p.revenue > 0 ? (p.margin / p.revenue) * 100 : 0,
      avgRetailPrice: avgRetail,
      avgProcurementCost: avgProcure,
      spread: avgRetail - avgProcure,
      volumeShare: totalVolume > 0 ? (p.volume / totalVolume) * 100 : 0,
      revenueShare: totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0,
    };
  });

  // Time Series (aggregated by date)
  const dateMap = new Map<
    string,
    { revenue: number; volume: number; margin: number }
  >();
  for (const r of currentRecords) {
    const existing = dateMap.get(r.date) || {
      revenue: 0,
      volume: 0,
      margin: 0,
    };
    existing.revenue += r.revenue;
    existing.volume += r.volumeLiters;
    existing.margin += r.grossMargin;
    dateMap.set(r.date, existing);
  }

  // Also collect prior period date buckets aligned chronologically
  const sortedDates = Array.from(dateMap.keys()).sort((a, b) =>
    a.localeCompare(b)
  );
  const prevDateMap = new Map<
    string,
    { revenue: number; volume: number; margin: number }
  >();
  for (const r of prevRecords) {
    const existing = prevDateMap.get(r.date) || {
      revenue: 0,
      volume: 0,
      margin: 0,
    };
    existing.revenue += r.revenue;
    existing.volume += r.volumeLiters;
    existing.margin += r.grossMargin;
    prevDateMap.set(r.date, existing);
  }
  const sortedPrevDates = Array.from(prevDateMap.keys()).sort((a, b) =>
    a.localeCompare(b)
  );

  const timeSeries: TimeSeriesPoint[] = sortedDates.map((date, idx) => {
    const cur = dateMap.get(date)!;
    const prevDate = sortedPrevDates[idx];
    const prev = prevDate ? prevDateMap.get(prevDate) : undefined;
    const dObj = new Date(date);
    const day = dObj.getDate();
    const month = dObj.toLocaleString("de-CH", { month: "short" });

    return {
      date,
      label: `${day}. ${month}`,
      revenue: Math.round(cur.revenue),
      volume: Math.round(cur.volume),
      grossMargin: Math.round(cur.margin),
      avgPrice: cur.volume > 0 ? +(cur.revenue / cur.volume).toFixed(3) : 0,
      prevRevenue: prev ? Math.round(prev.revenue) : undefined,
      prevVolume: prev ? Math.round(prev.volume) : undefined,
      prevMargin: prev ? Math.round(prev.margin) : undefined,
    };
  });

  // Performance Exceptions Engine: Real calculated anomalies
  const exceptions: PerformanceException[] = [];

  // 1. Identify highest margin station (efficiency outperformer)
  const highestMarginStation = [...rankings].sort(
    (a, b) => b.avgMarginPercent - a.avgMarginPercent
  )[0];
  if (highestMarginStation) {
    exceptions.push({
      id: "exc-1",
      stationId: highestMarginStation.station.id,
      stationName: highestMarginStation.station.name,
      region: highestMarginStation.station.region,
      severity: "opportunity",
      badge: "Höchste Marge",
      title: "Überdurchschnittliche Margenrealisierung",
      description: `Erzielt mit ${highestMarginStation.avgMarginPercent.toFixed(
        1
      )}% Bruttomarge den Spitzenwert im gefilterten Netzwerk durch günstigen Produktmix.`,
      impactMetric: "Bruttomarge",
      impactValue: `${highestMarginStation.avgMarginPercent.toFixed(1)}%`,
    });
  }

  // 2. Identify station with strongest growth
  const topGrowthStation = [...rankings].sort(
    (a, b) => b.revenueGrowthPct - a.revenueGrowthPct
  )[0];
  if (topGrowthStation && topGrowthStation.revenueGrowthPct > 3) {
    exceptions.push({
      id: "exc-2",
      stationId: topGrowthStation.station.id,
      stationName: topGrowthStation.station.name,
      region: topGrowthStation.station.region,
      severity: "opportunity",
      badge: "Absatz-Wachstum",
      title: "Stärkste Wachstumsdynamik vs. Vorperiode",
      description: `Umsatzanstieg um +${topGrowthStation.revenueGrowthPct.toFixed(
        1
      )}% gegenüber dem vorherigen Vergleichszeitraum.`,
      impactMetric: "Δ Umsatz",
      impactValue: `+${topGrowthStation.revenueGrowthPct.toFixed(1)}%`,
    });
  }

  // 3. Margin squeeze warning
  const squeezedStation = [...rankings].sort(
    (a, b) => a.marginGrowthPct - b.marginGrowthPct
  )[0];
  if (squeezedStation && squeezedStation.marginGrowthPct < -1.5) {
    exceptions.push({
      id: "exc-3",
      stationId: squeezedStation.station.id,
      stationName: squeezedStation.station.name,
      region: squeezedStation.station.region,
      severity: "critical",
      badge: "Margendruck",
      title: "Kompression der Bruttomarge",
      description: `Rückgang der Bruttomarge um ${squeezedStation.marginGrowthPct.toFixed(
        1
      )}% durch gestiegene Einkaufskosten bei verzögerter Preisanpassung.`,
      impactMetric: "Δ Marge",
      impactValue: `${squeezedStation.marginGrowthPct.toFixed(1)}%`,
    });
  }

  // 4. Regional underperformer warning
  const underperformer = [...rankings].sort(
    (a, b) => a.revenueVsRegionAvgPct - b.revenueVsRegionAvgPct
  )[0];
  if (underperformer && underperformer.revenueVsRegionAvgPct < -15) {
    exceptions.push({
      id: "exc-4",
      stationId: underperformer.station.id,
      stationName: underperformer.station.name,
      region: underperformer.station.region,
      severity: "warning",
      badge: "Regionalrückstand",
      title: "Absatzrückstand gegenüber Regionalschnitt",
      description: `Liegt ${Math.abs(
        underperformer.revenueVsRegionAvgPct
      ).toFixed(1)}% unter dem Durchschnitt der Region ${
        underperformer.station.region
      }. Standortüberprüfung empfohlen.`,
      impactMetric: "vs. Region",
      impactValue: `${underperformer.revenueVsRegionAvgPct.toFixed(1)}%`,
    });
  }

  return {
    activeStationsCount: activeStations.length,
    totalRevenue: Math.round(totalRevenue),
    totalVolume: Math.round(totalVolume),
    weightedAvgPrice: +weightedAvgPrice.toFixed(3),
    totalGrossMargin: Math.round(totalGrossMargin),
    avgMarginPercent: +avgMarginPercent.toFixed(2),
    netOperatingProfit: Math.round(netOperatingProfit),
    prevRevenue: Math.round(prevRevenue),
    prevVolume: Math.round(prevVolume),
    prevGrossMargin: Math.round(prevGrossMargin),
    revenueGrowthPct: +revenueGrowthPct.toFixed(2),
    volumeGrowthPct: +volumeGrowthPct.toFixed(2),
    marginGrowthPct: +marginGrowthPct.toFixed(2),
    rankings,
    regionalBenchmarks,
    productMix,
    timeSeries,
    exceptions,
  };
}

// Pricing Simulator & Predictive Scenario Engine
export function computeScenarioForecast(
  historicalTimeSeries: TimeSeriesPoint[],
  config: ForecastScenarioConfig,
  currentAvgPrice: number,
  currentAvgCost: number
): {
  projectedPoints: ForecastPoint[];
  summary: {
    baselineProjectedRevenue: number;
    scenarioProjectedRevenue: number;
    revenueDelta: number;
    baselineProjectedMargin: number;
    scenarioProjectedMargin: number;
    marginDelta: number;
    volumeDeltaPct: number;
    assumedElasticity: number;
  };
} {
  const horizon = config.horizonDays;
  const recentHistory = historicalTimeSeries.slice(-30);
  const avgDailyRev =
    recentHistory.reduce((s, p) => s + p.revenue, 0) /
    (recentHistory.length || 1);
  const avgDailyVol =
    recentHistory.reduce((s, p) => s + p.volume, 0) /
    (recentHistory.length || 1);
  const avgDailyMargin =
    recentHistory.reduce((s, p) => s + p.grossMargin, 0) /
    (recentHistory.length || 1);

  // Micro-economic price elasticity formula:
  // % delta volume = elasticity * (% delta price)
  const pricePctChange =
    currentAvgPrice > 0 ? config.priceDeltaPerLiter / currentAvgPrice : 0;
  const volumeMultiplier = 1 + config.elasticityCoefficient * pricePctChange;

  const newPrice = currentAvgPrice + config.priceDeltaPerLiter;
  const newCost = currentAvgCost + config.costDeltaPerLiter;
  const newSpread = Math.max(0.05, newPrice - newCost);

  const projectedPoints: ForecastPoint[] = [];

  // Start projection from tomorrow
  const lastDate =
    historicalTimeSeries[historicalTimeSeries.length - 1]?.date ?? "2026-10-15";
  const lastTime = new Date(lastDate).getTime();

  let baselineProjectedRevenue = 0;
  let scenarioProjectedRevenue = 0;
  let baselineProjectedMargin = 0;
  let scenarioProjectedMargin = 0;

  for (let i = 1; i <= horizon; i++) {
    const pDate = new Date(lastTime + i * 24 * 60 * 60 * 1000);
    const dateStr = pDate.toISOString().slice(0, 10);
    const dayOfWeek = pDate.getUTCDay();
    let dayFactor = 1.0;
    if (dayOfWeek === 5) dayFactor = 1.15;
    else if (dayOfWeek === 6) dayFactor = 1.1;
    else if (dayOfWeek === 0) dayFactor = 0.85;

    // Projected baseline with slight seasonal drift
    const seasonalDrift = 1.0 + 0.03 * Math.sin((i / 30) * Math.PI);
    const dayBaseVol = Math.round(avgDailyVol * dayFactor * seasonalDrift);
    const dayBaseRev = Math.round(dayBaseVol * currentAvgPrice);
    const dayBaseMargin = Math.round(
      dayBaseVol * (currentAvgPrice - currentAvgCost)
    );

    // Scenario projection
    const dayScenVol = Math.round(dayBaseVol * volumeMultiplier);
    const dayScenRev = Math.round(dayScenVol * newPrice);
    const dayScenMargin = Math.round(dayScenVol * newSpread);

    // Downside (if market conditions tighten -4% and supply costs rise)
    const downsideRev = Math.round(dayScenRev * 0.94);
    // Upside (if demand elasticity is lower or competitor prices rise +5%)
    const upsideRev = Math.round(dayScenRev * 1.06);

    baselineProjectedRevenue += dayBaseRev;
    scenarioProjectedRevenue += dayScenRev;
    baselineProjectedMargin += dayBaseMargin;
    scenarioProjectedMargin += dayScenMargin;

    const day = pDate.getDate();
    const month = pDate.toLocaleString("de-CH", { month: "short" });

    projectedPoints.push({
      date: dateStr,
      label: `+${i}d (${day}. ${month})`,
      isProjected: true,
      baselineRevenue: dayBaseRev,
      baselineVolume: dayBaseVol,
      baselineMargin: dayBaseMargin,
      scenarioRevenue: dayScenRev,
      scenarioVolume: dayScenVol,
      scenarioMargin: dayScenMargin,
      downsideRevenue: downsideRev,
      upsideRevenue: upsideRev,
    });
  }

  return {
    projectedPoints,
    summary: {
      baselineProjectedRevenue,
      scenarioProjectedRevenue,
      revenueDelta: scenarioProjectedRevenue - baselineProjectedRevenue,
      baselineProjectedMargin,
      scenarioProjectedMargin,
      marginDelta: scenarioProjectedMargin - baselineProjectedMargin,
      volumeDeltaPct: +((volumeMultiplier - 1) * 100).toFixed(2),
      assumedElasticity: config.elasticityCoefficient,
    },
  };
}
