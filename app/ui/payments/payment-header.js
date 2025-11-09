// app/ui/payments/payment-header.js - Compact Version
import { formatCurrency } from '@/app/lib/utils';

export default function PaymentHeader({ customerName, invoiceCount, totalPending }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 mb-6">
      {/* Mobile Layout - Stacked */}
      <div className="sm:hidden space-y-3">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-blue-900">Payment Collection</h2>
          <p className="text-blue-700 text-sm mt-1">{customerName || 'All Customers'}</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-blue-700">Total Pending</div>
              <div className="text-xl font-bold text-blue-900">
                {formatCurrency(totalPending)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-700">Invoices</div>
              <div className="text-lg font-bold text-blue-900">{invoiceCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Side by Side */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-blue-900">Payment Collection</h2>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-blue-700 text-sm">
              {customerName || 'All Customers'}
            </p>
            <div className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
              {invoiceCount} pending invoice{invoiceCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(totalPending)}
          </div>
          <p className="text-blue-700 text-sm">Total Pending</p>
        </div>
      </div>
    </div>
  );
}