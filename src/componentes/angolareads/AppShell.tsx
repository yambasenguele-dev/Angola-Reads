'use client'

import { useEffect, useState } from 'react'
import { usarNavegacao, TipoVista } from '@/lojas/navegacao'
import { usarAutenticacao } from '@/lojas/autenticacao'
import { caminhoDaVista, vistaDoCaminho, TITULOS_VISTA } from '@/lib/rotas'

// Componentes da aplicação
import Cabecalho from '@/componentes/angolareads/Cabecalho'
import Rodape from '@/componentes/angolareads/Rodape'
import Catalogo from '@/componentes/angolareads/Catalogo'
import PaginaProduto from '@/componentes/angolareads/PaginaProduto'
import Carrinho from '@/componentes/angolareads/Carrinho'
import Checkout from '@/componentes/angolareads/Checkout'
import OsMeusEbooks from '@/componentes/angolareads/OsMeusEbooks'
import FormularioLogin from '@/componentes/angolareads/FormularioLogin'
import FormularioRegisto from '@/componentes/angolareads/FormularioRegisto'
import RecuperarSenha from '@/componentes/angolareads/RecuperarSenha'
import PainelAfiliado from '@/componentes/angolareads/PainelAfiliado'
import PainelPublisher from '@/componentes/angolareads/PainelPublisher'
import PaginaSobre from '@/componentes/angolareads/PaginaSobre'
import PaginaTermos from '@/componentes/angolareads/PaginaTermos'
import PaginaPrivacidade from '@/componentes/angolareads/PaginaPrivacidade'
import PaginaSuporte from '@/componentes/angolareads/PaginaSuporte'
import PaginaFAQ from '@/componentes/angolareads/PaginaFAQ'
import BotaoWhatsAppFlutuante from '@/componentes/angolareads/BotaoWhatsAppFlutuante'
import { capturarRefDaQuery } from '@/lib/afiliado-ref'

// Mapa de vistas do SPA - cada vista é renderizada com base na navegação
const mapaVistas: Record<TipoVista, React.ComponentType> = {
  inicio: Catalogo,
  produto: PaginaProduto,
  carrinho: Carrinho,
  checkout: Checkout,
  'os-meus-ebooks': OsMeusEbooks,
  login: FormularioLogin,
  registo: FormularioRegisto,
  'recuperar-senha': RecuperarSenha,
  afiliado: PainelAfiliado,
  publisher: PainelPublisher,
  sobre: PaginaSobre,
  termos: PaginaTermos,
  privacidade: PaginaPrivacidade,
  suporte: PaginaSuporte,
  faq: PaginaFAQ,
}

const TITULO_PADRAO = 'AngolaReads | Loja de Ebooks em Angola'

interface PropsAppShell {
  /** Vista com que a página é renderizada no servidor (rota real) */
  vistaInicial?: TipoVista
}

export default function AppShell({ vistaInicial = 'inicio' }: PropsAppShell) {
  const vistaAtual = usarNavegacao((s) => s.vistaAtual)
  const { definirUtilizador, definirCarregando } = usarAutenticacao()
  // Antes de montar, a vista vem da rota (igual no servidor e no 1.º render do cliente,
  // o que evita diferenças de hidratação).
  const [montado, definirMontado] = useState(false)

  // Estado inicial a partir do URL: rota real (/produto/..., /sobre...) ou deep-link
  // antigo ?vista=xxx&id=yyy (emails, links de afiliado). Corre uma só vez.
  useEffect(() => {
    capturarRefDaQuery()

    const { vista, id } = vistaDoCaminho(window.location.pathname, window.location.search)
    usarNavegacao.setState({ vistaAtual: vista, parametroId: id, historico: [] })

    // Deep-link antigo (?vista=produto&id=X): passar para o URL canónico sem criar histórico extra
    if (vista === 'produto' && window.location.pathname === '/') {
      window.history.replaceState({}, '', caminhoDaVista('produto', id))
    }

    definirMontado(true)
  }, [])

  // Botão "Voltar/Avançar" do browser: repor a vista a partir do URL
  useEffect(() => {
    const aoNavegar = () => {
      const { vista, id } = vistaDoCaminho(window.location.pathname, window.location.search)
      usarNavegacao.setState((estado) => ({
        vistaAtual: vista,
        parametroId: id,
        historico: estado.historico.slice(0, -1),
      }))
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('popstate', aoNavegar)
    return () => window.removeEventListener('popstate', aoNavegar)
  }, [])

  // Título do separador por vista (o produto define o seu próprio título)
  useEffect(() => {
    if (!montado || vistaAtual === 'produto') return
    const titulo = TITULOS_VISTA[vistaAtual]
    document.title = titulo ? `${titulo} | AngolaReads` : TITULO_PADRAO
  }, [montado, vistaAtual])

  // Verificar sessão existente ao montar a aplicação
  useEffect(() => {
    async function verificarSessao() {
      try {
        const resposta = await fetch('/api/auth/perfil')
        if (resposta.ok) {
          const dados = await resposta.json()
          if (dados.utilizador) {
            definirUtilizador(dados.utilizador)
          } else {
            definirUtilizador(null)
          }
        } else {
          definirUtilizador(null)
        }
      } catch {
        definirUtilizador(null)
      }
      definirCarregando(false)
    }
    verificarSessao()
  }, [definirUtilizador, definirCarregando])

  const vistaAMostrar = montado ? vistaAtual : vistaInicial
  const ComponenteVista = mapaVistas[vistaAMostrar] || Catalogo

  return (
    <div className="min-h-screen flex flex-col">
      <Cabecalho />
      <main className="flex-1">
        <ComponenteVista key={vistaAMostrar} />
      </main>
      <Rodape />
      <BotaoWhatsAppFlutuante />
    </div>
  )
}
