// ============================================================
// Store de Navegação - AngolaReads
// Gere a navegação SPA e mantém o URL do browser sincronizado:
//   /  ·  /produto/<id>  ·  /sobre  ·  /suporte  ·  /termos ...
// Assim cada ecrã tem um URL real (partilhável, indexável e que
// funciona com o botão "Voltar" e ao recarregar a página).
// ============================================================

import { create } from 'zustand'
import { caminhoDaVista } from '@/lib/rotas'

// Tipos de vista disponíveis no sistema
type TipoVista =
  | 'inicio'
  | 'produto'
  | 'carrinho'
  | 'checkout'
  | 'os-meus-ebooks'
  | 'login'
  | 'registo'
  | 'recuperar-senha'
  | 'afiliado'
  | 'publisher'
  | 'sobre'
  | 'termos'
  | 'privacidade'
  | 'suporte'
  | 'faq'

interface EstadoNavegacao {
  vistaAtual: TipoVista
  parametroId: string | null
  navegarPara: (vista: TipoVista, id?: string | null) => void
  voltar: () => void
  historico: TipoVista[]
}

export type { TipoVista }

export const usarNavegacao = create<EstadoNavegacao>((set, get) => ({
  vistaAtual: 'inicio',
  parametroId: null,
  historico: [],

  navegarPara: (vista, id = null) => {
    const estadoAnterior = get().vistaAtual
    set((estado) => ({
      vistaAtual: vista,
      parametroId: id,
      historico: [...estado.historico, estadoAnterior],
    }))

    // Actualizar o URL (sem recarregar) para este ecrã
    const destino = caminhoDaVista(vista, id)
    if (destino !== window.location.pathname + window.location.search) {
      window.history.pushState({}, '', destino)
    }

    // Rolar para o topo ao navegar
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },

  // Volta ao ecrã anterior através do histórico do browser; o AppShell
  // (evento "popstate") actualiza a vista a partir do URL.
  voltar: () => {
    if (get().historico.length > 0) {
      window.history.back()
    }
  },
}))
