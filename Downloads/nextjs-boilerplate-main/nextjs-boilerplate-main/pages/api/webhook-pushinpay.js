// Webhook PushinPay - Recebe notificações de pagamento confirmado
// Este endpoint é chamado pela PushinPay quando um pagamento é confirmado

export default async function handler(req, res) {
  // Apenas permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('📩 Webhook recebido da PushinPay:', JSON.stringify(req.body, null, 2));

    const payload = req.body;

    // Validar token de segurança (se a PushinPay enviar)
    const webhookToken = req.headers['x-webhook-token'] || req.headers['authorization'];
    const expectedToken = process.env.PUSHINPAY_WEBHOOK_TOKEN;

    // Validação opcional do token de webhook
    if (expectedToken && webhookToken !== expectedToken) {
      console.error('❌ Token de webhook inválido');
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Extrair dados do pagamento
    const {
      id,
      status,
      value,
      payer,
      payment_method,
      created_at,
      paid_at,
    } = payload;

    console.log('💰 Pagamento recebido:', {
      id,
      status,
      value,
      paid_at
    });

    // Verificar se o pagamento foi confirmado
    if (status === 'paid' || status === 'confirmed' || status === 'approved') {
      console.log('✅ Pagamento confirmado! ID:', id);

      // Aqui você pode:
      // 1. Salvar no banco de dados
      // 2. Enviar email de confirmação
      // 3. Liberar acesso ao conteúdo
      // 4. Enviar notificação no Telegram

      // Enviar notificação no Telegram (se configurado)
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        try {
          const telegramMessage = `
🎉 *Novo Pagamento Confirmado!*

💰 Valor: R$ ${(value / 100).toFixed(2)}
🆔 ID: ${id}
📅 Pago em: ${paid_at || new Date().toLocaleString('pt-BR')}
👤 Pagador: ${payer?.name || 'Não informado'}

✅ Status: APROVADO
          `.trim();

          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: process.env.TELEGRAM_CHAT_ID,
              text: telegramMessage,
              parse_mode: 'Markdown'
            })
          });

          console.log('📱 Notificação enviada no Telegram');
        } catch (telegramError) {
          console.error('Erro ao enviar notificação no Telegram:', telegramError);
        }
      }

      // Enviar webhook para o WhatsApp (se configurado)
      if (process.env.WHATSAPP_WEBHOOK_URL) {
        try {
          await fetch(process.env.WHATSAPP_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'payment_confirmed',
              payment_id: id,
              value: value,
              status: status,
              paid_at: paid_at
            })
          });

          console.log('📱 Webhook WhatsApp enviado');
        } catch (whatsappError) {
          console.error('Erro ao enviar webhook WhatsApp:', whatsappError);
        }
      }

      // Responder sucesso para a PushinPay
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook processado com sucesso',
        payment_id: id
      });
    }

    // Outros status (pending, canceled, expired, etc)
    console.log(`ℹ️ Status do pagamento: ${status}`);
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook recebido',
      status: status
    });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar webhook',
      message: error.message 
    });
  }
}

