import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router'; 
// import { useCartStore } from '@/shared/store/cartStore'; // Descomenta según cómo manejes tu carrito

export const AddiMockPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const navigate = useNavigate({ from: '/addi-mock' });

  // const clearCart = useCartStore((state) => state.clearCart); // Función ficticia para limpiar carrito

  const handleSimulateApproval = () => {
    setIsProcessing(true);

    // Simulamos un proceso de validación en los servidores de Addi (2 segundos)
    setTimeout(() => {
      setIsProcessing(false);
      setIsApproved(true);
      
      // Vaciar el carrito aquí
      // clearCart(); 
      
      // Redirigimos después de 1.5s para que el usuario pueda ver el mensaje de éxito
      setTimeout(() => {
        navigate({ to: '/checkout' });
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Corporativo Addi */}
        <div className="bg-[#6B28E8] px-6 py-8 text-center relative">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Addi</h1>
          <div className="absolute top-4 right-4 bg-white/20 px-2 py-1 rounded text-xs text-white font-medium uppercase tracking-wider">
            Entorno de Pruebas
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-6">
            Simulador de Pago Addi
          </h2>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6 text-center">
            <p className="text-sm text-gray-500 mb-1 uppercase tracking-wide font-semibold">Total a financiar</p>
            <p className="text-3xl font-black text-[#6B28E8]">$ 3.500.000</p>
          </div>

          <div className="flex items-center space-x-3 mb-8 text-sm text-gray-600 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <svg className="w-6 h-6 text-[#6B28E8] flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p>Validando identidad para la cédula <strong className="text-gray-800">XXXXX...</strong></p>
          </div>

          {/* Renderizado Condicional del Botón y Estado */}
          {isApproved ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-5 rounded-xl text-center">
              <p className="text-xl font-bold flex items-center justify-center mb-1">
                <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                ¡Crédito Aprobado!
              </p>
              <p className="text-sm font-medium opacity-80 animate-pulse">Redirigiendo a tu pedido...</p>
            </div>
          ) : (
            <button
              onClick={handleSimulateApproval}
              disabled={isProcessing}
              className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg transition-all duration-200 ${
                isProcessing 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-[#00D084] hover:bg-[#00b372] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isProcessing ? 'Procesando solicitud...' : 'Simular Aprobación de Crédito'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddiMockPage;
