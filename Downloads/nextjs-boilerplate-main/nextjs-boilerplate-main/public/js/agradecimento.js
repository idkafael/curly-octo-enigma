// Script da página de agradecimento - Versão Simplificada
(function() {
  'use strict';
  
  // Obter dados da URL
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get('id') || 'N/A';
  
  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    // Evento Facebook Pixel - Purchase (se disponível)
    try {
      if (typeof fbq !== 'undefined' && fbq) {
        fbq('track', 'Purchase', {
          value: 9.90,
          currency: 'BRL',
          content_name: 'Curso Privacy',
          content_category: 'Digital Product',
          transaction_id: transactionId
        });
        console.log('✅ Facebook Pixel Purchase event enviado');
      }
    } catch (error) {
      // Silenciar erro - Facebook Pixel pode estar bloqueado
    }
    
    // Exibir ID da transação
    const transactionIdElement = document.getElementById('transactionId');
    if (transactionIdElement) {
      transactionIdElement.textContent = transactionId;
    }
    
    // Salvar dados da conversão no Database (se disponível)
    if (typeof Database !== 'undefined') {
      try {
        const transacaoTemp = JSON.parse(localStorage.getItem('transacao_temp') || '{}');
        
        if (transacaoTemp.transactionId) {
          const dados = {
            transactionId: transacaoTemp.transactionId,
            valor: transacaoTemp.valor || 9.90,
            plano: transacaoTemp.plano || '1 mês',
            status: 'paid',
            tags: ['convertido', 'pago', 'agradecimento_visualizado'],
            timestamp: new Date().toISOString()
          };
          
          Database.adicionarCliente(dados);
          console.log('✅ Conversão registrada no Database');
          
          // Limpar transação temporária
          localStorage.removeItem('transacao_temp');
        }
      } catch (error) {
        console.warn('⚠️ Erro ao salvar conversão:', error);
      }
    }
    
    // Rastrear conversão no LeadTracking (se disponível)
    if (typeof LeadTracking !== 'undefined') {
      try {
        LeadTracking.rastrearConversao('pagina_agradecimento_visualizada');
        console.log('✅ Conversão registrada no LeadTracking');
      } catch (error) {
        console.warn('⚠️ Erro ao rastrear conversão:', error);
      }
    }
    
    // Animação de entrada
    const card = document.querySelector('.bg-white');
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(50px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100);
    }
  }
  
})();
