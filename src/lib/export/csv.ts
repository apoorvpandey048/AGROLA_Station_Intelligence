import { DailyRecord } from "@/types";
import { STATIONS } from "../data/stations";

export function generateCsvExport(
  records: DailyRecord[],
  delimiter: ";" | "," = ";"
): string {
  const stationMap = new Map();
  STATIONS.forEach((s) => stationMap.set(s.id, s));

  const headers = [
    "Datum",
    "Station_ID",
    "Station_Name",
    "Kanton",
    "Region",
    "Standorttyp",
    "Treibstoff",
    "Absatz_Liter",
    "Verkaufspreis_CHF_pro_L",
    "Einkaufspreis_CHF_pro_L",
    "Margenspanne_CHF_pro_L",
    "Umsatz_CHF",
    "Bruttomarge_CHF",
    "Marge_Prozent",
    "Betriebskosten_CHF",
    "Operativer_Gewinn_CHF",
  ];

  const escapeCell = (val: string | number | undefined): string => {
    if (val === undefined || val === null) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows: string[] = [];
  rows.push(headers.map(escapeCell).join(delimiter));

  for (const r of records) {
    const s = stationMap.get(r.stationId);
    const spread = +(r.retailPricePerLiter - r.procurementCostPerLiter).toFixed(4);

    const row = [
      r.date,
      r.stationId,
      s?.name ?? r.stationId,
      s?.canton ?? "",
      s?.region ?? "",
      s?.type ?? "",
      r.fuelType,
      r.volumeLiters.toFixed(0),
      r.retailPricePerLiter.toFixed(4),
      r.procurementCostPerLiter.toFixed(4),
      spread.toFixed(4),
      r.revenue.toFixed(2),
      r.grossMargin.toFixed(2),
      r.marginPercent.toFixed(2) + "%",
      r.operatingCost.toFixed(2),
      r.netOperatingProfit.toFixed(2),
    ];

    rows.push(row.map(escapeCell).join(delimiter));
  }

  // Prepend UTF-8 BOM so Microsoft Excel interprets characters cleanly
  return "\uFEFF" + rows.join("\r\n");
}

export function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
