import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import Footer from "./components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const nunito = Nunito({ variable: "--font-nunito", weight: ["600", "700", "800"], subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "КупиПродади - Огласи во Македонија",
  description: "Купи и продај производи локално во Македонија.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mk" className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full max-w-full overflow-x-hidden flex flex-col bg-[#050b17] text-white transition-colors duration-300">
        <ThemeProvider>
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
