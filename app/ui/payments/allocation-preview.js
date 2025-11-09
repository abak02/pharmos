import { formatCurrency } from '@/app/lib/utils';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function AllocationPreview({ allocations, paymentAmount, totalPending }) {
  if (allocations.length === 0) return null;

  const fullyPaidCount = allocations.filter(alloc => alloc.status === 'fully_paid').length;
  const partialCount = allocations.filter(alloc => alloc.status === 'partial').length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Payment Allocation Preview</h4>
            <p className="text-xs text-gray-600 mt-1 hidden sm:block">
              How the payment will be distributed across invoices
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            {fullyPaidCount > 0 && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {fullyPaidCount} fully paid
              </span>
            )}
            {partialCount > 0 && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {partialCount} partial
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-1 sm:hidden">
          How the payment will be distributed across invoices
        </p>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {allocations.map((alloc, index) => (
          <AllocationRow 
            key={alloc.invoiceId} 
            allocation={alloc} 
            isLast={index === allocations.length - 1}
          />
        ))}
      </div>

      <AllocationSummary 
        totalPending={totalPending}
        paymentAmount={paymentAmount}
      />
    </div>
  );
}

function AllocationRow({ allocation, isLast }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 ${
      allocation.status === 'fully_paid' ? 'bg-green-50' : 'bg-white'
    } ${!isLast ? 'border-b border-gray-200' : ''}`}>
      
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <StatusIndicator status={allocation.status} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
              Invoice {allocation.invoiceId.slice(-8)}
            </div>
            <div className="text-xs text-gray-500 space-y-0.5">
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <span>Date: {new Date(allocation.date).toLocaleDateString()}</span>
                <span className="hidden sm:inline">•</span>
                <span>Total: {formatCurrency(allocation.invoiceAmount)}</span>
              </div>
              <div>Paid: {formatCurrency(allocation.paidAmount)}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
        <div className="text-left sm:text-right">
          <div className={`text-base sm:text-lg font-semibold ${
            allocation.status === 'fully_paid' ? 'text-green-600' : 'text-blue-600'
          }`}>
            {formatCurrency(allocation.allocatedAmount)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {allocation.status === 'fully_paid' ? (
              <span className="text-green-600 font-medium">Fully cleared</span>
            ) : (
              <span className="text-blue-600">
                {formatCurrency(allocation.pendingAmount - allocation.allocatedAmount)} remaining
              </span>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <StatusBadge status={allocation.status} />
        </div>
      </div>
    </div>
  );
}

function StatusIndicator({ status }) {
  return (
    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
      status === 'fully_paid' 
        ? 'bg-green-100 text-green-600' 
        : 'bg-blue-100 text-blue-600'
    }`}>
      {status === 'fully_paid' ? (
        <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      ) : (
        <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${
      status === 'fully_paid' 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-blue-100 text-blue-800 border border-blue-200'
    }`}>
      {status === 'fully_paid' ? 'FULLY PAID' : 'PARTIAL'}
    </div>
  );
}

function AllocationSummary({ totalPending, paymentAmount }) {
  return (
    <div className="bg-gray-50 px-3 sm:px-4 py-3 border-t border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
        <div className="text-center p-2 sm:p-0 bg-white sm:bg-transparent rounded-lg border border-gray-200 sm:border-none">
          <div className="text-base sm:text-lg font-bold text-gray-900">
            {formatCurrency(totalPending)}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Total Pending</div>
        </div>
        
        <div className="text-center p-2 sm:p-0 bg-white sm:bg-transparent rounded-lg border border-gray-200 sm:border-none">
          <div className="text-base sm:text-lg font-bold text-blue-600">
            {formatCurrency(paymentAmount)}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Payment Amount</div>
        </div>
        
        <div className="text-center p-2 sm:p-0 bg-white sm:bg-transparent rounded-lg border border-gray-200 sm:border-none">
          <div className="text-base sm:text-lg font-bold text-red-600">
            {formatCurrency(totalPending - parseFloat(paymentAmount))}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Remaining Pending</div>
        </div>

        <div className="text-center p-2 sm:p-0 bg-white sm:bg-transparent rounded-lg border border-gray-200 sm:border-none">
          <div className="text-base sm:text-lg font-bold text-red-600">
            {formatCurrency(totalPending - parseFloat(paymentAmount))}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Change Amount</div>
        </div>
      </div>
    </div>
  );
}