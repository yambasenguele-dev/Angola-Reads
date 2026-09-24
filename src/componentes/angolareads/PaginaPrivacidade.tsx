'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Database,
  Target,
  Share2,
  Cookie,
  Lock,
  UserCheck,
  Clock,
  Baby,
  FileEdit,
  Phone,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usarNavegacao } from '@/lojas/navegacao'

// ============================================================
// Dados das secções da política
// ============================================================

interface SecaoPolitica {
  id: string
  titulo: string
  icone: React.ElementType
  conteudo: string
}

const secoesPolitica: SecaoPolitica[] = [
  {
    id: 'recolha',
    titulo: '1. Informações que Recolhemos',
    icone: Database,
    conteudo: `Na AngolaReads, recolhemos informações necessárias para proporcionar uma experiência de utilização completa e segura. As informações recolhidas incluem:

• Informações de identificação: nome completo, endereço de email e número de telefone fornecidos durante o registo da conta;
• Dados de transacções: histórico de compras, métodos de pagamento utilizados e detalhes de facturas;
• Informações técnicas: endereço IP, tipo de navegador, sistema operativo, páginas visitadas e tempo de navegação;
• Dados de utilização: ebooks visualizados, pesquisas efectuadas, itens adicionados ao carrinho e funcionalidades utilizadas;
• Informações de comunicação: mensagens enviadas através do formulário de contacto ou WhatsApp;
• Dados de referência: código de afiliado utilizado quando acede à plataforma através de um link de referência.

Recolhemos estas informações directamente quando cria uma conta, efectua uma compra ou interage com a plataforma. Algumas informações são recolhidas automaticamente através de cookies e tecnologias similares.`,
  },
  {
    id: 'utilizacao',
    titulo: '2. Como Utilizamos as Informações',
    icone: Target,
    conteudo: `As informações recolhidas são utilizadas para os seguintes fins:

• Prestação do serviço: processar encomendas, gerir a sua conta de utilizador e fornecer acesso aos ebooks adquiridos;
• Comunicação: enviar confirmações de compra, actualizações da conta, notificações sobre novos lançamentos e responder a solicitações de suporte;
• Melhoria da plataforma: analisar padrões de uso para melhorar a funcionalidade, o desempenho e a experiência de utilizador;
• Personalização: recomendar ebooks relevantes com base no seu histórico de compras e navegação;
• Segurança: detectar e prevenir actividades fraudulentas, acessos não autorizados e abusos da plataforma;
• Programa de afiliados: rastrear vendas geradas através de links de afiliados e calcular as respectivas comissões;
• Conformidade legal: cumprir obrigações legais e regulatórias aplicáveis em Angola.

Não vendemos, alugamos ou partilhamos as suas informações pessoais com terceiros para fins de marketing sem o seu consentimento explícito.`,
  },
  {
    id: 'partilha',
    titulo: '3. Partilha de Informações',
    icone: Share2,
    conteudo: `A AngolaReads pode partilhar as suas informações pessoais nas seguintes circunstâncias:

• Prestadores de serviços: partilhamos informações com prestadores de serviços de pagamento e processamento de transacções estritamente necessários para o funcionamento da plataforma. Estes prestadores estão contratualmente obrigados a proteger as suas informações e utilizá-las apenas para os fins especificados;
• Requisitos legais: podemos divulgar informações quando exigido por lei, ordem judicial, ou por autoridades governamentais competentes;
• Protecção de direitos: podemos partilhar informações para proteger os nossos direitos, propriedade ou segurança, ou dos nossos utilizadores e do público;
• Parceiros de afiliados: partilhamos dados de vendas agregados com afiliados para que possam acompanhar as suas comissões, mas não partilhamos dados pessoais identificáveis dos compradores;
• Sucesso empresarial: em caso de fusão, aquisição ou venda de activos, as suas informações podem ser transferidas como parte da transacção.

Para além destes casos, não partilhamos informações pessoais com terceiros sem o seu consentimento prévio.`,
  },
  {
    id: 'cookies',
    titulo: '4. Cookies e Tecnologias Similares',
    icone: Cookie,
    conteudo: `A AngolaReads utiliza cookies e tecnologias similares para melhorar a sua experiência na plataforma. Os cookies são pequenos ficheiros de texto armazenados no seu dispositivo que nos permitem:

• Cookies essenciais: necessários para o funcionamento básico da plataforma, incluindo autenticação, segurança e preferências de sessão;
• Cookies de desempenho: recolhem informações sobre como os utilizadores interagem com a plataforma, permitindo-nos identificar áreas de melhoria;
• Cookies de funcionalidade: permitem funcionalidades aprimoradas e personalização, como lembrar as suas preferências e definições;
• Cookies de referência (afiliados): armazenam o código de afiliado para garantir que as comissões sejam atribuídas correctamente;
• Cookies de análise: utilizados para compreender como os utilizadores chegam à plataforma e como a utilizam.

Pode controlar e gerir cookies através das definições do seu navegador. No entanto, a desactivação de certos cookies pode afectar a funcionalidade da plataforma.

Utilizamos também pixels de rastreamento e tecnologias de análise para compreender melhor o uso da plataforma e melhorar os nossos serviços.`,
  },
  {
    id: 'seguranca',
    titulo: '5. Segurança dos Dados',
    icone: Lock,
    conteudo: `A AngolaReads implementa medidas de segurança técnicas e organizativas adequadas para proteger as suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Estas medidas incluem:

• Encriptação: utilização de protocolos SSL/TLS para encriptar todas as transmissões de dados entre o seu navegador e os nossos servidores;
• Controlo de acesso: restrição do acesso às informações pessoais apenas a funcionários autorizados que necessitam dessas informações para desempenhar as suas funções;
• Armazenamento seguro: os dados são armazenados em servidores seguros com firewall e outras medidas de protecção;
• Monitorização: monitorização contínua dos nossos sistemas para detectar e responder a potenciais ameaças de segurança;
• Avaliação de fornecedores: avaliação cuidadosa dos prestadores de serviços para garantir que cumprem padrões de segurança adequados.

Apesar dos nossos esforços, nenhum sistema de segurança é completamente infalível. Em caso de violação de dados que afecte as suas informações pessoais, notificá-lo-emos de acordo com os requisitos legais aplicáveis.`,
  },
  {
    id: 'direitos',
    titulo: '6. Os Seus Direitos',
    icone: UserCheck,
    conteudo: `Em conformidade com as leis aplicáveis em Angola, tem os seguintes direitos relativos às suas informações pessoais:

• Direito de acesso: pode solicitar uma cópia das informações pessoais que detemos sobre si;
• Direito de rectificação: pode solicitar a correcção de informações pessoais inexactas ou incompletas;
• Direito de eliminação: pode solicitar a eliminação das suas informações pessoais, sujeito a certas excepções legais;
• Direito de oposição: pode opor-se ao processamento das suas informações pessoais para determinados fins, incluindo marketing directo;
• Direito de portabilidade: pode solicitar a transferência das suas informações pessoais para outro serviço;
• Direito de retirar consentimento: quando o processamento é baseado no seu consentimento, pode retirá-lo a qualquer momento.

Para exercer qualquer destes direitos, entre em contacto connosco através de angolareads@gmail.com. Responderemos à sua solicitação num prazo de 30 dias úteis. Pode ser necessário verificar a sua identidade antes de processar o seu pedido.

Note que a eliminação da sua conta resultará na perda de acesso a todos os ebooks adquiridos e ao seu histórico de compras.`,
  },
  {
    id: 'retencao',
    titulo: '7. Retenção de Dados',
    icone: Clock,
    conteudo: `A AngolaReads retém as suas informações pessoais pelo tempo necessário para cumprir os fins para os quais foram recolhidas, incluindo:

• Conta activa: enquanto a sua conta estiver activa, mantemos as suas informações para fornecer os nossos serviços;
• Dados de transacções: mantemos os registos de compra e pagamento por um período mínimo de 5 (cinco) anos, conforme exigido pela legislação fiscal angolana;
• Dados de afiliados: mantemos as informações do programa de afiliados enquanto a conta de afiliado estiver activa e por 3 (três) anos após a desactivação, para fins de auditoria;
• Dados de suporte: mantemos os registos de comunicações de suporte por 2 (dois) anos;
• Dados de marketing: mantemos as suas preferências de marketing até que retire o seu consentimento;
• Cookies: a maioria dos cookies expira automaticamente após um período definido, conforme descrito na secção de Cookies.

Após o período de retenção aplicável, as suas informações pessoais são eliminadas ou anonimizadas de forma segura.`,
  },
  {
    id: 'menores',
    titulo: '8. Menores de Idade',
    icone: Baby,
    conteudo: `A AngolaReads não se destina a menores de 18 (dezoito) anos de idade. Não recolhemos conscientemente informações pessoais de menores de idade.

Se somos informados de que recolhemos informações pessoais de um menor de 18 anos sem verificação do consentimento parental, tomaremos medidas para eliminar essas informações dos nossos servidores o mais rapidamente possível.

Se é pai, mãe ou tutor e acredita que o seu filho menor forneceu informações pessoais à AngolaReads, contacte-nos imediatamente através de angolareads@gmail.com para que possamos tomar as medidas adequadas.

Aconselhamos os pais e tutores a supervisionar a actividade online dos seus filhos menores e a utilizar ferramentas de controlo parental disponíveis nos navegadores e sistemas operativos.`,
  },
  {
    id: 'alteracoes',
    titulo: '9. Alterações à Política',
    icone: FileEdit,
    conteudo: `A AngolaReads reserva-se o direito de actualizar esta Política de Privacidade a qualquer momento. As alterações entram em vigor imediatamente após a publicação da política actualizada na plataforma.

Quando efectuamos alterações materiais a esta política, faremos um esforço razoável para notificar os utilizadores através de:

• Aviso destacado na plataforma;
• Comunicação por email para o endereço associado à sua conta;
• Actualização da data de "última atualização" no topo desta política.

O uso continuado da plataforma após a publicação de alterações constitui aceitação da política actualizada. Recomendamos que reveja esta política periodicamente para se manter informado sobre como protegemos as suas informações.

Se tiver questões sobre alterações à nossa política de privacidade, não hesite em entrar em contacto connosco.`,
  },
  {
    id: 'contacto',
    titulo: '10. Contacto',
    icone: Phone,
    conteudo: `Para questões relacionadas com esta Política de Privacidade, ou para exercer qualquer dos seus direitos relativos aos seus dados pessoais, pode entrar em contacto connosco através dos seguintes canais:

• Email: angolareads@gmail.com
• WhatsApp: +244 947399578
• Horário de atendimento: Segunda a Sexta-feira, das 08:00 às 18:00 (horário de Luanda)

Reservamo-nos o direito de responder às solicitações num prazo razoável, geralmente dentro de 24 a 48 horas úteis. Para solicitações mais complexas, como pedidos de eliminação de dados, o prazo pode estender-se até 30 dias úteis.

Tomamos a protecção dos seus dados pessoais muito a sério e estamos disponíveis para esclarecer qualquer dúvida que possa ter sobre as nossas práticas de privacidade.`,
  },
]

// ============================================================
// Componente Principal
// ============================================================

export default function PaginaPrivacidade() {
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
              <Eye className="h-4 w-4 text-amber-300" />
              Protecção dos seus dados
            </motion.div>

            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Política de Privacidade
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

      {/* Conteúdo da Política */}
      <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-8 pt-8"
        >
          {secoesPolitica.map((secao) => (
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
