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
import PaginaSobre from '@/componentes/angolareads/PaginaSobre'
import PaginaTermos from '@/componentes/angolareads/PaginaTermos'
import PaginaPrivacidade from '@/componentes/angolareads/PaginaPrivacidade'
import PaginaSuporte from '@/componentes/angolareads/PaginaSuporte'
import BotaoWhatsAppFlutuante from '@/componentes/angolareads/BotaoWhatsAppFlutuante'

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
  sobre: PaginaSobre,
  termos: PaginaTermos,
  privacidade: PaginaPrivacidade,
  suporte: PaginaSuporte,
}

export default function PaginaPrincipal() {
  const vistaAtual = usarNavegacao((s) => s.vistaAtual)
  const { definirUtilizador, definirCarregando } = usarAutenticacao()

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
