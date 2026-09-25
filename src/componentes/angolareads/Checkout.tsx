'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Upload,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  Loader2,
  ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { usarCarrinho } from '@/lojas/carrinho'
import { usarNavegacao } from '@/lojas/navegacao'
import { usarAutenticacao } from '@/lojas/autenticacao'
import { formatarPreco } from '@/lib/autenticacao'
import { toast } from 'sonner'

// ============================================================
// Constantes dos Dados de Pagamento
// ============================================================

const DADOS_BANCARIOS = {
  banco: 'Millennium Atlântico',
  iban: 'AO06 0055 0000 0704 4488 1014 4',
  titular: 'Yamba Gabriel Adolfo Senguele',
  conta: '40704448810001',
}

const DADOS_AIRTM = {
  email: 'gabrielfigura128@gmail.com',
  nome: 'ADOLFO SENGUELE YAMBA GABRIEL',
}

const DADOS_PAYPAL = {
  email: 'reciprocidade001@gmail.com',
}

// Tipo do método de pagamento
type MetodoPagamento = 'transferencia_bancaria' | 'airtm' | 'paypal'

export default function Checkout() {
  const { itens, obterTotal, limparCarrinho } = usarCarrinho()
  const navegarPara = usarNavegacao((s) => s.navegarPara)
  const { estaAutenticado, carregando: carregandoAuth } = usarAutenticacao()

  // Estado do formulário
  const [metodoPagamento, definirMetodoPagamento] = useState<MetodoPagamento>('transferencia_bancaria')
  const [codigoAfiliado, definirCodigoAfiliado] = useState('')
  const [observacoes, definirObservacoes] = useState('')
  const [ficheiroComprovativo, definirFicheiroComprovativo] = useState<File | null>(null)
  const [nomeFicheiro, definirNomeFicheiro] = useState('')
  const [aEnviarPedido, definirAEnviarPedido] = useState(false)
  const [aCarregarUpload, definirACarregarUpload] = useState(false)
  const [referenciaPedido, definirReferenciaPedido] = useState('')
  const [dialogoSucessoAberto, definirDialogoSucessoAberto] = useState(false)
  const [validado, definirValidado] = useState(false)

  const referenciaInput = useRef<HTMLInputElement>(null)

  const total = obterTotal()

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!carregandoAuth && !estaAutenticado()) {
      navegarPara('login')
    }
  }, [carregandoAuth, estaAutenticado, navegarPara])

  // Se o carrinho estiver vazio, redirecionar para o carrinho
  useEffect(() => {
    if (!carregandoAuth && estaAutenticado() && itens.length === 0) {
      navegarPara('carrinho')
    }
  }, [carregandoAuth, estaAutenticado, itens.length, navegarPara])

  // Verificar parâmetro ?ref= para código de afiliado
  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search)
    const ref = parametros.get('ref')
    if (ref) {
      definirCodigoAfiliado(ref)
    }
  }, [])

  // Validar que o utilizador pode ver a página
  const podeVer = !carregandoAuth && estaAutenticado() && itens.length > 0

  // Manipular seleção de ficheiro de comprovativo
  const manipularFicheiro = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const ficheiro = e.target.files?.[0]
    if (!ficheiro) return

    // Verificar tipo (apenas imagens)
    if (!ficheiro.type.startsWith('image/')) {
      toast.error('Formato inválido', {
        description: 'Por favor, seleciona apenas ficheiros de imagem (JPG, PNG, etc.).',
      })
      e.target.value = ''
      return
    }

    // Verificar tamanho (máx. 5MB)
    if (ficheiro.size > 5 * 1024 * 1024) {
      toast.error('Ficheiro demasiado grande', {
        description: 'O tamanho máximo permitido é de 5MB.',
      })
      e.target.value = ''
      return
    }

    definirFicheiroComprovativo(ficheiro)
    definirNomeFicheiro(ficheiro.name)
  }, [])

  // Enviar pedido
  const submeterPedido = async () => {
    if (!validado) {
      definirValidado(true)
      // Pequeno atraso para o utilizador ver erros de validação
      await new Promise((r) => setTimeout(r, 100))
    }

    // Validações
    // Comprovativo só é obrigatório para Airtm. Na transferência bancária o
    // cliente só vê os dados bancários depois de o pedido ser criado, logo
    // ainda não tem como enviar o comprovativo nesta fase.
    const precisaComprovativoObrigatorio = metodoPagamento === 'airtm'
    const podeEnviarComprovativoAgora =
      metodoPagamento === 'airtm' || metodoPagamento === 'transferencia_bancaria'

    if (precisaComprovativoObrigatorio && !ficheiroComprovativo) {
      toast.error('Comprovativo obrigatório', {
        description: 'Por favor, carrega o teu comprovativo de pagamento.',
      })
      return
    }

    if (itens.length === 0) {
      toast.error('Carrinho vazio', {
        description: 'Não há itens no teu carrinho para finalizar.',
      })
      return
    }

    definirAEnviarPedido(true)

    try {
      let urlComprovativo: string | null = null

      // Passo 1: Upload do comprovativo (se necessário)
      if (podeEnviarComprovativoAgora && ficheiroComprovativo) {
        definirACarregarUpload(true)
        try {
          const formularioUpload = new FormData()
          formularioUpload.append('ficheiro', ficheiroComprovativo)
          formularioUpload.append('pasta', 'comprovativos')

          const respostaUpload = await fetch('/api/upload', {
            method: 'POST',
            body: formularioUpload,
          })

          if (!respostaUpload.ok) {
            const erro = await respostaUpload.json()
            throw new Error(erro.erro || 'Erro ao carregar o comprovativo')
          }

          const dadosUpload = await respostaUpload.json()
          urlComprovativo = dadosUpload.url || dadosUpload.caminho
        } catch (erroUpload) {
          toast.error('Erro no upload', {
            description: erroUpload instanceof Error ? erroUpload.message : 'Não foi possível carregar o comprovativo.',
          })
          definirAEnviarPedido(false)
          definirACarregarUpload(false)
          return
        } finally {
          definirACarregarUpload(false)
        }
      }

      // Passo 2: Criar pedido
      const corpoPedido = {
        itens: itens.map((item) => ({
          produtoId: item.produtoId,
          titulo: item.titulo,
          formato: item.formato,
          preco: item.precoPromocional ?? item.preco,
        })),
        metodoPagamento,
        total,
        comprovativoUrl: urlComprovativo,
        codigoAfiliado: codigoAfiliado.trim() || null,
        observacoes: observacoes.trim() || null,
      }

      const respostaPedido = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpoPedido),
      })

      if (!respostaPedido.ok) {
        const erro = await respostaPedido.json()
        throw new Error(erro.erro || 'Erro ao criar o pedido')
      }

      const dadosPedido = await respostaPedido.json()

      // Sucesso!
      definirReferenciaPedido(dadosPedido.referencia || dadosPedido.pedido?.referencia || '')
      definirDialogoSucessoAberto(true)
      limparCarrinho()

      toast.success('Pedido enviado com sucesso!', {
        description: `A referência do teu pedido é ${dadosPedido.referencia || dadosPedido.pedido?.referencia || 'N/A'}.`,
      })
    } catch (erro) {
      toast.error('Erro ao enviar pedido', {
        description: erro instanceof Error ? erro.message : 'Ocorreu um erro inesperado. Tenta novamente.',
      })
    } finally {
      definirAEnviarPedido(false)
    }
  }

  // Fechar diálogo de sucesso e navegar para o início
  const fecharSucesso = () => {
    definirDialogoSucessoAberto(false)
    navegarPara('inicio')
  }

  // Estados de carregamento
  if (carregandoAuth || !podeVer) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </section>
    )
  }

  const textoBotaoEnviar = aEnviarPedido
    ? aCarregarUpload
      ? 'A carregar comprovativo...'
      : 'A enviar pedido...'
    : metodoPagamento === 'transferencia_bancaria'
      ? 'Confirmar pedido e ver dados bancários'
      : 'Enviar Pedido'

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Diálogo de Sucesso */}
      <Dialog open={dialogoSucessoAberto} onOpenChange={definirDialogoSucessoAberto}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader className="items-center text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-xl text-gray-900">
              Pedido Enviado com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              O teu pedido foi registado e será analisado em breve.
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 rounded-xl bg-emerald-50 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
              Referência do Pedido
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {referenciaPedido}
            </p>
          </div>

          {metodoPagamento === 'transferencia_bancaria' && (
            <div className="rounded-xl bg-gray-50 p-5">
              <h3 className="mb-4 text-sm font-semibold text-gray-700">
                Dados para Transferência Bancária
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                  <span className="text-xs font-medium text-gray-500">Banco</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {DADOS_BANCARIOS.banco}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                  <span className="text-xs font-medium text-gray-500">IBAN</span>
                  <span className="break-all text-sm font-mono font-semibold text-gray-900">
                    {DADOS_BANCARIOS.iban}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                  <span className="text-xs font-medium text-gray-500">Titular</span>
                  <span className="text-right text-sm font-semibold text-gray-900">
                    {DADOS_BANCARIOS.titular}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                  <span className="text-xs font-medium text-gray-500">Nº da Conta</span>
                  <span className="text-sm font-mono font-semibold text-gray-900">
                    {DADOS_BANCARIOS.conta}
                  </span>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-700">
                  Usa a referência <strong>{referenciaPedido}</strong> na descrição da
                  transferência. Depois, envia o comprovativo para{' '}
                  <strong>angolareads@gmail.com</strong> (ou pela página de Suporte) para
                  liberarmos o teu download.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-amber-50 p-3">
            <p className="text-center text-xs text-amber-700">
              {metodoPagamento === 'paypal'
                ? 'Após o pagamento no PayPal, o teu pedido será confirmado manualmente.'
                : metodoPagamento === 'transferencia_bancaria'
                  ? 'O teu pedido será confirmado após a verificação do comprovativo enviado por email.'
                  : 'O teu pedido será confirmado após a verificação do comprovativo.'}
            </p>
          </div>

          <DialogFooter className="mt-2 sm:justify-center">
            <Button
              onClick={fecharSucesso}
              className="w-full rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700 sm:w-auto sm:px-8"
            >
              Voltar ao Início
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <button
          type="button"
          onClick={() => navegarPara('carrinho')}
          className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Carrinho
        </button>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Finalizar Compra
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Escolhe o teu método de pagamento preferido e envia o pedido.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Coluna Principal - Formulário (3/5) */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Selecção do Método de Pagamento */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Método de Pagamento
                </h2>

                <RadioGroup
                  value={metodoPagamento}
                  onValueChange={(valor) => definirMetodoPagamento(valor as MetodoPagamento)}
                  className="space-y-3"
                >
                  {/* Transferência Bancária */}
                  <label
                    htmlFor="metodo-transferencia"
                    className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                      metodoPagamento === 'transferencia_bancaria'
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <RadioGroupItem
                      value="transferencia_bancaria"
                      id="metodo-transferencia"
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <img
                          src="/logos/millennium-atlantico.png"
                          alt=""
                          className="h-5 w-5 rounded object-cover"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Transferência Bancária (Millennium Atlântico)
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Faz a transferência para a conta indicada e carrega o comprovativo.
                      </p>
                    </div>
                  </label>

                  {/* Airtm */}
                  <label
                    htmlFor="metodo-airtm"
                    className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                      metodoPagamento === 'airtm'
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <RadioGroupItem
                      value="airtm"
                      id="metodo-airtm"
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <img
                          src="/logos/airtm.png"
                          alt=""
                          className="h-5 w-5 rounded object-cover"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Airtm (USD/EUR)
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Envia o pagamento via Airtm e carrega o comprovativo.
                      </p>
                    </div>
                  </label>

                  {/* PayPal */}
                  <label
                    htmlFor="metodo-paypal"
                    className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                      metodoPagamento === 'paypal'
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <RadioGroupItem
                      value="paypal"
                      id="metodo-paypal"
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <img
                          src="/logos/paypal.svg"
                          alt=""
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          PayPal
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Faz o pagamento para o email indicado. Confirmação manual.
                      </p>
                    </div>
                  </label>
                </RadioGroup>

                {/* Detalhes do Método Selecionado */}
                <motion.div
                  key={metodoPagamento}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-5"
                >
                  {metodoPagamento === 'transferencia_bancaria' && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
                      <h3 className="mb-2 text-sm font-semibold text-gray-700">
                        Transferência Bancária
                      </h3>
                      <p className="text-xs leading-relaxed text-gray-600">
                        Ao confirmares o pedido, vais ver os dados bancários e a
                        referência do pedido. Usa essa referência na descrição da
                        transferência. Depois envia o comprovativo pelo suporte para
                        liberarmos o download.
                      </p>
                    </div>
                  )}

                  {metodoPagamento === 'airtm' && (
                    <div className="rounded-xl bg-gray-50 p-5">
                      <h3 className="mb-4 text-sm font-semibold text-gray-700">
                        Dados Airtm
                      </h3>
                      <div className="space-y-3">
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                          <span className="text-xs font-medium text-gray-500">Email Airtm</span>
                          <span className="break-all text-sm font-semibold text-gray-900">
                            {DADOS_AIRTM.email}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                          <span className="text-xs font-medium text-gray-500">Nome</span>
                          <span className="text-right text-sm font-semibold text-gray-900">
                            {DADOS_AIRTM.nome}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {metodoPagamento === 'paypal' && (
                    <div className="rounded-xl bg-gray-50 p-5">
                      <h3 className="mb-4 text-sm font-semibold text-gray-700">
                        Dados PayPal
                      </h3>
                      <div className="space-y-3">
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                          <span className="text-xs font-medium text-gray-500">Email PayPal</span>
                          <span className="break-all text-sm font-semibold text-gray-900">
                            {DADOS_PAYPAL.email}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs text-amber-700">
                          <strong>Nota:</strong> Após o pagamento no PayPal, o teu pedido será
                          confirmado manualmente pela nossa equipa. O processo pode levar
                          até 24 horas.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </CardContent>
            </Card>

            {/* Upload do Comprovativo (não aplicável à transferência bancária,
                cujo comprovativo é enviado depois, após ver os dados bancários) */}
            {metodoPagamento === 'airtm' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-gray-100 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                      <Upload className="h-5 w-5 text-emerald-600" />
                      Comprovativo de Pagamento
                    </h2>

                    <div
                      className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                        validado && !ficheiroComprovativo
                          ? 'border-red-300 bg-red-50/50'
                          : ficheiroComprovativo
                            ? 'border-emerald-300 bg-emerald-50/50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => referenciaInput.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          referenciaInput.current?.click()
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label="Carregar ficheiro de comprovativo"
                    >
                      <input
                        ref={referenciaInput}
                        type="file"
                        accept="image/*"
                        onChange={manipularFicheiro}
                        className="hidden"
                        aria-hidden="true"
                      />

                      {ficheiroComprovativo ? (
                        <>
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                          </div>
                          <p className="text-sm font-semibold text-emerald-700">
                            Ficheiro selecionado
                          </p>
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {nomeFicheiro}
                          </p>
                          <p className="mt-2 text-xs text-emerald-600 underline">
                            Clique para alterar
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">
                            Clique para carregar o comprovativo
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Apenas imagens (JPG, PNG, etc.) • Máx. 5MB
                          </p>
                          {validado && !ficheiroComprovativo && (
                            <p className="mt-2 text-xs font-medium text-red-500">
                              Campo obrigatório
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Campos Opcionais */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="space-y-5 p-6">
                {/* Código de Afiliado */}
                <div className="space-y-2">
                  <Label htmlFor="codigo-afiliado" className="text-sm font-medium text-gray-700">
                    Código de Afiliado{' '}
                    <span className="font-normal text-gray-400">(opcional)</span>
                  </Label>
                  <Input
                    id="codigo-afiliado"
                    type="text"
                    placeholder="Ex: AF123ABC"
                    value={codigoAfiliado}
                    onChange={(e) => definirCodigoAfiliado(e.target.value.toUpperCase())}
                    className="rounded-lg border-gray-200"
                  />
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700">
                    Observações{' '}
                    <span className="font-normal text-gray-400">(opcional)</span>
                  </Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Alguma nota ou observação sobre o teu pedido..."
                    value={observacoes}
                    onChange={(e) => definirObservacoes(e.target.value)}
                    rows={3}
                    className="resize-none rounded-lg border-gray-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botão de Envio (Mobile) */}
            <div className="lg:hidden">
              <Button
                className="w-full rounded-xl bg-emerald-600 py-6 text-base font-semibold text-white hover:bg-emerald-700"
                onClick={submeterPedido}
                disabled={aEnviarPedido}
              >
                {aEnviarPedido ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                {textoBotaoEnviar}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Coluna Lateral - Resumo (2/5) */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="sticky top-24 border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <h2 className="mb-5 text-lg font-bold text-gray-900">
                  Resumo do Pedido
                </h2>

                {/* Lista de Itens */}
                <div className="mb-4 max-h-64 space-y-3 overflow-y-auto pr-1">
                  {itens.map((item) => {
                    const precoAtual = item.precoPromocional ?? item.preco
                    return (
                      <div
                        key={`${item.produtoId}-${item.formato}`}
                        className="flex items-start gap-3"
                      >
                        {/* Miniatura */}
                        <div className="h-12 w-9 shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {item.capaUrl ? (
                            <img
                              src={item.capaUrl}
                              alt={`Capa de ${item.titulo}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                              <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-gray-700">
                            {item.titulo}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <Badge
                              className={`${
                                item.formato === 'pdf'
                                  ? 'bg-red-50 text-red-500 hover:bg-red-50'
                                  : 'bg-purple-50 text-purple-500 hover:bg-purple-50'
                              } border-0 px-1.5 py-0 text-[10px] font-semibold`}
                            >
                              {item.formato.toUpperCase()}
                            </Badge>
                            <span className="text-xs font-medium text-gray-800">
                              {formatarPreco(precoAtual)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Separator className="my-4" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {formatarPreco(total)}
                  </span>
                </div>

                {/* Botão de Envio (Desktop) */}
                <Button
                  className="mt-6 hidden w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 lg:block"
                  onClick={submeterPedido}
                  disabled={aEnviarPedido}
                >
                  {aEnviarPedido ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {textoBotaoEnviar}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
