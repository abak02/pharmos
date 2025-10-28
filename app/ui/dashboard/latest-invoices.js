import { ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

import { lusitana } from '@/app/ui/fonts';
import { fetchLatestInvoices } from '@/app/lib/data';
import { formatDateTimeToLocal, formatCurrency } from '@/app/lib/utils';
import Link from 'next/link';

// Function to generate gradient color based on customer name
function getGradientColor(name) {
  const gradientPairs = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600',
    'from-purple-500 to-pink-600',
    'from-pink-500 to-rose-600',
    'from-orange-500 to-amber-600',
    'from-teal-500 to-cyan-600',
    'from-indigo-500 to-blue-600',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-500',
    'from-emerald-500 to-green-600',
    'from-violet-500 to-purple-600',
    'from-fuchsia-500 to-pink-600',
    'from-sky-500 to-blue-600',
    'from-lime-500 to-green-600',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % gradientPairs.length;
  return gradientPairs[index];
}

export default async function LatestInvoices() {
  const latestInvoices = await fetchLatestInvoices();
  
  return (
    <div className="w-full md:col-span-4">
      <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-4 md:p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Header inside the card */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className={`${lusitana.className} text-xl md:text-2xl font-bold text-gray-800`}>
            Recent Transactions
          </h2>
          <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-blue-50 rounded-full">
            <DocumentTextIcon className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
            <span className="text-xs md:text-sm font-medium text-blue-700">
              {latestInvoices.length} invoices
            </span>
          </div>
        </div>
        
        {/* Transactions List - Flexible height */}
        <div className="flex-1 min-h-0">
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 md:pr-2">
            {latestInvoices.map((invoice, i) => {
              const gradientClass = getGradientColor(invoice.name);
              
              return (
                <div
                  key={invoice.id}
                  className={clsx(
                    'group flex items-center justify-between p-3 md:p-4 rounded-xl transition-all duration-200',
                    {
                      'bg-gray-50': i % 2 === 0,
                      'hover:bg-blue-50 hover:border hover:border-blue-200': true,
                      'border border-transparent': true,
                    },
                  )}
                >
                  <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                    {/* Customer Avatar with Gradient Color */}
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-br ${gradientClass}`}>
                        <span className="text-white font-semibold text-xs md:text-sm">
                          {invoice.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {invoice.name}
                        </p>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 max-w-[100px] sm:max-w-[120px] truncate">
                          {invoice.phone_no}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>Created</span>
                        <span className="font-medium">{formatDateTimeToLocal(invoice.date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end flex-shrink-0 ml-4">
                    <p className={`${lusitana.className} text-base md:text-lg font-bold text-green-600 mb-1`}>
                      {formatCurrency(invoice.amount)}
                    </p>
                    <div className={clsx(
                      'px-2 py-0.5 md:py-1 rounded-full text-xs font-medium',
                      {
                        'bg-green-50 text-green-700': parseFloat(invoice.amount) > 1000,
                        'bg-blue-50 text-blue-700': parseFloat(invoice.amount) <= 1000,
                      }
                    )}>
                      {parseFloat(invoice.amount) > 1000 ? 'Large' : 'Standard'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-row items-center justify-between pt-4 md:pt-6 mt-4 border-t border-gray-200 gap-2 sm:gap-0">
          <div className="flex items-center text-xs md:text-sm text-gray-500">
            <ArrowPathIcon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span>Updated just now</span>
          </div>
          <Link href="dashboard/invoices">
            <button className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View all invoices →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}