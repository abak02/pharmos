// app/ui/customers/action-button.js
'use client';

import { DocumentTextIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export function ViewInvoicesButton({ customerId, customerName, currentFilter = 'all', variant = "default" }) {
  const router = useRouter();

  const handleViewInvoices = () => {
    const params = new URLSearchParams();
    params.set('customer', customerId);
    params.set('name', customerName);
    params.set('page', '1');
    
    if (currentFilter === 'pending') {
      params.set('status', 'pending');
    } else if (currentFilter === 'paid') {
      params.set('status', 'paid');
    }
    
    router.push(`/dashboard/invoices?${params.toString()}`);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleViewInvoices}
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition-all duration-200"
        title={`View ${currentFilter !== 'all' ? currentFilter : 'all'} invoices for ${customerName}`}
      >
        <DocumentTextIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleViewInvoices}
      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 group"
      title={`View ${currentFilter !== 'all' ? currentFilter : 'all'} invoices for ${customerName}`}
    >
      <DocumentTextIcon className="h-5 w-5" />
      <span className="text-sm font-medium">
        View {currentFilter !== 'all' ? currentFilter : ''} Invoices
      </span>
    </button>
  );
}

export function PartialPaymentButton({ 
  customerId, 
  customerName, 
  pendingAmount = 0, 
  variant = "default"
}) {
  const router = useRouter();

  const handlePartialPayment = () => {
    // Navigate to payment page
    router.push(`/dashboard/payments?customerId=${customerId}&customerName=${encodeURIComponent(customerName)}`);
  };

  if (pendingAmount <= 0) return null;

  if (variant === "icon") {
    return (
      <button
        onClick={handlePartialPayment}
        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-200 transition-all duration-200"
        title={`Accept partial payment from ${customerName} - Pending: ৳${pendingAmount}`}
      >
        <CurrencyDollarIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handlePartialPayment}
      className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all duration-200 group"
      title={`Accept partial payment from ${customerName} - Pending: ৳${pendingAmount}`}
    >
      <CurrencyDollarIcon className="h-5 w-5" />
      <span className="text-sm font-medium">
        Take Payment
      </span>
      {pendingAmount > 0 && (
        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
          ৳{pendingAmount.toFixed(2)}
        </span>
      )}
    </button>
  );
}

export function CustomerActionButtons({ 
  customerId, 
  customerName, 
  currentFilter = 'all', 
  pendingAmount = 0,
  layout = "horizontal" 
}) {
  if (layout === "vertical") {
    return (
      <div className="flex flex-col gap-2">
        <ViewInvoicesButton 
          customerId={customerId}
          customerName={customerName}
          currentFilter={currentFilter}
          variant="default"
        />
        <PartialPaymentButton 
          customerId={customerId}
          customerName={customerName}
          pendingAmount={pendingAmount}
          variant="default"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ViewInvoicesButton 
        customerId={customerId}
        customerName={customerName}
        currentFilter={currentFilter}
        variant="icon"
      />
      <PartialPaymentButton 
        customerId={customerId}
        customerName={customerName}
        pendingAmount={pendingAmount}
        variant="icon"
      />
    </div>
  );
}