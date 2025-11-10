// Sistema PushinPay Seguro - Usa API Route do Next.js
// Token protegido no servidor, não exposto no cliente

const PushinPaySecure = {
  // Estado atual
  estado: {
    transacaoId: null,
    status: 'pending',
    intervaloVerificacao: null,
    valorAtual: 990, // Valor em centavos (R$ 9,90)
    planoAtual: 'Vitalício'
  },
  
  // Criar PIX via API Route (token protegido no servidor)
  async criarPix() {
    try {
      console.log('🔍 Criando PIX via API Route protegida...');
      
      // Chamar API Route do Next.js (não expõe token no cliente)
      const response = await fetch('/api/pushinpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-pix',
          valor: this.estado.valorAtual,
          plano: this.estado.planoAtual,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar PIX');
      }
      
      const data = await response.json();
      console.log('✅ PIX criado com sucesso:', data);
      
      // Salvar dados da transação
      this.estado.transacaoId = data.id || data.transaction_id;
      this.estado.status = data.status || 'pending';
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar PIX:', error);
      throw error;
    }
  },
  
  // Verificar pagamento via API Route
  async verificarPagamento() {
    if (!this.estado.transacaoId) {
      console.warn('⚠️ Nenhuma transação para verificar');
      return null;
    }
    
    try {
      const response = await fetch('/api/pushinpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'check-payment',
          transactionId: this.estado.transacaoId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao verificar pagamento');
      }
      
      const data = await response.json();
      
      if (data.status === 'paid' || data.status === 'completed') {
        this.estado.status = 'paid';
        console.log('✅ Pagamento confirmado!');
        return data;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Erro ao verificar pagamento:', error);
      return null;
    }
  },
  
  // Atualizar valor e plano
  atualizarValorPlano(valor, plano) {
    this.estado.valorAtual = Math.round(valor * 100); // Converter para centavos
    this.estado.planoAtual = plano;
    console.log('📝 Valor e plano atualizados:', { valor: this.estado.valorAtual, plano });
  },
  
  // Exibir QR Code
  exibirQRCode(qrCodeBase64) {
    const qrCodeDiv = document.getElementById('qrCode');
    if (qrCodeDiv && qrCodeBase64) {
      qrCodeDiv.innerHTML = `<img src="data:image/png;base64,${qrCodeBase64}" alt="QR Code PIX" class="mx-auto" style="max-width: 300px;" />`;
    }
  },
  
  // Exibir código PIX
  exibirCodigoPix(codigoPix) {
    const pixInput = document.getElementById('pixCodeInput');
    if (pixInput && codigoPix) {
      pixInput.value = codigoPix;
    }
  },
  
  // Atualizar status
  atualizarStatus(mensagem) {
    const statusDiv = document.getElementById('paymentStatus');
    if (statusDiv) {
      statusDiv.innerHTML = `
        <div class="flex items-center justify-center space-x-2 text-orange-600">
          <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>${mensagem}</span>
        </div>
      `;
    }
  },
  
  // Iniciar verificação automática
  iniciarVerificacao() {
    // Parar verificação anterior se existir
    this.pararVerificacao();
    
    // Verificar a cada 5 segundos
    this.estado.intervaloVerificacao = setInterval(async () => {
      const resultado = await this.verificarPagamento();
      
      if (resultado && (resultado.status === 'paid' || resultado.status === 'completed')) {
        this.pararVerificacao();
        this.atualizarStatus('✅ Pagamento confirmado!');
        
        // Redirecionar para página de agradecimento
        const valorFormatado = (this.estado.valorAtual / 100).toFixed(2).replace('.', ',');
        setTimeout(() => {
          window.location.href = `/agradecimento?id=${this.estado.transacaoId}&valor=${valorFormatado}&status=paid`;
        }, 2000);
      }
    }, 5000);
    
    console.log('🔄 Verificação automática iniciada');
  },
  
  // Parar verificação
  pararVerificacao() {
    if (this.estado.intervaloVerificacao) {
      clearInterval(this.estado.intervaloVerificacao);
      this.estado.intervaloVerificacao = null;
      console.log('⏹️ Verificação automática parada');
    }
  },
};

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.PushinPaySecure = PushinPaySecure;
}

