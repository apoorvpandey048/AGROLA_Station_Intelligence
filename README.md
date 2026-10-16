# AGROLA Station Intelligence | Enterprise Tankstellen Cockpit

> **Premium Enterprise BI & GIS Analytics Platform for Swiss Energy & Fuel Retail**  
> Konzeptionelle Verkaufsdemonstration & Executive Cockpit für das Schweizer AGROLA Tankstellennetzwerk.

---

## 1. Übersicht & Zielsetzung

Die **AGROLA Station Intelligence Plattform** ist ein hochentwickeltes Business-Intelligence-Cockpit, zugeschnitten auf die spezifischen Anforderungen des Schweizer Kraftstoff- und Tankstellenmarkts. Es verbindet Schweizer Industriepräzision, redaktionelle Datenvisualisierung und fundierte Handelsspannenlogik.

Im Gegensatz zu statischen Mockups basiert dieses Cockpit auf einer **vollständig reconcilierten Berechnungsarchitektur**: Sämtliche Kennzahlen, Rankings, Zeitreihen, Margen, Produktmixe und Exporte leiten sich deterministisch aus täglichen Einzelbeobachtungen über 365 Tage ab.

---

## 2. Visuelle Identität & Design-System

* **Farbpalette:**
  * Waldgrün (*AGROLA Forest*): `#173D30` & `#0E2920` (Markenanker & Primärstruktur)
  * Ink & Graphit: `#182620` (Text & Display-Elemente)
  * Warme Canvas: `#F4F5F1` (Redaktioneller Hintergrund)
  * Akzent Limette (*AGROLA Lime*): `#B8D96B` (Präzise Highlights & Indikatoren)
  * Spannen-Bernstein (*Amber*): `#D9822B` (Preise, Alerts & Selektionen)
  * Smaragdgrün: `#237A4B` (Margenperformance & DB-Werte)
* **Typografie:**
  * `IBM Plex Sans` / `Plus Jakarta Sans` für hierarchische Benutzeroberfläche
  * Tabellarische Ziffern (`tabular-nums`) für exakte visuelle Ausrichtung aller Beträge
  * `IBM Plex Mono` für Währungswerte, Mengen (L) und Spannen
* **Kartografie:**
  * Interaktive Schweizer Landeskarte mit Leaflet (CartoDB Voyager/Positron)
  * Koordinatengetreue Verortung (WGS84 CH) von 28 Demonstrationsstationen
  * Metrikgesteuerte Pins mit Skalierung nach Umsatz, Absatz, Bruttomarge oder Preis

---

## 3. Kernmodule der Anwendung

### A. Netzwerk-Übersicht (`/`)
* **Executive KPI-Grid:** Gesamtumsatz (CHF), Treibstoffabsatz (L), gewichteter Ø Verkaufspreis (CHF/L), Bruttomarge (CHF und %), operativer Deckungsbeitrag (DB II) sowie aktive Standorte.
* **Period-over-Period Delta:** Automatischer Vergleich mit dem unmittelbar vorangehenden Zeitraum gleicher Dauer (nicht fest verdrahtet).
* **Interaktive Schweizer Karte & Ranking-Panel:** Synchronisierte Selektion – ein Klick auf der Karte oder im Ranking fokussiert die Station beidseitig.
* **Operative Ausnahmen (Disposition):** Automatische Erkennung von Margendruck, Wachstumsspitzen und regionalen Ausreißern.
* **Zeitreihenanalyse:** Recharts-Flächendiagramm mit Vorperioden-Overlay (gestrichelte Linie).
* **Produktmix:** Benzin 95, Benzin 98 und Diesel mit Umsatzanteilen, Einstandspreisen und Margenspannen.
* **Regionale Wirtschaftsräume:** Benchmark-Vergleich der 6 Schweizer Großregionen.

### B. Geografisches Informationssystem (`Interaktive Karte`)
* Dedizierte GIS-Kartenansicht mit Metrik-Umschaltung (*Umsatz*, *Absatz*, *Marge %*, *Ø Preis*).
* Standortverzeichnis mit Live-Volltextsuche nach Ort, Kanton oder Stationstyp (*Autobahn*, *Stadt*, *Hauptstrasse*, *Gewerbezone*).

### C. Standortanalyse & Vergleich (`Standortanalyse`)
* Tiefenprüfung einzelner Stationen mit Ausstattungsprofil (TopShop, Waschanlage, Fast-EV Lader).
* Produktmix-Rentabilität auf Standortebene.
* **Multi-Standortvergleich:** Gleichzeitiger, tabellarischer und grafischer Vergleich von bis zu **3 Tankstellen**.

### D. Preise & Margenspannen (`Preise & Margen`)
* Strikte architektonische Trennung von **Endverbraucher-Verkaufspreis (Retail Price)** und **Einstandspreis (Procurement Cost)**.
* Spannenanalyse (*Handelsspanne CHF/L*) über alle Standorte für Benzin 95, Benzin 98 und Diesel.

