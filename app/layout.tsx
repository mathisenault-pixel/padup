import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReservationProvider } from "@/state/ReservationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pad'Up - Réservez vos terrains de padel",
    template: "%s | Pad'Up"
  },
  description: "Réservez facilement vos terrains de padel. Trouvez les meilleurs clubs autour de vous et gérez vos réservations en ligne.",
  keywords: ["padel", "réservation", "terrain", "club", "sport"],
  icons: {
    icon: "/icon-v2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReservationProvider>
          {children}
        </ReservationProvider>
      </body>
    </html>
  );
}
