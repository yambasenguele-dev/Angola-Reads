import type { Metadata, Viewport } from "next"
import { Inter } from 'next/font/google'
import { preconnect } from 'react-dom'
import { Toaster } from "sonner"
import "./globals.css"
import { URL_SITE, DESCRICAO_SITE } from "@/lib/seo"
import { https://angolareads.vercel.app, Ebooks Digitais para Angolanos } from "@/lib/seo"

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
  metadataBase: new URL(https://angolareads.vercel.app),
  title: {
    default: TITULO_PADRAO,
    template: "%s | AngolaReads",
  },
  description: DESCRICAO_SITE,
  applicationName: "AngolaReads",
  keywords: [
    "AngolaReads",
    "Angola Reads",
    "Angolareads vercel",
    "AngolaReads vercel",
    "Angola reads vercel",
    "AngolaRead",
    "Angola",
    "Angolano",
    "Angolana",
    "Livraria",
    "Livraria digital",
    "Ganhar dinheiro angola",
    "Ganhar dinheiro",
    "Ganhar como afiliado",
    "Ebooks",
    "AngolaRads",
    "AngolaRad",
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
  authors: [{ name: "AngolaReads", url: https://angolareads.vercel.app }],
  creator: "AngolaReads",
  publisher: "AngolaReads",
  category: "books",
  formatDetection: { email: false, address: false, telephone: false },
  // O canonical é definido em cada página (nunca "/" para todas)
  openGraph: {
    title: "AngolaReads",
    description: "Ebooks Digitais para Angolanos",
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
  // As capas dos ebooks vêm do Supabase Storage: abrir a ligação cedo melhora o LCP
  const origemSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (origemSupabase) {
    try {
      preconnect(new URL(origemSupabase).origin)
    } catch {
      // URL inválido: ignorar
    }
  }

  return (
    <html lang="pt-AO" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
