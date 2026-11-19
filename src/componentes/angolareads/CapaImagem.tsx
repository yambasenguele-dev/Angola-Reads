"use client"

import { useState } from "react"
import Image from "next/image"

// ============================================================
// Capa de ebook otimizada
// - Usa o otimizador do Next: redimensiona para o tamanho real do ecrã,
//   converte para WebP e guarda em cache na CDN (muito mais leve que o
//   ficheiro original do Supabase Storage).
// - Se a imagem não puder ser otimizada (host desconhecido) ou o otimizador
//   falhar, mostra a imagem original: nunca fica uma capa partida.
// O contentor pai deve ter "relative" e uma altura/proporção definida.
// ============================================================

const HOST_PERSONALIZADO = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    return url ? new URL(url).hostname : ""
  } catch {
    return ""
  }
})()

// Tem de corresponder a images.remotePatterns em next.config.ts
function podeOtimizar(src: string): boolean {
  if (src.startsWith("/")) return true
  try {
    const url = new URL(src)
    if (url.protocol !== "https:") return false
    if (!url.pathname.startsWith("/storage/v1/object/public/")) return false
    return url.hostname.endsWith(".supabase.co") || (!!HOST_PERSONALIZADO && url.hostname === HOST_PERSONALIZADO)
  } catch {
    return false
  }
}

interface CapaImagemProps {
  src: string
  alt: string
  /** Largura real a que a imagem é mostrada (ex.: "50vw" ou "56px") */
  sizes: string
  /** Imagem acima da dobra (LCP): carrega de imediato e com prioridade */
  prioridade?: boolean
  className?: string
}

export default function CapaImagem({ src, alt, sizes, prioridade = false, className = "" }: CapaImagemProps) {
  const [falhou, definirFalhou] = useState(false)

  if (falhou || !podeOtimizar(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={prioridade ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={prioridade ? "high" : "auto"}
        className={`absolute inset-0 h-full w-full ${className}`}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={prioridade}
      loading={prioridade ? "eager" : "lazy"}
      decoding="async"
      className={className}
      onError={() => definirFalhou(true)}
    />
  )
}
