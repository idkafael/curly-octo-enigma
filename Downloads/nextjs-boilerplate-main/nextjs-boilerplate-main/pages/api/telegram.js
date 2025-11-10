// API Route para Telegram - Protegida no servidor
// Só o servidor tem acesso às variáveis de ambiente

export default async function handler(req, res) {
  // Apenas permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Tokens do ambiente (seguro, não exposto no cliente)
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || BOT_TOKEN === 'SEU_BOT_TOKEN_AQUI') {
    return res.status(500).json({ 
      error: 'Bot Token não configurado. Configure a variável TELEGRAM_BOT_TOKEN no .env.local' 
    });
  }

  if (!CHAT_ID || CHAT_ID === 'SEU_CHAT_ID_AQUI') {
    return res.status(500).json({ 
      error: 'Chat ID não configurado. Configure a variável TELEGRAM_CHAT_ID no .env.local' 
    });
  }

  try {
    const { mensagem, dados } = req.body;

    if (!mensagem) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    // Enviar mensagem via Telegram API
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: mensagem,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.description || 'Erro ao enviar mensagem no Telegram' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Mensagem enviada com sucesso' 
    });
  } catch (error) {
    console.error('Erro na API Telegram:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

