// ============================================================
// Store de Autenticação - AngolaReads
// Gerencia o estado da sessão do utilizador em memória. A sessão
// em si (cookies) é gerida automaticamente pelo Supabase Auth
// (ver src/lib/supabase/* e src/middleware.ts) — este store serve
// apenas para a UI saber quem está autenticado.
// ============================================================

import { create } from 'zustand'

export interface UtilizadorAtual {
  id: string
  email: string
  nomeCompleto: string
  isAdmin: boolean
}

interface EstadoAutenticacao {
  utilizador: UtilizadorAtual | null
  carregando: boolean
  definirUtilizador: (utilizador: UtilizadorAtual | null) => void
  definirCarregando: (valor: boolean) => void
  estaAutenticado: () => boolean
  eAdmin: () => boolean
  sair: () => void
}

export const usarAutenticacao = create<EstadoAutenticacao>((set, get) => ({
  utilizador: null,
  carregando: true,

  definirUtilizador: (utilizador) => set({ utilizador, carregando: false }),

  definirCarregando: (valor) => set({ carregando: valor }),

  estaAutenticado: () => get().utilizador !== null,

  eAdmin: () => get().utilizador?.isAdmin === true,

  sair: () => {
    // Termina a sessão no servidor (limpa os cookies do Supabase Auth)
    fetch('/api/auth/sair', { method: 'POST' }).catch(() => {})
    set({ utilizador: null, carregando: false })
  },
}))
