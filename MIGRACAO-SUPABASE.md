# Migração para Supabase — Guia Passo a Passo

Este documento explica exatamente o que precisas de fazer no painel do
Supabase (e no teu ambiente local) para colocar o AngolaReads a
funcionar com a nova arquitetura.

## 1. Criar o projeto Supabase

1. Vai a [supabase.com](https://supabase.com) → **New Project**.
2. Escolhe uma organização, dá um nome ao projeto (ex: `angolareads`),
   define uma password forte para a base de dados e escolhe a região
   mais próxima (ex: `eu-west` ou `sa-east` — não há região em Angola,
   escolhe a que tiver menor latência para o teu público).
3. Espera 1–2 minutos até o projeto ficar pronto.

## 2. Correr o schema SQL

1. No painel, vai a **SQL Editor** → **New query**.
2. Copia todo o conteúdo de `supabase/schema.sql` (deste projeto) e
   cola no editor. Clica **Run**.
   - Isto cria todas as tabelas, ativa o RLS (Row Level Security),
     cria as funções auxiliares, os triggers e os 3 buckets de
     Storage (`ebooks`, `comprovativos`, `capas`) com as respetivas
     políticas.
3. (Opcional, mas recomendado para testar) Cria uma nova query com o
   conteúdo de `supabase/seed.sql` e corre-a também — isto insere as
   categorias e produtos de exemplo.

> Podes correr `schema.sql` mais do que uma vez sem problema — todos
> os comandos usam `if not exists` / `on conflict do nothing` onde
> relevante.

## 3. Configurar a autenticação (Auth)

1. Vai a **Authentication → Providers** e confirma que o **Email**
   está ativado (vem ativado por omissão).
2. Vai a **Authentication → Settings**:
   - Se quiseres que os utilizadores entrem imediatamente depois de
     se registarem (sem confirmar o email primeiro — mais simples
     para testar), desativa **"Confirm email"**.
   - Se preferires mais segurança em produção, deixa a confirmação de
     email ativa; o utilizador vai receber um email do próprio
     Supabase para confirmar a conta antes de conseguir entrar.
3. Em **Authentication → URL Configuration**, define o **Site URL**
   como o domínio onde vais publicar o site (ex:
   `https://angolareads.vercel.app`), e adiciona esse mesmo domínio
   (e `http://localhost:3000` para desenvolvimento) em **Redirect
   URLs**. Isto é necessário para o fluxo de "Esqueci-me da senha"
   funcionar corretamente.

## 4. Confirmar os buckets de Storage

O `schema.sql` já cria os buckets automaticamente, mas vale a pena
confirmar em **Storage**:

| Bucket          | Público | Uso                                      |
|------------------|---------|-------------------------------------------|
| `capas`          | Sim     | Imagens de capa dos ebooks (leitura livre) |
| `ebooks`         | Não     | Ficheiros PDF/EPUB (só acessíveis via link assinado gerado pelo servidor) |
| `comprovativos`  | Não     | Comprovativos de pagamento enviados pelos clientes |

Não precisas de criar políticas manualmente — o `schema.sql` já as
define. Se quiseres reforçar limites de tamanho/tipo de ficheiro por
bucket, podes ajustá-los em **Storage → (bucket) → Configuration**.

## 5. Obter as chaves da API

Vai a **Project Settings → API** e copia:

- **Project URL** → vai para `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → vai para `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → vai para `SUPABASE_SERVICE_ROLE_KEY`
  (⚠️ **nunca** exponhas esta chave no browser nem a partilhes; ela
  ignora todas as regras de RLS)

Cria um ficheiro `.env.local` na raiz do projeto (usa `.env.example`
como modelo) e cola os 3 valores.

## 6. Instalar as dependências e correr localmente

```bash
npm install
# ou: bun install

npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## 7. Criar o primeiro administrador

Não existe nenhum ecrã de "criar admin" por segurança. Para
promoveres uma conta a administrador:

1. Regista-te normalmente na aplicação (ou via **Authentication →
   Users → Add user** no painel Supabase).
2. No **SQL Editor**, corre (substitui pelo teu email):

   ```sql
   update public.perfis
   set is_admin = true
   where email = 'o-teu-email@exemplo.com';
   ```

3. Volta a entrar na aplicação (ou recarrega a página) — vais ver a
   opção de **Painel de Administração**.

## 8. Publicar em produção (ex: Vercel)

1. Faz push do código para um repositório Git.
2. Cria um novo projeto na Vercel a partir desse repositório.
3. Em **Environment Variables**, adiciona as mesmas 3 variáveis do
   `.env.local` (URL, anon key, service role key).
4. Publica. Não precisas de nenhuma configuração adicional de base de
   dados — tudo corre no Supabase.

---

# Atualização 2 — Saques, Painel Admin separado, Emails, Recibos

Esta secção documenta apenas o que foi **adicionado** depois da migração
inicial. Não repete os passos já feitos acima.

## 1. Correr a migração SQL dos saques

No **SQL Editor** do Supabase, corre o conteúdo de
`supabase/migration_002_saques.sql`. (Se estiveres a instalar o projeto
pela primeira vez, o `supabase/schema.sql` já inclui isto tudo — não
precisas de correr os dois.)

Isto cria:
- Colunas de conta de recebimento em `afiliados` (IBAN/banco/titular,
  email Airtm, email PayPal, método preferido)
- A tabela `pedidos_saque` com RLS
- A configuração `saque_minimo` (valor por omissão: `3000`)

Para alterares o valor mínimo de saque mais tarde, basta editar a
configuração `saque_minimo` no separador **Configurações** do painel
admin (é tratada como qualquer outra configuração da loja) ou
diretamente por SQL:

```sql
update public.configuracoes set valor = '5000' where chave = 'saque_minimo';
```

## 2. Novo painel de administração — `/Administrador-123`

O painel de gestão deixou de estar misturado com a loja. Agora vive
numa rota própria, sem catálogo, carrinho ou opção de "tornar-me
afiliado":

```
https://oteudominio.com/Administrador-123
```

- O acesso é verificado **no servidor** antes de qualquer conteúdo ser
  enviado — se não estiveres autenticado ou não fores admin, és
  redirecionado para a loja.
- O nome da rota foi propositadamente ofuscado (em vez de `/admin`)
  para reduzir tentativas de acesso automatizado. Isto **não substitui**
  a verificação de permissão — é só uma camada extra. Se quiseres
  trocar por outro nome, basta renomear a pasta
  `src/app/Administrador-123` para o nome que preferires.
- Novos separadores: **Dashboard** (estatísticas rápidas), **Afiliados**
  (saldo de todos), **Saques** (aprovar/rejeitar pedidos de saque),
  **Utilizadores** (promover/remover admin, ativar/desativar contas).

## 3. Emails transacionais (Resend) — opcional

Sem configurar nada, a aplicação continua a funcionar normalmente — os
emails ficam apenas registados no log do servidor (`console.log`), sem
serem enviados.

Para ativar o envio real:

1. Cria conta em [resend.com](https://resend.com)
2. Em **Domains**, verifica o teu domínio de envio (adiciona os
   registos DNS que o Resend pedir). Enquanto não tens domínio
   próprio, podes usar o remetente de testes `onboarding@resend.dev`
   (só entrega para o teu próprio email de cadastro no Resend).
3. Gera uma API key em **API Keys** → **Create API Key**.
4. No `.env.local`, define:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
   EMAIL_REMETENTE="AngolaReads <naoresponder@teudominio.com>"
   NEXT_PUBLIC_URL_SITE=https://oteudominio.com
   ```

Emails que já estão ligados automaticamente:
- **Compra recebida** — enviado ao criar o pedido
- **Pagamento aprovado** (com link para os downloads) — enviado ao
  aprovares o pedido ou o comprovativo no painel admin
- **Pedido rejeitado** — enviado ao rejeitares o pedido/comprovativo
- **Saque solicitado** — enviado ao afiliado ao pedir o saque
- **Saque aprovado / rejeitado** — enviado quando processas o pedido de
  saque no painel admin

Templates em `src/lib/email/modelos.ts` — edita à vontade o texto, cores
ou remetente.

## 4. Recibo de compra

Depois de um pedido ficar com estado "Pago", o cliente vê um botão
**Recibo** na página "Os Meus Ebooks", que abre
`/api/pedidos/[id]/recibo` numa nova aba — uma página HTML simples e
imprimível (o próprio botão "Imprimir / Guardar como PDF" usa a função
de impressão do browser, que qualquer pessoa consegue gravar como PDF).

## 5. O que verificar antes de publicar

- [ ] Correste `supabase/schema.sql` (ou `migration_002_saques.sql` se
      já tinhas o schema anterior)?
- [ ] Criaste pelo menos um administrador (`is_admin = true`)?
- [ ] Testaste entrar em `/Administrador-123` com essa conta?
- [ ] (Opcional) Configuraste o Resend e testaste um email de compra?
- [ ] Reviste o texto de "Termos de Uso" (política de reembolsos) e
      ajustaste os dados de contacto/suporte às tuas informações reais?

---

## O que mudou tecnicamente (resumo)

- **Prisma + SQLite → Supabase (Postgres)**: todo o acesso a dados
  passa a ser feito através de `@supabase/supabase-js`, com Row Level
  Security a proteger cada tabela diretamente na base de dados (em
  vez de confiares apenas na lógica das rotas de API).
- **Autenticação própria (bcrypt + tokens manuais) → Supabase Auth**:
  as passwords, sessões e tokens são agora geridos inteiramente pelo
  Supabase. A sessão viaja em cookies `httpOnly` geridos pelo pacote
  `@supabase/ssr` — deixou de ser preciso qualquer `Authorization:
  Bearer` manual no frontend.
- **Uploads locais (`/public/uploads`) → Supabase Storage**: capas,
  ebooks e comprovativos ficam em 3 buckets distintos. As capas são
  públicas (URL direto e permanente); os ebooks e comprovativos são
  privados e só acessíveis através de **URLs assinados** gerados no
  servidor (`/api/downloads` e a listagem de comprovativos no painel
  admin), válidos por poucos minutos/horas.
- **Aprovação de pedidos**: ao marcares um pedido/comprovativo como
  "pago"/"aprovado", o servidor cria automaticamente os registos de
  `downloads` (liberando o acesso aos ficheiros), incrementa o
  contador de vendas do produto e gera a comissão de afiliado
  correspondente (se o pedido tiver sido feito através de um código
  de afiliado).

## Ficheiros principais da migração

```
supabase/schema.sql              → schema completo + RLS + storage + saques
supabase/migration_002_saques.sql→ migração incremental (saques) p/ instalações antigas
supabase/seed.sql                → dados de exemplo (opcional)
src/lib/supabase/cliente.ts      → cliente Supabase (browser)
src/lib/supabase/servidor.ts     → cliente Supabase (rotas de API)
src/lib/supabase/admin.ts        → cliente com service role (interno)
src/middleware.ts                → renovação da sessão em cada pedido
src/lib/autenticacao-servidor.ts → helpers exigirUtilizador/exigirAdmin
src/lib/autenticacao.ts          → utilitários puros (formatarPreco, etc.)
src/lib/email/enviar.ts          → wrapper de envio (Resend)
src/lib/email/modelos.ts         → templates de email em PT-AO
src/app/Administrador-123/**     → painel de administração (rota própria)
src/app/api/**                   → todas as rotas adaptadas ao Supabase
src/app/api/pedidos/[id]/recibo  → recibo de compra em HTML
```
