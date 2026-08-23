import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

const description =
  "Construisez le mix électrique français de 2050 dans les bornes industrielles décrites par RTE, et voyez ce que chaque choix implique.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mix.climatelab.fr"),
  title: "Mix, le simulateur du mix électrique de 2050",
  description,
  icons: {
    icon: "https://em-content.zobj.net/source/apple/354/high-voltage_26a1.png",
  },
  openGraph: {
    title: "Mix",
    description,
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Mix",
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
