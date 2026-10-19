import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AngolaReads — Ebooks Digitais',
    short_name: 'AngolaReads',
    description: 'Loja de ebooks digitais para angolanos. Compra e descarrega em segundos.',
    id: '/',
    scope: '/',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    categories: ['books', 'education', 'shopping'],
    background_color: '#ffffff',
    theme_color: '#065f46',
    lang: 'pt-AO',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Os meus ebooks',
        short_name: 'Meus ebooks',
        url: '/?vista=os-meus-ebooks',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  }
}
