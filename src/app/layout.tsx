import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { Toaster } from "sonner"
import "./globals.css"

// Fonte principal - Inter para boa legibilidade em português
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

// Metadados SEO completos para AngolaReads
export const metadata: Metadata = {
  title: {
    default: "AngolaReads - Ebooks Digitais para Angolanos",
    template: "%s | AngolaReads",
  },
  description:
    "Descobre ebooks que transformam a tua vida. Conhecimento prático, histórias poderosas e ferramentas digitais criadas especialmente para o público angolano e de língua portuguesa. Compra agora e começa a ler em segundos.",
  keywords: [
    "ebooks angola",
    "livros digitais angola",
    "empreendedorismo angola",
    "finanças pessoais angola",
    "marketing digital angola",
    "desenvolvimento pessoal",
    "angolareads",
    "ebooks português",
    "livros digitais",
  ],
  authors: [{ name: "AngolaReads" }],
  creator: "AngolaReads",
  publisher: "AngolaReads",
  metadataBase: new URL("https://angolareads.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AngolaReads - Ebooks Digitais para Angolanos",
    description:
      "Descobre ebooks que transformam a tua vida. Conhecimento prático, histórias poderosas e ferramentas digitais criadas especialmente para o público angolano.",
    url: "https://angolareads.vercel.app",
    siteName: "AngolaReads",
    type: "website",
    locale: "pt_AO",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AngolaReads - Ebooks Digitais para Angolanos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AngolaReads - Ebooks Digitais para Angolanos",
    description:
      "Descobre ebooks que transformam a tua vida. Conhecimento prático e ferramentas digitais para o público angolano.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>",
  },
}

export default function RaizLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-AO" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
