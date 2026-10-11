'use client'

import { useEffect } from 'react'
import { usarNavegacao, TipoVista } from '@/lojas/navegacao'
import { usarAutenticacao } from '@/lojas/autenticacao'

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

export default function PaginaPrincipal() {
  const vistaAtual = usarNavegacao((s) => s.vistaAtual)
  const navegarPara = usarNavegacao((s) => s.navegarPara)
  const { definirUtilizador, definirCarregando } = usarAutenticacao()

  // Deep-link: abrir directamente numa vista via ?vista=xxx&id=yyy (usado
  // pelos links dos emails, ex: nova venda de publisher, e pelo link de
  // partilha de um produto) e capturar ?ref=CODIGO de afiliado, guardando-o
  // para o checkout usar mais tarde. Só corre uma vez, ao carregar a app.
  useEffect(() => {
    capturarRefDaQuery()
    const parametros = new URLSearchParams(window.location.search)
    const vista = parametros.get('vista') as TipoVista | null
    const id = parametros.get('id')
    if (vista && vista in mapaVistas) {
      navegarPara(vista, id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const ComponenteVista = mapaVistas[vistaAtual] || Catalogo

  return (
    <div className="min-h-screen flex flex-col">
      <Cabecalho />
      <main className="flex-1">
        <ComponenteVista key={vistaAtual} />
      </main>
      <Rodape />
      <BotaoWhatsAppFlutuante />
    </div>
  )
}
