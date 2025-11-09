import { CheckIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function InvoiceStatus({ status, paidAmount, totalAmount }) {
  // Calculate percentage for partial payments
  const paymentPercentage = totalAmount && paidAmount ? 
    Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border',
        {
          'bg-red-100 text-red-700 border-red-200': status === 'pending',
          'bg-green-100 text-green-700 border-green-200': status === 'paid',
          'bg-blue-100 text-blue-700 border-blue-200': status === 'partial',
        },
      )}
    >
      <div
        className={clsx(
          'w-2 h-2 rounded-full',
          {
            'bg-red-500 animate-pulse': status === 'pending',
            'bg-green-500': status === 'paid',
            'bg-blue-500': status === 'partial',
          },
        )}
      />
      {status === 'pending' ? (
        <>
          Pending
          <ClockIcon className="w-4 text-red-500" />
        </>
      ) : null}
      {status === 'paid' ? (
        <>
          Paid
          <CheckIcon className="w-4 text-green-500" />
        </>
      ) : null}
      {status === 'partial' ? (
        <>
          Partial
          {paymentPercentage > 0 && (
            <span className="text-xs font-bold">({paymentPercentage}%)</span>
          )}
          <CurrencyDollarIcon className="w-4 text-blue-500" />
        </>
      ) : null}
    </span>
  );
}