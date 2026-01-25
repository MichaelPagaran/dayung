import { Roboto_Flex } from "next/font/google";

// Main Variable Font: Roboto Flex
// Supports: "GRAD" (Grade), "wdth" (Width), "wght" (Weight), "slnt" (Slant), "opsz" (Optical Size)
// We export this as a single font variable that covers both body and headings.
export const fontMain = Roboto_Flex({
    subsets: ["latin"],
    variable: "--font-roboto-flex",
    display: "swap",
    axes: ["opsz", "slnt", "wdth", "GRAD"],
});

