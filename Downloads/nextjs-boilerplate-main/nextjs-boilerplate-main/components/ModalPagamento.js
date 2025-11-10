export default function ModalPagamento({ aberto, fechar, valor, plano }) {
  if (!aberto) return null;

  return (
    <div id="paymentModal" className="fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Pagamento PIX</h3>
              <button onClick={fechar} className="text-white hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Conteúdo */}
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Status do Pagamento */}
            <div id="paymentStatus" className="mb-6">
              <div className="flex items-center justify-center space-x-2 text-orange-600">
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Gerando pagamento...</span>
              </div>
            </div>
            
            {/* QR Code */}
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Escaneie o QR Code</h4>
              <div id="qrCode" className="flex justify-center">
                {/* QR Code será inserido aqui */}
              </div>
            </div>
            
            {/* Código PIX */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Ou copie o código PIX</h4>
              <div className="bg-gray-100 rounded-lg p-3">
                <input 
                  type="text" 
                  id="pixCodeInput" 
                  readOnly 
                  className="w-full bg-transparent text-sm text-gray-700 border-none outline-none"
                  placeholder="Código PIX será gerado..."
                />
              </div>
              <button 
                onClick={() => {
                  const input = document.getElementById('pixCodeInput');
                  if (input && input.value) {
                    input.select();
                    document.execCommand('copy');
                  }
                }} 
                className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Copiar Código PIX
              </button>
            </div>
            
            {/* Informações */}
            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-orange-800 mb-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                <span className="font-semibold">Instruções</span>
              </div>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Escaneie o QR Code com seu app bancário</li>
                <li>• Ou copie e cole o código PIX</li>
                <li>• O pagamento será confirmado automaticamente</li>
              </ul>
            </div>
            
            {/* Valor */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">R$ {valor.toFixed(2).replace('.', ',')}</div>
              <div className="text-sm text-gray-600">{plano}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

