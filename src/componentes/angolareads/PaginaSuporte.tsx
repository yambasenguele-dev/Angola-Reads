'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeft,
  HelpCircle,
  Mail,
  MessageCircle,
  Headphones,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { usarNavegacao } from '@/lojas/navegacao'

// ============================================================
// Dados do FAQ
// ============================================================

interface PerguntaFaq {
  id: string
  pergunta: string
  resposta: string
}

const perguntasFaq: PerguntaFaq[] = [
  {
    id: 'comprar',
    pergunta: 'Como faço para comprar um ebook?',
    resposta: `Comprar um ebook na AngolaReads é simples e rápido! Siga estes passos:

1. Navegue pelo nosso catálogo e encontre o ebook que deseja;
2. Clique no botão "Adicionar ao Carrinho" na página do produto;
3. Quando terminar, clique no ícone do carrinho no canto superior direito;
4. Verifique os itens e clique em "Finalizar Compra";
5. Se ainda não tem conta, crie uma rapidamente (são necessários apenas nome, email e senha);
6. Escolha o método de pagamento e siga as instruções;
7. Após a confirmação do pagamento, o ebook ficará disponível imediatamente na sua biblioteca pessoal "Os Meus Ebooks".

O processo todo leva menos de 5 minutos!`,
  },
  {
    id: 'pagamentos',
    pergunta: 'Quais são os métodos de pagamento?',
    resposta: `A AngolaReads oferece métodos de pagamento adaptados à realidade angolana:

• Multicaixa Express: faça o pagamento em qualquer caixa multicaixa com a referência gerada na plataforma;
• Transferência Bancária: efectue uma transferência para a nossa conta bancária (os dados são fornecidos durante o checkout);
• Pagamento Móvel: utilize os serviços de pagamento móvel disponíveis (o número e instruções são fornecidos durante o checkout);

Todos os pagamentos são processados de forma segura. Após a confirmação do pagamento, o acesso ao ebook é liberado automaticamente. O tempo de confirmação varia conforme o método escolhido: Multicaixa Express é quase instantâneo, enquanto transferências bancárias podem levar até 24 horas úteis.`,
  },
  {
    id: 'receber-ebook',
    pergunta: 'Como recebo o meu ebook após a compra?',
    resposta: `Após a confirmação do pagamento, o seu ebook fica disponível imediatamente na sua biblioteca pessoal. Para aceder:

1. Faça login na sua conta;
2. Clique em "Os Meus Ebooks" no menu;
3. Encontre o ebook desejado e clique em "Ler Agora" ou "Descarregar".

Os ebooks estão disponíveis nos formatos PDF e/ou EPUB, dependendo do produto. Pode ler directamente no seu navegador ou descarregar para ler offline no seu dispositivo.

Também receberá um email de confirmação da compra com o resumo da encomenda. Se não encontrar o seu ebook na biblioteca dentro de 30 minutos após o pagamento, contacte-nos através do WhatsApp ou email.`,
  },
  {
    id: 'reembolso',
    pergunta: 'Posso pedir reembolso?',
    resposta: `Sim, a AngolaReads possui uma política de reembolsos. Pode solicitar um reembolso num prazo máximo de 7 (sete) dias úteis após a compra, desde que:

• O ebook não tenha sido descarregado ou o download não tenha sido iniciado;
• O ficheiro esteja defeituoso ou corrompido;
• O produto não corresponda à descrição apresentada;
• Tenha ocorrido um pagamento duplicado.

Não é possível reembolsar ebooks que já foram descarregados com sucesso.

Para solicitar, envie um email para angolareads@gmail.com com o número da ordem de compra e o motivo. Os reembolsos são processados em 5 a 10 dias úteis após a aprovação.`,
  },
  {
    id: 'afiliados',
    pergunta: 'Como funciona o programa de afiliados?',
    resposta: `O programa de afiliados da AngolaReads permite-lhe ganhar dinheiro recomendando os nossos ebooks. Funciona assim:

1. Crie a sua conta e active o programa de afiliados no painel de afiliados;
2. Receberá um link único com o seu código de afiliado;
3. Partilhe esse link nas suas redes sociais, WhatsApp, blog ou qualquer outro canal;
4. Quando alguém comprar através do seu link, recebe uma comissão de 20% a 40% do valor da venda;
5. Acompanhe as suas vendas e comissões em tempo real no seu painel;
6. Receba os pagamentos das suas comissões conforme os termos do programa.

Não há custos para participar. Quanto mais partilhar, mais poderá ganhar!

Para mais detalhes, visite a página do Programa de Afiliados na sua conta.`,
  },
  {
    id: 'dispositivos',
    pergunta: 'Os ebooks funcionam em todos os dispositivos?',
    resposta: `Sim! Os ebooks da AngolaReads são concebidos para funcionar na maioria dos dispositivos:

• Computadores (Windows, Mac, Linux): pode ler directamente no navegador ou descarregar o ficheiro;
• Smartphones (Android e iOS): leia no navegador móvel ou descarregue para uma aplicação de leitura;
• Tablets: compatível com iPad, tablets Android e outros;
• E-readers: os ficheiros em EPUB são compatíveis com a maioria dos e-readers (Kindle, Kobo, etc.).

Os formatos disponíveis variam conforme o ebook: oferecemos PDF (universal) e EPUB (padrão para e-readers). O PDF funciona em praticamente qualquer dispositivo com um leitor de documentos.

Se tiver dificuldades com algum formato específico, contacte o nosso suporte e ajudaremos com prazer.`,
  },
]

