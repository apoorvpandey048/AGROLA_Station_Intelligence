export type SwissRegion =
  | "Nordwestschweiz"
  | "Mittelland"
  | "Zürich / Ost"
  | "Zentralschweiz"
  | "Romandie"
  | "Tessin";

export type FuelType = "Benzin 95" | "Benzin 98" | "Diesel";

export type StationType = "Autobahn" | "Hauptstrasse" | "Gewerbezone" | "Stadt";

export interface Station {
  id: string;
  name: string;
  city: string;
  canton: string;
  region: SwissRegion;
  lat: number;
  lng: number;
  type: StationType;
  pumpsCount: number;
  hasShop: boolean;
  hasCarWash: boolean;
  evCharging: boolean;
  baseVolumeFactor: number;
  dieselShareFactor: number;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  stationId: string;
  fuelType: FuelType;
  volumeLiters: number;
  retailPricePerLiter: number;
  procurementCostPerLiter: number;
  revenue: number;
  grossMargin: number;
  marginPercent: number;
  operatingCost: number;
  netOperatingProfit: number;
}

export interface FuelProductMetric {
  fuelType: FuelType;
  volume: number;
  revenue: number;
  grossMargin: number;
  marginPercent: number;
  avgRetailPrice: number;
  avgProcurementCost: number;
  spread: number;
  volumeShare: number;
  revenueShare: number;
}

export interface AggregatedStationMetrics {
  station: Station;
  totalVolume: number;
  totalRevenue: number;
  totalGrossMargin: number;
  avgMarginPercent: number;
  weightedAvgPrice: number;
  weightedAvgCost: number;
  avgSpread: number;
  operatingCost: number;
  netOperatingProfit: number;
  // Comparisons vs preceding period
  prevVolume: number;
  prevRevenue: number;
  prevGrossMargin: number;
  volumeGrowthPct: number;
  revenueGrowthPct: number;
  marginGrowthPct: number;
  // Product breakdown
  products: Record<FuelType, FuelProductMetric>;
  // Regional benchmark diff
  revenueVsRegionAvgPct: number;
  volumeVsRegionAvgPct: number;
}

export interface RegionalBenchmark {
  region: SwissRegion;
  stationCount: number;
  totalRevenue: number;
  totalVolume: number;
  totalGrossMargin: number;
  avgMarginPercent: number;
  avgRetailPrice: number;
  shareOfNetworkRevenue: number;
  shareOfNetworkVolume: number;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  revenue: number;
  volume: number;
  grossMargin: number;
  avgPrice: number;
  prevRevenue?: number;
  prevVolume?: number;
  prevMargin?: number;
}

export interface PerformanceException {
  id: string;
  stationId: string;
  stationName: string;
  region: SwissRegion;
  severity: "critical" | "warning" | "opportunity";
  badge: string;
  title: string;
  description: string;
  impactMetric: string;
  impactValue: string;
}

export interface NetworkSummary {
  activeStationsCount: number;
  totalRevenue: number;
  totalVolume: number;
  weightedAvgPrice: number;
  totalGrossMargin: number;
  avgMarginPercent: number;
  netOperatingProfit: number;
  // Prior period comparisons
  prevRevenue: number;
  prevVolume: number;
  prevGrossMargin: number;
  revenueGrowthPct: number;
  volumeGrowthPct: number;
  marginGrowthPct: number;
  // Sub-aggregations
  rankings: AggregatedStationMetrics[];
  regionalBenchmarks: RegionalBenchmark[];
  productMix: FuelProductMetric[];
  timeSeries: TimeSeriesPoint[];
  exceptions: PerformanceException[];
}

export type PeriodFilter = "30" | "90" | "365";

export interface FilterState {
  region: "all" | SwissRegion;
  stationId: "all" | string;
  fuelType: "all" | FuelType;
  period: PeriodFilter;
  metricMode: "revenue" | "volume" | "margin" | "price";
}

export interface ForecastScenarioConfig {
  horizonDays: 30 | 60 | 90;
  priceDeltaPerLiter: number; // e.g. -0.05 to +0.05 CHF
  costDeltaPerLiter: number;  // assumed supplier procurement shift
  elasticityCoefficient: number; // e.g. -0.35 (price elasticity of demand)
  scenarioType: "baseline" | "downside" | "upside";
}

export interface ForecastPoint {
  date: string;
  label: string;
  isProjected: boolean;
  baselineRevenue: number;
  baselineVolume: number;
  baselineMargin: number;
  scenarioRevenue: number;
  scenarioVolume: number;
  scenarioMargin: number;
  downsideRevenue: number;
  upsideRevenue: number;
}
