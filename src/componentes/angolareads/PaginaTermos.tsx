'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, FileText, ScrollText, ShieldCheck, CreditCard, RefreshCcw, Scale, Phone, Settings, Gavel, PenTool, CheckCircle2, Users, Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usarNavegacao } from '@/lojas/navegacao'

// ============================================================
// Dados das secções dos termos
// ============================================================

interface SecaoTermo {
  id: string
  titulo: string
  icone: React.ElementType
  conteudo: string
}

const secoesTermos: SecaoTermo[] = [
  {
    id: 'aceitacao',
    titulo: '1. Aceitação dos Termos',
    icone: CheckCircle2,
    conteudo: `Ao aceder e utilizar a plataforma AngolaReads, disponível em angolareads.vercel.app, concorda integralmente com estes Termos de Uso. Estes termos constituem um acordo legal vinculativo entre si ("Utilizador") e a AngolaReads ("Plataforma", "Nós").

Se não concorda com qualquer parte destes termos, deverá cessar imediatamente a utilização da plataforma. O uso continuado da plataforma após a publicação de alterações aos termos constitui aceitação dessas alterações.

Estes termos aplicam-se a todos os visitantes, utilizadores e outros que acedam ou utilizem a AngolaReads, incluindo aqueles que acedem através de links de afiliados.`,
  },
  {
    id: 'servico',
    titulo: '2. Descrição do Serviço',
    icone: FileText,
    conteudo: `A AngolaReads é uma plataforma digital de venda de ebooks (livros electrónicos) em língua portuguesa, destinada predominantemente ao público angolano. Os nossos serviços incluem:

• Venda de ebooks em formato digital (PDF, EPUB e outros formatos compatíveis);
• Download imediato após a confirmação do pagamento;
• Acesso a uma biblioteca pessoal de ebooks adquiridos;
• Programa de afiliados que permite a utilizadores ganhar comissões por vendas referenciadas;
• Suporte ao cliente via email e WhatsApp.

A AngolaReads reserva-se o direito de modificar, suspender ou descontinuar qualquer funcionalidade do serviço a qualquer momento, sem aviso prévio, embora nos esforcemos por notificar os utilizadores sobre alterações significativas.`,
  },
  {
    id: 'contas',
    titulo: '3. Contas de Utilizador',
    icone: Users,
    conteudo: `Para aceder a determinadas funcionalidades da plataforma (como comprar ebooks ou participar no programa de afiliados), é necessário criar uma conta de utilizador. Ao criar uma conta, compromete-se a:

• Fornecer informações verdadeiras, exactas, completas e actualizadas durante o registo;
• Manter e actualizar prontamente as suas informações para mantê-las verdadeiras, exactas, completas e actualizadas;
• Manter a confidencialidade da sua palavra-passe e de todas as credenciais de acesso;
• Aceitar toda a responsabilidade por todas as actividades que ocorram na sua conta;
• Notificar imediatamente a AngolaReads sobre qualquer uso não autorizado da sua conta.

Cada pessoa pode possuir apenas uma conta. A criação de múltiplas contas pode resultar na suspensão de todas as contas associadas. A AngolaReads reserva-se o direito de suspender ou encerrar contas que violem estes termos.`,
  },
  {
    id: 'propriedade',
    titulo: '4. Propriedade Intelectual',
    icone: Shield,
    conteudo: `Todo o conteúdo disponível na plataforma AngolaReads, incluindo mas não limitado a textos, gráficos, logótipos, ícones, imagens, clipes de áudio, downloads digitais e compilações de dados, é propriedade da AngolaReads ou dos seus fornecedores de conteúdo e está protegido pelas leis angolanas e internacionais de direitos de autor e propriedade intelectual.

Os ebooks adquiridos na plataforma são licenciados ao utilizador para uso pessoal e não comercial. O utilizador não pode:

• Reproduzir, distribuir, transmitir ou vender cópias dos ebooks adquiridos;
• Partilhar ficheiros de ebooks com terceiros;
• Utilizar o conteúdo dos ebooks para fins comerciais sem autorização expressa;
• Remover quaisquer avisos de direitos de autor ou marca registada dos materiais;
• Criar obras derivadas baseadas no conteúdo dos ebooks sem autorização.

A violação destes direitos pode resultar em acção legal e na rescisão imediata do acesso à plataforma.`,
  },
  {
    id: 'precos',
    titulo: '5. Preços e Pagamentos',
    icone: CreditCard,
    conteudo: `Todos os preços dos ebooks são apresentados em Kwanza Angolano (AOA), com equivalência indicativa em USD/EUR quando aplicável. A AngolaReads reserva-se o direito de alterar os preços a qualquer momento, sem aviso prévio, embora as alterações não afectem compras já concluídas.

Os métodos de pagamento aceites são:

• Transferência bancária (Angola);
• Airtm (para clientes fora de Angola ou sem acesso a transferência bancária local);
• PayPal.

Após escolheres o método de pagamento, deves efectuar o pagamento e submeter o comprovativo através da plataforma. A nossa equipa confirma manualmente cada pagamento — este processo demora tipicamente algumas horas (normalmente dentro de 24 horas). O acesso aos downloads é liberado automaticamente assim que o comprovativo for aprovado, e recebes também um email de confirmação.

Preços promocionais são válidos pelo período indicado na promoção ou enquanto durarem os stocks disponíveis.`,
  },
  {
    id: 'reembolsos',
    titulo: '6. Política de Entrega Digital e Reembolsos',
    icone: RefreshCcw,
    conteudo: `Os ebooks vendidos na AngolaReads são produtos digitais entregues por download imediato após a aprovação do pagamento. Ao concluíres a compra e confirmares o comprovativo, aceitas expressamente que o serviço seja iniciado de imediato (entrega digital), pelo que o direito de livre resolução previsto para compras à distância deixa de se aplicar assim que o download é disponibilizado.

Regra geral: não há reembolso depois de o ficheiro ter sido descarregado.

Isto acontece porque, ao contrário de um produto físico, um ebook descarregado não pode ser "devolvido" — o ficheiro já está na posse do cliente. Esta é a prática habitual em qualquer loja de produtos digitais.

Excepções — aceitamos pedido de reembolso quando:

• O ficheiro está corrompido, incompleto ou não abre correctamente (erro técnico comprovado da nossa parte);
• O ebook enviado não corresponde ao produto que foi comprado;
• Houve cobrança duplicada pelo mesmo produto;
• O pagamento foi confirmado por engano e o download ainda não foi realizado.

Nestes casos, o pedido deve ser feito num prazo máximo de 7 (sete) dias úteis após a compra. Sempre que possível, a nossa primeira resposta é corrigir o problema (reenviar o ficheiro correcto, por exemplo) — o reembolso é o último recurso.

Não são aceites pedidos de reembolso por simples mudança de ideias, arrependimento da compra, ou por não teres conseguido usar o ebook por motivos alheios à AngolaReads (ex: dispositivo incompatível, falta de leitor de PDF/EPUB instalado).

Para solicitar um reembolso, contacta-nos através do email de suporte indicado na página de Suporte, com o número de referência do pedido e a descrição do problema. Respondemos normalmente dentro de 48 horas, e os reembolsos aprovados são processados no mesmo método de pagamento usado na compra, num prazo de 5 a 10 dias úteis.`,
  },
  {
    id: 'limitacao',
    titulo: '7. Limitação de Responsabilidade',
    icone: AlertTriangle,
    conteudo: `A AngolaReads disponibiliza a plataforma e os seus conteúdos "tal como estão" e "conforme disponíveis", sem garantias de qualquer tipo, expressas ou implícitas, incluindo mas não limitado a garantias de comercialização, adequação a um fim específico e não violação.

Em nenhum caso a AngolaReads, os seus directores, empregados, parceiros, agentes, fornecedores ou afiliados serão responsáveis por quaisquer danos indirectos, incidentais, especiais, consequenciais ou punitivos, incluindo mas não limitado a perda de lucros, dados, uso, boa reputação ou outras perdas intangíveis, resultantes do uso ou da impossibilidade de uso da plataforma.

A responsabilidade total da AngolaReads perante o utilizador por todas as reclamações decorrentes destes termos não excederá o valor total pago pelo utilizador à AngolaReads nos 12 (doze) meses anteriores à ocorrência do evento que deu origem à reclamação.

A AngolaReads não garante que a plataforma estará disponível ininterruptamente, segura ou livre de erros. O acesso à plataforma pode ser temporariamente suspenso para manutenção ou actualizações.`,
  },
  {
    id: 'modificacoes',
    titulo: '8. Modificações dos Termos',
    icone: PenTool,
    conteudo: `A AngolaReads reserva-se o direito de modificar estes Termos de Uso a qualquer momento. As modificações entram em vigor imediatamente após a sua publicação na plataforma.

Quando efectuamos alterações materiais a estes termos, faremos um esforço razoável para notificar os utilizadores através de:

• Aviso na plataforma;
• Comunicação por email para o endereço associado à conta do utilizador;
• Notificação através de outros meios que consideremos apropriados.

O uso continuado da plataforma após a entrada em vigor de qualquer modificação constitui aceitação dos novos termos. É responsabilidade do utilizador rever periodicamente estes termos.

Se não concorda com os termos modificados, deverá cessar a utilização da plataforma e, se desejar, solicitar a eliminação da sua conta de utilizador.`,
  },
  {
    id: 'lei',
    titulo: '9. Lei Aplicável',
    icone: Scale,
    conteudo: `Estes Termos de Uso são regidos e interpretados de acordo com as leis da República de Angola, sem consideração aos princípios de conflito de leis.

Quaisquer litígios decorrentes destes termos ou relacionados com a plataforma serão submetidos à jurisdição exclusiva dos tribunais competentes de Luanda, República de Angola.

Se qualquer disposição destes termos for considerada inválida ou inexequível por um tribunal competente, as disposições restantes permanecerão em pleno vigor e efeito. A falha da AngolaReads em exercer qualquer direito previsto nestes termos não constitui renúncia a tal direito.

Estes termos constituem o acordo integral entre o utilizador e a AngolaReads em relação ao uso da plataforma, substituindo quaisquer acordos anteriores relativos ao mesmo assunto.`,
  },
  {
    id: 'contacto',
    titulo: '10. Contacto',
    icone: Phone,
    conteudo: `Para questões relacionadas com estes Termos de Uso, ou para qualquer outra questão sobre a plataforma AngolaReads, pode entrar em contacto connosco através dos seguintes canais:

• Email: angolareads@gmail.com
• WhatsApp: +244 947399578
• Horário de atendimento: Segunda a Sexta-feira, das 08:00 às 18:00 (horário de Luanda)

Reservamo-nos o direito de responder às solicitações num prazo razoável, geralmente dentro de 24 a 48 horas úteis.`,
  },
]

