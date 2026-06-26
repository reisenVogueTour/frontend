import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/shared/header";
import Footer from "../components/shared/footer";

const satoshi = localFont({
  variable: "--font-satoshi",
  display: "swap",
  src: [
    { path: "../public/Satoshi-Light.otf", weight: "300", style: "normal" },
    {
      path: "../public/Satoshi-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    { path: "../public/Satoshi-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/Satoshi-Italic.otf", weight: "400", style: "italic" },
    { path: "../public/Satoshi-Medium.otf", weight: "500", style: "normal" },
    {
      path: "../public/Satoshi-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    { path: "../public/Satoshi-Bold.otf", weight: "700", style: "normal" },
    {
      path: "../public/Satoshi-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    { path: "../public/Satoshi-Black.otf", weight: "900", style: "normal" },
    {
      path: "../public/Satoshi-BlackItalic.otf",
      weight: "900",
      style: "italic",
    },
  ],
});

const cabinetGrotesk = localFont({
  variable: "--font-cabinet-grotesk",
  display: "swap",
  src: [
    {
      path: "../public/CabinetGrotesk-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/CabinetGrotesk-Extralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/CabinetGrotesk-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/CabinetGrotesk-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/CabinetGrotesk-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/CabinetGrotesk-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/CabinetGrotesk-Extrabold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/CabinetGrotesk-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Reisen",
  description:
    "Whether your interests are vinyl shops or hidden hiking trails, Reisen builds a trip around it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${cabinetGrotesk.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
