// Dados estruturados (schema.org) em JSON-LD — componente de servidor
export default function JsonLd({ dados }: { dados: Record<string, unknown> | Record<string, unknown>[] }) {
  // Escapar "<" evita que um título malicioso feche a tag <script>
  const json = JSON.stringify(dados).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
