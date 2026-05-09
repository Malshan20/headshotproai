import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "PortraifyAI — Professional AI Portraits in Seconds",
  description:
    "Transform any selfie into a stunning, professional headshot using AI. Look confident, polished, and ready for career success.",
  keywords: ["AI headshot", "professional photo", "LinkedIn photo", "career photo", "AI portrait"],
  openGraph: {
    title: "PortraifyAI — Professional AI Portraits",
    description: "Transform any selfie into a stunning professional headshot with AI.",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0e1a" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
