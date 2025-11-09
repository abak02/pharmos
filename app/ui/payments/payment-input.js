import { formatCurrency } from '@/app/lib/utils';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function PaymentInput({ paymentAmount, totalPending, onAmountChange }) {
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow empty string or valid numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onAmountChange(value);
    }
  };

  const isAmountExceeded = parseFloat(paymentAmount) > totalPending;

  return (
    <div>
      <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-3">
        Enter Payment Amount (৳)
      </label>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            id="paymentAmount"
            type="text"
            inputMode="decimal"
            value={paymentAmount}
            onChange={handleAmountChange}
            className={`w-full p-4 pl-4 pr-24 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl font-medium ${
              isAmountExceeded ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="0.00"
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <span className="text-gray-500 font-medium">BDT</span>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => onAmountChange(totalPending.toFixed(2))}
          className="px-6 py-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium whitespace-nowrap"
        >
          Pay Full Amount
        </button>
      </div>
      
      <div className="flex justify-between text-sm text-gray-500 my-2">
        <span>Maximum: {formatCurrency(totalPending)}</span>
        {isAmountExceeded && (
          <span className="text-red-600 font-medium flex items-center gap-1">
            <ExclamationCircleIcon className="h-4 w-4" />
            Amount exceeds total pending
          </span>
        )}
      </div>
    </div>
  );
}