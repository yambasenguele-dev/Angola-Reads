import type { Metadata } from 'next'
import AppShell from '@/componentes/angolareads/AppShell'

export const metadata: Metadata = {
  title: 'Perguntas Frequentes',
  description:
    'Respostas às perguntas mais frequentes sobre comprar ebooks na AngolaReads: pagamentos, downloads, formatos PDF/EPUB e afiliados.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Perguntas Frequentes | AngolaReads',
    description:
      'Respostas às perguntas mais frequentes sobre comprar ebooks na AngolaReads: pagamentos, downloads, formatos PDF/EPUB e afiliados.',
    url: '/faq',
    siteName: 'AngolaReads',
    type: 'website',
    locale: 'pt_AO',
  },
}

export default function Pagina() {
  return <AppShell vistaInicial="faq" />
}
