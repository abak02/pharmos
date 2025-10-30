// app/ui/customers/ActionButtons.js
'use client';

import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useSearchParams, useRouter } from "next/navigation";

export function ViewInvoicesButton({ customerId, customerName, currentFilter = 'all', variant = "default" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewInvoices = () => {
    const params = new URLSearchParams();
    params.set('customer', customerId);
    params.set('name', customerName);
    params.set('page', '1');
    
    // Add status filter based on current customer filter
    if (currentFilter === 'pending') {
      params.set('status', 'pending');
    } else if (currentFilter === 'paid') {
      params.set('status', 'paid');
    }
    // For 'all' filter, don't set any status filter
    
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleViewInvoices}
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition-all duration-200"
        title={`View ${currentFilter !== 'all' ? currentFilter : 'all'} invoices for ${customerName}`}
      >
        <DocumentTextIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={handleViewInvoices}
      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 group"
      title={`View ${currentFilter !== 'all' ? currentFilter : 'all'} invoices for ${customerName}`}
    >
      <DocumentTextIcon className="h-4 w-4" />
      <span className="text-sm font-medium">
        View {currentFilter !== 'all' ? currentFilter : ''} Invoices
      </span>
    </button>
  );
}