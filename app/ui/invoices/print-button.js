'use client';

import { PrinterIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { handlePrintInvoice } from '@/app/lib/print-utils';

export default function PrintButton({ invoice }) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    if (isPrinting) return;
    
    setIsPrinting(true);
    try {
      await handlePrintInvoice(invoice);
    } catch (error) {
      console.error('Print error:', error);
      alert('Failed to print invoice. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={isPrinting}
      className="rounded-md border p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Print Receipt"
    >
      <PrinterIcon className={`w-5 ${isPrinting ? 'text-gray-400' : 'text-green-500'}`} />
    </button>
  );
}