-- ============================================================
-- AngolaReads — Dados iniciais (opcional)
-- Corre depois do schema.sql. Não cria nenhum admin — isso é
-- feito através do Supabase Auth (ver README de migração,
-- secção "Criar o primeiro administrador").
-- ============================================================

insert into public.categorias (nome, descricao, slug, ordem) values
  ('Empreendedorismo', 'Guias práticos para empreender em Angola', 'empreendedorismo', 0),
  ('Finanças Pessoais', 'Aprende a gerir o teu dinheiro', 'financas-pessoais', 1),
  ('Desenvolvimento Pessoal', 'Crescimento pessoal e profissional', 'desenvolvimento-pessoal', 2),
  ('Tecnologia', 'Ferramentas digitais e programação', 'tecnologia', 3),
  ('Marketing Digital', 'Estratégias de marketing para o mercado angolano', 'marketing-digital', 4),
  ('Histórias de Angola', 'Literatura e contos angolanos', 'historias-angola', 5)
on conflict (slug) do nothing;

insert into public.produtos
  (titulo, descricao, descricao_curta, tipo_produto, preco_normal, preco_promocional, preco_usd, preco_eur, categoria_id, destaque, comissao_afiliado)
select
  v.titulo, v.descricao, v.descricao_curta, v.tipo_produto, v.preco_normal, v.preco_promocional, v.preco_usd, v.preco_eur,
  c.id, v.destaque, v.comissao_afiliado
from (values
  ('Guia do Empreendedor Angolano 2024',
   'Um guia completo e prático para quem quer começar ou melhorar o seu negócio em Angola. Aborda desde a formalização da empresa até estratégias de crescimento, passando por acesso a financiamento, marketing local e gestão de equipas.',
   'Tudo o que precisas para empreender com sucesso em Angola', 'ebook', 5500::numeric, 3500::numeric, 6.99::numeric, 6.49::numeric, 'empreendedorismo', true, 30),
  ('Domina as Tuas Finanças',
   'Aprende a tomar controlo das tuas finanças de forma prática e adaptada à realidade angolana. Orçamentação, poupança, investimento básico e fundo de emergência.',
   'Controlo total do teu dinheiro em passos simples', 'ebook', 3500::numeric, 2500::numeric, 4.99::numeric, 4.49::numeric, 'financas-pessoais', true, 20),
  ('Pacote Marketing Digital Angola',
   'Bundle completo com 3 ebooks de marketing digital focados no mercado angolano: redes sociais, SEO local e publicidade com orçamento limitado.',
   '3 ebooks de marketing + bónus exclusivos', 'bundle', 12000::numeric, 7500::numeric, 14.99::numeric, 13.99::numeric, 'marketing-digital', true, 40),
  ('Mindset de Sucesso',
   'Transforma a tua mentalidade e alcança os teus objetivos, com base em investigação científica e histórias reais de angolanos.',
   'Transforma a tua mentalidade, transforma a tua vida', 'ebook', 3000::numeric, null, 3.99::numeric, 3.69::numeric, 'desenvolvimento-pessoal', false, 20),
  ('Curso Introdução à Programação',
   'Curso limitado com materiais completos para aprender a programar do zero: lógica, HTML/CSS, JavaScript e o teu primeiro website.',
   'Aprende a programar do zero - vagas limitadas', 'curso_limitado', 15000::numeric, 9900::numeric, 19.99::numeric, 18.99::numeric, 'tecnologia', true, 30),
  ('Contos da Nossa Terra',
   'Uma coleção de 15 contos originais que capturam a essência da cultura angolana: amor, superação, tradição e modernidade.',
   '15 contos que celebram a cultura angolana', 'ebook', 2500::numeric, 1500::numeric, 2.99::numeric, 2.79::numeric, 'historias-angola', false, 20),
  ('Excel para Negócios Angolanos',
   'Domina o Microsoft Excel e Google Sheets com exemplos práticos: fórmulas, tabelas dinâmicas, gráficos e dashboards de gestão.',
   'Planilhas profissionais para o teu negócio', 'ebook', 4500::numeric, null, 5.99::numeric, 5.49::numeric, 'tecnologia', false, 30),
  ('Guia de Investimentos em Angola',
   'Um guia prático sobre como investir o teu dinheiro em Angola: depósitos a prazo, fundos, imobiliário e diversificação de portfólio.',
   'Começa a investir com conhecimento e segurança', 'ebook', 6000::numeric, 4500::numeric, 7.99::numeric, 7.49::numeric, 'financas-pessoais', true, 30)
) as v(titulo, descricao, descricao_curta, tipo_produto, preco_normal, preco_promocional, preco_usd, preco_eur, categoria_slug, destaque, comissao_afiliado)
join public.categorias c on c.slug = v.categoria_slug
where not exists (select 1 from public.produtos p where p.titulo = v.titulo);

insert into public.configuracoes (chave, valor) values
  ('airtm_email', 'gabrielfigura128@gmail.com'),
  ('airtm_nome', 'ADOLFO SENGUELE YAMBA GABRIEL'),
  ('paypal_email', 'reciprocidade001@gmail.com'),
  ('email_suporte', 'angolareads@gmail.com'),
  ('whatsapp_suporte', '+244 947399578')
on conflict (chave) do nothing;
