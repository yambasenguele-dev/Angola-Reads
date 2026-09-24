'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  Target,
  Eye,
  Award,
  Users,
  Lightbulb,
  Heart,
  Sparkles,
  ArrowRight,
  BookMarked,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usarNavegacao } from '@/lojas/navegacao'

// ============================================================
// Animações
// ============================================================

const varianteContainer = {
  oculto: { opacity: 0 },
  visivel: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const varianteItem = {
  oculto: { opacity: 0, y: 24 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

// ============================================================
// Dados dos valores
// ============================================================

const valores = [
  {
    icone: Award,
    titulo: 'Qualidade',
    descricao:
      'Selecionamos cuidadosamente cada ebook para garantir conteúdo de alta qualidade, relevante e enriquecedor para os nossos leitores angolanos.',
    cor: 'bg-emerald-100 text-emerald-600',
  },
  {
    icone: Heart,
    titulo: 'Acessibilidade',
    descricao:
      'Trabalhamos para que o conhecimento chegue a todos os angolanos, com preços justos, interface intuitiva e suporte dedicado.',
    cor: 'bg-amber-100 text-amber-600',
  },
  {
    icone: Users,
    titulo: 'Comunidade',
    descricao:
      'Construímos uma comunidade de leitores apaixonados que partilham experiências, recomendam livros e crescem juntos.',
    cor: 'bg-teal-100 text-teal-600',
  },
  {
    icone: Lightbulb,
    titulo: 'Inovação',
    descricao:
      'Estamos sempre à procura de novas formas de melhorar a experiência de leitura digital e tornar o acesso ao conhecimento mais fácil.',
    cor: 'bg-emerald-100 text-emerald-600',
  },
]

// ============================================================
// Componente Principal
// ============================================================

export default function PaginaSobre() {
  const { voltar, navegarPara } = usarNavegacao()

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700">
        {/* Elementos decorativos de fundo */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-40 w-40 rounded-full bg-amber-400/5 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
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
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm"
            >
              <BookMarked className="h-4 w-4 text-amber-300" />
              Conhece-nos melhor
            </motion.div>

            <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Sobre a{' '}
              <span className="bg-gradient-to-r from-amber-200 to-amber-300 bg-clip-text text-transparent">
                AngolaReads
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base leading-relaxed text-emerald-100 sm:text-lg">
              Nascemos da paixão pela leitura e da convicção de que todo angolano
              merece acesso fácil e acessível ao conhecimento digital.
            </p>
          </motion.div>
        </div>

        {/* Onda decorativa na base */}
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

      <motion.main
        variants={varianteContainer}
        initial="oculto"
        whileInView="visivel"
        viewport={{ once: true, margin: '-50px' }}
        className="mx-auto max-w-5xl px-4 pb-16 sm:px-6"
      >
        {/* Quem Somos */}
        <motion.section variants={varianteItem} className="mb-16 py-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <BookOpen className="h-3 w-3" />
                A nossa história
              </div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
                Quem Somos
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  A <strong className="text-gray-900">AngolaReads</strong> é a
                  primeira livraria digital 100% angolana, criada com o objectivo
                  de democratizar o acesso a ebooks em língua portuguesa no nosso
                  país.
                </p>
                <p>
                  Fundada por apaixonados pela leitura e tecnologia, a AngolaReads
                  surgiu da constatação de que muitos angolanos tinham dificuldade
                  em aceder a conteúdo digital de qualidade em português, com
                  métodos de pagamento adaptados à realidade local.
                </p>
                <p>
                  Hoje, contamos com uma crescente biblioteca de ebooks que abrange
                  desde desenvolvimento pessoal e negócios até ficção, educação e
                  muito mais — sempre com a qualidade e relevância que os nossos
                  leitores merecem.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 p-8">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { numero: '500+', rotulo: 'Ebooks disponíveis' },
                    { numero: '5K+', rotulo: 'Leitores activos' },
                    { numero: '50+', rotulo: 'Autores angolanos' },
                    { numero: '24/7', rotulo: 'Acesso imediato' },
                  ].map((estatistica) => (
                    <div key={estatistica.rotulo} className="text-center">
                      <p className="text-2xl font-bold text-emerald-700 sm:text-3xl">
                        {estatistica.numero}
                      </p>
                      <p className="mt-1 text-xs text-emerald-600/70">
                        {estatistica.rotulo}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Missão */}
        <motion.section variants={varianteItem} className="mb-16">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Nossa Missão
                </h2>
              </div>
            </div>
            <CardContent className="px-6 py-8 sm:px-8">
              <p className="text-lg leading-relaxed text-gray-700">
                Democratizar o acesso ao conhecimento em Angola, oferecendo uma
                plataforma digital intuitiva e acessível onde todos os angolanos
                possam descobrir, adquirir e desfrutar de ebooks em língua
                portuguesa, com métodos de pagamento adaptados à realidade local e
                preços justos.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Visão */}
        <motion.section variants={varianteItem} className="mb-16">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-8 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Nossa Visão
                </h2>
              </div>
            </div>
            <CardContent className="px-6 py-8 sm:px-8">
              <p className="text-lg leading-relaxed text-gray-700">
                Ser a principal plataforma de ebooks em português para angolanos,
                reconhecida pela excelência do catálogo, pela experiência de
                utilizador excepcional e por impulsionar a cultura de leitura
                digital em Angola e na diáspora angolana.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Valores */}
        <motion.section variants={varianteItem} className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Nossos Valores
            </h2>
            <p className="mx-auto max-w-xl text-gray-500">
              Os pilares que guiam tudo o que fazemos na AngolaReads.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {valores.map((valor) => (
              <motion.div
                key={valor.titulo}
                variants={varianteItem}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="h-full border-0 shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div
                      className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${valor.cor}`}
                    >
                      <valor.icone className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      {valor.titulo}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-500">
                      {valor.descricao}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Equipa */}
        <motion.section variants={varianteItem} className="mb-16">
          <div className="overflow-hidden rounded-2xl border-0 bg-white shadow-lg">
            <div className="grid lg:grid-cols-5">
              <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-10 lg:col-span-2 lg:px-8">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-400/10 blur-2xl" />
                <div className="relative">
                  <Sparkles className="mb-4 h-8 w-8 text-amber-300" />
                  <h2 className="mb-3 text-2xl font-bold text-white">
                    A Equipa
                  </h2>
                  <p className="text-sm leading-relaxed text-emerald-100">
                    Por trás da AngolaReads está uma equipa pequena mas dedicada de
                    profissionais apaixonados pela leitura e pela tecnologia.
                  </p>
                </div>
              </div>
              <div className="px-6 py-10 lg:col-span-3 lg:px-8">
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      Feita com amor por angolanos, para angolanos
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-500">
                      A AngolaReads foi criada e é mantida por uma equipa de
                      jovens empreendedores angolanos que acreditam no poder da
                      leitura para transformar vidas. Combinamos conhecimentos em
                      tecnologia, design e literatura para oferecer a melhor
                      experiência de leitura digital do país.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      Parceiros locais e globais
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-500">
                      Trabalhamos com autores angolanos e internacionais, editoras
                      independentes e parceiros tecnológicos para oferecer um
                      catálogo diversificado e uma plataforma robusta e confiável.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      Compromisso com Angola
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-500">
                      Mais do que uma empresa, somos um movimento pela leitura em
                      Angola. Uma parte das nossas receitas é investida em
                      projectos de promoção da literacia e do hábito de leitura
                      nas comunidades angolanas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section variants={varianteItem} className="text-center">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 px-6 py-12 sm:px-8 sm:py-16">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                  Começa a Ler Hoje
                </h2>
                <p className="mx-auto mb-8 max-w-lg text-emerald-100">
                  Junta-te a milhares de angolanos que já descobriram o prazer da
                  leitura digital com a AngolaReads.
                </p>
                <Button
                  size="lg"
                  onClick={() => navegarPara('inicio')}
                  className="bg-amber-500 px-8 text-white hover:bg-amber-600"
                >
                  Explorar o Catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.section>
      </motion.main>
    </div>
  )
}
