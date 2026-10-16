import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGROLA | Station Intelligence — Enterprise Tankstellen Cockpit",
  description:
    "Strategische BI-Plattform für Schweizer Tankstellennetzwerke: Absatzanalysen, Preisdynamiken, Deckungsbeiträge und prädiktive Szenariomodelle.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2222%22 fill=%22%23173D30%22/><text y=%2270%22 font-size=%2260%22 font-weight=%22900%22 fill=%22%23B8D96B%22 x=%2228%22 font-family=%22sans-serif%22>A</text></svg>" />
      </head>
      <body className="min-h-screen bg-agrola-canvas text-agrola-ink selection:bg-agrola-lime selection:text-agrola-forest">
        {children}
      </body>
    </html>
  );
}
