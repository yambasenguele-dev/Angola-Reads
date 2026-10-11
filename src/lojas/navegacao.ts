// ============================================================
// Store de Navegação - AngolaReads
// Gerencia a navegação SPA (todas as vistas na mesma rota `/`)
// ============================================================

import { create } from 'zustand'

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
  | 'sobre'
  | 'termos'
  | 'privacidade'
  | 'suporte'

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
    // Rolar para o topo ao navegar
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },

  voltar: () => {
    const historico = [...get().historico]
    const vistaAnterior = historico.pop()
    if (vistaAnterior) {
      set({
        vistaAtual: vistaAnterior,
        parametroId: null,
        historico,
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },
}))
