'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Copy,
  Check,
  Users,
  DollarSign,
  Clock,
  Wallet,
  Link2,
  Share2,
  TrendingUp,
  Gift,
  AlertCircle,
  Loader2,
  Eye,
  MessageSquare,
  Globe,
  BarChart2,
  Banknote,
  Pencil,
  XCircle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usarNavegacao } from '@/lojas/navegacao'
import { usarAutenticacao } from '@/lojas/autenticacao'
import { formatarPreco } from '@/lib/autenticacao'
import { toast } from 'sonner'

// ============================================================
// Tipos
// ============================================================

interface ContaAfiliado {
  id: string
  codigoAfiliado: string
  utilizadorId: string
  totalVendas: number
  comissoesPendentes: number
  comissoesPagas: number
  saldoDisponivel: number
  percentagemComissao: number
}

interface Comissao {
  id: string
  data: string
  produto: string
  valor: number
  percentagem: number
  estado: 'pendente' | 'paga'
}

interface DadosRecebimento {
  metodoRecebimento: 'transferencia_bancaria' | 'airtm' | 'paypal' | null
  titularConta: string | null
  iban: string | null
  banco: string | null
  emailAirtm: string | null
  emailPaypal: string | null
}

interface PedidoSaque {
  id: string
  valor: number
  metodo: string
  estado: 'pendente' | 'pago' | 'rejeitado'
  observacoesAdmin: string | null
  criadoEm: string
}

// ============================================================
// Animações
// ============================================================

