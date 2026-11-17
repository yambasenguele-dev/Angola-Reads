"use client"

import { motion } from "framer-motion"
import { ArrowLeft, HelpCircle, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { usarNavegacao } from "@/lojas/navegacao"

interface Pergunta {
  id: string
  pergunta: string
  resposta: string
}

interface Grupo {
  titulo: string
  perguntas: Pergunta[]
}

// Respostas alinhadas com o checkout e os Termos: transferência bancária, Airtm
// e PayPal; comprovativo enviado pelo site; download só após confirmação.
const GRUPOS: Grupo[] = [
  {
    titulo: "Compras e pagamentos",
    perguntas: [
      {
        id: "comprar",
        pergunta: "Como faço para comprar um ebook?",
        resposta:
          "Escolhe o ebook no catálogo, clica em \"Adicionar ao Carrinho\" e depois em \"Finalizar Compra\". Se ainda não tens conta, crias uma em poucos segundos (nome, email e senha). Escolhe o método de pagamento, confirma o pedido e segue as instruções que aparecem no ecrã.",
      },
      {
        id: "pagamentos",
        pergunta: "Quais são os métodos de pagamento?",
        resposta:
          "Aceitamos transferência bancária, Airtm e PayPal. Na transferência bancária, ao confirmares o pedido mostramos-te o banco, o IBAN, o titular, o valor a pagar e a referência do pedido, que deves colocar na descrição da transferência.",
      },
      {
        id: "comprovativo",
        pergunta: "Como envio o comprovativo da transferência?",
        resposta:
          "Diretamente pelo site. Logo a seguir a confirmares o pedido aparece o espaço para carregares o comprovativo (JPG, PNG ou PDF, até 5MB). Se preferires, podes enviá-lo mais tarde em \"Os Meus Ebooks\", no botão \"Enviar comprovativo\" do pedido pendente.",
      },
      {
        id: "confirmacao",
        pergunta: "Quanto tempo demora a confirmação do pagamento?",
        resposta:
          "A confirmação é feita manualmente pela nossa equipa, normalmente dentro de 24 horas. O pedido fica pendente até lá e, quando for aprovado, recebes um email.",
      },
    ],
  },
  {
    titulo: "Downloads e ficheiros",
    perguntas: [
      {
        id: "download",
        pergunta: "Quando posso descarregar o ebook?",
        resposta:
          "O download só fica disponível depois de confirmarmos o pagamento. Quando o pedido for aprovado, o ebook aparece em \"Os Meus Ebooks\", onde podes descarregá-lo.",
      },
      {
        id: "formatos",
        pergunta: "Qual a diferença entre PDF e EPUB?",
        resposta:
          "O PDF mantém a paginação original e abre em praticamente qualquer telemóvel ou computador. O EPUB adapta o texto ao tamanho do ecrã e é ideal para leitores de ebooks e aplicações de leitura. Quando um ebook tem os dois formatos, podes levar ambos.",
      },
      {
        id: "dispositivos",
        pergunta: "Os ebooks funcionam em todos os dispositivos?",
        resposta:
          "Sim. Podes ler no telemóvel, no tablet e no computador, com qualquer leitor de PDF ou de EPUB.",
      },
    ],
  },
  {
    titulo: "Conta, suporte e reembolsos",
    perguntas: [
      {
        id: "naoaparece",
        pergunta: "Já paguei mas o ebook não aparece. O que faço?",
        resposta:
          "Vai a \"Os Meus Ebooks\", encontra o pedido pendente e carrega o comprovativo em \"Enviar comprovativo\". Se já o enviaste, aguarda a confirmação. Se passar mais de 24 horas, fala com o nosso suporte indicando a referência do pedido.",
      },
      {
        id: "reembolso",
        pergunta: "Posso pedir reembolso?",
        resposta:
          "Por regra, não há reembolso depois de o ficheiro ter sido descarregado. Se tiveres um problema com o ficheiro, contacta-nos em até 7 dias úteis com a referência do pedido e tentaremos resolver primeiro. Os detalhes estão nos Termos e Condições.",
      },
      {
        id: "afiliados",
        pergunta: "Como funciona o Programa de Afiliados?",
        resposta:
          "Depois de ativares o Programa de Afiliados, ganhas comissão por cada venda confirmada feita através do teu link. Em cada ebook com comissão, usa o botão \"Afiliar-me a este produto\" para veres a percentagem e copiares o teu link.",
      },
    ],
  },
]

export default function PaginaFAQ() {
  const navegarPara = usarNavegacao((s) => s.navegarPara)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <button
        type="button"
        onClick={() => navegarPara("inicio")}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-emerald-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao catálogo
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <HelpCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Perguntas Frequentes
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Tudo o que precisas de saber para comprar e ler ebooks na AngolaReads.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {GRUPOS.map((grupo) => (
            <section key={grupo.titulo}>
              <h2 className="mb-2 text-base font-semibold text-gray-900">
                {grupo.titulo}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {grupo.perguntas.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left text-sm font-medium text-gray-800 hover:no-underline sm:text-base">
                      {item.pergunta}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-gray-600">
                      {item.resposta}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-center">
          <Headphones className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
          <p className="text-sm font-medium text-gray-800">
            Não encontraste a resposta?
          </p>
          <p className="mb-3 text-xs text-gray-500">
            A nossa equipa de suporte ajuda-te com o que precisares.
          </p>
          <Button
            onClick={() => navegarPara("suporte")}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Falar com o suporte
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
