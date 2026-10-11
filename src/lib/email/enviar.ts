// ============================================================
// Envio de Emails — AngolaReads
// Usa a API REST do Resend (https://resend.com) diretamente por
// fetch, sem depender do SDK oficial (evita uma dependência extra).
//
// Se a variável de ambiente RESEND_API_KEY não estiver configurada,
// o envio é ignorado de forma silenciosa (só regista no log) — a
// aplicação continua a funcionar normalmente sem emails, para que
// não seja obrigatório configurar isto para testar o resto do sistema.
//
// Para ativar os emails reais:
//   1. Cria uma conta em https://resend.com
//   2. Verifica o teu domínio de envio (ou usa o domínio de testes
//      "onboarding@resend.dev" enquanto não tens domínio próprio)
//   3. Gera uma API key em https://resend.com/api-keys
//   4. Define no .env.local:
//        RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
//        EMAIL_REMETENTE="AngolaReads <naoresponder@teudominio.com>"
// ============================================================

interface DadosEnvioEmail {
  destinatario: string
  assunto: string
  html: string
}

interface ResultadoEnvioEmail {
  enviado: boolean
  motivo?: string
}

export async function enviarEmail({
  destinatario,
  assunto,
  html,
}: DadosEnvioEmail): Promise<ResultadoEnvioEmail> {
  const chaveApi = process.env.RESEND_API_KEY
  const remetente = process.env.EMAIL_REMETENTE || 'AngolaReads <onboarding@resend.dev>'

  if (!chaveApi) {
    console.log(
      `[email] RESEND_API_KEY não configurada — email "${assunto}" para ${destinatario} não foi enviado (apenas registado no log).`
    )
    return { enviado: false, motivo: 'RESEND_API_KEY não configurada' }
  }

  try {
    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${chaveApi}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: remetente,
        to: [destinatario],
        subject: assunto,
        html,
      }),
    })

    if (!resposta.ok) {
      const erro = await resposta.text()
      console.error(`[email] Falha ao enviar "${assunto}" para ${destinatario}:`, erro)
      return { enviado: false, motivo: erro }
    }

    return { enviado: true }
  } catch (erro) {
    console.error(`[email] Erro de rede ao enviar "${assunto}" para ${destinatario}:`, erro)
    return { enviado: false, motivo: String(erro) }
  }
}
