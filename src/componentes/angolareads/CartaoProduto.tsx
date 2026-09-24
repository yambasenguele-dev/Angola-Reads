'use client'

import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usarNavegacao } from '@/lojas/navegacao'
import { formatarPreco } from '@/lib/autenticacao'

// Tipo do produto recebido como prop
interface CategoriaProduto {
  nome: string
  slug: string
}

interface ProdutoCard {
  id: string
  titulo: string
  descricaoCurta: string | null
  capaUrl: string | null
  precoNormal: number
  precoPromocional: number | null
  tipoProduto: string
  categoria: CategoriaProduto
}

interface PropsCartaoProduto {
  produto: ProdutoCard
  indice?: number
}

// Mapeamento de tipos para etiquetas amigáveis
const etiquetasTipo: Record<string, string> = {
  ebook: 'Ebook',
  bundle: 'Pacote',
  curso_limitado: 'Curso',
}

// Cores dos badges por tipo
const coresTipo: Record<string, string> = {
  ebook: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  bundle: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  curso_limitado: 'bg-teal-100 text-teal-700 hover:bg-teal-100',
}

export default function CartaoProduto({ produto, indice = 0 }: PropsCartaoProduto) {
  const navegarPara = usarNavegacao((s) => s.navegarPara)
  const temPromocao = produto.precoPromocional !== null && produto.precoPromocional > 0
  const precoFinal = temPromocao ? produto.precoPromocional : produto.precoNormal
  const desconto = temPromocao
    ? Math.round(((produto.precoNormal - produto.precoPromocional) / produto.precoNormal) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(indice * 0.06, 0.3),
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Card className="group h-full overflow-hidden border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-emerald-100/50">
          {/* Área da Capa */}
          <div
            className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden"
            onClick={() => navegarPara('produto', produto.id)}
          >
            {produto.capaUrl ? (
              <motion.img
                src={produto.capaUrl}
                alt={`Capa de ${produto.titulo}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-2xl bg-emerald-100 p-4">
                    <BookOpen className="h-10 w-10 text-emerald-500" />
                  </div>
                  <span className="text-xs font-medium text-emerald-400">
                    Sem capa
                  </span>
                </div>
              </div>
            )}

            {/* Badges sobrepostos na capa */}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              <Badge
                className={`${coresTipo[produto.tipoProduto] || 'bg-gray-100 text-gray-700'} border-0 text-[11px] font-semibold px-2 py-0.5`}
              >
                {etiquetasTipo[produto.tipoProduto] || produto.tipoProduto}
              </Badge>
              {temPromocao && desconto > 0 && (
                <Badge className="border-0 bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-red-500">
                  -{desconto}%
                </Badge>
              )}
            </div>
          </div>

          {/* Conteúdo do Cartão */}
          <CardContent className="flex flex-1 flex-col gap-3 p-4">
            {/* Categoria */}
            <Badge
              variant="secondary"
              className="w-fit rounded-full bg-gray-100 px-2.5 py-0 text-[11px] font-normal text-gray-600 hover:bg-gray-100"
            >
              {produto.categoria.nome}
            </Badge>

            {/* Título */}
            <h3
              className="line-clamp-2 cursor-pointer text-sm font-semibold leading-snug text-gray-900 transition-colors hover:text-emerald-700"
              onClick={() => navegarPara('produto', produto.id)}
            >
              {produto.titulo}
            </h3>

            {/* Descrição Curta */}
            {produto.descricaoCurta && (
              <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
                {produto.descricaoCurta}
              </p>
            )}

            {/* Espaçamento flexível */}
            <div className="flex-1" />

            {/* Preço e Botão */}
            <div className="flex items-end justify-between gap-2">
              <div className="flex flex-col">
                {temPromocao ? (
                  <>
                    <span className="text-xs text-gray-400 line-through">
                      {formatarPreco(produto.precoNormal)}
                    </span>
                    <span className="text-base font-bold text-emerald-600">
                      {formatarPreco(precoFinal)}
                    </span>
                  </>
                ) : (
                  <span className="text-base font-bold text-gray-900">
                    {formatarPreco(produto.precoNormal)}
                  </span>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => navegarPara('produto', produto.id)}
                className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