const varianteContainer = {
  oculto: { opacity: 0 },
  visivel: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const varianteItem = {
  oculto: { opacity: 0, y: 20 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// ============================================================
// Componente: Secção Tornar-se Afiliado
// ============================================================

function SecaoTornarAfiliado({
  criandoConta,
  criarContaAfiliado,
}: {
  criandoConta: boolean
  criarContaAfiliado: () => void
}) {
  return (
    <motion.div
      key="sem-conta"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-8 text-center sm:px-8 sm:py-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100"
          >
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          </motion.div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Tornar-me Afiliado
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-gray-600">
            Junta-te ao nosso programa de afiliados e começa a ganhar
            comissões por cada venda que gerares. É simples, gratuito e
            sem complicações.
          </p>
        </div>

        <CardContent className="px-6 py-6 sm:px-8">
          {/* Benefícios */}
          <motion.div
            variants={varianteContainer}
            initial="oculto"
            animate="visivel"
            className="mb-8 grid gap-4 sm:grid-cols-3"
          >
            {[
              {
                icone: DollarSign,
                titulo: '20-40% de Comissão',
                descricao:
                  'Ganha entre 20% e 40% do valor de cada venda realizada através do teu link.',
              },
              {
                icone: Wallet,
                titulo: 'Pagamentos Seguros',
                descricao:
                  'Recebe as tuas comissões de forma segura e transparente directamente na tua conta.',
              },
              {
                icone: BarChart2,
                titulo: 'Painel Completo',
                descricao:
                  'Acompanha as tuas vendas e comissões em tempo real num painel dedicado.',
              },
            ].map((beneficio) => (
              <motion.div
                key={beneficio.titulo}
                variants={varianteItem}
                className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  <beneficio.icone className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-gray-900">
                  {beneficio.titulo}
                </h3>
                <p className="text-xs leading-relaxed text-gray-500">
                  {beneficio.descricao}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Como funciona */}
          <div className="mb-8">
            <h3 className="mb-4 text-center text-lg font-semibold text-gray-900">
              Como Funciona?
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  passo: '1',
                  titulo: 'Regista-te',
                  descricao:
                    'Cria a tua conta de afiliado gratuitamente com um clique.',
                },
                {
                  passo: '2',
                  titulo: 'Partilha o Link',
                  descricao:
                    'Partilha o teu link de afiliado nas redes sociais, WhatsApp ou blog.',
                },
                {
                  passo: '3',
                  titulo: 'Ganha Comissões',
                  descricao:
                    'Recebe comissões automáticas por cada venda gerada pelo teu link.',
                },
              ].map((item, indice) => (
                <motion.div
                  key={item.passo}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + indice * 0.1 }}
                  className="relative text-center"
                >
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                    {item.passo}
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-gray-900">
                    {item.titulo}
                  </h4>
                  <p className="text-xs text-gray-500">{item.descricao}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Botão de registo */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={criarContaAfiliado}
              disabled={criandoConta}
              className="bg-emerald-600 px-8 text-white hover:bg-emerald-700"
            >
              {criandoConta ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A criar conta...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Criar Conta de Afiliado
                </>
              )}
            </Button>
            <p className="mt-3 text-xs text-gray-400">
              Ao criar a conta, aceitas os termos do programa de afiliados.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================================
// Componente: Secção Painel do Afiliado
// ============================================================

function SecaoPainelAfiliado({
  contaAfiliado,
  comissoes,
  utilizadorNome,
  dadosRecebimento,
  saqueMinimo,
  saques,
  editandoRecebimento,
  definirEditandoRecebimento,
  guardandoRecebimento,
  formRecebimento,
  definirFormRecebimento,
  guardarDadosRecebimento,
  valorSaque,
  definirValorSaque,
  solicitandoSaque,
  solicitarSaque,
}: {
  contaAfiliado: ContaAfiliado
  comissoes: Comissao[]
  utilizadorNome: string
  dadosRecebimento: DadosRecebimento | null
  saqueMinimo: number
  saques: PedidoSaque[]
  editandoRecebimento: boolean
  definirEditandoRecebimento: (valor: boolean) => void
  guardandoRecebimento: boolean
  formRecebimento: {
    metodoRecebimento: 'transferencia_bancaria' | 'airtm' | 'paypal'
    titularConta: string
    iban: string
    banco: string
    emailAirtm: string
    emailPaypal: string
  }
  definirFormRecebimento: (valor: {
    metodoRecebimento: 'transferencia_bancaria' | 'airtm' | 'paypal'
    titularConta: string
    iban: string
    banco: string
    emailAirtm: string
    emailPaypal: string
  }) => void
  guardarDadosRecebimento: () => void
  valorSaque: string
  definirValorSaque: (valor: string) => void
  solicitandoSaque: boolean
  solicitarSaque: () => void
}) {
  const [copiado, definirCopiado] = useState<string | null>(null)

  const linkPartilha = `https://angolareads.vercel.app/?ref=${contaAfiliado.codigoAfiliado}`

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(valor)

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr)
    return data.toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const copiarTexto = async (texto: string, identificador: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      definirCopiado(identificador)
      toast.success('Copiado para a área de transferência!')
      setTimeout(() => definirCopiado(null), 2000)
    } catch {
      toast.error('Erro ao copiar')
    }
  }

  return (
    <motion.div
      key="com-conta"
      variants={varianteContainer}
      initial="oculto"
      animate="visivel"
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Mensagem de boas-vindas e código */}
      <motion.div variants={varianteItem}>
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-6 text-white sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  Olá, {utilizadorNome}! 👋
                </h2>
                <p className="mt-1 text-emerald-100">
                  Aqui está o resumo da tua conta de afiliado.
                </p>
              </div>
              <Badge className="w-fit bg-amber-400/20 px-3 py-1 text-amber-100 hover:bg-amber-400/30">
                {contaAfiliado.percentagemComissao}% de comissão
              </Badge>
            </div>
          </div>
          <CardContent className="px-6 py-5 sm:px-8">
            {/* Código de afiliado */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-gray-500">
                O teu código de afiliado:
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-3">
                  <code className="text-lg font-bold tracking-wider text-emerald-700 sm:text-xl">
                    {contaAfiliado.codigoAfiliado}
                  </code>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copiarTexto(contaAfiliado.codigoAfiliado, 'codigo')}
                  className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {copiado === 'codigo' ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Link de partilha */}
            <div>
              <p className="mb-2 text-sm font-medium text-gray-500">
                O teu link de partilha:
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="truncate text-sm text-gray-700">{linkPartilha}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copiarTexto(linkPartilha, 'link')}
                  className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {copiado === 'link' ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cartões de estatísticas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            icone: Users,
            rotulo: 'Total de Vendas',
            valor: contaAfiliado.totalVendas,
            cor: 'bg-emerald-50 text-emerald-600',
          },
          {
            icone: Clock,
            rotulo: 'Comissões Pendentes',
            valor: contaAfiliado.comissoesPendentes,
            cor: 'bg-amber-50 text-amber-600',
            formatoMoeda: true,
          },
          {
            icone: DollarSign,
            rotulo: 'Comissões Pagas',
            valor: contaAfiliado.comissoesPagas,
            cor: 'bg-emerald-50 text-emerald-600',
            formatoMoeda: true,
          },
          {
            icone: Wallet,
            rotulo: 'Saldo Disponível',
            valor: contaAfiliado.saldoDisponivel,
            cor: 'bg-teal-50 text-teal-600',
            formatoMoeda: true,
          },
        ].map((stat) => (
          <motion.div key={stat.rotulo} variants={varianteItem}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.cor}`}>
                    <stat.icone className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.formatoMoeda ? formatarMoeda(stat.valor) : stat.valor}
                </p>
                <p className="mt-1 text-xs text-gray-500">{stat.rotulo}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Conta de recebimento + Pedido de saque */}
      <motion.div variants={varianteItem}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Banknote className="h-4 w-4 text-emerald-600" />
                Conta de Recebimento
              </CardTitle>
              {dadosRecebimento?.metodoRecebimento && !editandoRecebimento && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => definirEditandoRecebimento(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!dadosRecebimento?.metodoRecebimento || editandoRecebimento ? (
              <div className="space-y-4">
                <div>
                  <Label className="mb-1.5 block text-xs text-gray-600">
                    Método de recebimento
                  </Label>
                  <Select
                    value={formRecebimento.metodoRecebimento}
                    onValueChange={(valor) =>
                      definirFormRecebimento({
                        ...formRecebimento,
                        metodoRecebimento: valor as 'transferencia_bancaria' | 'airtm' | 'paypal',
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transferencia_bancaria">Transferência Bancária</SelectItem>
                      <SelectItem value="airtm">Airtm</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formRecebimento.metodoRecebimento === 'transferencia_bancaria' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="mb-1.5 block text-xs text-gray-600">Titular da conta</Label>
                      <Input
                        value={formRecebimento.titularConta}
                        onChange={(e) =>
                          definirFormRecebimento({ ...formRecebimento, titularConta: e.target.value })
                        }
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-xs text-gray-600">Banco</Label>
                      <Input
                        value={formRecebimento.banco}
                        onChange={(e) =>
                          definirFormRecebimento({ ...formRecebimento, banco: e.target.value })
                        }
                        placeholder="Ex: BAI, BFA, BIC..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="mb-1.5 block text-xs text-gray-600">IBAN</Label>
                      <Input
                        value={formRecebimento.iban}
                        onChange={(e) =>
                          definirFormRecebimento({ ...formRecebimento, iban: e.target.value })
                        }
                        placeholder="AO06 0000 0000 0000 0000 0000 0"
                      />
                    </div>
                  </div>
                )}

                {formRecebimento.metodoRecebimento === 'airtm' && (
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-600">Email da Airtm</Label>
                    <Input
                      type="email"
                      value={formRecebimento.emailAirtm}
                      onChange={(e) =>
                        definirFormRecebimento({ ...formRecebimento, emailAirtm: e.target.value })
                      }
                      placeholder="oteu@email.com"
                    />
                  </div>
                )}

                {formRecebimento.metodoRecebimento === 'paypal' && (
                  <div>
                    <Label className="mb-1.5 block text-xs text-gray-600">Email do PayPal</Label>
                    <Input
                      type="email"
                      value={formRecebimento.emailPaypal}
                      onChange={(e) =>
                        definirFormRecebimento({ ...formRecebimento, emailPaypal: e.target.value })
                      }
                      placeholder="oteu@email.com"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    disabled={guardandoRecebimento}
                    onClick={guardarDadosRecebimento}
                  >
                    {guardandoRecebimento ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Guardar
                  </Button>
                  {dadosRecebimento?.metodoRecebimento && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => definirEditandoRecebimento(false)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-700">
                <p className="font-medium">
                  {dadosRecebimento.metodoRecebimento === 'transferencia_bancaria' && 'Transferência Bancária'}
                  {dadosRecebimento.metodoRecebimento === 'airtm' && 'Airtm'}
                  {dadosRecebimento.metodoRecebimento === 'paypal' && 'PayPal'}
                </p>
                {dadosRecebimento.metodoRecebimento === 'transferencia_bancaria' && (
                  <p className="mt-1 text-xs text-gray-500">
                    {dadosRecebimento.titularConta} · {dadosRecebimento.banco}
                    <br />
                    {dadosRecebimento.iban}
                  </p>
                )}
                {dadosRecebimento.metodoRecebimento === 'airtm' && (
                  <p className="mt-1 text-xs text-gray-500">{dadosRecebimento.emailAirtm}</p>
                )}
                {dadosRecebimento.metodoRecebimento === 'paypal' && (
                  <p className="mt-1 text-xs text-gray-500">{dadosRecebimento.emailPaypal}</p>
                )}
              </div>
            )}

            <Separator />

            {/* Pedido de saque */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">Pedir Saque</p>
                <p className="text-xs text-gray-500">
                  Saldo disponível: <strong>{formatarMoeda(contaAfiliado.saldoDisponivel)}</strong>
                </p>
              </div>
              <p className="mb-3 text-xs text-gray-500">Saque mínimo: 3.000 Kz</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="number"
                  min={saqueMinimo}
                  placeholder={`Valor a levantar (mín. ${saqueMinimo.toLocaleString('pt-AO')} Kz)`}
                  value={valorSaque}
                  onChange={(e) => definirValorSaque(e.target.value)}
                  className="sm:flex-1"
                />
                <Button
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                  disabled={solicitandoSaque || contaAfiliado.saldoDisponivel < saqueMinimo}
                  onClick={solicitarSaque}
                >
                  {solicitandoSaque ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet className="h-4 w-4" />
                  )}
                  Solicitar Saque
                </Button>
              </div>
              {contaAfiliado.saldoDisponivel < saqueMinimo && (
                <p className="mt-2 text-xs text-amber-600">
                  Precisas de pelo menos {saqueMinimo.toLocaleString('pt-AO')} Kz de saldo para
                  poderes solicitar um saque.
                </p>
              )}
            </div>

            {/* Histórico de saques */}
            {saques.length > 0 && (
              <div className="pt-2">
                <p className="mb-2 text-sm font-medium text-gray-800">Histórico de Saques</p>
                <div className="space-y-2">
                  {saques.map((saque) => (
                    <div
                      key={saque.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {formatarMoeda(saque.valor)}
                        </p>
                        <p className="text-xs text-gray-500">{formatarData(saque.criadoEm)}</p>
                      </div>
                      <Badge
                        className={
                          saque.estado === 'pago'
                            ? 'border-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : saque.estado === 'rejeitado'
                              ? 'border-0 bg-red-100 text-red-700 hover:bg-red-100'
                              : 'border-0 bg-amber-100 text-amber-700 hover:bg-amber-100'
                        }
                      >
                        {saque.estado === 'pago' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {saque.estado === 'rejeitado' && <XCircle className="mr-1 h-3 w-3" />}
                        {saque.estado === 'pendente' && <Clock className="mr-1 h-3 w-3" />}
                        {saque.estado === 'pago'
                          ? 'Pago'
                          : saque.estado === 'rejeitado'
                            ? 'Rejeitado'
                            : 'Pendente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabela de comissões recentes */}
      <motion.div variants={varianteItem}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Comissões Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {comissoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <AlertCircle className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  Nenhuma comissão registada
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Começa a partilhar o teu link para gerar as tuas primeiras comissões!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100 hover:bg-transparent">
                      <TableHead className="text-xs font-medium text-gray-500">Data</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500">Produto</TableHead>
                      <TableHead className="text-right text-xs font-medium text-gray-500">Valor</TableHead>
                      <TableHead className="text-right text-xs font-medium text-gray-500">%</TableHead>
                      <TableHead className="text-right text-xs font-medium text-gray-500">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comissoes.map((comissao) => (
                      <TableRow key={comissao.id} className="border-gray-50">
                        <TableCell className="text-sm text-gray-600">
                          {formatarData(comissao.data)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm font-medium text-gray-900">
                          {comissao.produto}
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-900">
                          {formatarMoeda(comissao.valor)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-600">
                          {comissao.percentagem}%
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={comissao.estado === 'paga' ? 'default' : 'secondary'}
                            className={
                              comissao.estado === 'paga'
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                            }
                          >
                            {comissao.estado === 'paga' ? 'Paga' : 'Pendente'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Instruções de partilha */}
      <motion.div variants={varianteItem}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Share2 className="h-4 w-4 text-emerald-600" />
              Como Partilhar o Teu Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icone: MessageSquare,
                  titulo: 'WhatsApp',
                  descricao:
                    'Envia o teu link directamente para contactos e grupos do WhatsApp. É o canal com maior conversão!',
                },
                {
                  icone: Globe,
                  titulo: 'Redes Sociais',
                  descricao:
                    'Partilha no Facebook, Instagram, Twitter/X ou TikTok. Cria conteúdo atraente sobre os ebooks.',
                },
                {
                  icone: Eye,
                  titulo: 'Blog ou Website',
                  descricao:
                    'Se tens um blog ou website, coloca o teu link em artigos, banners ou recomendações.',
                },
              ].map((canal) => (
                <div key={canal.titulo} className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                    <canal.icone className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-gray-900">
                    {canal.titulo}
                  </h4>
                  <p className="text-xs leading-relaxed text-gray-500">
                    {canal.descricao}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="text-sm text-emerald-800">
                <strong>Dica:</strong> Sempre que alguém comprar um ebook
                através do teu link, a comissão é registada automaticamente
                na tua conta. Quanto mais partilhares, mais ganhas!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ============================================================
// Componente Principal
// ============================================================

export default function PainelAfiliado() {
  const { voltar, navegarPara } = usarNavegacao()
  const { estaAutenticado, carregando: carregandoAuth, utilizador } = usarAutenticacao()

  const [contaAfiliado, definirContaAfiliado] = useState<ContaAfiliado | null>(null)
  const [comissoes, definirComissoes] = useState<Comissao[]>([])
  const [carregando, definirCarregando] = useState(true)
  const [criandoConta, definirCriandoConta] = useState(false)

  // Dados de recebimento + saques
  const [dadosRecebimento, definirDadosRecebimento] = useState<DadosRecebimento | null>(null)
  const [saqueMinimo, definirSaqueMinimo] = useState(3000)
  const [saques, definirSaques] = useState<PedidoSaque[]>([])
  const [editandoRecebimento, definirEditandoRecebimento] = useState(false)
  const [guardandoRecebimento, definirGuardandoRecebimento] = useState(false)
  const [solicitandoSaque, definirSolicitandoSaque] = useState(false)
  const [valorSaque, definirValorSaque] = useState('')
  const [formRecebimento, definirFormRecebimento] = useState({
    metodoRecebimento: 'transferencia_bancaria' as 'transferencia_bancaria' | 'airtm' | 'paypal',
    titularConta: '',
    iban: '',
    banco: '',
    emailAirtm: '',
    emailPaypal: '',
  })

  // Buscar dados do afiliado
  const buscarDadosAfiliado = useCallback(async () => {
    definirCarregando(true)
    try {
      const resposta = await fetch('/api/afiliados')
      if (resposta.ok) {
        const dados = await resposta.json()
        definirContaAfiliado(dados.conta)
        definirComissoes(dados.comissoes ?? [])
        definirDadosRecebimento(dados.dadosRecebimento ?? null)
        definirSaqueMinimo(dados.saqueMinimo ?? 3000)
        if (dados.dadosRecebimento?.metodoRecebimento) {
          definirFormRecebimento({
            metodoRecebimento: dados.dadosRecebimento.metodoRecebimento,
            titularConta: dados.dadosRecebimento.titularConta || '',
            iban: dados.dadosRecebimento.iban || '',
            banco: dados.dadosRecebimento.banco || '',
            emailAirtm: dados.dadosRecebimento.emailAirtm || '',
            emailPaypal: dados.dadosRecebimento.emailPaypal || '',
          })
        }
      } else if (resposta.status === 404) {
        definirContaAfiliado(null)
      }
    } catch {
      toast.error('Erro ao carregar dados do afiliado')
    } finally {
      definirCarregando(false)
    }
  }, [])

  // Buscar histórico de saques
  const buscarSaques = useCallback(async () => {
    try {
      const resposta = await fetch('/api/saques')
      if (resposta.ok) {
        const dados = await resposta.json()
        definirSaques(dados.saques ?? [])
      }
    } catch {
      // Silencioso
    }
  }, [])

  useEffect(() => {
    if (!carregandoAuth) {
      if (!estaAutenticado()) {
        navegarPara('login')
        return
      }
      buscarDadosAfiliado()
      buscarSaques()
    }
  }, [carregandoAuth, estaAutenticado, navegarPara, buscarDadosAfiliado, buscarSaques])

  // Criar conta de afiliado
  const criarContaAfiliado = async () => {
    definirCriandoConta(true)
    try {
      const resposta = await fetch('/api/afiliados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (resposta.ok) {
        const dados = await resposta.json()
        definirContaAfiliado(dados)
        toast.success('Conta de afiliado criada com sucesso!')
        buscarDadosAfiliado()
      } else {
        const erro = await resposta.json()
        toast.error(erro.erro ?? 'Erro ao criar conta de afiliado')
      }
    } catch {
      toast.error('Erro de conexão. Tenta novamente.')
    } finally {
      definirCriandoConta(false)
    }
  }

  // Guardar/atualizar a conta de recebimento
  const guardarDadosRecebimento = async () => {
    definirGuardandoRecebimento(true)
    try {
      const resposta = await fetch('/api/afiliados/dados-recebimento', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formRecebimento),
      })
      const dados = await resposta.json()
      if (resposta.ok) {
        definirDadosRecebimento(dados.dadosRecebimento)
        definirEditandoRecebimento(false)
        toast.success('Conta de recebimento guardada com sucesso!')
      } else {
        toast.error(dados.erro ?? 'Erro ao guardar conta de recebimento')
      }
    } catch {
      toast.error('Erro de conexão. Tenta novamente.')
    } finally {
      definirGuardandoRecebimento(false)
    }
  }

  // Solicitar um novo saque
  const solicitarSaque = async () => {
    const valor = Number(valorSaque)

    if (!valor || valor <= 0) {
      toast.error('Indica um valor de saque válido')
      return
    }
    if (valor < saqueMinimo) {
      toast.error(`O valor mínimo de saque é ${formatarPreco(saqueMinimo)}`)
      return
    }
    if (contaAfiliado && valor > contaAfiliado.saldoDisponivel) {
      toast.error('Saldo insuficiente para este valor de saque')
      return
    }
    if (!dadosRecebimento?.metodoRecebimento) {
      toast.error('Configura primeiro a tua conta de recebimento')
      return
    }

    definirSolicitandoSaque(true)
    try {
      const resposta = await fetch('/api/saques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor }),
      })
      const dados = await resposta.json()
      if (resposta.ok) {
        toast.success('Pedido de saque enviado com sucesso! Vamos processá-lo em breve.')
        definirValorSaque('')
        buscarDadosAfiliado()
        buscarSaques()
      } else {
        toast.error(dados.erro ?? 'Erro ao solicitar saque')
      }
    } catch {
      toast.error('Erro de conexão. Tenta novamente.')
    } finally {
      definirSolicitandoSaque(false)
    }
  }

  // ============================================================
  // Estado de carregamento
  // ============================================================

  if (carregandoAuth || carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-gray-500">A carregar painel de afiliado...</p>
        </div>
      </div>
    )
  }

  // Nome do utilizador
  const nomeUtilizador = utilizador?.nomeCompleto?.split(' ')[0] ?? ''

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={voltar}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Programa de Afiliados
            </h1>
            <p className="text-sm text-emerald-100">
              Ganha comissões promovendo a AngolaReads
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          {contaAfiliado ? (
            <SecaoPainelAfiliado
              contaAfiliado={contaAfiliado}
              comissoes={comissoes}
              utilizadorNome={nomeUtilizador}
              dadosRecebimento={dadosRecebimento}
              saqueMinimo={saqueMinimo}
              saques={saques}
              editandoRecebimento={editandoRecebimento}
              definirEditandoRecebimento={definirEditandoRecebimento}
              guardandoRecebimento={guardandoRecebimento}
              formRecebimento={formRecebimento}
              definirFormRecebimento={definirFormRecebimento}
              guardarDadosRecebimento={guardarDadosRecebimento}
              valorSaque={valorSaque}
              definirValorSaque={definirValorSaque}
              solicitandoSaque={solicitandoSaque}
              solicitarSaque={solicitarSaque}
            />
          ) : (
            <SecaoTornarAfiliado
              criandoConta={criandoConta}
              criarContaAfiliado={criarContaAfiliado}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
