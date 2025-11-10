// API Route para PushinPay - Protegida no servidor
// Só o servidor tem acesso às variáveis de ambiente

export default async function handler(req, res) {
  // Apenas permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { action } = req.body;

  // Token PushinPay do ambiente (seguro, não exposto no cliente)
  const token = process.env.PUSHINPAY_TOKEN;
  
  if (!token || token === 'SEU_TOKEN_PUSHINPAY_AQUI') {
    return res.status(500).json({ 
      error: 'Token PushinPay não configurado. Configure a variável PUSHINPAY_TOKEN no .env.local' 
    });
  }

  try {
    if (action === 'create-pix') {
      const { valor, plano } = req.body;
      
      // Validar valor
      // PushinPay: valor mínimo é 50 centavos (segundo documentação)
      // O valor vem do frontend em centavos (990, 1990, 4990)
      const valorFinal = valor || parseInt(process.env.PLANO_VITALICIO_19_90) || 990;
      
      if (!valorFinal || valorFinal < 50) {
        return res.status(400).json({ 
          error: 'Valor inválido. O valor mínimo é R$ 0,50 (50 centavos)',
          message: 'Valor inválido. O valor mínimo é R$ 0,50 (50 centavos)'
        });
      }
      
      console.log('Criando PIX:', { valor: valorFinal, plano });
      
      // Criar PIX via PushinPay API
      // Base URL de produção: https://api.pushinpay.com.br/api
      // Endpoint: /pix/cashIn
      // URL completa: https://api.pushinpay.com.br/api/pix/cashIn
      const apiBaseUrl = process.env.PUSHINPAY_API_URL || 'https://api.pushinpay.com.br/api';
      const endpoint = '/pix/cashIn';
      const url = `${apiBaseUrl}${endpoint}`;
      
      // Configurar URL do webhook
      // A URL do webhook deve ser pública e acessível pela PushinPay
      // Exemplo: https://seu-dominio.com/api/webhook-pushinpay
      const webhookUrl = process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook-pushinpay`
        : null;
      
      console.log(`Chamando API PushinPay: ${url}`);
      if (webhookUrl) {
        console.log(`Webhook configurado: ${webhookUrl}`);
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: valorFinal,
          webhook_url: webhookUrl, // URL do webhook para notificações
          split_rules: []
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Erro PushinPay API:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        return res.status(response.status).json({ 
          error: data.message || data.error || 'Erro ao criar PIX',
          message: data.message || data.error || 'Erro ao criar PIX',
          details: data
        });
      }

      console.log('PIX criado com sucesso:', data);
      return res.status(200).json(data);
    }

    if (action === 'check-payment') {
      const { transactionId } = req.body;
      
      if (!transactionId) {
        return res.status(400).json({ error: 'transactionId é obrigatório' });
      }

      // Verificar status do pagamento
      // Base URL: https://api.pushinpay.com.br/api
      // Tentando diferentes variações do endpoint de consulta
      const apiBaseUrl = process.env.PUSHINPAY_API_URL || 'https://api.pushinpay.com.br/api';
      const endpoints = [
        `/pix/${transactionId}`,           // /api/pix/{id}
        `/v1/pix/${transactionId}`,         // /api/v1/pix/{id}
        `/pix/${transactionId}/status`,     // /api/pix/{id}/status
        `/transactions/${transactionId}`,  // /api/transactions/{id}
      ];
      
      let response = null;
      let lastError = null;
      
      // Tentar cada endpoint até encontrar um que funcione
      for (const endpoint of endpoints) {
        try {
          const url = `${apiBaseUrl}${endpoint}`;
          console.log(`Tentando consultar PIX: ${url}`);
          
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          const data = await response.json();
          
          if (response.ok) {
            console.log(`✅ Endpoint de consulta funcionou: ${url}`);
            return res.status(200).json(data);
          } else if (response.status !== 404) {
            // Se não for 404, esse pode ser o endpoint correto mas com erro diferente
            console.error(`Endpoint ${url} retornou ${response.status}:`, data);
            return res.status(response.status).json({ 
              error: data.message || data.error || 'Erro ao verificar pagamento',
              details: data
            });
          }
          
          lastError = data;
        } catch (error) {
          console.error(`Erro ao tentar endpoint ${endpoint}:`, error.message);
          lastError = { message: error.message };
        }
      }
      
      // Se nenhum endpoint funcionou, retornar erro
      console.error('Nenhum endpoint de consulta da API PushinPay funcionou');
      return res.status(404).json({ 
        error: 'Endpoint de consulta da API PushinPay não encontrado. Verifique a documentação.',
        message: 'Endpoint de consulta da API PushinPay não encontrado. Verifique a documentação.',
        details: lastError
      });
    }

    return res.status(400).json({ 
      error: 'Ação inválida',
      message: 'Ação inválida' 
    });
  } catch (error) {
    console.error('Erro na API PushinPay:', error);
    return res.status(500).json({ 
      error: error.message || 'Erro interno do servidor',
      message: error.message || 'Erro interno do servidor',
      type: error.name || 'Error'
    });
  }
}

