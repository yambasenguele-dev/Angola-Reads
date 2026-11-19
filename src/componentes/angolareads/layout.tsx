import type { Metadata, Viewport } from "next"
import { Inter } from 'next/font/google'
import { Toaster } from "sonner"
import "./globals.css"
import { URL_SITE, DESCRICAO_SITE } from "@/lib/seo"

// Fonte principal - Inter para boa legibilidade em português
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

// Cor do browser no telemóvel + zoom correcto
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#065f46",
}

const TITULO_PADRAO = "AngolaReads | Loja de Ebooks em Angola — Compra e Descarrega"

// Metadados SEO base do site. Cada rota (/produto/[id], /sobre, ...) define o seu
// próprio title, description e canonical por cima destes valores.
export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: {
    default: TITULO_PADRAO,
    template: "%s | AngolaReads",
  },
  description: DESCRICAO_SITE,
  applicationName: "AngolaReads",
  keywords: [
    "ebooks angola",
    "livros digitais angola",
    "comprar ebooks em angola",
    "empreendedorismo angola",
    "finanças pessoais angola",
    "marketing digital angola",
    "desenvolvimento pessoal",
    "angolareads",
    "ebooks em português",
  ],
  authors: [{ name: "AngolaReads", url: URL_SITE }],
  creator: "AngolaReads",
  publisher: "AngolaReads",
  category: "books",
  formatDetection: { email: false, address: false, telephone: false },
  // O canonical é definido em cada página (nunca "/" para todas)
  openGraph: {
    title: TITULO_PADRAO,
    description: DESCRICAO_SITE,
    url: "/",
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
    title: TITULO_PADRAO,
    description: DESCRICAO_SITE,
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
  // Ícones gerados a partir do logo (ficheiros em /public)
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  verification: {
    google: 'eY59hiTOzrl8LPhWgl9-evJwBYVsXBQJR4o9TGSvNX0',
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
