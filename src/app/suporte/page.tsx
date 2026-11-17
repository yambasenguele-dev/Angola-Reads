import type { Metadata } from 'next'
import AppShell from '@/componentes/angolareads/AppShell'

export const metadata: Metadata = {
  title: 'Suporte e Ajuda',
  description:
    'Precisas de ajuda com um pedido, pagamento ou download? Fala com o suporte da AngolaReads por email ou WhatsApp e consulta as respostas às dúvidas mais comuns.',
  alternates: { canonical: '/suporte' },
  openGraph: {
    title: 'Suporte e Ajuda | AngolaReads',
    description:
      'Precisas de ajuda com um pedido, pagamento ou download? Fala com o suporte da AngolaReads por email ou WhatsApp e consulta as respostas às dúvidas mais comuns.',
    url: '/suporte',
    siteName: 'AngolaReads',
    type: 'website',
    locale: 'pt_AO',
  },
}

export default function Pagina() {
  return <AppShell vistaInicial="suporte" />
}
