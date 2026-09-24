import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { obterPerfilAtual } from '@/lib/autenticacao-servidor'

const NOMES_METODO: Record<string, string> = {
  transferencia_bancaria: 'Transferência Bancária',
  airtm: 'Airtm',
  paypal: 'PayPal',
}

const NOMES_ESTADO: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  rejeitado: 'Rejeitado',
  cancelado: 'Cancelado',
}

// GET /api/pedidos/[id]/recibo - Recibo de compra em HTML (imprimível / "Guardar como PDF")
export async function GET(
  requisicao: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await criarClienteServidor()
  const perfil = await obterPerfilAtual(supabase)

  if (!perfil) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params

  let consulta = supabase
    .from('pedidos')
    .select(
      `id, referencia, estado, metodoPagamento:metodo_pagamento, subtotal, moeda,
       criadoEm:criado_em, perfilId:perfil_id,
       perfil:perfis(nomeCompleto:nome_completo, email),
       itens:itens_pedido(titulo, preco, formato)`
    )
    .eq('id', id)

  // Cliente só vê o seu próprio pedido; admin vê qualquer um.
  if (!perfil.isAdmin) {
    consulta = consulta.eq('perfil_id', perfil.id)
  }

  const { data: pedido, error } = await consulta.single()

  if (error || !pedido) {
    return new NextResponse('Pedido não encontrado.', { status: 404 })
  }

  if (pedido.estado !== 'pago') {
    return new NextResponse(
      'O recibo só fica disponível depois do pagamento ser confirmado.',
      { status: 400 }
    )
  }

  const clientePerfil = Array.isArray(pedido.perfil) ? pedido.perfil[0] : pedido.perfil
  const dataFormatada = new Date(pedido.criadoEm).toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const linhasItens = (pedido.itens || [])
    .map(
      (item: any) => `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #e5e7eb;">${item.titulo} <span style="color:#6b7280;">(${item.formato.toUpperCase()})</span></td>
        <td style="padding:8px 0; border-bottom:1px solid #e5e7eb; text-align:right;">${Number(item.preco).toLocaleString('pt-AO')} Kz</td>
      </tr>`
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="pt-AO">
<head>
<meta charset="utf-8" />
<title>Recibo ${pedido.referencia} — AngolaReads</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#111827; margin:0; padding:32px; background:#f4f4f5; }
  .recibo { max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; padding:32px; border:1px solid #e5e7eb; }
  .cabecalho { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #059669; padding-bottom:16px; margin-bottom:24px; }
  .marca { font-size:20px; font-weight:800; color:#059669; }
  .estado { display:inline-block; padding:4px 12px; border-radius:9999px; background:#d1fae5; color:#065f46; font-size:12px; font-weight:700; }
  table { width:100%; border-collapse:collapse; margin-top:8px; }
  .total-linha td { padding-top:12px; font-weight:800; font-size:16px; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px; font-size:14px; }
  .info-grid strong { display:block; color:#6b7280; font-size:12px; font-weight:600; text-transform:uppercase; margin-bottom:2px; }
  .rodape { margin-top:32px; padding-top:16px; border-top:1px solid #e5e7eb; font-size:12px; color:#9ca3af; text-align:center; }
  @media print {
    body { background:#ffffff; padding:0; }
    .recibo { border:none; }
    .botao-imprimir { display:none; }
  }
  .botao-imprimir { display:inline-block; margin-bottom:16px; padding:10px 20px; background:#059669; color:#fff; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
</style>
</head>
<body>
  <div style="max-width:640px; margin:0 auto;">
    <button class="botao-imprimir" onclick="window.print()">Imprimir / Guardar como PDF</button>
  </div>
  <div class="recibo">
    <div class="cabecalho">
      <div>
        <div class="marca">AngolaReads</div>
        <div style="font-size:13px; color:#6b7280; margin-top:4px;">Recibo de Compra</div>
      </div>
      <span class="estado">${NOMES_ESTADO[pedido.estado] || pedido.estado}</span>
    </div>

    <div class="info-grid">
      <div><strong>Referência</strong>${pedido.referencia}</div>
      <div><strong>Data</strong>${dataFormatada}</div>
      <div><strong>Cliente</strong>${clientePerfil?.nomeCompleto || '—'}</div>
      <div><strong>Email</strong>${clientePerfil?.email || '—'}</div>
      <div><strong>Método de Pagamento</strong>${NOMES_METODO[pedido.metodoPagamento] || pedido.metodoPagamento}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="text-align:left; font-size:12px; color:#6b7280; text-transform:uppercase; padding-bottom:8px; border-bottom:2px solid #e5e7eb;">Item</th>
          <th style="text-align:right; font-size:12px; color:#6b7280; text-transform:uppercase; padding-bottom:8px; border-bottom:2px solid #e5e7eb;">Preço</th>
        </tr>
      </thead>
      <tbody>
        ${linhasItens}
        <tr class="total-linha">
          <td>Total</td>
          <td style="text-align:right;">${Number(pedido.subtotal).toLocaleString('pt-AO')} ${pedido.moeda}</td>
        </tr>
      </tbody>
    </table>

    <div class="rodape">
      Este documento serve como comprovativo de compra digital na AngolaReads.<br/>
      Em caso de dúvidas, contacta o nosso suporte com a referência acima.
    </div>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
