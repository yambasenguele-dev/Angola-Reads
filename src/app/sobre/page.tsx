import type { Metadata } from 'next'
import AppShell from '@/componentes/angolareads/AppShell'

export const metadata: Metadata = {
  title: 'Sobre nós',
  description:
    'Conhece a AngolaReads: a loja angolana de ebooks digitais com conhecimento prático, histórias e ferramentas criadas para o público de Angola e de língua portuguesa.',
  alternates: { canonical: '/sobre' },
  openGraph: {
    title: 'Sobre nós | AngolaReads',
    description:
      'Conhece a AngolaReads: a loja angolana de ebooks digitais com conhecimento prático, histórias e ferramentas criadas para o público de Angola e de língua portuguesa.',
    url: '/sobre',
    siteName: 'AngolaReads',
    type: 'website',
    locale: 'pt_AO',
  },
}

export default function Pagina() {
  return <AppShell vistaInicial="sobre" />
}
