import type { Metadata } from 'next'
import AppShell from '@/componentes/angolareads/AppShell'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Como a AngolaReads recolhe, usa e protege os teus dados pessoais ao comprares e descarregares ebooks na nossa loja.',
  alternates: { canonical: '/privacidade' },
  openGraph: {
    title: 'Política de Privacidade | AngolaReads',
    description:
      'Como a AngolaReads recolhe, usa e protege os teus dados pessoais ao comprares e descarregares ebooks na nossa loja.',
    url: '/privacidade',
    siteName: 'AngolaReads',
    type: 'website',
    locale: 'pt_AO',
  },
}

export default function Pagina() {
  return <AppShell vistaInicial="privacidade" />
}