### E. Prognose & Preisszenario-Simulator (`Prognose & Szenarien`)
* Prädiktive Disposition über +30, +60 oder +90 Tage.
* Interaktiver Schieberegler für hypothetische Preisanpassungen ($\pm 0.08$ CHF/L).
* Einstellbare Preiselastizität der Nachfrage ($\varepsilon = -0.35$ als Schweizer Treibstoffstandard).
* Formelbasierte Ausweisung der Mengen- und Deckungsbeitragseffekte.

---

## 4. REST API Endpunkte

Die Plattform stellt integrierte Next.js App Router Route Handlers bereit:

| Methode | Endpunkt | Beschreibung | Parameter |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/stations` | Liefert alle 28 Schweizer Stationen mit Stammdaten | — |
| `GET` | `/api/stations/[id]` | Detaildaten & Performance einer Station | `?period=30\|90\|365` |
| `GET` | `/api/analytics` | Aggregierte Netzwerk-Analytik & Zeitreihen | `?region=...&stationId=...&fuelType=...&period=30\|90\|365` |

**Beispiel-Aufruf:**
```bash
curl http://localhost:3000/api/analytics?period=30&region=Mittelland
```

---

## 5. Mathematische Berechnungsdefinitionen

1. **Umsatz (CHF):**
   $$\text{Revenue} = \sum (\text{VolumeLiters} \times \text{RetailPricePerLiter})$$

2. **Bruttomarge (CHF) & Margenspanne:**
   $$\text{GrossMargin} = \text{Revenue} - \sum (\text{VolumeLiters} \times \text{ProcurementCostPerLiter})$$
   $$\text{Spread (CHF/L)} = \text{RetailPrice} - \text{ProcurementCost}$$

3. **Bruttomargenquote (%):**
   $$\text{MarginPercent} = \frac{\text{GrossMargin}}{\text{Revenue}} \times 100$$

4. **Operativer Deckungsbeitrag (DB II):**
   $$\text{OperatingProfit} = \text{GrossMargin} - (\text{FixedStationOverhead} + \text{VolumeLiters} \times 0.022\text{ CHF})$$

5. **Absatzgewichteter Durchschnittspreis:**
   $$\bar{P} = \frac{\sum \text{Revenue}}{\sum \text{VolumeLiters}}$$

6. **Preiselastizitäts-Szenario:**
   $$\Delta \text{Volume}\% = \varepsilon \times \left( \frac{\Delta \text{Price}}{\bar{P}_{\text{Basis}}} \right)$$

---

## 6. Installation & Lokale Ausführung

### Voraussetzungen
* Node.js $\ge 18$ (getestet mit v22.13.0)
* npm $\ge 10$

### 1. Abhängigkeiten installieren
```bash
npm install
```

### 2. Entwicklungsserver starten
```bash
npm run dev
```
Das Dashboard ist anschließend erreichbar unter: `http://localhost:3000`.

### 3. Produktions-Build erstellen & starten
```bash
npm run build
npx next start -p 3000
```

---

## 7. CSV-Export Spezifikation

* **Format:** RFC-konformes CSV mit UTF-8 Byte Order Mark (`\uFEFF`) für native Microsoft Excel-Kompatibilität im Schweizer/deutschen Sprachraum.
* **Trennzeichen:** Semikolon (`;`).
* **Inhalt:** Dynamisch generiert aus dem aktuell aktiven Filtersatz (keine statische Beispieldatei).
* **Felder:** `Datum`, `Station_ID`, `Station_Name`, `Kanton`, `Region`, `Standorttyp`, `Treibstoff`, `Absatz_Liter`, `Verkaufspreis_CHF_pro_L`, `Einkaufspreis_CHF_pro_L`, `Margenspanne_CHF_pro_L`, `Umsatz_CHF`, `Bruttomarge_CHF`, `Marge_Prozent`, `Betriebskosten_CHF`, `Operativer_Gewinn_CHF`.

---

## 8. Zukünftiger Integrationspfad (Real-Data Transition)

Die Codebasis ist bewusst so modular aufgebaut, dass die Datengenerierung in `src/lib/data/generator.ts` ohne Änderungen an der Benutzeroberfläche durch reale Datenquellen ersetzt werden kann:
1. **ERP / SAP-Konnektor:** Anbindung der Transaktionsdaten über OData oder REST in `src/lib/analytics/calculations.ts`.
2. **Kassensysteme (POS / Tokheim / Gilbarco):** Streaming von Tagesabschlüssen direkt in die Aggregations-Pipeline.
3. **Automatisierte Marktpreis-Feeds:** Integration externer Preisspiegel (z.B. TCS, internationale Rohöl-Spotmärkte) über Serverless Cron Jobs.
4. **Authentifizierung & Mandantenfähigkeit:** NextAuth.js oder Azure AD für rollenbasierte Zugriffe (z.B. Regionalleiter vs. Geschäftsleitung).
