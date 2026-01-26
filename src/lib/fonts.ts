import { Geist } from "next/font/google";
import { Inter } from "next/font/google";

// Geist Sans: Modern, geometric font for headings and navigation
// Used for: H1 (800), H2-H3 (600), Navigation (500)
export const fontHeading = Geist({
    subsets: ["latin"],
    variable: "--font-heading",
    display: "swap",
    weight: ["500", "600", "800"],
});

// Inter Variable: Highly readable font for data and body text
// Used for: Data/Ledgers (400, tabular-nums), Labels (600)
export const fontBody = Inter({
    subsets: ["latin"],
    variable: "--font-body",
    display: "swap",
});

// Combined class for applying both font variables
export const fontVariables = `${fontHeading.variable} ${fontBody.variable}`;
