// ============================================================
// Conteúdo indexável (Server Component)
// A loja é uma SPA: o catálogo e os produtos são carregados no
// browser. Estes blocos entregam ao Google, JÁ NO HTML inicial,
// o mesmo conteúdo (título, descrição, preço) e links <a href>
// reais para cada ebook. São visualmente ocultos (sr-only) porque
// a interface visível é a da SPA, mas continuam acessíveis
// (leitores de ecrã) e rastreáveis.
// ============================================================
import { caminhoProduto } from '@/lib/rotas'
import { resumirTexto, type ProdutoSeo } from '@/lib/seo'

function formatarKz(valor: number): string {
  return `${Math.round(valor).toLocaleString('pt-PT')} Kz`
}

function preco(p: ProdutoSeo): number {
  return p.precoPromocional ?? p.precoNormal
}

/** Home: lista de todos os ebooks com links rastreáveis */
export function CatalogoIndexavel({ produtos }: { produtos: ProdutoSeo[] }) {
  if (produtos.length === 0) return null

  return (
    <nav aria-label="Catálogo de ebooks" className="sr-only">
      <h2>Ebooks disponíveis na AngolaReads</h2>
      <ul>
        {produtos.map((p) => (
          <li key={p.id}>
            <a href={caminhoProduto(p.id, p.titulo)}>{p.titulo}</a>
            {p.categoriaNome ? <span> — {p.categoriaNome}</span> : null}
            <p>{resumirTexto(p.descricaoCurta || p.descricao, 160)}</p>
            <p>Preço: {formatarKz(preco(p))}</p>
          </li>
        ))}
      </ul>
      <p>
        <a href="/sobre">Sobre a AngolaReads</a> · <a href="/faq">Perguntas frequentes</a> ·{' '}
        <a href="/suporte">Suporte</a>
      </p>
    </nav>
  )
}

/** Produto: descrição, preço e links para outros ebooks */
export function ProdutoIndexavel({
  produto,
  relacionados,
}: {
  produto: ProdutoSeo
  relacionados: ProdutoSeo[]
}) {
  return (
    <article className="sr-only" aria-label={`Ebook ${produto.titulo}`}>
      <h2>{produto.titulo}</h2>
      {produto.categoriaNome ? <p>Categoria: {produto.categoriaNome}</p> : null}
      <p>{resumirTexto(produto.descricaoCurta || produto.descricao, 600)}</p>
      <p>
        Preço: {formatarKz(preco(produto))}
        {produto.precoPromocional != null ? ` (preço normal: ${formatarKz(produto.precoNormal)})` : ''}
      </p>
      <p>Ebook digital em PDF/EPUB. Pagamento por transferência bancária, Airtm ou PayPal.</p>

      {relacionados.length > 0 && (
        <nav aria-label="Outros ebooks">
          <h3>Outros ebooks da AngolaReads</h3>
          <ul>
            {relacionados.map((p) => (
              <li key={p.id}>
                <a href={caminhoProduto(p.id, p.titulo)}>{p.titulo}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <p>
        <a href="/">Voltar ao catálogo de ebooks</a>
      </p>
    </article>
  )
}
