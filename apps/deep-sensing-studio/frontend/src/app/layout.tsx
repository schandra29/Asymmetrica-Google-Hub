import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import StructuredData from "@/components/landing/StructuredData";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-family-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-family-display",
});

export const metadata: Metadata = {
  title: "Deep-Sensing Studio: Intelligence Beyond Dimensions",
  description: "Quaternion-powered document understanding with Vedic mathematics. Achieve 50% storage savings and 33.5% better outlier detection.",
  openGraph: {
    title: "Deep-Sensing Studio: Intelligence Beyond Dimensions",
    description: "Quaternion-powered document understanding with Vedic mathematics.",
    url: "https://asymmetrica.ai", // Placeholder URL
    siteName: 'Asymmetrica',
    images: [
      {
        url: 'https://asymmetrica.ai/og-image.png', // Placeholder OG image
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deep-Sensing Studio: Intelligence Beyond Dimensions',
    description: 'Quaternion-powered document understanding with Vedic mathematics.',
    images: ['https://asymmetrica.ai/og-image.png'], // Placeholder Twitter image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}