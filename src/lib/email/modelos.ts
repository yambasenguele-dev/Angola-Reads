// ============================================================
// Modelos de Email — AngolaReads
// Cada função devolve { assunto, html } pronto a passar a enviarEmail().
// ============================================================

const COR_PRIMARIA = '#059669' // emerald-600
const URL_SITE = process.env.NEXT_PUBLIC_URL_SITE || 'https://angolareads.vercel.app'

function moldura(tituloInterno: string, corpoHtml: string): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f4f4f5; padding:24px 0;">
    <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e4e4e7;">
      <div style="background:${COR_PRIMARIA}; padding:20px 28px;">
        <span style="color:#ffffff; font-size:18px; font-weight:700;">AngolaReads</span>
      </div>
      <div style="padding:28px;">
        <h1 style="font-size:18px; margin:0 0 16px 0; color:#111827;">${tituloInterno}</h1>
        ${corpoHtml}
      </div>
      <div style="padding:16px 28px; background:#fafafa; border-top:1px solid #e4e4e7;">
        <p style="font-size:12px; color:#9ca3af; margin:0;">
          AngolaReads — Ebooks digitais para o mercado angolano.<br/>
          Precisas de ajuda? Contacta-nos pelo email de suporte indicado no site.
        </p>
      </div>
    </div>
  </div>`
}

function botao(texto: string, url: string): string {
  return `
    <a href="${url}" style="display:inline-block; margin-top:16px; padding:12px 24px; background:${COR_PRIMARIA}; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px;">
      ${texto}
    </a>`
}

// --- 1. Compra recebida (pedido criado) ---
export function modeloCompraRecebida(dados: {
  nome: string
  referencia: string
  itens: { titulo: string; formato: string; preco: number }[]
  total: number
  metodoPagamento: string
}) {
  const linhasItens = dados.itens
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 0; font-size:14px; color:#374151;">${item.titulo} (${item.formato.toUpperCase()})</td>
          <td style="padding:6px 0; font-size:14px; color:#374151; text-align:right;">${item.preco.toLocaleString('pt-AO')} Kz</td>
        </tr>`
    )
    .join('')

  const nomesMetodo: Record<string, string> = {
    transferencia_bancaria: 'Transferência Bancária',
    airtm: 'Airtm',
    paypal: 'PayPal',
  }

  const corpo = `
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      Olá ${dados.nome},<br/><br/>
      Recebemos o teu pedido <strong>${dados.referencia}</strong>. Assim que confirmarmos
      o pagamento, vais receber um novo email com o acesso aos teus downloads.
    </p>
    <table style="width:100%; border-collapse:collapse; margin-top:12px;">
      ${linhasItens}
      <tr>
        <td style="padding:10px 0 0 0; font-size:14px; font-weight:700; border-top:1px solid #e4e4e7;">Total</td>
        <td style="padding:10px 0 0 0; font-size:14px; font-weight:700; text-align:right; border-top:1px solid #e4e4e7;">${dados.total.toLocaleString('pt-AO')} Kz</td>
      </tr>
    </table>
    <p style="font-size:13px; color:#6b7280; margin-top:16px;">
      Método de pagamento: <strong>${nomesMetodo[dados.metodoPagamento] || dados.metodoPagamento}</strong>
    </p>
    ${botao('Ver estado do meu pedido', `${URL_SITE}/?vista=os-meus-ebooks`)}
  `

  return {
    assunto: `Recebemos o teu pedido ${dados.referencia} — AngolaReads`,
    html: moldura('Pedido recebido!', corpo),
  }
}

// --- 2. Pagamento aprovado (com link para downloads) ---
export function modeloPagamentoAprovado(dados: { nome: string; referencia: string }) {
  const corpo = `
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      Boas notícias, ${dados.nome}! 🎉<br/><br/>
      O pagamento do teu pedido <strong>${dados.referencia}</strong> foi confirmado.
      Os teus ebooks já estão disponíveis para download.
    </p>
    ${botao('Descarregar os meus ebooks', `${URL_SITE}/?vista=os-meus-ebooks`)}
    <p style="font-size:12px; color:#9ca3af; margin-top:20px;">
      Guarda bem os teus ficheiros — os links de download são de uso pessoal e têm
      validade limitada por questões de segurança, mas podes voltar a gerá-los a
      qualquer momento na secção "Os Meus Ebooks" da tua conta.
    </p>
  `

  return {
    assunto: `Pagamento aprovado — o teu pedido ${dados.referencia} já está pronto!`,
    html: moldura('Pagamento aprovado ✅', corpo),
  }
}

// --- 3. Pagamento rejeitado ---
export function modeloPagamentoRejeitado(dados: { nome: string; referencia: string; motivo?: string }) {
  const corpo = `
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      Olá ${dados.nome},<br/><br/>
      Infelizmente não foi possível confirmar o pagamento do teu pedido
      <strong>${dados.referencia}</strong>.
    </p>
    ${dados.motivo ? `<p style="font-size:14px; color:#374151;"><strong>Motivo:</strong> ${dados.motivo}</p>` : ''}
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      Se achas que isto é um engano, ou queres tentar novamente, contacta o nosso
      suporte ou faz um novo pedido com um comprovativo válido.
    </p>
  `

  return {
    assunto: `O teu pedido ${dados.referencia} não foi confirmado — AngolaReads`,
    html: moldura('Pedido não confirmado', corpo),
  }
}

// --- 4. Saque solicitado (confirmação para o afiliado) ---
export function modeloSaqueSolicitado(dados: { nome: string; valor: number }) {
  const corpo = `
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      Olá ${dados.nome},<br/><br/>
      Recebemos o teu pedido de saque no valor de
      <strong>${dados.valor.toLocaleString('pt-AO')} Kz</strong>.
      Vamos processá-lo em breve e avisamos-te assim que houver uma atualização.
    </p>
  `
  return {
    assunto: 'Pedido de saque recebido — AngolaReads',
    html: moldura('Pedido de saque recebido', corpo),
  }
}

// --- 5. Saque aprovado ---
export function modeloSaqueAprovado(dados: { nome: string; valor: number }) {
  const corpo = `
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      Boas notícias, ${dados.nome}! 🎉<br/><br/>
      O teu saque de <strong>${dados.valor.toLocaleString('pt-AO')} Kz</strong> foi
      aprovado e processado para a conta de recebimento que configuraste.
    </p>
  `
  return {
    assunto: 'O teu saque foi aprovado — AngolaReads',
    html: moldura('Saque aprovado ✅', corpo),
  }
}

// --- 6. Saque rejeitado ---
export function modeloSaqueRejeitado(dados: { nome: string; valor: number; motivo?: string }) {
  const corpo = `
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      Olá ${dados.nome},<br/><br/>
      O teu pedido de saque de <strong>${dados.valor.toLocaleString('pt-AO')} Kz</strong>
      foi rejeitado. O valor já foi devolvido ao teu saldo de afiliado.
    </p>
    ${dados.motivo ? `<p style="font-size:14px; color:#374151;"><strong>Motivo:</strong> ${dados.motivo}</p>` : ''}
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      Se tiveres dúvidas, contacta o nosso suporte.
    </p>
  `
  return {
    assunto: 'O teu pedido de saque foi rejeitado — AngolaReads',
    html: moldura('Saque rejeitado', corpo),
  }
}