// ============================================================
// Componente Principal
// ============================================================

export default function PaginaSuporte() {
  const { voltar } = usarNavegacao()

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Cabeçalho Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-40 w-40 rounded-full bg-amber-400/5 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
          <Button
            variant="ghost"
            onClick={voltar}
            className="mb-6 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm"
            >
              <Headphones className="h-8 w-8 text-amber-300" />
            </motion.div>

            <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
              Precisas de Ajuda?
            </h1>
            <p className="mx-auto max-w-lg text-base text-emerald-100">
              Estamos aqui para te ajudar. Escolhe a melhor forma de entrar em
              contacto connosco ou consulta as perguntas frequentes abaixo.
            </p>
          </motion.div>
        </div>

        {/* Onda decorativa */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 60V20C240 0 480 40 720 30C960 20 1200 0 1440 20V60H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        {/* Canais de Contacto */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="-mt-4 mb-12"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Email */}
            <motion.a
              href="mailto:angolareads@gmail.com"
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="h-full border-0 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                    <Mail className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-1 text-base font-semibold text-gray-900">
                      Email
                    </h3>
                    <p className="mb-2 text-sm text-gray-500">
                      Envia-nos um email e respondemos em até 24-48 horas úteis.
                    </p>
                    <p className="truncate text-sm font-medium text-emerald-600">
                      angolareads@gmail.com
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.a>

            {/* WhatsApp */}
            <motion.a
              href="https://wa.me/244947399578"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="h-full border-0 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                    <MessageCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-1 text-base font-semibold text-gray-900">
                      WhatsApp
                    </h3>
                    <p className="mb-2 text-sm text-gray-500">
                      Resposta rápida durante o horário de atendimento.
                    </p>
                    <p className="text-sm font-medium text-emerald-600">
                      +244 947 399 578
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.a>
          </div>

          {/* Horário de atendimento */}
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Horário de atendimento: Segunda a Sexta-feira, 08:00 – 18:00 (Luanda)</span>
          </div>
        </motion.section>

        {/* Separador */}
        <Separator className="mb-12" />

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
            >
              <HelpCircle className="h-3 w-3" />
              Respostas rápidas
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Perguntas Frequentes
            </h2>
            <p className="mt-2 text-gray-500">
              Encontra respostas para as questões mais comuns sobre a AngolaReads.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              {perguntasFaq.map((faq, indice) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="px-6 last:border-b-0"
                >
                  <AccordionTrigger className="py-5 text-left text-sm font-medium text-gray-900 hover:text-emerald-700 hover:no-underline sm:text-base">
                    <span className="flex items-start gap-3">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600">
                        {indice + 1}
                      </span>
                      {faq.pergunta}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pl-10">
                    <div className="space-y-3">
                      {faq.resposta.split('\n\n').map((paragrafo, i) => (
                        <div key={i}>
                          {paragrafo.includes('\n') ? (
                            <div className="space-y-1">
                              <p className="text-sm leading-relaxed text-gray-600">
                                {paragrafo.split('\n')[0]}
                              </p>
                              <ul className="ml-4 space-y-1">
                                {paragrafo
                                  .split('\n')
                                  .slice(1)
                                  .filter((linha) => linha.trim())
                                  .map((linha, j) => (
                                    <li
                                      key={j}
                                      className="flex items-start gap-2 text-sm leading-relaxed text-gray-600"
                                    >
                                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                                      <span>{linha.replace(/^\d+\.\s*/, '').replace(/^•\s*/, '')}</span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed text-gray-600">
                              {paragrafo}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.section>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-10 text-center sm:px-8">
              <h3 className="mb-2 text-xl font-bold text-white">
                Não encontraste o que procuravas?
              </h3>
              <p className="mx-auto mb-6 max-w-md text-sm text-emerald-100">
                Não hesites em entrar em contacto connosco directamente. Estamos
                sempre prontos para te ajudar com qualquer questão.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="mailto:angolareads@gmail.com">
                  <Button
                    variant="secondary"
                    className="bg-white text-emerald-700 hover:bg-emerald-50"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Email
                  </Button>
                </a>
                <a
                  href="https://wa.me/244947399578"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-amber-500 text-white hover:bg-amber-600">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
