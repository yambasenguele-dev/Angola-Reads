'use client'

import { useRef, useState } from 'react'
import { CheckCircle2, FileText, Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const TAMANHO_MAXIMO = 5 * 1024 * 1024
const TIPOS_ACEITES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

interface UploadComprovativoProps {
  pedidoId: string
  /** Chamado depois de o comprovativo ser guardado com sucesso */
  aoEnviar?: () => void
  /** Texto do botão de envio (ex.: "Enviar novo comprovativo") */
  rotuloBotao?: string
}

export default function UploadComprovativo({
  pedidoId,
  aoEnviar,
  rotuloBotao = 'Enviar comprovativo',
}: UploadComprovativoProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [ficheiro, definirFicheiro] = useState<File | null>(null)
  const [aEnviar, definirAEnviar] = useState(false)
  const [enviado, definirEnviado] = useState(false)

  const escolher = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    if (!TIPOS_ACEITES.includes(f.type)) {
      toast.error('Formato inválido', {
        description: 'Envia uma imagem (JPG, PNG, WEBP) ou um PDF.',
      })
      e.target.value = ''
      return
    }
    if (f.size > TAMANHO_MAXIMO) {
      toast.error('Ficheiro demasiado grande', {
        description: 'O tamanho máximo permitido é de 5MB.',
      })
      e.target.value = ''
      return
    }
    definirFicheiro(f)
  }

  const limpar = () => {
    definirFicheiro(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const enviar = async () => {
    if (!ficheiro || aEnviar) return
    definirAEnviar(true)
    try {
      const formulario = new FormData()
      formulario.append('ficheiro', ficheiro)

      const resposta = await fetch(`/api/pedidos/${pedidoId}/comprovativo`, {
        method: 'POST',
        body: formulario,
      })
      const dados = await resposta.json().catch(() => ({}))

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Não foi possível enviar o comprovativo.')
      }

      definirEnviado(true)
      toast.success('Comprovativo enviado!', {
        description: 'Vamos confirmar o pagamento e libertar o download.',
      })
      aoEnviar?.()
    } catch (erro) {
      toast.error('Erro ao enviar comprovativo', {
        description: erro instanceof Error ? erro.message : 'Tenta novamente.',
      })
    } finally {
      definirAEnviar(false)
    }
  }

  if (enviado) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-xs text-emerald-800">
          <strong>Comprovativo recebido.</strong> O pedido continua pendente até
          confirmarmos o pagamento. Depois disso, o download fica disponível em
          "Os Meus Ebooks".
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={escolher}
        className="hidden"
        aria-label="Selecionar ficheiro do comprovativo"
      />

      {!ficheiro ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-4 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-50/40"
        >
          <Upload className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            Escolher comprovativo
          </span>
          <span className="text-xs text-gray-400">JPG, PNG ou PDF — máx. 5MB</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-2">
          <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
            {ficheiro.name}
          </span>
          <button
            type="button"
            onClick={limpar}
            disabled={aEnviar}
            className="rounded p-1 text-gray-400 hover:bg-white hover:text-gray-600"
            aria-label="Remover ficheiro"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Button
        type="button"
        onClick={enviar}
        disabled={!ficheiro || aEnviar}
        className="w-full rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400"
      >
        {aEnviar ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            A enviar...
          </>
        ) : (
          rotuloBotao
        )}
      </Button>
    </div>
  )
}
