'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldX,
  Package,
  FolderTree,
  ShoppingCart,
  FileCheck,
  Settings,
  Eye,
  RefreshCw,
  Save,
  Image as IconeImagem,
  FileText,
  BookOpen,
  Store,
  LogOut,
  Users,
  Wallet,
  LayoutDashboard,
  Banknote,
} from 'lucide-react'

import { usarAutenticacao } from '@/lojas/autenticacao'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// ============================================================
// Tipos
// ============================================================

interface Categoria {
  id: string
  nome: string
  descricao: string | null
  slug: string
  ativa: boolean
  ordem: number
  criadoEm: string
}

interface Produto {
  id: string
  titulo: string
  descricao: string
  descricaoCurta: string | null
  capaUrl: string | null
  tipoProduto: string
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
  vendasCount: number
  criadoEm: string
  categoria?: Categoria
}

interface ItemPedido {
  id: string
  titulo: string
  preco: number
  formato: string
}

interface Pedido {
  id: string
  referencia: string
  perfilId: string
  estado: string
  metodoPagamento: string
  subtotal: number
  moeda: string
  observacoes: string | null
  criadoEm: string
  itens?: ItemPedido[]
  perfil?: {
    email: string
    nomeCompleto: string
  }
}

interface Comprovativo {
  id: string
  pedidoId: string
  ficheiroUrl: string
  estado: string
  observacoes: string | null
  criadoEm: string
  pedido?: {
    referencia: string
  }
}

interface ConfiguracaoSistema {
  airtm_email: string
  airtm_nome: string
  paypal_email: string
  email_suporte: string
  whatsapp_suporte: string
}

interface AfiliadoAdmin {
  id: string
  codigoRef: string
  saldo: number
  ativo: boolean
  criadoEm: string
  perfil?: { nomeCompleto: string; email: string }
}

interface PedidoSaqueAdmin {
  id: string
  valor: number
  metodo: string
  dadosRecebimento: Record<string, string>
  estado: string
  observacoesAdmin: string | null
  criadoEm: string
  afiliado?: {
    id: string
    codigoRef: string
    perfil?: { nomeCompleto: string; email: string }
  }
}

interface UtilizadorAdmin {
  id: string
  email: string
  nomeCompleto: string
  telefone: string | null
  isAdmin: boolean
  ativo: boolean
  criadoEm: string
}

// ============================================================
// Dados iniciais do formulário de produto
// ============================================================

const formularioProdutoVazio = {
  titulo: '',
  descricao: '',
  descricaoCurta: '',
  tipoProduto: 'ebook',
  categoriaId: '',
  precoNormal: 0,
  precoPromocional: 0,
  precoUsd: 0,
  precoEur: 0,
  comissaoAfiliado: 20,
  destaque: false,
  capaUrl: '' as string,
  formatoPdf: '' as string,
  formatoEpub: '' as string,
}

const formularioCategoriaVazia = {
  nome: '',
  descricao: '',
  slug: '',
  ativa: true,
}

const configuracaoVazia: ConfiguracaoSistema = {
  airtm_email: '',
  airtm_nome: '',
  paypal_email: '',
  email_suporte: '',
  whatsapp_suporte: '',
}

// ============================================================
// Componente Principal
// ============================================================

