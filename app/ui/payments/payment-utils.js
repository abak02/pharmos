import { formatCurrency } from '@/app/lib/utils';

export function allocatePayment(totalPayment, invoices) {
  const allocations = [];
  let remainingPayment = totalPayment;
  
  // Filter invoices with pending amounts and sort by smallest pending first
  const sortedInvoices = [...invoices]
    .filter(invoice => {
      const pendingAmount = invoice.amount - invoice.paid_amount;
      return pendingAmount > 0;
    })
    .sort((a, b) => {
      const aPending = a.amount - a.paid_amount;
      const bPending = b.amount - b.paid_amount;
      return aPending - bPending;
    });
  
  for (const invoice of sortedInvoices) {
    if (remainingPayment <= 0) break;
    
    const pendingAmount = invoice.amount - invoice.paid_amount;
    const allocatedAmount = Math.min(remainingPayment, pendingAmount);
    
    allocations.push({
      invoiceId: invoice.id,
      allocatedAmount,
      invoiceAmount: invoice.amount,
      pendingAmount: pendingAmount,
      paidAmount: invoice.paid_amount,
      date: invoice.date,
      status: allocatedAmount === pendingAmount ? 'fully_paid' : 'partial'
    });
    
    remainingPayment -= allocatedAmount;
  }
  
  return allocations;
}

export function validatePaymentAmount(amount, totalPending) {
  if (!amount || amount <= 0) {
    return 'Please enter a valid payment amount';
  }
  
  if (amount > totalPending) {
    return `Payment amount cannot exceed total pending amount of ${formatCurrency(totalPending)}`;
  }
  
  return null;
}