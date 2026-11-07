import type { Metadata } from "next";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Rabalata Rides | Your Journey. Your Choice. Your Ride.",
  description: "Book shuttle rides, negotiate fares and follow your driver in real time."
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en-ZA"><body><SiteHeader />{children}<footer className="footer"><b>RABALATA RIDES</b><span>Your Journey. Your Choice. Your Ride.</span><span>Developed by Otsile Graphics © 2026</span></footer></body></html>;
}
