-- ============================================================
-- AngolaReads — Migração 002: Saques de Afiliados
-- ============================================================
-- Corre este script no SQL Editor do Supabase DEPOIS do schema.sql.
-- É idempotente (podes correr mais do que uma vez sem problema).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Dados de recebimento na tabela "afiliados"
-- ------------------------------------------------------------
alter table public.afiliados
  add column if not exists metodo_recebimento text
    check (metodo_recebimento in ('transferencia_bancaria', 'airtm', 'paypal')),
  add column if not exists titular_conta      text,
  add column if not exists iban               text,
  add column if not exists banco              text,
  add column if not exists email_airtm        text,
  add column if not exists email_paypal       text;

-- ------------------------------------------------------------
-- 2. Tabela: pedidos_saque
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 3. RLS
-- ------------------------------------------------------------
alter table public.pedidos_saque enable row level security;

-- Dono (via afiliado) vê os seus pedidos de saque; admin vê todos.
drop policy if exists "pedidos_saque_ver" on public.pedidos_saque;
create policy "pedidos_saque_ver" on public.pedidos_saque
  for select using (
    public.eh_admin() or
    exists (select 1 from public.afiliados a where a.id = afiliado_id and a.perfil_id = auth.uid())
  );

-- Dono pode criar o seu próprio pedido de saque.
drop policy if exists "pedidos_saque_inserir" on public.pedidos_saque;
create policy "pedidos_saque_inserir" on public.pedidos_saque
  for insert with check (
    exists (select 1 from public.afiliados a where a.id = afiliado_id and a.perfil_id = auth.uid())
  );

-- Só o admin pode alterar o estado (aprovar/rejeitar).
drop policy if exists "pedidos_saque_editar_admin" on public.pedidos_saque;
create policy "pedidos_saque_editar_admin" on public.pedidos_saque
  for update using (public.eh_admin());

-- ------------------------------------------------------------
-- 4. Configuração: valor mínimo de saque
-- ------------------------------------------------------------
insert into public.configuracoes (chave, valor) values
  ('saque_minimo', '3000')
on conflict (chave) do nothing;

-- ============================================================
-- FIM DA MIGRAÇÃO 002
-- ============================================================
