'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { processPayment } from '@/app/lib/actions';
import { allocatePayment } from './payment-utils';
import PaymentHeader from './payment-header';
import PaymentInput from './payment-input';
import AllocationPreview from './allocation-preview';
import InvoicesList from './invoices-list';
import SubmitButton from './submit-button';

export default function PaymentForm({ customerId, customerName, pendingInvoices }) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [allocations, setAllocations] = useState([]);
  
  // Initialize form state with the server action
  const [state, formAction] = useFormState(processPayment, {
    success: false,
    message: '',
    allocations: []
  });

  const totalPending = pendingInvoices.reduce((sum, invoice) => {
    return sum + (invoice.amount - invoice.paid_amount);
  }, 0);

  // Auto-allocate payment when amount changes
  useEffect(() => {
    if (paymentAmount > 0) {
      const newAllocations = allocatePayment(parseFloat(paymentAmount), pendingInvoices);
      setAllocations(newAllocations);
    } else {
      setAllocations([]);
    }
  }, [paymentAmount, pendingInvoices]);

  // Handle form submission
  const handleSubmit = (formData) => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (amount > totalPending) {
      alert(`Payment amount cannot exceed total pending amount of ৳${totalPending.toFixed(2)}`);
      return;
    }

    // Create FormData and append all fields
    const submitFormData = new FormData();
    submitFormData.append('customerId', customerId);
    submitFormData.append('totalAmount', amount.toString());
    submitFormData.append('allocations', JSON.stringify(
      allocations.map(alloc => ({
        invoiceId: alloc.invoiceId,
        allocatedAmount: alloc.allocatedAmount
      }))
    ));
    submitFormData.append('paymentDate', new Date().toISOString().split('T')[0]);

    console.log('Submitting form data:', {
      customerId,
      totalAmount: amount,
      allocations: allocations.map(a => ({ invoiceId: a.invoiceId, allocatedAmount: a.allocatedAmount })),
      paymentDate: new Date().toISOString().split('T')[0]
    });

    // Call the server action with FormData
    formAction(submitFormData);
  };

  // Handle success state
  useEffect(() => {
    if (state.success) {
      // Reset form on success
      setPaymentAmount('');
      setAllocations([]);
      
      // Refresh page after delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [state.success]);

  return (
    <div className="mt-6">
      <PaymentHeader 
        customerName={customerName}
        invoiceCount={pendingInvoices.length}
        totalPending={totalPending}
      />

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {/* Error Message */}
        {state.message && !state.success && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{state.message}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {state.success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{state.message}</span>
            </div>
          </div>
        )}

        {/* Use a proper form with action */}
        <form action={handleSubmit}>
          <PaymentInput
            paymentAmount={paymentAmount}
            totalPending={totalPending}
            onAmountChange={setPaymentAmount}
          />

          <AllocationPreview
            allocations={allocations}
            paymentAmount={paymentAmount}
            totalPending={totalPending}
          />

          <div className="flex justify-end pt-4">
            <SubmitButton
              paymentAmount={paymentAmount}
              totalPending={totalPending}
              allocationsCount={allocations.length}
            />
          </div>
        </form>
      </div>

      <InvoicesList invoices={pendingInvoices} />
    </div>
  );
}