// ============================================================
// Componente Principal
// ============================================================

export default function PaginaTermos() {
  const { voltar } = usarNavegacao()

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Cabeçalho */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
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
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm"
            >
              <ScrollText className="h-4 w-4 text-amber-300" />
              Documento Legal
            </motion.div>

            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Termos de Uso
            </h1>
            <p className="mt-2 text-emerald-100">
              Última atualização: Janeiro de 2025
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

      {/* Conteúdo dos Termos */}
      <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-8 pt-8"
        >
          {secoesTermos.map((secao, indice) => (
            <motion.article
              key={secao.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-gray-50 bg-gray-50/50 px-5 py-4">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                    <secao.icone className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                    {secao.titulo}
                  </h2>
                </div>
                <div className="px-5 py-5 sm:px-6">
                  {secao.conteudo.split('\n\n').map((paragrafo, i) => (
                    <div key={i} className={i > 0 ? 'mt-4' : ''}>
                      {paragrafo.startsWith('•') ? (
                        <ul className="space-y-1.5">
                          {paragrafo.split('\n').map((item, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-sm leading-relaxed text-gray-600"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                              <span>{item.replace(/^•\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm leading-relaxed text-gray-600">
                          {paragrafo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}

          <Separator className="my-10" />

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-gray-400"
          >
            © {new Date().getFullYear()} AngolaReads. Todos os direitos reservados.
          </motion.p>
        </motion.div>
      </main>
    </div>
  )
}


