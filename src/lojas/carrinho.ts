// ============================================================
// Store do Carrinho de Compras - AngolaReads
// Gerencia itens do carrinho na memória do cliente
// ============================================================

import { create } from 'zustand'

export interface ItemCarrinho {
  produtoId: string
  titulo: string
  preco: number
  precoPromocional: number | null
  capaUrl: string | null
  formato: 'pdf' | 'epub'
  tipoProduto: string
}

interface EstadoCarrinho {
  itens: ItemCarrinho[]
  adicionarItem: (item: ItemCarrinho) => void
  removerItem: (produtoId: string, formato: string) => void
  limparCarrinho: () => void
  obterTotal: () => number
  obterQuantidade: () => number
}

export const usarCarrinho = create<EstadoCarrinho>((set, get) => ({
  itens: [],

  adicionarItem: (novoItem) => {
    set((estado) => {
      // Verificar se já existe no carrinho
      const jaExiste = estado.itens.some(
        (i) => i.produtoId === novoItem.produtoId && i.formato === novoItem.formato
      )
      if (jaExiste) return estado
      return { itens: [...estado.itens, novoItem] }
    })
  },

  removerItem: (produtoId, formato) => {
    set((estado) => ({
      itens: estado.itens.filter(
        (i) => !(i.produtoId === produtoId && i.formato === formato)
      ),
    }))
  },

  limparCarrinho: () => set({ itens: [] }),

  obterTotal: () => {
    return get().itens.reduce((total, item) => {
      const preco = item.precoPromocional ?? item.preco
      return total + preco
    }, 0)
  },

  obterQuantidade: () => get().itens.length,
}))
