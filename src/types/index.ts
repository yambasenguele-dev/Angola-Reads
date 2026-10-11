// ============================================================
// Tipos do AngolaReads - Sistema de Vendas de Ebooks Digitais
// ============================================================

// --- Vistas de Navegação SPA ---
export type VistaLoja =
  | 'inicial'
  | 'catalogo'
  | 'produto'
  | 'carrinho'
  | 'checkout'
  | 'conta'
  | 'registro'
  | 'entrada'
  | 'afiliado'
  | 'meus_downloads'
  | 'meus_pedidos'
  | 'sobre'

// --- Categorias ---
export interface Categoria {
  id: string
  nome: string
  descricao: string | null
  slug: string
  ativa: boolean
  ordem: number
  criadoEm: string
  atualizadoEm: string
}

// --- Produtos ---
export type TipoProduto = 'ebook' | 'bundle' | 'curso_limitado'

export interface Produto {
  id: string
  titulo: string
  descricao: string
  descricaoCurta: string | null
  capaUrl: string | null
  tipoProduto: TipoProduto
  formatoPdf: string | null
  formatoEpub: string | null
  precoNormal: number
  precoPromocional: number | null
  precoUsd: number | null
  precoEur: number | null
  categoriaId: string
  ativo: boolean
  destaque: boolean
  comissaoAfiliado: number
  estoqueIlimitado: boolean
  estoqueMaximo: number | null
  vendasCount: number
  criadoEm: string
  atualizadoEm: string
  categoria?: Categoria
}

// --- Utilizador / Perfil ---
export interface Perfil {
  id: string
  email: string
  nomeCompleto: string
  telefone: string | null
  isAdmin: boolean
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

// --- Pedidos ---
export type EstadoPedido = 'pendente' | 'pago' | 'rejeitado' | 'cancelado'
export type MetodoPagamento = 'transferencia_bancaria' | 'airtm' | 'paypal'

export interface ItemPedido {
  id: string
  pedidoId: string
  produtoId: string
  titulo: string
  preco: number
  formato: string
}

export interface Pedido {
  id: string
  referencia: string
  perfilId: string
  estado: EstadoPedido
  metodoPagamento: MetodoPagamento
  subtotal: number
  moeda: string
  afiliadoId: string | null
  observacoes: string | null
  criadoEm: string
  atualizadoEm: string
  itens: ItemPedido[]
  comprovativo?: Comprovativo | null
}

// --- Comprovativos ---
export type EstadoComprovativo = 'pendente' | 'aprovado' | 'rejeitado'

export interface Comprovativo {
  id: string
  pedidoId: string
  ficheiroUrl: string
  estado: EstadoComprovativo
  observacoes: string | null
  criadoEm: string
  atualizadoEm: string
}

// --- Downloads ---
export interface Download {
  id: string
  perfilId: string
  produtoId: string
  pedidoId: string
  formato: string
  ativo: boolean
  criadoEm: string
}

// --- Afiliados ---
export interface Afiliado {
  id: string
  perfilId: string
  codigoRef: string
  saldo: number
  totalGanho: number
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

export interface ComissaoAfiliado {
  id: string
  afiliadoId: string
  pedidoId: string
  produtoId: string
  valor: number
  percentagem: number
  estado: 'pendente' | 'paga'
  criadoEm: string
  atualizadoEm: string
}

// --- Configurações ---
export interface Configuracao {
  id: string
  chave: string
  valor: string
}

// --- Carrinho ---
export interface ItemCarrinho {
  produto: Produto
  formato: 'pdf' | 'epub'
  quantidade: number
}

// --- Filtros do Catálogo ---
export interface FiltrosCatalogo {
  pesquisa: string
  categoriaId: string | null
  tipoProduto: TipoProduto | null
  precoMin: number | null
  precoMax: number | null
  ordenarPor: 'relevancia' | 'preco_asc' | 'preco_desc' | 'mais_vendidos' | 'mais_recentes'
}

// --- Respostas da API ---
export interface RespostaApi<T = unknown> {
  sucesso: boolean
  dados?: T
  erro?: string
  mensagem?: string
}

export interface RespostaPaginada<T> {
  sucesso: boolean
  dados: T[]
  total: number
  pagina: number
  totalPaginas: number
}
