import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "@styles/globals.css";

const robotoSans = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Roboto requires explicit weights
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "700"], // Roboto Mono requires explicit weights
});

export const metadata: Metadata = {
  title: "Takegumi",
  description:
    "View and edit illustrated webtoon panels with text overlays, styling and animations. Designed for Webtoon content with Short Video Format export support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${robotoSans.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
