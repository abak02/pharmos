import { fetchPendingInvoices } from '@/app/lib/actions';
import { lusitana } from '@/app/ui/fonts';
import PaymentForm from '@/app/ui/payments/payment-form';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default async function PaymentPage({ searchParams }) {
  const customerId = searchParams?.customerId;
  const customerName = searchParams?.customerName;

  if (!customerId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900">Customer Not Found</h1>
            <p className="text-gray-600 mt-2">Please select a valid customer.</p>
            <Link
              href="/dashboard/customers"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Customers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let pendingInvoices = [];
  try {
    pendingInvoices = await fetchPendingInvoices(customerId);
  } catch (error) {
    console.error('Error fetching pending invoices:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/dashboard/customers"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div className="flex-1">
              <h1 className={` ${lusitana.className} text-3xl font-bold text-blue-600`}>Accept Payment</h1>
              <p className="text-gray-600 mt-1">
                Customer: <span className="font-semibold text-gray-800">{customerName}</span>
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <PaymentForm 
            customerId={customerId}
            customerName={customerName}
            pendingInvoices={pendingInvoices}
          />
        </div>
      </div>
    </div>
  );
}