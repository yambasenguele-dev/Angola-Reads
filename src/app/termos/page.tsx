import type { Metadata } from 'next'
import AppShell from '@/componentes/angolareads/AppShell'

export const metadata: Metadata = {
  title: 'Termos e Condições',
  description:
    'Termos e condições de utilização da AngolaReads: compras de ebooks, pagamentos, downloads, reembolsos e programa de afiliados.',
  alternates: { canonical: '/termos' },
  openGraph: {
    title: 'Termos e Condições | AngolaReads',
    description:
      'Termos e condições de utilização da AngolaReads: compras de ebooks, pagamentos, downloads, reembolsos e programa de afiliados.',
    url: '/termos',
    siteName: 'AngolaReads',
    type: 'website',
    locale: 'pt_AO',
  },
}

export default function Pagina() {
  return <AppShell vistaInicial="termos" />
}