export default function PainelAdmin() {
  const {
  eAdmin,
  carregando: carregandoAuth,
  sair,
  definirUtilizador,
  definirCarregando,
} = usarAutenticacao()

  // Estados de dados
  const [produtos, definirProdutos] = useState<Produto[]>([])
  const [categorias, definirCategorias] = useState<Categoria[]>([])
  const [pedidos, definirPedidos] = useState<Pedido[]>([])
  const [comprovativos, definirComprovativos] = useState<Comprovativo[]>([])
  const [configuracao, definirConfiguracao] = useState<ConfiguracaoSistema>(configuracaoVazia)
  const [afiliadosAdmin, definirAfiliadosAdmin] = useState<AfiliadoAdmin[]>([])
  const [saquesAdmin, definirSaquesAdmin] = useState<PedidoSaqueAdmin[]>([])
  const [utilizadoresAdmin, definirUtilizadoresAdmin] = useState<UtilizadorAdmin[]>([])

  // Estados de carregamento
  const [carregandoProdutos, definirCarregandoProdutos] = useState(false)
  const [carregandoCategorias, definirCarregandoCategorias] = useState(false)
  const [carregandoPedidos, definirCarregandoPedidos] = useState(false)
  const [carregandoComprovativos, definirCarregandoComprovativos] = useState(false)
  const [carregandoConfiguracao, definirCarregandoConfiguracao] = useState(false)
  const [carregandoAfiliadosAdmin, definirCarregandoAfiliadosAdmin] = useState(false)
  const [carregandoSaquesAdmin, definirCarregandoSaquesAdmin] = useState(false)
  const [carregandoUtilizadoresAdmin, definirCarregandoUtilizadoresAdmin] = useState(false)
  const [salvando, definirSalvando] = useState(false)

  // Estados de diálogos
  const [dialogoProdutoAberto, definirDialogoProduto] = useState(false)
  const [dialogoCategoriaAberto, definirDialogoCategoria] = useState(false)
  const [dialogoConfirmacaoAberto, definirDialogoConfirmacao] = useState(false)
  const [itemEliminar, definirItemEliminar] = useState<{ tipo: string; id: string; titulo: string } | null>(null)

  // Estados de formulários
  const [formularioProduto, definirFormularioProduto] = useState({ ...formularioProdutoVazio })
  const [formularioCategoria, definirFormularioCategoria] = useState({ ...formularioCategoriaVazia })
  const [editandoProduto, definirEditandoProduto] = useState(false)
  const [idProdutoEdicao, definirIdProdutoEdicao] = useState<string | null>(null)
  const [editandoCategoria, definireditandoCategoria] = useState(false)
  const [idCategoriaEdicao, definirIdCategoriaEdicao] = useState<string | null>(null)

  // Pedidos expandidos
  const [pedidosExpandidos, definirPedidosExpandidos] = useState<Set<string>>(new Set())

  // Refs para ficheiros
  const refFicheiroCapa = useRef<File | null>(null)
  const refFicheiroPdf = useRef<File | null>(null)
  const refFicheiroEpub = useRef<File | null>(null)

  // ============================================================
  // Hooks (obrigatório antes de quaisquer retornos antecipados)
  // ============================================================

  const cabecalhosAutenticados = useCallback(() => ({
    'Content-Type': 'application/json',
  }), [])

    // Inicializar sessão nesta rota (a home faz isto; o admin também precisa)
  useEffect(() => {
    async function verificarSessao() {
      try {
        const resposta = await fetch('/api/auth/perfil')
        if (resposta.ok) {
          const dados = await resposta.json()
          definirUtilizador(dados.utilizador ?? null)
        } else {
          definirUtilizador(null)
        }
      } catch {
        definirUtilizador(null)
      } finally {
        definirCarregando(false)
      }
    }
    verificarSessao()
  }, [definirUtilizador, definirCarregando])
  
  // Carregar dados iniciais (apenas se administrador)
  useEffect(() => {
    if (!carregandoAuth && eAdmin()) {
      carregarProdutos()
      carregarCategorias()
      carregarPedidos()
      carregarComprovativos()
      carregarConfiguracao()
      carregarAfiliadosAdmin()
      carregarSaquesAdmin()
      carregarUtilizadoresAdmin()
    }
  }, [carregandoAuth])

  // ============================================================
  // Verificação de acesso administrativo
  // ============================================================

  if (carregandoAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!eAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Alert variant="destructive" className="max-w-md">
          <ShieldX className="size-5" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            Não tem permissão para aceder ao painel de administração.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // ============================================================
  // Funções auxiliares
  // ============================================================

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-AO', {
      dia: '2-digit',
      mês: '2-digit',
      ano: 'numeric',
      hora: '2-digit',
      minuto: '2-digit',
    })
  }

  const formatarMoeda = (valor: number, moeda: string = 'AOA') => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: moeda,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(valor)
  }

  // ============================================================
  // Upload de ficheiros
  // ============================================================

  const enviarFicheiro = async (
    ficheiro: File,
    pasta: 'capas' | 'ebooks'
  ): Promise<string> => {
    const formulario = new FormData()
    formulario.append('ficheiro', ficheiro)
    formulario.append('pasta', pasta)
    const resposta = await fetch('/api/upload', {
      method: 'POST',
      body: formulario,
    })
    if (!resposta.ok) throw new Error('Falha ao enviar ficheiro')
    const dados = await resposta.json()
    // "capas" é um bucket público -> guardamos o URL público e permanente.
    // "ebooks" é privado -> guardamos apenas o caminho (usado depois para
    // gerar URLs de download assinados em /api/downloads).
    return pasta === 'capas' ? dados.url || dados.caminho : dados.caminho
  }

  // ============================================================
  // Carregamento de dados
  // ============================================================

  const carregarProdutos = async () => {
    definirCarregandoProdutos(true)
    try {
      const resposta = await fetch('/api/produtos', { headers: cabecalhosAutenticados() })
      if (resposta.ok) {
        const dados = await resposta.json()
        definirProdutos(Array.isArray(dados) ? dados : dados.produtos || [])
      }
    } catch {
      toast.error('Erro ao carregar produtos')
    } finally {
      definirCarregandoProdutos(false)
    }
  }

  const carregarCategorias = async () => {
    definirCarregandoCategorias(true)
    try {
      const resposta = await fetch('/api/categorias', { headers: cabecalhosAutenticados() })
      if (resposta.ok) {
        const dados = await resposta.json()
        definirCategorias(Array.isArray(dados) ? dados : dados.categorias || [])
      }
    } catch {
      toast.error('Erro ao carregar categorias')
    } finally {
      definirCarregandoCategorias(false)
    }
  }

  const carregarPedidos = async () => {
    definirCarregandoPedidos(true)
    try {
      const resposta = await fetch('/api/admin/pedidos', { headers: cabecalhosAutenticados() })
      if (resposta.ok) {
        const dados = await resposta.json()
        definirPedidos(Array.isArray(dados) ? dados : dados.pedidos || [])
      }
    } catch {
      toast.error('Erro ao carregar pedidos')
    } finally {
      definirCarregandoPedidos(false)
    }
  }

  const carregarComprovativos = async () => {
    definirCarregandoComprovativos(true)
    try {
      const resposta = await fetch('/api/admin/comprovativos', { headers: cabecalhosAutenticados() })
      if (resposta.ok) {
        const dados = await resposta.json()
        definirComprovativos(Array.isArray(dados) ? dados : dados.comprovativos || [])
      }
    } catch {
      toast.error('Erro ao carregar comprovativos')
    } finally {
      definirCarregandoComprovativos(false)
    }
  }

  const carregarConfiguracao = async () => {
    definirCarregandoConfiguracao(true)
    try {
      const resposta = await fetch('/api/admin/configuracao', { headers: cabecalhosAutenticados() })
      if (resposta.ok) {
        const dados = await resposta.json()
        definirConfiguracao({
          airtm_email: dados.airtm_email || '',
          airtm_nome: dados.airtm_nome || '',
          paypal_email: dados.paypal_email || '',
          email_suporte: dados.email_suporte || '',
          whatsapp_suporte: dados.whatsapp_suporte || '',
        })
      }
    } catch {
      // Silencioso - pode ser a primeira configuração
    } finally {
      definirCarregandoConfiguracao(false)
    }
  }

  const carregarAfiliadosAdmin = async () => {
    definirCarregandoAfiliadosAdmin(true)
    try {
      const resposta = await fetch('/api/admin/afiliados', { headers: cabecalhosAutenticados() })
      if (resposta.ok) {
        const dados = await resposta.json()
        definirAfiliadosAdmin(dados.afiliados || [])
      }
    } catch {
      toast.error('Erro ao carregar afiliados')
    } finally {
      definirCarregandoAfiliadosAdmin(false)
    }
  }

  const carregarSaquesAdmin = async () => {
    definirCarregandoSaquesAdmin(true)
    try {
      const resposta = await fetch('/api/admin/saques', { headers: cabecalhosAutenticados() })
      if (resposta.ok) {
        const dados = await resposta.json()
        definirSaquesAdmin(dados.saques || [])
      }
    } catch {
      toast.error('Erro ao carregar pedidos de saque')
    } finally {
      definirCarregandoSaquesAdmin(false)
    }
  }

  const carregarUtilizadoresAdmin = async () => {
    definirCarregandoUtilizadoresAdmin(true)
    try {
      const resposta = await fetch('/api/admin/utilizadores', { headers: cabecalhosAutenticados() })
      if (resposta.ok) {
        const dados = await resposta.json()
        definirUtilizadoresAdmin(dados.utilizadores || [])
      }
    } catch {
      toast.error('Erro ao carregar utilizadores')
    } finally {
      definirCarregandoUtilizadoresAdmin(false)
    }
  }

  const alterarEstadoSaque = async (saqueId: string, novoEstado: 'pago' | 'rejeitado') => {
    if (novoEstado === 'rejeitado') {
      const motivo = window.prompt('Motivo da rejeição (visível para o afiliado):')
      if (motivo === null) return
      try {
        const resposta = await fetch(`/api/admin/saques/${saqueId}`, {
          method: 'PATCH',
          headers: cabecalhosAutenticados(),
          body: JSON.stringify({ estado: novoEstado, observacoesAdmin: motivo }),
        })
        if (!resposta.ok) throw new Error()
        toast.success('Saque rejeitado e valor devolvido ao saldo do afiliado')
        carregarSaquesAdmin()
      } catch {
        toast.error('Erro ao rejeitar saque')
      }
      return
    }
    try {
      const resposta = await fetch(`/api/admin/saques/${saqueId}`, {
        method: 'PATCH',
        headers: cabecalhosAutenticados(),
        body: JSON.stringify({ estado: novoEstado }),
      })
      if (!resposta.ok) throw new Error()
      toast.success('Saque marcado como pago')
      carregarSaquesAdmin()
    } catch {
      toast.error('Erro ao aprovar saque')
    }
  }

  const alternarAdminUtilizador = async (utilizadorId: string, isAdmin: boolean) => {
    try {
      const resposta = await fetch(`/api/admin/utilizadores/${utilizadorId}`, {
        method: 'PATCH',
        headers: cabecalhosAutenticados(),
        body: JSON.stringify({ isAdmin }),
      })
      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}))
        throw new Error(dados.erro || 'Erro ao atualizar utilizador')
      }
      toast.success(isAdmin ? 'Utilizador promovido a administrador' : 'Privilégios de administrador removidos')
      carregarUtilizadoresAdmin()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao atualizar utilizador')
    }
  }

  const alternarAtivoUtilizador = async (utilizadorId: string, ativo: boolean) => {
    try {
      const resposta = await fetch(`/api/admin/utilizadores/${utilizadorId}`, {
        method: 'PATCH',
        headers: cabecalhosAutenticados(),
        body: JSON.stringify({ ativo }),
      })
      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}))
        throw new Error(dados.erro || 'Erro ao atualizar utilizador')
      }
      toast.success(ativo ? 'Conta reativada' : 'Conta desativada')
      carregarUtilizadoresAdmin()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao atualizar utilizador')
    }
  }

  // ============================================================
  // Operações de Produto
  // ============================================================

  const abrirDialogoNovoProduto = () => {
    definirFormularioProduto({ ...formularioProdutoVazio })
    refFicheiroCapa.current = null
    refFicheiroPdf.current = null
    refFicheiroEpub.current = null
    definirEditandoProduto(false)
    definirIdProdutoEdicao(null)
    definirDialogoProduto(true)
  }

  const abrirDialogoEditarProduto = (produto: Produto) => {
    definirFormularioProduto({
      titulo: produto.titulo,
      descricao: produto.descricao,
      descricaoCurta: produto.descricaoCurta || '',
      tipoProduto: produto.tipoProduto,
      categoriaId: produto.categoriaId,
      precoNormal: produto.precoNormal,
      precoPromocional: produto.precoPromocional || 0,
      precoUsd: produto.precoUsd || 0,
      precoEur: produto.precoEur || 0,
      comissaoAfiliado: produto.comissaoAfiliado,
      destaque: produto.destaque,
      capaUrl: produto.capaUrl || '',
      formatoPdf: produto.formatoPdf || '',
      formatoEpub: produto.formatoEpub || '',
    })
    refFicheiroCapa.current = null
    refFicheiroPdf.current = null
    refFicheiroEpub.current = null
    definirEditandoProduto(true)
    definirIdProdutoEdicao(produto.id)
    definirDialogoProduto(true)
  }

  const guardarProduto = async () => {
    if (!formularioProduto.titulo.trim()) {
      toast.error('O título é obrigatório')
      return
    }
    if (!formularioProduto.categoriaId) {
      toast.error('Selecione uma categoria')
      return
    }

    definirSalvando(true)
    try {
      // Enviar ficheiros se existirem
      let capaUrl = formularioProduto.capaUrl
      let formatoPdf = formularioProduto.formatoPdf
      let formatoEpub = formularioProduto.formatoEpub

      if (refFicheiroCapa.current) {
        capaUrl = await enviarFicheiro(refFicheiroCapa.current, 'capas')
      }
      if (refFicheiroPdf.current) {
        formatoPdf = await enviarFicheiro(refFicheiroPdf.current, 'ebooks')
      }
      if (refFicheiroEpub.current) {
        formatoEpub = await enviarFicheiro(refFicheiroEpub.current, 'ebooks')
      }

      const corpo = {
        ...formularioProduto,
        capaUrl,
        formatoPdf,
        formatoEpub,
        precoPromocional: formularioProduto.precoPromocional || null,
        precoUsd: formularioProduto.precoUsd || null,
        precoEur: formularioProduto.precoEur || null,
      }

      if (editandoProduto && idProdutoEdicao) {
        const resposta = await fetch(`/api/produtos/${idProdutoEdicao}`, {
          method: 'PUT',
          headers: cabecalhosAutenticados(),
          body: JSON.stringify(corpo),
        })
        if (!resposta.ok) throw new Error()
        toast.success('Produto atualizado com sucesso')
      } else {
        const resposta = await fetch('/api/produtos', {
          method: 'POST',
          headers: cabecalhosAutenticados(),
          body: JSON.stringify(corpo),
        })
        if (!resposta.ok) throw new Error()
        toast.success('Produto criado com sucesso')
      }

      definirDialogoProduto(false)
      carregarProdutos()
    } catch {
      toast.error(editandoProduto ? 'Erro ao atualizar produto' : 'Erro ao criar produto')
    } finally {
      definirSalvando(false)
    }
  }

  const eliminarProduto = async () => {
    if (!itemEliminar) return
    try {
      const resposta = await fetch(`/api/produtos/${itemEliminar.id}`, {
        method: 'DELETE',
        headers: cabecalhosAutenticados(),
      })
      if (!resposta.ok) throw new Error()
      toast.success('Produto eliminado com sucesso')
      carregarProdutos()
    } catch {
      toast.error('Erro ao eliminar produto')
    } finally {
      definirDialogoConfirmacao(false)
      definirItemEliminar(null)
    }
  }

  const alternarAtivoProduto = async (produto: Produto) => {
    try {
      const resposta = await fetch(`/api/produtos/${produto.id}`, {
        method: 'PATCH',
        headers: cabecalhosAutenticados(),
        body: JSON.stringify({ ativo: !produto.ativo }),
      })
      if (!resposta.ok) throw new Error()
      toast.success(produto.ativo ? 'Produto desativado' : 'Produto ativado')
      carregarProdutos()
    } catch {
      toast.error('Erro ao alterar estado do produto')
    }
  }

  // ============================================================
  // Operações de Categoria
  // ============================================================

  const abrirDialogoNovaCategoria = () => {
    definirFormularioCategoria({ ...formularioCategoriaVazia })
    definireditandoCategoria(false)
    definirIdCategoriaEdicao(null)
    definirDialogoCategoria(true)
  }

  const abrirDialogoEditarCategoria = (categoria: Categoria) => {
    definirFormularioCategoria({
      nome: categoria.nome,
      descricao: categoria.descricao || '',
      slug: categoria.slug,
      ativa: categoria.ativa,
    })
    definireditandoCategoria(true)
    definirIdCategoriaEdicao(categoria.id)
    definirDialogoCategoria(true)
  }

  const guardarCategoria = async () => {
    if (!formularioCategoria.nome.trim()) {
      toast.error('O nome é obrigatório')
      return
    }
    if (!formularioCategoria.slug.trim()) {
      toast.error('O slug é obrigatório')
      return
    }

    definirSalvando(true)
    try {
      if (editandoCategoria && idCategoriaEdicao) {
        const resposta = await fetch(`/api/categorias/${idCategoriaEdicao}`, {
          method: 'PUT',
          headers: cabecalhosAutenticados(),
          body: JSON.stringify(formularioCategoria),
        })
        if (!resposta.ok) throw new Error()
        toast.success('Categoria atualizada com sucesso')
      } else {
        const resposta = await fetch('/api/categorias', {
          method: 'POST',
          headers: cabecalhosAutenticados(),
          body: JSON.stringify(formularioCategoria),
        })
        if (!resposta.ok) throw new Error()
        toast.success('Categoria criada com sucesso')
      }

      definirDialogoCategoria(false)
      carregarCategorias()
    } catch {
      toast.error(editandoCategoria ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria')
    } finally {
      definirSalvando(false)
    }
  }

  const eliminarCategoria = async () => {
    if (!itemEliminar) return
    try {
      const resposta = await fetch(`/api/categorias/${itemEliminar.id}`, {
        method: 'DELETE',
        headers: cabecalhosAutenticados(),
      })
      if (!resposta.ok) throw new Error()
      toast.success('Categoria eliminada com sucesso')
      carregarCategorias()
    } catch {
      toast.error('Erro ao eliminar categoria')
    } finally {
      definirDialogoConfirmacao(false)
      definirItemEliminar(null)
    }
  }

  // ============================================================
  // Operações de Pedido
  // ============================================================

  const carregarItensPedido = async (pedidoId: string) => {
    try {
      const resposta = await fetch(`/api/admin/pedidos/${pedidoId}/itens`, {
        headers: cabecalhosAutenticados(),
      })
      if (resposta.ok) {
        const dados = await resposta.json()
        definirPedidos((anterior) =>
          anterior.map((p) => (p.id === pedidoId ? { ...p, itens: dados.itens || dados } : p))
        )
      }
    } catch {
      // Silencioso
    }
  }

  const alternarPedidoExpandido = (pedidoId: string) => {
    definirPedidosExpandidos((anterior) => {
      const novo = new Set(anterior)
      if (novo.has(pedidoId)) {
        novo.delete(pedidoId)
      } else {
        novo.add(pedidoId)
        carregarItensPedido(pedidoId)
      }
      return novo
    })
  }

  const alterarEstadoPedido = async (pedidoId: string, novoEstado: string) => {
    try {
      const resposta = await fetch(`/api/admin/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: cabecalhosAutenticados(),
        body: JSON.stringify({ estado: novoEstado }),
      })
      if (!resposta.ok) throw new Error()
      toast.success(
        novoEstado === 'pago'
          ? 'Pedido aprovado com sucesso'
          : 'Pedido rejeitado com sucesso'
      )
      carregarPedidos()
      carregarComprovativos()
    } catch {
      toast.error(`Erro ao ${novoEstado === 'pago' ? 'aprovar' : 'rejeitar'} pedido`)
    }
  }

  // ============================================================
  // Operações de Comprovativo
  // ============================================================

  const alterarEstadoComprovativo = async (pedidoId: string, novoEstado: string) => {
    try {
      const resposta = await fetch('/api/admin/comprovativos', {
        method: 'PATCH',
        headers: cabecalhosAutenticados(),
        body: JSON.stringify({ pedidoId, estado: novoEstado }),
      })
      if (!resposta.ok) throw new Error()
      toast.success(
        novoEstado === 'aprovado'
          ? 'Comprovativo aprovado com sucesso'
          : 'Comprovativo rejeitado com sucesso'
      )
      carregarComprovativos()
      carregarPedidos()
    } catch {
      toast.error(`Erro ao processar comprovativo`)
    }
  }

  // ============================================================
  // Operações de Configuração
  // ============================================================

  const guardarConfiguracao = async () => {
    definirSalvando(true)
    try {
      const resposta = await fetch('/api/admin/configuracao', {
        method: 'PUT',
        headers: cabecalhosAutenticados(),
        body: JSON.stringify(configuracao),
      })
      if (!resposta.ok) throw new Error()
      toast.success('Configuração guardada com sucesso')
    } catch {
      toast.error('Erro ao guardar configuração')
    } finally {
      definirSalvando(false)
    }
  }

  // ============================================================
  // Badges de estado do pedido
  // ============================================================

  const obterBadgeEstado = (estado: string) => {
    const estilos: Record<string, string> = {
      pendente: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      pago: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
      rejeitado: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      cancelado: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
    }
    return estilos[estado] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const obterRotuloEstado = (estado: string) => {
    const rotulos: Record<string, string> = {
      pendente: 'Pendente',
      pago: 'Pago',
      rejeitado: 'Rejeitado',
      cancelado: 'Cancelado',
    }
    return rotulos[estado] || estado
  }

  const obterRotuloMetodoPagamento = (metodo: string) => {
    const rotulos: Record<string, string> = {
      transferencia_bancaria: 'Transferência',
      airtm: 'AirTM',
      paypal: 'PayPal',
    }
    return rotulos[metodo] || metodo
  }

  // ============================================================
  // Renderização
  // ============================================================

  return (
    <div className="min-h-screen">
      {/* Barra superior — a área /Administrador-123 não usa o cabeçalho da loja */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-gray-900">
              AngolaReads <span className="font-normal text-gray-400">· Gestão</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Store className="size-4" />
                <span className="hidden sm:inline">Voltar à loja</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="gap-1.5 text-red-600 hover:text-red-700" onClick={sair}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8"
      >
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Painel de Administração
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerir produtos, categorias, pedidos, afiliados e configurações
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full sm:w-auto flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="dashboard" className="gap-1.5">
            <LayoutDashboard className="size-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="produtos" className="gap-1.5">
            <Package className="size-4" />
            <span className="hidden sm:inline">Produtos</span>
          </TabsTrigger>
          <TabsTrigger value="categorias" className="gap-1.5">
            <FolderTree className="size-4" />
            <span className="hidden sm:inline">Categorias</span>
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="gap-1.5">
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline">Pedidos</span>
          </TabsTrigger>
          <TabsTrigger value="comprovativos" className="gap-1.5">
            <FileCheck className="size-4" />
            <span className="hidden sm:inline">Comprovativos</span>
          </TabsTrigger>
          <TabsTrigger value="afiliados" className="gap-1.5">
            <Users className="size-4" />
            <span className="hidden sm:inline">Afiliados</span>
          </TabsTrigger>
          <TabsTrigger value="saques" className="gap-1.5">
            <Wallet className="size-4" />
            <span className="hidden sm:inline">Saques</span>
          </TabsTrigger>
          <TabsTrigger value="utilizadores" className="gap-1.5">
            <Users className="size-4" />
            <span className="hidden sm:inline">Utilizadores</span>
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="gap-1.5">
            <Settings className="size-4" />
            <span className="hidden sm:inline">Configurações</span>
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* TAB: PRODUTOS */}
        {/* ============================================================ */}
        {/* ============================================================ */}
        {/* TAB: DASHBOARD */}
        {/* ============================================================ */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="size-4" />
                <span className="text-xs font-medium">Produtos ativos</span>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {produtos.filter((p) => p.ativo).length}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShoppingCart className="size-4" />
                <span className="text-xs font-medium">Pedidos pendentes</span>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {pedidos.filter((p) => p.estado === 'pendente').length}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileCheck className="size-4" />
                <span className="text-xs font-medium">Comprovativos por rever</span>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {comprovativos.filter((c) => c.estado === 'pendente').length}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="size-4" />
                <span className="text-xs font-medium">Saques pendentes</span>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {saquesAdmin.filter((s) => s.estado === 'pendente').length}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShoppingCart className="size-4" />
                <span className="text-xs font-medium">Vendas confirmadas</span>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {pedidos.filter((p) => p.estado === 'pago').length}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Banknote className="size-4" />
                <span className="text-xs font-medium">Faturação confirmada</span>
              </div>
              <p className="mt-2 text-xl font-bold">
                {formatarMoeda(
                  pedidos
                    .filter((p) => p.estado === 'pago')
                    .reduce((soma, p) => soma + Number(p.subtotal), 0)
                )}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-4" />
                <span className="text-xs font-medium">Afiliados ativos</span>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {afiliadosAdmin.filter((a) => a.ativo).length}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FolderTree className="size-4" />
                <span className="text-xs font-medium">Categorias</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{categorias.length}</p>
            </div>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Os números refletem os dados já carregados nas restantes secções.
            Usa o botão "Atualizar" em cada aba para dados mais recentes.
          </p>
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB: PRODUTOS */}
        {/* ============================================================ */}
        <TabsContent value="produtos">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Produtos</h2>
            <Button onClick={abrirDialogoNovoProduto} size="sm">
              <Plus className="size-4" />
              Novo Produto
            </Button>
          </div>

          {carregandoProdutos ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[300px]">Título</TableHead>
                      <TableHead className="hidden md:table-cell">Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                      <TableHead>Ativo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum produto encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      produtos.map((produto) => (
                        <TableRow key={produto.id}>
                          <TableCell className="font-medium max-w-[300px] truncate">
                            {produto.titulo}
                            {produto.destaque && (
                              <Badge variant="secondary" className="ml-2 text-[10px]">
                                ⭐ Destaque
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {produto.categoria?.nome || produto.categoriaId}
                          </TableCell>
                          <TableCell>
                            {produto.precoPromocional && produto.precoPromocional > 0 ? (
                              <>
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                  {formatarMoeda(produto.precoPromocional)}
                                </span>
                                <span className="block text-xs text-muted-foreground line-through">
                                  {formatarMoeda(produto.precoNormal)}
                                </span>
                              </>
                            ) : (
                              formatarMoeda(produto.precoNormal)
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {produto.tipoProduto}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={produto.ativo}
                              onCheckedChange={() => alternarAtivoProduto(produto)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => abrirDialogoEditarProduto(produto)}
                                title="Editar"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  definirItemEliminar({
                                    tipo: 'produto',
                                    id: produto.id,
                                    titulo: produto.titulo,
                                  })
                                  definirDialogoConfirmacao(true)
                                }}
                                title="Eliminar"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB: CATEGORIAS */}
        {/* ============================================================ */}
        <TabsContent value="categorias">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Categorias</h2>
            <Button onClick={abrirDialogoNovaCategoria} size="sm">
              <Plus className="size-4" />
              Nova Categoria
            </Button>
          </div>

          {carregandoCategorias ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell">Slug</TableHead>
                      <TableHead className="hidden sm:table-cell">Descrição</TableHead>
                      <TableHead>Ativa</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorias.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhuma categoria encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      categorias.map((categoria) => (
                        <TableRow key={categoria.id}>
                          <TableCell className="font-medium">{categoria.nome}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {categoria.slug}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell max-w-[200px] truncate text-muted-foreground">
                            {categoria.descricao || '—'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={categoria.ativa
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800'
                              }
                            >
                              {categoria.ativa ? 'Sim' : 'Não'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => abrirDialogoEditarCategoria(categoria)}
                                title="Editar"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  definirItemEliminar({
                                    tipo: 'categoria',
                                    id: categoria.id,
                                    titulo: categoria.nome,
                                  })
                                  definirDialogoConfirmacao(true)
                                }}
                                title="Eliminar"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB: PEDIDOS */}
        {/* ============================================================ */}
        <TabsContent value="pedidos">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pedidos</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                carregarPedidos()
                carregarComprovativos()
              }}
            >
              <RefreshCw className="size-4" />
              Atualizar
            </Button>
          </div>

          {carregandoPedidos ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Referência</TableHead>
                      <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                      <TableHead className="hidden md:table-cell">Data</TableHead>
                      <TableHead className="hidden lg:table-cell">Pagamento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Nenhum pedido encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      pedidos.map((pedido) => (
                        <React.Fragment key={pedido.id}>
                          <TableRow>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => alternarPedidoExpandido(pedido.id)}
                              >
                                {pedidosExpandidos.has(pedido.id) ? (
                                  <ChevronUp className="size-3.5" />
                                ) : (
                                  <ChevronDown className="size-3.5" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-mono text-sm font-medium">
                              {pedido.referencia}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {pedido.perfil?.email || pedido.perfilId}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                              {formatarData(pedido.criadoEm)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="outline" className="text-[10px]">
                                {obterRotuloMetodoPagamento(pedido.metodoPagamento)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={obterBadgeEstado(pedido.estado)}>
                                {obterRotuloEstado(pedido.estado)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatarMoeda(pedido.subtotal, pedido.moeda)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {pedido.estado === 'pendente' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="size-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                      onClick={() => alterarEstadoPedido(pedido.id, 'pago')}
                                      title="Aprovar"
                                    >
                                      <Check className="size-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                      onClick={() => alterarEstadoPedido(pedido.id, 'rejeitado')}
                                      title="Rejeitar"
                                    >
                                      <X className="size-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          {/* Linha expandida com itens do pedido */}
                          <AnimatePresence>
                            {pedidosExpandidos.has(pedido.id) && (
                              <TableRow key={`${pedido.id}-itens`}>
                                <TableCell colSpan={8} className="bg-muted/30 p-0">
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-4">
                                      <p className="text-sm font-medium mb-2 text-muted-foreground">
                                        Itens do pedido
                                      </p>
                                      {pedido.itens && pedido.itens.length > 0 ? (
                                        <div className="space-y-2">
                                          {pedido.itens.map((item) => (
                                            <div
                                              key={item.id}
                                              className="flex items-center justify-between text-sm bg-background rounded-md border px-3 py-2"
                                            >
                                              <div className="flex items-center gap-2">
                                                <BookOpen className="size-4 text-muted-foreground" />
                                                <span>{item.titulo}</span>
                                                <Badge variant="outline" className="text-[10px]">
                                                  {item.formato.toUpperCase()}
                                                </Badge>
                                              </div>
                                              <span className="font-medium">
                                                {formatarMoeda(item.preco)}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground">
                                          A carregar itens...
                                        </p>
                                      )}
                                    </div>
                                  </motion.div>
                                </TableCell>
                              </TableRow>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB: COMPROVATIVOS */}
        {/* ============================================================ */}
        <TabsContent value="comprovativos">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Comprovativos Pendentes
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={carregarComprovativos}
            >
              <RefreshCw className="size-4" />
              Atualizar
            </Button>
          </div>

          {carregandoComprovativos ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Pedido</TableHead>
                      <TableHead className="hidden sm:table-cell">Data</TableHead>
                      <TableHead>Ficheiro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comprovativos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Nenhum comprovativo pendente
                        </TableCell>
                      </TableRow>
                    ) : (
                      comprovativos
                        .filter((c) => c.estado === 'pendente')
                        .map((comp) => (
                          <TableRow key={comp.id}>
                            <TableCell className="font-mono text-sm font-medium">
                              {comp.pedido?.referencia || comp.pedidoId}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                              {formatarData(comp.criadoEm)}
                            </TableCell>
                            <TableCell>
                              <a
                                href={comp.ficheiroUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                              >
                                <Eye className="size-3.5" />
                                Ver comprovativo
                              </a>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                  onClick={() => alterarEstadoComprovativo(comp.pedidoId, 'aprovado')}
                                >
                                  <Check className="size-3.5" />
                                  <span className="hidden sm:inline">Aprovar</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={() => alterarEstadoComprovativo(comp.pedidoId, 'rejeitado')}
                                >
                                  <X className="size-3.5" />
                                  <span className="hidden sm:inline">Rejeitar</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB: AFILIADOS */}
        {/* ============================================================ */}
        <TabsContent value="afiliados">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Afiliados</h2>
            <Button variant="outline" size="sm" onClick={carregarAfiliadosAdmin}>
              <RefreshCw className="size-4" />
              Atualizar
            </Button>
          </div>

          {carregandoAfiliadosAdmin ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Afiliado</TableHead>
                      <TableHead className="hidden sm:table-cell">Código</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead className="hidden sm:table-cell text-right">Total Ganho</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {afiliadosAdmin.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum afiliado registado
                        </TableCell>
                      </TableRow>
                    ) : (
                      afiliadosAdmin.map((afiliado) => (
                        <TableRow key={afiliado.id}>
                          <TableCell>
                            <p className="font-medium">{afiliado.perfil?.nomeCompleto}</p>
                            <p className="text-xs text-muted-foreground">{afiliado.perfil?.email}</p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell font-mono text-sm">
                            {afiliado.codigoRef}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatarMoeda(afiliado.saldo)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-right text-muted-foreground">
                            {formatarMoeda((afiliado as any).totalGanho ?? 0)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={afiliado.ativo ? 'default' : 'secondary'}>
                              {afiliado.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB: SAQUES */}
        {/* ============================================================ */}
        <TabsContent value="saques">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pedidos de Saque</h2>
            <Button variant="outline" size="sm" onClick={carregarSaquesAdmin}>
              <RefreshCw className="size-4" />
              Atualizar
            </Button>
          </div>

          {carregandoSaquesAdmin ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Afiliado</TableHead>
                      <TableHead className="hidden sm:table-cell">Data</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Dados de Recebimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saquesAdmin.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum pedido de saque
                        </TableCell>
                      </TableRow>
                    ) : (
                      saquesAdmin.map((saque) => (
                        <TableRow key={saque.id}>
                          <TableCell>
                            <p className="font-medium">{saque.afiliado?.perfil?.nomeCompleto}</p>
                            <p className="text-xs text-muted-foreground">{saque.afiliado?.codigoRef}</p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                            {formatarData(saque.criadoEm)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {obterRotuloMetodoPagamento(saque.metodo)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {saque.dadosRecebimento?.iban && (
                              <>
                                {saque.dadosRecebimento.titularConta} · {saque.dadosRecebimento.banco}
                                <br />
                                {saque.dadosRecebimento.iban}
                              </>
                            )}
                            {saque.dadosRecebimento?.emailAirtm && `Airtm: ${saque.dadosRecebimento.emailAirtm}`}
                            {saque.dadosRecebimento?.emailPaypal && `PayPal: ${saque.dadosRecebimento.emailPaypal}`}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatarMoeda(saque.valor)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                saque.estado === 'pago'
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0'
                                  : saque.estado === 'rejeitado'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-100 border-0'
                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-0'
                              }
                            >
                              {obterRotuloEstado(saque.estado)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {saque.estado === 'pendente' && (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  onClick={() => alterarEstadoSaque(saque.id, 'pago')}
                                >
                                  <Check className="size-3.5" />
                                  <span className="hidden sm:inline">Marcar Pago</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => alterarEstadoSaque(saque.id, 'rejeitado')}
                                >
                                  <X className="size-3.5" />
                                  <span className="hidden sm:inline">Rejeitar</span>
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB: UTILIZADORES */}
        {/* ============================================================ */}
        <TabsContent value="utilizadores">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Utilizadores</h2>
            <Button variant="outline" size="sm" onClick={carregarUtilizadoresAdmin}>
              <RefreshCw className="size-4" />
              Atualizar
            </Button>
          </div>

          {carregandoUtilizadoresAdmin ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Utilizador</TableHead>
                      <TableHead className="hidden sm:table-cell">Registado em</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Conta</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {utilizadoresAdmin.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum utilizador encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      utilizadoresAdmin.map((utilizador) => (
                        <TableRow key={utilizador.id}>
                          <TableCell>
                            <p className="font-medium">{utilizador.nomeCompleto}</p>
                            <p className="text-xs text-muted-foreground">{utilizador.email}</p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                            {formatarData(utilizador.criadoEm)}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={utilizador.isAdmin}
                              onCheckedChange={(valor) => alternarAdminUtilizador(utilizador.id, valor)}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                utilizador.ativo
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-100 border-0'
                              }
                            >
                              {utilizador.ativo ? 'Ativo' : 'Desativado'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => alternarAtivoUtilizador(utilizador.id, !utilizador.ativo)}
                            >
                              {utilizador.ativo ? 'Desativar' : 'Reativar'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB: CONFIGURAÇÕES */}
        {/* ============================================================ */}
        <TabsContent value="configuracoes">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Configurações do Sistema</h2>
          </div>

          {carregandoConfiguracao ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-lg border p-6 max-w-2xl space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Métodos de Pagamento</h3>
                <p className="text-sm text-muted-foreground">
                  Configure os dados de recebimento para cada método de pagamento disponível.
                </p>
              </div>

              <Separator />

              {/* AirTM */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">AirTM</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="airtm_email">Email AirTM</Label>
                    <Input
                      id="airtm_email"
                      type="email"
                      placeholder="seu@email.airtm.com"
                      value={configuracao.airtm_email}
                      onChange={(e) =>
                        definirConfiguracao((c) => ({ ...c, airtm_email: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="airtm_nome">Nome AirTM</Label>
                    <Input
                      id="airtm_nome"
                      type="text"
                      placeholder="Nome no AirTM"
                      value={configuracao.airtm_nome}
                      onChange={(e) =>
                        definirConfiguracao((c) => ({ ...c, airtm_nome: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* PayPal */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">PayPal</h4>
                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="paypal_email">Email PayPal</Label>
                  <Input
                    id="paypal_email"
                    type="email"
                    placeholder="seu@email.paypal.com"
                    value={configuracao.paypal_email}
                    onChange={(e) =>
                      definirConfiguracao((c) => ({ ...c, paypal_email: e.target.value }))
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Suporte */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Suporte ao Cliente</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email_suporte">Email de Suporte</Label>
                    <Input
                      id="email_suporte"
                      type="email"
                      placeholder="suporte@angolareads.com"
                      value={configuracao.email_suporte}
                      onChange={(e) =>
                        definirConfiguracao((c) => ({ ...c, email_suporte: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_suporte">WhatsApp de Suporte</Label>
                    <Input
                      id="whatsapp_suporte"
                      type="tel"
                      placeholder="+244 9XX XXX XXX"
                      value={configuracao.whatsapp_suporte}
                      onChange={(e) =>
                        definirConfiguracao((c) => ({ ...c, whatsapp_suporte: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end pt-2">
                <Button onClick={guardarConfiguracao} disabled={salvando}>
                  {salvando ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Guardar Configuração
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ============================================================ */}
      {/* DIÁLOGO: PRODUTO */}
      {/* ============================================================ */}
      <Dialog open={dialogoProdutoAberto} onOpenChange={definirDialogoProduto}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editandoProduto ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {editandoProduto
                ? 'Atualize os dados do produto abaixo.'
                : 'Preencha os dados para criar um novo produto.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="produto_titulo">Título *</Label>
              <Input
                id="produto_titulo"
                placeholder="Título do produto"
                value={formularioProduto.titulo}
                onChange={(e) =>
                  definirFormularioProduto((f) => ({ ...f, titulo: e.target.value }))
                }
              />
            </div>

            {/* Descrição Curta */}
            <div className="space-y-2">
              <Label htmlFor="produto_descricao_curta">Descrição Curta</Label>
              <Input
                id="produto_descricao_curta"
                placeholder="Breve descrição para listagens"
                value={formularioProduto.descricaoCurta}
                onChange={(e) =>
                  definirFormularioProduto((f) => ({ ...f, descricaoCurta: e.target.value }))
                }
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="produto_descricao">Descrição Completa *</Label>
              <Textarea
                id="produto_descricao"
                placeholder="Descrição detalhada do produto..."
                rows={5}
                value={formularioProduto.descricao}
                onChange={(e) =>
                  definirFormularioProduto((f) => ({ ...f, descricao: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Tipo de Produto */}
              <div className="space-y-2">
                <Label>Tipo de Produto</Label>
                <Select
                  value={formularioProduto.tipoProduto}
                  onValueChange={(valor) =>
                    definirFormularioProduto((f) => ({ ...f, tipoProduto: valor }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ebook">Ebook</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                    <SelectItem value="curso_limitado">Curso Limitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select
                  value={formularioProduto.categoriaId}
                  onValueChange={(valor) =>
                    definirFormularioProduto((f) => ({ ...f, categoriaId: valor }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias
                      .filter((c) => c.ativa)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />\n
            {/* Preços */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Preços</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="produto_preco_normal">Preço Normal (AOA) *</Label>
                  <Input
                    id="produto_preco_normal"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    value={formularioProduto.precoNormal || ''}
                    onChange={(e) =>
                      definirFormularioProduto((f) => ({
                        ...f,
                        precoNormal: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="produto_preco_promo">Preço Promocional (AOA)</Label>
                  <Input
                    id="produto_preco_promo"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00 (opcional)"
                    value={formularioProduto.precoPromocional || ''}
                    onChange={(e) =>
                      definirFormularioProduto((f) => ({
                        ...f,
                        precoPromocional: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="produto_preco_usd">Preço USD ($)</Label>
                  <Input
                    id="produto_preco_usd"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00 (opcional)"
                    value={formularioProduto.precoUsd || ''}
                    onChange={(e) =>
                      definirFormularioProduto((f) => ({
                        ...f,
                        precoUsd: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="produto_preco_eur">Preço EUR (€)</Label>
                  <Input
                    id="produto_preco_eur"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00 (opcional)"
                    value={formularioProduto.precoEur || ''}
                    onChange={(e) =>
                      definirFormularioProduto((f) => ({
                        ...f,
                        precoEur: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Comissão de Afiliado */}
              <div className="space-y-2">
                <Label>Comissão de Afiliado (%)</Label>
                <Select
                  value={String(formularioProduto.comissaoAfiliado)}
                  onValueChange={(valor) =>
                    definirFormularioProduto((f) => ({
                      ...f,
                      comissaoAfiliado: parseInt(valor, 10),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="40">40%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Destaque */}
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={formularioProduto.destaque}
                  onCheckedChange={(valor) =>
                    definirFormularioProduto((f) => ({ ...f, destaque: valor }))
                  }
                />
                <Label>Produto em Destaque</Label>
              </div>
            </div>

            <Separator />

            {/* Uploads */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Ficheiros</h4>

              {/* Capa */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <IconeImagem className="size-4" />
                  Imagem de Capa
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const ficheiro = e.target.files?.[0]
                    if (ficheiro) refFicheiroCapa.current = ficheiro
                  }}
                  className="cursor-pointer"
                />
                {formularioProduto.capaUrl && (
                  <p className="text-xs text-muted-foreground truncate">
                    Ficheiro atual: {formularioProduto.capaUrl}
                  </p>
                )}
              </div>

              {/* PDF */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="size-4" />
                  Ficheiro PDF
                </Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const ficheiro = e.target.files?.[0]
                    if (ficheiro) refFicheiroPdf.current = ficheiro
                  }}
                  className="cursor-pointer"
                />
                {formularioProduto.formatoPdf && (
                  <p className="text-xs text-muted-foreground truncate">
                    Ficheiro atual: {formularioProduto.formatoPdf}
                  </p>
                )}
              </div>

              {/* EPUB */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BookOpen className="size-4" />
                  Ficheiro EPUB
                </Label>
                <Input
                  type="file"
                  accept=".epub"
                  onChange={(e) => {
                    const ficheiro = e.target.files?.[0]
                    if (ficheiro) refFicheiroEpub.current = ficheiro
                  }}
                  className="cursor-pointer"
                />
                {formularioProduto.formatoEpub && (
                  <p className="text-xs text-muted-foreground truncate">
                    Ficheiro atual: {formularioProduto.formatoEpub}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => definirDialogoProduto(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button onClick={guardarProduto} disabled={salvando}>
              {salvando ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  A guardar...
                </>
              ) : editandoProduto ? (
                'Atualizar Produto'
              ) : (
                'Criar Produto'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* DIÁLOGO: CATEGORIA */}
      {/* ============================================================ */}
      <Dialog open={dialogoCategoriaAberto} onOpenChange={definirDialogoCategoria}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editandoCategoria ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editandoCategoria
                ? 'Atualize os dados da categoria.'
                : 'Preencha os dados para criar uma nova categoria.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="categoria_nome">Nome *</Label>
              <Input
                id="categoria_nome"
                placeholder="Nome da categoria"
                value={formularioCategoria.nome}
                onChange={(e) =>
                  definirFormularioCategoria((f) => ({ ...f, nome: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria_descricao">Descrição</Label>
              <Textarea
                id="categoria_descricao"
                placeholder="Descrição da categoria"
                rows={3}
                value={formularioCategoria.descricao}
                onChange={(e) =>
                  definirFormularioCategoria((f) => ({ ...f, descricao: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria_slug">Slug *</Label>
              <Input
                id="categoria_slug"
                placeholder="url-da-categoria"
                value={formularioCategoria.slug}
                onChange={(e) =>
                  definirFormularioCategoria((f) => ({ ...f, slug: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formularioCategoria.ativa}
                onCheckedChange={(valor) =>
                  definirFormularioCategoria((f) => ({ ...f, ativa: valor }))
                }
              />
              <Label>Categoria Ativa</Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => definirDialogoCategoria(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button onClick={guardarCategoria} disabled={salvando}>
              {salvando ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  A guardar...
                </>
              ) : editandoCategoria ? (
                'Atualizar Categoria'
              ) : (
                'Criar Categoria'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* DIÁLOGO: CONFIRMAÇÃO DE ELIMINAÇÃO */}
      {/* ============================================================ */}
      <AlertDialog open={dialogoConfirmacaoAberto} onOpenChange={definirDialogoConfirmacao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar{' '}
              <strong>{itemEliminar?.titulo}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemEliminar?.tipo === 'produto') {
                  eliminarProduto()
                } else if (itemEliminar?.tipo === 'categoria') {
                  eliminarCategoria()
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </motion.div>
    </div>
  )
}
