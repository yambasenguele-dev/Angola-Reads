'use client'

import { usarNavegacao, TipoVista } from '@/lojas/navegacao'
import { caminhoDaVista, caminhoProduto } from '@/lib/rotas'

interface LinkVistaProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick' | 'id'> {
  vista: TipoVista
  id?: string | null
  /** Título do produto — usado só para o href ficar com o URL canónico com slug */
  titulo?: string | null
}

// <a href> real (rastreável pelo Google, abre em novo separador com Ctrl/Cmd+clique)
// que, num clique normal, navega dentro da SPA sem recarregar a página.
export default function LinkVista({ vista, id = null, titulo = null, children, ...resto }: LinkVistaProps) {
  const navegarPara = usarNavegacao((s) => s.navegarPara)
  return (
    <a
      href={vista === 'produto' && id ? caminhoProduto(id, titulo) : caminhoDaVista(vista, id)}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        navegarPara(vista, id)
      }}
      {...resto}
    >
      {children}
    </a>
  )
}
