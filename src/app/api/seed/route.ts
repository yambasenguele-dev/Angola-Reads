// ============================================================
// Rota de Seed - AngolaReads
// Cria dados iniciais: admin, categorias, produtos de exemplo
// Aceder uma vez: GET /api/seed
// ============================================================

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { gerarHashSenha, gerarTokenSessao } from '@/lib/autenticacao'

export async function GET() {
  try {
    // Criar perfil admin
    const senhaAdmin = 'admin123'
    const { hash, salt } = gerarHashSenha(senhaAdmin)
    const tokenAdmin = gerarTokenSessao()

    const adminExistente = await db.perfil.findUnique({ where: { email: 'admin@angolareads.com' } })
    if (!adminExistente) {
      const novoAdmin = await db.perfil.create({
        data: {
          email: 'admin@angolareads.com',
          nomeCompleto: 'Administrador AngolaReads',
          senhaHash: `${salt}:${hash}`,
          isAdmin: true,
        },
      })
      // Criar sessão do admin
      await db.configuracao.create({
        data: { chave: `sessao_${tokenAdmin}`, valor: novoAdmin.id },
      })
      console.log(`Admin criado: admin@angolareads.com / ${senhaAdmin}`)
      console.log(`Token admin: ${tokenAdmin}`)
    } else {
      const tokenExistente = await db.configuracao.findFirst({
        where: { valor: adminExistente.id, chave: { startsWith: 'sessao_' } },
      })
      if (tokenExistente) {
      }
    }

    // Criar categorias
    const categoriasDados = [
      { nome: 'Empreendedorismo', descricao: 'Guias práticos para empreender em Angola', slug: 'empreendedorismo', ordem: 0 },
      { nome: 'Finanças Pessoais', descricao: 'Aprende a gerir o teu dinheiro', slug: 'financas-pessoais', ordem: 1 },
      { nome: 'Desenvolvimento Pessoal', descricao: 'Crescimento pessoal e profissional', slug: 'desenvolvimento-pessoal', ordem: 2 },
      { nome: 'Tecnologia', descricao: 'Ferramentas digitais e programação', slug: 'tecnologia', ordem: 3 },
      { nome: 'Marketing Digital', descricao: 'Estratégias de marketing para o mercado angolano', slug: 'marketing-digital', ordem: 4 },
      { nome: 'Histórias de Angola', descricao: 'Literatura e contos angolanos', slug: 'historias-angola', ordem: 5 },
    ]

    for (const cat of categoriasDados) {
      const existe = await db.categoria.findUnique({ where: { slug: cat.slug } })
      if (!existe) {
        await db.categoria.create({ data: cat })
      }
    }

    // Buscar categorias criadas
    const categorias = await db.categoria.findMany()
    const mapaCategorias: Record<string, string> = {}
    categorias.forEach((c) => { mapaCategorias[c.slug] = c.id })

    // Criar produtos de exemplo
    const produtosDados = [
      {
        titulo: 'Guia do Empreendedor Angolano 2024',
        descricao: 'Um guia completo e prático para quem quer começar ou melhorar o seu negócio em Angola. Aborda desde a formalização da empresa até estratégias de crescimento, passando por acesso a financiamento, marketing local e gestão de equipas. Inclui estudos de caso de empreendedores angolanos de sucesso e planilhas práticas para aplicar no teu dia a dia. Capítulos: Como formalizar o teu negócio em Angola, Fontes de financiamento disponíveis, Marketing digital para negócios locais, Gestão financeira para pequenas empresas, Como construir uma marca forte, Redes de contacto e networking em Angola.',
        descricaoCurta: 'Tudo o que precisas para empreender com sucesso em Angola',
        tipoProduto: 'ebook',
        precoNormal: 5500, precoPromocional: 3500, precoUsd: 6.99, precoEur: 6.49,
        categoriaSlug: 'empreendedorismo', destaque: true, comissaoAfiliado: 30,
      },
      {
        titulo: 'Domina as Tuas Finanças',
        descricao: 'Aprende a tomar controlo das tuas finanças de forma prática e adaptada à realidade angolana. Este ebook cobre orçamentação, poupança, investimento básico, e como construir um fundo de emergência mesmo com um salário modesto. O que vais aprender: Como criar um orçamento mensal realista, A regra 50/30/20 adaptada a Angola, Como poupar mesmo ganhando pouco, Noções básicas de investimento, Como sair das dívidas, Planeamento financeiro para o futuro.',
        descricaoCurta: 'Controlo total do teu dinheiro em passos simples',
        tipoProduto: 'ebook',
        precoNormal: 3500, precoPromocional: 2500, precoUsd: 4.99, precoEur: 4.49,
        categoriaSlug: 'financas-pessoais', destaque: true, comissaoAfiliado: 20,
      },
      {
        titulo: 'Pacote Marketing Digital Angola',
        descricao: 'Bundle completo com 3 ebooks de marketing digital focados no mercado angolano. Inclui estratégias de redes sociais, SEO para negócios locais, e como criar campanhas publicitárias eficazes com orçamento limitado. Conteúdo: 1. Marketing nas Redes Sociais em Angola 2. SEO Local para Negócios Angolanos 3. Publicidade Digital com Orçamento Zero. Bónus: Templates de posts para Instagram e Facebook.',
        descricaoCurta: '3 ebooks de marketing + bónus exclusivos',
        tipoProduto: 'bundle',
        precoNormal: 12000, precoPromocional: 7500, precoUsd: 14.99, precoEur: 13.99,
        categoriaSlug: 'marketing-digital', destaque: true, comissaoAfiliado: 40,
      },
      {
        titulo: 'Mindset de Sucesso',
        descricao: 'Transforma a tua mentalidade e alcança os teus objetivos. Baseado em investigação científica e experiências reais de angolanos que superaram adversidades. Neste ebook vais descobrir: Como desenvolver uma mentalidade de crescimento, Técnicas de produtividade comprovadas, Como definir e alcançar metas, A importância da resiliência, Histórias inspiradoras de angolanos, Exercícios práticos diários.',
        descricaoCurta: 'Transforma a tua mentalidade, transforma a tua vida',
        tipoProduto: 'ebook',
        precoNormal: 3000, precoPromocional: null, precoUsd: 3.99, precoEur: 3.69,
        categoriaSlug: 'desenvolvimento-pessoal', destaque: false, comissaoAfiliado: 20,
      },
      {
        titulo: 'Curso Introdução à Programação',
        descricao: 'Curso limitado com acesso a materiais completos para aprender a programar do zero. Ideal para jovens angolanos que querem entrar no mundo da tecnologia. Módulos: 1. Introdução à Lógica de Programação 2. HTML e CSS para Iniciantes 3. JavaScript Básico 4. Criar o teu Primeiro Website 5. Próximos Passos na Carreira Tech. Vagas limitadas! Inclui certificado de conclusão.',
        descricaoCurta: 'Aprende a programar do zero - vagas limitadas',
        tipoProduto: 'curso_limitado',
        precoNormal: 15000, precoPromocional: 9900, precoUsd: 19.99, precoEur: 18.99,
        categoriaSlug: 'tecnologia', destaque: true, comissaoAfiliado: 30,
      },
      {
        titulo: 'Contos da Nossa Terra',
        descricao: 'Uma coleção de contos que capturam a essência da cultura angolana. Histórias de amor, superação, tradição e modernidade que te farão rir, pensar e sentir. Inclui 15 contos originais de autores angolanos, abordando temas como: A vida em Luanda, Tradições e modernidade, Histórias de família, O humor angolano, Amor e relacionamentos, A diáspora angolana.',
        descricaoCurta: '15 contos que celebram a cultura angolana',
        tipoProduto: 'ebook',
        precoNormal: 2500, precoPromocional: 1500, precoUsd: 2.99, precoEur: 2.79,
        categoriaSlug: 'historias-angola', destaque: false, comissaoAfiliado: 20,
      },
      {
        titulo: 'Excel para Negócios Angolanos',
        descricao: 'Domina o Microsoft Excel e Google Sheets com exemplos práticos para o contexto angolano. Aprende a criar planilhas de controlo, relatórios financeiros, e dashboards para o teu negócio. Conteúdo: Fundamentos do Excel, Fórmulas e funções essenciais, Tabelas dinâmicas, Gráficos profissionais, Planilhas de controlo de stock, Relatórios financeiros, Dashboards para gestão.',
        descricaoCurta: 'Planilhas profissionais para o teu negócio',
        tipoProduto: 'ebook',
        precoNormal: 4500, precoPromocional: null, precoUsd: 5.99, precoEur: 5.49,
        categoriaSlug: 'tecnologia', destaque: false, comissaoAfiliado: 30,
      },
      {
        titulo: 'Guia de Investimentos em Angola',
        descricao: 'Um guia prático sobre como investir o teu dinheiro em Angola. Desde depósitos a prazo até ações, passando por imóveis e negócios próprios. Tópicos: O cenário de investimentos em Angola, Depósitos a prazo e poupança, Fundos de investimento, Investimento imobiliário, Como avaliar oportunidades de negócio, Diversificação de portfólio, Riscos e como mitigá-los.',
        descricaoCurta: 'Começa a investir com conhecimento e segurança',
        tipoProduto: 'ebook',
        precoNormal: 6000, precoPromocional: 4500, precoUsd: 7.99, precoEur: 7.49,
        categoriaSlug: 'financas-pessoais', destaque: true, comissaoAfiliado: 30,
      },
    ]

    for (const prod of produtosDados) {
      const existe = await db.produto.findFirst({ where: { titulo: prod.titulo } })
      if (!existe) {
        const catId = mapaCategorias[prod.categoriaSlug]
        if (catId) {
          await db.produto.create({
            data: {
              titulo: prod.titulo,
              descricao: prod.descricao,
              descricaoCurta: prod.descricaoCurta,
              tipoProduto: prod.tipoProduto,
              precoNormal: prod.precoNormal,
              precoPromocional: prod.precoPromocional,
              precoUsd: prod.precoUsd,
              precoEur: prod.precoEur,
              categoriaId: catId,
              destaque: prod.destaque,
              comissaoAfiliado: prod.comissaoAfiliado,
            },
          })
        }
      }
    }

    // Criar configurações padrão
    const configsPadrao = [
      { chave: 'airtm_email', valor: 'gabrielfigura128@gmail.com' },
      { chave: 'airtm_nome', valor: 'ADOLFO SENGUELE YAMBA GABRIEL' },
      { chave: 'paypal_email', valor: 'reciprocidade001@gmail.com' },
      { chave: 'email_suporte', valor: 'angolareads@gmail.com' },
      { chave: 'whatsapp_suporte', valor: '+244 947399578' },
    ]

    for (const config of configsPadrao) {
      const existe = await db.configuracao.findUnique({ where: { chave: config.chave } })
      if (!existe) {
        await db.configuracao.create({ data: config })
      }
    }

    return NextResponse.json({
      mensagem: 'Seed concluída com sucesso!',
      admin: { email: 'admin@angolareads.com', senha: senhaAdmin },
    })
  } catch (erro) {
    console.error('Erro no seed:', erro)
    return NextResponse.json({ erro: 'Erro ao executar seed' }, { status: 500 })
  }
}
