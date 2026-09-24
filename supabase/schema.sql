-- ============================================================
-- AngolaReads — Schema Supabase (Postgres)
-- ============================================================
-- Este script é idempotente (pode ser corrido várias vezes sem
-- rebentar). Corre-o completo no SQL Editor do painel Supabase.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- Função utilitária: atualizar coluna atualizado_em
-- ============================================================
create or replace function public.definir_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- ============================================================
-- TABELA: categorias
-- ============================================================
create table if not exists public.categorias (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null unique,
  descricao     text,
  slug          text not null unique,
  ativa         boolean not null default true,
  ordem         integer not null default 0,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_categorias_slug on public.categorias (slug);
create index if not exists idx_categorias_ativa on public.categorias (ativa);

drop trigger if exists trg_categorias_atualizado_em on public.categorias;
create trigger trg_categorias_atualizado_em
  before update on public.categorias
  for each row execute function public.definir_atualizado_em();

-- ============================================================
-- TABELA: produtos
-- ============================================================
create table if not exists public.produtos (
  id                uuid primary key default gen_random_uuid(),
  titulo            text not null,
  descricao         text not null,
  descricao_curta   text,
  capa_url          text,
  tipo_produto      text not null default 'ebook'
                    check (tipo_produto in ('ebook', 'bundle', 'curso_limitado')),
  formato_pdf       text,
  formato_epub      text,
  preco_normal      numeric(12,2) not null,
  preco_promocional numeric(12,2),
  preco_usd         numeric(10,2),
  preco_eur         numeric(10,2),
  categoria_id      uuid not null references public.categorias (id),
  ativo             boolean not null default true,
  destaque          boolean not null default false,
  comissao_afiliado integer not null default 20,
  estoque_ilimitado boolean not null default true,
  estoque_maximo    integer,
  vendas_count      integer not null default 0,
  criado_em         timestamptz not null default now(),
  atualizado_em     timestamptz not null default now()
);

create index if not exists idx_produtos_titulo on public.produtos (titulo);
create index if not exists idx_produtos_categoria on public.produtos (categoria_id);
create index if not exists idx_produtos_ativo on public.produtos (ativo);
create index if not exists idx_produtos_destaque on public.produtos (destaque);
create index if not exists idx_produtos_tipo on public.produtos (tipo_produto);

drop trigger if exists trg_produtos_atualizado_em on public.produtos;
create trigger trg_produtos_atualizado_em
  before update on public.produtos
  for each row execute function public.definir_atualizado_em();

-- ============================================================
-- TABELA: perfis
-- Ligada 1:1 a auth.users (Supabase Auth trata da password/login)
-- ============================================================
create table if not exists public.perfis (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null unique,
  nome_completo text not null,
  telefone      text,
  is_admin      boolean not null default false,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_perfis_email on public.perfis (email);

drop trigger if exists trg_perfis_atualizado_em on public.perfis;
create trigger trg_perfis_atualizado_em
  before update on public.perfis
  for each row execute function public.definir_atualizado_em();

-- Trigger: criar automaticamente um "perfil" quando um novo
-- utilizador se regista no Supabase Auth.
create or replace function public.gerir_novo_utilizador()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfis (id, email, nome_completo, telefone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nome_completo', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'telefone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.gerir_novo_utilizador();

-- Função auxiliar de RLS: verifica se o utilizador autenticado é admin.
-- security definer para evitar recursão de RLS sobre a própria tabela perfis.
create or replace function public.eh_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.perfis where id = auth.uid()), false);
$$;

-- ============================================================
-- TABELA: afiliados
-- ============================================================
create table if not exists public.afiliados (
  id            uuid primary key default gen_random_uuid(),
  perfil_id     uuid not null unique references public.perfis (id) on delete cascade,
  codigo_ref    text not null unique,
  saldo         numeric(12,2) not null default 0,
  total_ganho   numeric(12,2) not null default 0,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_afiliados_codigo on public.afiliados (codigo_ref);
create index if not exists idx_afiliados_perfil on public.afiliados (perfil_id);

drop trigger if exists trg_afiliados_atualizado_em on public.afiliados;
create trigger trg_afiliados_atualizado_em
  before update on public.afiliados
  for each row execute function public.definir_atualizado_em();

-- ============================================================
-- TABELA: pedidos
-- ============================================================
create table if not exists public.pedidos (
  id               uuid primary key default gen_random_uuid(),
  referencia       text not null unique,
  perfil_id        uuid not null references public.perfis (id),
  estado           text not null default 'pendente'
                   check (estado in ('pendente', 'pago', 'rejeitado', 'cancelado')),
  metodo_pagamento text not null
                   check (metodo_pagamento in ('transferencia_bancaria', 'airtm', 'paypal')),
  subtotal         numeric(12,2) not null,
  moeda            text not null default 'AOA',
  afiliado_id      uuid references public.afiliados (id),
  observacoes      text,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);

create index if not exists idx_pedidos_perfil on public.pedidos (perfil_id);
create index if not exists idx_pedidos_referencia on public.pedidos (referencia);
create index if not exists idx_pedidos_estado on public.pedidos (estado);
create index if not exists idx_pedidos_afiliado on public.pedidos (afiliado_id);

drop trigger if exists trg_pedidos_atualizado_em on public.pedidos;
create trigger trg_pedidos_atualizado_em
  before update on public.pedidos
  for each row execute function public.definir_atualizado_em();

-- ============================================================
-- TABELA: itens_pedido
-- ============================================================
create table if not exists public.itens_pedido (
  id         uuid primary key default gen_random_uuid(),
  pedido_id  uuid not null references public.pedidos (id) on delete cascade,
  produto_id uuid not null references public.produtos (id),
  titulo     text not null,
  preco      numeric(12,2) not null,
  formato    text not null default 'pdf' check (formato in ('pdf', 'epub'))
);

create index if not exists idx_itens_pedido_pedido on public.itens_pedido (pedido_id);
create index if not exists idx_itens_pedido_produto on public.itens_pedido (produto_id);

-- ============================================================
-- TABELA: comprovativos
-- ============================================================
create table if not exists public.comprovativos (
  id            uuid primary key default gen_random_uuid(),
  pedido_id     uuid not null unique references public.pedidos (id) on delete cascade,
  ficheiro_url  text not null,
  estado        text not null default 'pendente'
                check (estado in ('pendente', 'aprovado', 'rejeitado')),
  observacoes   text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_comprovativos_estado on public.comprovativos (estado);

drop trigger if exists trg_comprovativos_atualizado_em on public.comprovativos;
create trigger trg_comprovativos_atualizado_em
  before update on public.comprovativos
  for each row execute function public.definir_atualizado_em();

-- ============================================================
-- TABELA: downloads
-- ============================================================
create table if not exists public.downloads (
  id         uuid primary key default gen_random_uuid(),
  perfil_id  uuid not null references public.perfis (id),
  produto_id uuid not null references public.produtos (id),
  pedido_id  uuid not null references public.pedidos (id),
  formato    text not null check (formato in ('pdf', 'epub')),
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);

create index if not exists idx_downloads_perfil on public.downloads (perfil_id);
create index if not exists idx_downloads_produto on public.downloads (produto_id);
create index if not exists idx_downloads_pedido on public.downloads (pedido_id);

-- ============================================================
-- TABELA: comissoes_afiliado
-- ============================================================
create table if not exists public.comissoes_afiliado (
  id            uuid primary key default gen_random_uuid(),
  afiliado_id   uuid not null references public.afiliados (id),
  pedido_id     uuid not null references public.pedidos (id),
  produto_id    uuid not null references public.produtos (id),
  valor         numeric(12,2) not null,
  percentagem   integer not null,
  estado        text not null default 'pendente' check (estado in ('pendente', 'paga')),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_comissoes_afiliado on public.comissoes_afiliado (afiliado_id);
create index if not exists idx_comissoes_pedido on public.comissoes_afiliado (pedido_id);
create index if not exists idx_comissoes_estado on public.comissoes_afiliado (estado);

drop trigger if exists trg_comissoes_atualizado_em on public.comissoes_afiliado;
create trigger trg_comissoes_atualizado_em
  before update on public.comissoes_afiliado
  for each row execute function public.definir_atualizado_em();

-- ============================================================
-- TABELA: configuracoes
-- ============================================================
create table if not exists public.configuracoes (
  id    uuid primary key default gen_random_uuid(),
  chave text not null unique,
  valor text not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.categorias         enable row level security;
alter table public.produtos           enable row level security;
alter table public.perfis             enable row level security;
alter table public.afiliados          enable row level security;
alter table public.pedidos            enable row level security;
alter table public.itens_pedido       enable row level security;
alter table public.comprovativos      enable row level security;
alter table public.downloads          enable row level security;
alter table public.comissoes_afiliado enable row level security;
alter table public.configuracoes      enable row level security;

-- --- categorias: leitura pública das ativas; escrita só admin ---
drop policy if exists "categorias_leitura_publica" on public.categorias;
create policy "categorias_leitura_publica" on public.categorias
  for select using (ativa = true or public.eh_admin());

drop policy if exists "categorias_escrita_admin" on public.categorias;
create policy "categorias_escrita_admin" on public.categorias
  for all using (public.eh_admin()) with check (public.eh_admin());

-- --- produtos: leitura pública dos ativos; escrita só admin ---
drop policy if exists "produtos_leitura_publica" on public.produtos;
create policy "produtos_leitura_publica" on public.produtos
  for select using (ativo = true or public.eh_admin());

drop policy if exists "produtos_escrita_admin" on public.produtos;
create policy "produtos_escrita_admin" on public.produtos
  for all using (public.eh_admin()) with check (public.eh_admin());

-- --- perfis: cada utilizador vê/edita o seu; admin vê todos ---
drop policy if exists "perfis_ver_proprio_ou_admin" on public.perfis;
create policy "perfis_ver_proprio_ou_admin" on public.perfis
  for select using (auth.uid() = id or public.eh_admin());

drop policy if exists "perfis_editar_proprio_ou_admin" on public.perfis;
create policy "perfis_editar_proprio_ou_admin" on public.perfis
  for update using (auth.uid() = id or public.eh_admin());

drop policy if exists "perfis_inserir_proprio" on public.perfis;
create policy "perfis_inserir_proprio" on public.perfis
  for insert with check (auth.uid() = id);

-- --- afiliados: dono vê/insere o seu; admin vê/gere todos ---
drop policy if exists "afiliados_ver_proprio_ou_admin" on public.afiliados;
create policy "afiliados_ver_proprio_ou_admin" on public.afiliados
  for select using (auth.uid() = perfil_id or public.eh_admin());

drop policy if exists "afiliados_inserir_proprio" on public.afiliados;
create policy "afiliados_inserir_proprio" on public.afiliados
  for insert with check (auth.uid() = perfil_id);

drop policy if exists "afiliados_editar_admin" on public.afiliados;
create policy "afiliados_editar_admin" on public.afiliados
  for update using (public.eh_admin());

-- --- pedidos: dono vê/insere os seus; admin vê/gere todos ---
drop policy if exists "pedidos_ver_proprio_ou_admin" on public.pedidos;
create policy "pedidos_ver_proprio_ou_admin" on public.pedidos
  for select using (auth.uid() = perfil_id or public.eh_admin());

drop policy if exists "pedidos_inserir_proprio" on public.pedidos;
create policy "pedidos_inserir_proprio" on public.pedidos
  for insert with check (auth.uid() = perfil_id);

drop policy if exists "pedidos_editar_admin" on public.pedidos;
create policy "pedidos_editar_admin" on public.pedidos
  for update using (public.eh_admin());

-- --- itens_pedido: seguem a posse do pedido ---
drop policy if exists "itens_pedido_ver" on public.itens_pedido;
create policy "itens_pedido_ver" on public.itens_pedido
  for select using (
    public.eh_admin() or
    exists (select 1 from public.pedidos p where p.id = pedido_id and p.perfil_id = auth.uid())
  );

drop policy if exists "itens_pedido_inserir" on public.itens_pedido;
create policy "itens_pedido_inserir" on public.itens_pedido
  for insert with check (
    exists (select 1 from public.pedidos p where p.id = pedido_id and p.perfil_id = auth.uid())
  );

-- --- comprovativos: seguem a posse do pedido ---
drop policy if exists "comprovativos_ver" on public.comprovativos;
create policy "comprovativos_ver" on public.comprovativos
  for select using (
    public.eh_admin() or
    exists (select 1 from public.pedidos p where p.id = pedido_id and p.perfil_id = auth.uid())
  );

drop policy if exists "comprovativos_inserir" on public.comprovativos;
create policy "comprovativos_inserir" on public.comprovativos
  for insert with check (
    exists (select 1 from public.pedidos p where p.id = pedido_id and p.perfil_id = auth.uid())
  );

drop policy if exists "comprovativos_editar_admin" on public.comprovativos;
create policy "comprovativos_editar_admin" on public.comprovativos
  for update using (public.eh_admin());

-- --- downloads: dono vê os seus; admin vê todos; inserção via admin/serviço ---
drop policy if exists "downloads_ver_proprio_ou_admin" on public.downloads;
create policy "downloads_ver_proprio_ou_admin" on public.downloads
  for select using (auth.uid() = perfil_id or public.eh_admin());

drop policy if exists "downloads_inserir_admin" on public.downloads;
create policy "downloads_inserir_admin" on public.downloads
  for insert with check (public.eh_admin());

-- --- comissoes_afiliado: dono (via afiliado) vê as suas; admin gere todas ---
drop policy if exists "comissoes_ver" on public.comissoes_afiliado;
create policy "comissoes_ver" on public.comissoes_afiliado
  for select using (
    public.eh_admin() or
    exists (select 1 from public.afiliados a where a.id = afiliado_id and a.perfil_id = auth.uid())
  );

drop policy if exists "comissoes_gerir_admin" on public.comissoes_afiliado;
create policy "comissoes_gerir_admin" on public.comissoes_afiliado
  for all using (public.eh_admin()) with check (public.eh_admin());

-- --- configuracoes: leitura pública; escrita só admin ---
drop policy if exists "configuracoes_leitura_publica" on public.configuracoes;
create policy "configuracoes_leitura_publica" on public.configuracoes
  for select using (true);

drop policy if exists "configuracoes_escrita_admin" on public.configuracoes;
create policy "configuracoes_escrita_admin" on public.configuracoes
  for all using (public.eh_admin()) with check (public.eh_admin());

-- ============================================================
-- STORAGE — buckets (ebooks, comprovativos, capas)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('ebooks', 'ebooks', false, 52428800, array['application/pdf','application/epub+zip']),
  ('comprovativos', 'comprovativos', false, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('capas', 'capas', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- --- Políticas de storage.objects ---

-- capas: leitura pública, escrita só admin
drop policy if exists "capas_leitura_publica" on storage.objects;
create policy "capas_leitura_publica" on storage.objects
  for select using (bucket_id = 'capas');

drop policy if exists "capas_escrita_admin" on storage.objects;
create policy "capas_escrita_admin" on storage.objects
  for all using (bucket_id = 'capas' and public.eh_admin())
  with check (bucket_id = 'capas' and public.eh_admin());

-- ebooks: privado — só admin lê/escreve diretamente.
-- Os downloads dos clientes são sempre feitos via URL assinada
-- gerada no servidor com a service role (ver /api/downloads).
drop policy if exists "ebooks_gerir_admin" on storage.objects;
create policy "ebooks_gerir_admin" on storage.objects
  for all using (bucket_id = 'ebooks' and public.eh_admin())
  with check (bucket_id = 'ebooks' and public.eh_admin());

-- comprovativos: cada utilizador só pode enviar/ver ficheiros
-- dentro da sua própria pasta "{user_id}/...";  admin vê todos.
drop policy if exists "comprovativos_inserir_proprio" on storage.objects;
create policy "comprovativos_inserir_proprio" on storage.objects
  for insert with check (
    bucket_id = 'comprovativos'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );

drop policy if exists "comprovativos_ver_proprio_ou_admin" on storage.objects;
create policy "comprovativos_ver_proprio_ou_admin" on storage.objects
  for select using (
    bucket_id = 'comprovativos'
    and ((auth.uid())::text = (storage.foldername(name))[1] or public.eh_admin())
  );

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================

-- ============================================================
-- SAQUES DE AFILIADOS (ver também supabase/migration_002_saques.sql
-- para quem já tinha o schema anterior instalado — este bloco é
-- idempotente e seguro de correr também aqui, em instalações novas)
-- ============================================================

alter table public.afiliados
  add column if not exists metodo_recebimento text
    check (metodo_recebimento in ('transferencia_bancaria', 'airtm', 'paypal')),
  add column if not exists titular_conta      text,
  add column if not exists iban               text,
  add column if not exists banco              text,
  add column if not exists email_airtm        text,
  add column if not exists email_paypal       text;

create table if not exists public.pedidos_saque (
  id                  uuid primary key default gen_random_uuid(),
  afiliado_id         uuid not null references public.afiliados (id),
  valor               numeric(12,2) not null check (valor > 0),
  metodo              text not null
                      check (metodo in ('transferencia_bancaria', 'airtm', 'paypal')),
  dados_recebimento   jsonb not null,
  estado              text not null default 'pendente'
                      check (estado in ('pendente', 'pago', 'rejeitado')),
  observacoes_admin   text,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);

create index if not exists idx_pedidos_saque_afiliado on public.pedidos_saque (afiliado_id);
create index if not exists idx_pedidos_saque_estado on public.pedidos_saque (estado);

drop trigger if exists trg_pedidos_saque_atualizado_em on public.pedidos_saque;
create trigger trg_pedidos_saque_atualizado_em
  before update on public.pedidos_saque
  for each row execute function public.definir_atualizado_em();

alter table public.pedidos_saque enable row level security;

drop policy if exists "pedidos_saque_ver" on public.pedidos_saque;
create policy "pedidos_saque_ver" on public.pedidos_saque
  for select using (
    public.eh_admin() or
    exists (select 1 from public.afiliados a where a.id = afiliado_id and a.perfil_id = auth.uid())
  );

drop policy if exists "pedidos_saque_inserir" on public.pedidos_saque;
create policy "pedidos_saque_inserir" on public.pedidos_saque
  for insert with check (
    exists (select 1 from public.afiliados a where a.id = afiliado_id and a.perfil_id = auth.uid())
  );

drop policy if exists "pedidos_saque_editar_admin" on public.pedidos_saque;
create policy "pedidos_saque_editar_admin" on public.pedidos_saque
  for update using (public.eh_admin());

insert into public.configuracoes (chave, valor) values
  ('saque_minimo', '3000')
on conflict (chave) do nothing;

-- ============================================================
-- FIM (SAQUES)
-- ============================================================
