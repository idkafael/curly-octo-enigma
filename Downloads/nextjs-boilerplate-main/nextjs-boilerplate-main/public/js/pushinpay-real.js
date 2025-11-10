// PushinPay Real Integration
const PushinPayReal = {
  config: {
    baseUrl: '/api', // Aponta para a API Route do Next.js
    valor: 990, // R$ 9,90 em centavos (vitalício)
    webhookUrl: null,
    planoAtual: 'Vitalício'
  },
  
  estado: {
    qrCodeAtivo: false,
    intervaloVerificacao: null,
    valorAtual: 990,
    transactionId: null
  },
  
  atualizarValorPlano(valor, plano) {
    this.config.valor = Math.round(valor * 100); // Converter para centavos
    this.estado.valorAtual = this.config.valor;
    this.config.planoAtual = plano;
    console.log(`📊 Valor atualizado: R$ ${valor.toFixed(2)} - ${plano}`);
  },
  
  async criarPix() {
    try {
      this.atualizarStatus('Gerando pagamento...');
      console.log('🔍 Criando PIX via API Route...', {
        valor: this.estado.valorAtual,
        plano: this.config.planoAtual
      });
      
      const response = await fetch(`${this.config.baseUrl}/pushinpay`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create-pix',
          valor: this.estado.valorAtual,
          plano: this.config.planoAtual
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Erro desconhecido ao criar PIX';
        console.error('❌ Erro na API:', {
          status: response.status,
          error: errorMsg,
          details: data
        });
        
        this.atualizarStatus(`Erro: ${errorMsg}`);
        throw new Error(`PushinPay API Error: ${errorMsg}`);
      }
      
      console.log('✅ PIX criado com sucesso:', data);
      
      // Exibir QR Code e código PIX
      // Segundos a documentação da PushinPay:
      // - qr_code_base64: Imagem do QR Code em base64
      // - qr_code: Código PIX completo no padrão EMV
      // - id: Identificador único da transação
      
      if (data.qr_code_base64) {
        this.exibirQRCode(data.qr_code_base64);
      }
      
      if (data.qr_code) {
        this.exibirCodigoPix(data.qr_code);
      }
      
      // Salvar transactionId de várias formas possíveis (dependendo da API)
      const transactionId = data.id || data.transaction_id || data.transactionId || data.payment_id;
      if (transactionId) {
        this.estado.transactionId = transactionId;
        console.log('✅ Transaction ID salvo:', transactionId);
        // Iniciar verificação automática após criar PIX
        this.iniciarVerificacao();
      } else {
        console.warn('⚠️ Transaction ID não encontrado na resposta da API:', data);
      }
      
      this.atualizarStatus('QR Code gerado com sucesso!');
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar PIX:', error);
      this.atualizarStatus(`Erro: ${error.message || 'Falha ao gerar pagamento'}`);
      throw error;
    }
  },
  
  exibirQRCode(qrCodeBase64) {
    const qrDiv = document.getElementById('qrCode');
    if (qrDiv && qrCodeBase64) {
      // Se já tem o prefixo data:, usar direto, senão adicionar
      let imageSrc = qrCodeBase64;
      if (!qrCodeBase64.startsWith('data:')) {
        imageSrc = `data:image/png;base64,${qrCodeBase64}`;
      }
      qrDiv.innerHTML = `<img src="${imageSrc}" alt="QR Code PIX" class="mx-auto max-w-xs" style="max-width: 256px;" />`;
      console.log('✅ QR Code exibido');
    } else {
      console.warn('⚠️ QR Code base64 não disponível ou elemento qrCode não encontrado');
    }
  },
  
  exibirCodigoPix(codigoPix) {
    const pixInput = document.getElementById('pixCodeInput');
    if (pixInput) {
      pixInput.value = codigoPix;
      console.log('✅ Código PIX exibido');
    }
  },
  
  atualizarStatus(mensagem, isError = false) {
    const statusDiv = document.getElementById('paymentStatus');
    if (statusDiv) {
      const colorClass = isError ? 'text-red-600' : 'text-orange-600';
      const icon = isError ? '' : `
        <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      `;
      
      statusDiv.innerHTML = `
        <div class="flex items-center justify-center space-x-2 ${colorClass}">
          ${icon}
          <span>${mensagem}</span>
        </div>
      `;
    }
  },
  
  async iniciarVerificacao() {
    if (!this.estado.transactionId) {
      console.warn('⚠️ Transaction ID não disponível para verificação');
      return;
    }
    
    // Evitar múltiplas verificações simultâneas
    if (this.estado.intervaloVerificacao) {
      console.warn('⚠️ Verificação já está em andamento');
      return;
    }
    
    console.log('🔄 Iniciando verificação de pagamento...', this.estado.transactionId);
    
    this.pararVerificacao(); // Garantir que não há múltiplas verificações
    
    let tentativas = 0;
    const maxTentativas = 100; // Limitar a 100 tentativas (5 minutos)
    
    this.estado.intervaloVerificacao = setInterval(async () => {
      tentativas++;
      
      // Parar após muitas tentativas para evitar loop infinito
      if (tentativas > maxTentativas) {
        console.warn('⚠️ Limite de tentativas atingido. Parando verificação.');
        this.pararVerificacao();
        this.atualizarStatus('⏱️ Tempo de verificação expirado. Gere um novo QR Code.', true);
        return;
      }
      try {
        const response = await fetch(`${this.config.baseUrl}/pushinpay`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'check-payment',
            transactionId: this.estado.transactionId
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Erro ao verificar pagamento:', {
            status: response.status,
            error: errorData.error || errorData.message || 'Erro desconhecido'
          });
          
          // Se for 404, pode ser que o endpoint ainda não esteja deployado
          if (response.status === 404) {
            console.warn('⚠️ Endpoint de verificação não encontrado. Aguardando deploy...');
          }
          return;
        }
        
        const data = await response.json();
        const status = data.status?.toLowerCase() || data.payment_status?.toLowerCase() || 'unknown';
        console.log('📊 Status do pagamento:', status, '| Dados completos:', data);
        
        // Verificar se o pagamento foi confirmado
        // Status possíveis: paid, approved, confirmed, completed, success
        const statusConfirmado = ['paid', 'approved', 'confirmed', 'completed', 'success'];
        const isPagamentoConfirmado = statusConfirmado.includes(status) || 
                                       data.paid === true || 
                                       data.confirmed === true;
        
        if (isPagamentoConfirmado) {
          console.log('✅✅✅ PAGAMENTO CONFIRMADO! Redirecionando para agradecimento...');
          this.atualizarStatus('✅ Pagamento confirmado! Liberando acesso...');
          this.pararVerificacao();
          
          // Disparar evento customizado de pagamento confirmado
          window.dispatchEvent(new CustomEvent('paymentConfirmed', {
            detail: {
              transactionId: this.estado.transactionId,
              status: status,
              value: data.value || this.estado.valorAtual
            }
          }));
          
          // Evento Facebook Pixel
          if (typeof fbq !== 'undefined') {
            try {
              fbq('track', 'Purchase', {
                value: this.estado.valorAtual / 100,
                currency: 'BRL',
                content_name: this.config.planoAtual
              });
              console.log('✅ Facebook Pixel Purchase event enviado');
            } catch (fbError) {
              console.warn('⚠️ Erro ao enviar Facebook Pixel:', fbError);
            }
          }
          
          // Redirecionar IMEDIATAMENTE após confirmar pagamento
          const valorFormatado = (this.estado.valorAtual / 100).toFixed(2).replace('.', ',');
          const urlParams = new URLSearchParams();
          urlParams.set('id', this.estado.transactionId);
          urlParams.set('valor', valorFormatado);
          urlParams.set('status', status);
          
          // Mostrar mensagem de sucesso e redirecionar
          this.atualizarStatus('🎉 Acesso liberado! Redirecionando...');
          
          // Redirecionar após 1 segundo (tempo suficiente para mostrar mensagem)
          setTimeout(() => {
            console.log('🔄 Redirecionando para:', `/agradecimento?${urlParams.toString()}`);
            window.location.href = `/agradecimento?${urlParams.toString()}`;
          }, 1000);
          
        } else if (status === 'pending' || status === 'waiting' || status === 'processing') {
          // Pagamento ainda pendente, continuar verificando
          console.log('⏳ Aguardando pagamento... Status:', status);
        } else if (status === 'cancelled' || status === 'canceled' || status === 'expired' || status === 'failed') {
          // Pagamento cancelado ou expirado
          console.log('❌ Pagamento cancelado ou expirado. Status:', status);
          this.atualizarStatus('❌ Pagamento cancelado ou expirado. Gere um novo QR Code.');
          this.pararVerificacao();
        } else {
          // Status desconhecido, continuar verificando por segurança
          console.log('⚠️ Status desconhecido:', status, '- Continuando verificação...');
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      }
    }, 3000); // Verificar a cada 3 segundos (otimizado para resposta rápida)
    
    console.log('✅ Verificação automática iniciada - Checando a cada 3 segundos');
  },
  
  pararVerificacao() {
    if (this.estado.intervaloVerificacao) {
      clearInterval(this.estado.intervaloVerificacao);
      this.estado.intervaloVerificacao = null;
      console.log('⏸️ Verificação parada');
    }
  }
};

// Expor globalmente
if (typeof window !== 'undefined') {
  window.PushinPayReal = PushinPayReal;
}

