'use client'

import { motion } from 'framer-motion'
import {
  BookOpen,
  Mail,
  Phone,
  MessageCircle,
  CreditCard,
  Wallet,
  Banknote,
  Home,
  Info,
  FileText,
  ShieldCheck,
  Headphones,
} from 'lucide-react'
import { usarNavegacao } from '@/lojas/navegacao'

// Avaliações fictícias para o marquee
const avaliacoes = [
  {
    texto: 'Os ebooks da AngolaReads mudaram a minha forma de investir!',
    autor: 'Maria L.',
    local: 'Luanda',
  },
  {
    texto: 'Finalmente conteúdo de qualidade em português para angolanos.',
    autor: 'João S.',
    local: 'Benguela',
  },
  {
    texto: 'Comprei o bundle de empreendedorismo e valeu cada kwanza!',
    autor: 'Ana C.',
    local: 'Huambo',
  },
  {
    texto: 'O suporte é excelente, responderam no WhatsApp em minutos.',
    autor: 'Carlos M.',
    local: 'Lubango',
  },
  {
    texto: 'Os ebooks práticos são o que faltava para o meu negócio.',
    autor: 'Fernanda D.',
    local: 'Cabinda',
  },
  {
    texto: 'Melhor plataforma de ebooks em português que já usei!',
    autor: 'Ricardo A.',
    local: 'Luanda',
  },
  {
    texto: 'Conteúdo relevante e aplicável à realidade angolana.',
    autor: 'Patrícia N.',
    local: 'Namibe',
  },
  {
    texto: 'Recomendo a todos os empreendedores angolanos!',
    autor: 'Miguel T.',
    local: 'Huíla',
  },
]

// Links de navegação do rodapé
const linksNavegacao = [
  { etiqueta: 'Início', vista: 'inicio' as const, icone: Home },
  { etiqueta: 'Sobre', vista: 'sobre' as const, icone: Info },
  { etiqueta: 'Termos de Uso', vista: 'termos' as const, icone: FileText },
  { etiqueta: 'Política de Privacidade', vista: 'privacidade' as const, icone: ShieldCheck },
  { etiqueta: 'Suporte', vista: 'suporte' as const, icone: Headphones },
]

export default function Rodape() {
  const navegarPara = usarNavegacao((s) => s.navegarPara)

  return (
    <footer className="mt-auto w-full">
      {/* Seção principal do rodapé */}
      <div className="border-t border-emerald-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Coluna 1: Logo e descrição */}
            <div className="flex flex-col gap-4">
              <motion.button
                onClick={() => navegarPara('inicio')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex w-fit items-center gap-2 focus:outline-none"
                aria-label="Ir para o início"
              >
                <BookOpen className="h-6 w-6 text-emerald-600" />
                <span className="text-lg font-bold tracking-tight text-emerald-700">
                  Angola<span className="text-teal-500">Reads</span>
                </span>
              </motion.button>
              <p className="text-sm leading-relaxed text-gray-500">
                A tua livraria digital angolana. Ebooks práticos e relevantes
                para empreendedores, investidores e profissionais que querem
                crescer em Angola.
              </p>
            </div>

            {/* Coluna 2: Links de navegação */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                Navegação
              </h3>
              <nav className="flex flex-col gap-2" aria-label="Links do rodapé">
                {linksNavegacao.map((link) => {
                  const Icone = link.icone
                  return (
                    <button
                      key={link.vista}
                      onClick={() => navegarPara(link.vista)}
                      className="flex w-fit items-center gap-2 text-sm text-gray-500 transition-colors hover:text-emerald-600 focus:outline-none"
                    >
                      <Icone className="h-4 w-4" />
                      {link.etiqueta}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Coluna 3: Contacto */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                Contacto
              </h3>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:angolareads@gmail.com"
                  className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-emerald-600"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>angolareads@gmail.com</span>
                </a>
                <a
                  href="https://wa.me/244947399578"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-emerald-600"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span>+244 947399578 (WhatsApp)</span>
                </a>
              </div>
            </div>

            {/* Coluna 4: Métodos de pagamento */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                Métodos de Pagamento
              </h3>
              <div className="flex flex-col gap-3">
                {/* Millennium Atlântico */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50">
                    <Banknote className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Millennium Atlântico
                  </span>
                </div>

                {/* Airtm */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sky-50">
                    <Wallet className="h-4 w-4 text-sky-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Airtm
                  </span>
                </div>

                {/* PayPal */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-50">
                    <CreditCard className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    PayPal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção do marquee com avaliações */}
      <div className="overflow-hidden border-t border-emerald-200/60 bg-emerald-50/70 py-4">
        <div className="pista-avaliacoes flex w-max gap-8">
          {/* Duplicar o conteúdo para rolagem contínua sem lacunas */}
          {[...avaliacoes, ...avaliacoes].map((avaliacao, indice) => (
            <div
              key={indice}
              className="flex w-80 shrink-0 flex-col gap-1 rounded-lg border border-emerald-100 bg-white px-4 py-3 shadow-sm"
            >
              <p className="text-sm italic leading-relaxed text-gray-700">
                &ldquo;{avaliacao.texto}&rdquo;
              </p>
              <p className="text-xs font-semibold text-emerald-700">
                — {avaliacao.autor}, {avaliacao.local}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Barra inferior de direitos autorais */}
      <div className="border-t border-emerald-100 bg-emerald-800 py-4">
        <p className="text-center text-sm text-emerald-100">
          © 2024 AngolaReads. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
