import React from 'react';

interface AddiWidgetProps {
  price: number;
}

export const AddiWidget: React.FC<AddiWidgetProps> = ({ price }) => {
  const installmentValue = price / 3;

  const formattedInstallment = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(installmentValue);

  return (
    <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm text-sm text-gray-700 w-full max-w-md">
      <svg 
        className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" 
        fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <p className="leading-tight">
        Paga en 3 cuotas de <strong className="font-semibold text-gray-900">{formattedInstallment}</strong> 
        con <span className="font-extrabold text-[#6B28E8] tracking-tight">Addi</span>
      </p>
    </div>
  );
};
