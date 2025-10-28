import { UpdateInvoice, DeleteInvoice } from '@/app/ui/invoices/buttons';
import InvoiceStatus from '@/app/ui/invoices/status';
import { formatDateTimeToLocal, formatCurrency } from '@/app/lib/utils';
import { fetchFilteredInvoices } from '@/app/lib/data';
import { DocumentTextIcon, PhoneIcon, CalendarIcon, CurrencyBangladeshiIcon, PrinterIcon } from '@heroicons/react/24/outline';

// Function to generate random gradient based on customer name
function getRandomGradient(name) {
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600',
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-teal-500 to-cyan-600',
    'from-indigo-500 to-blue-600',
    'from-pink-500 to-rose-600',
    'from-amber-500 to-orange-600',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

// Animated Pending Status Component
function AnimatedPendingStatus() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-100 relative overflow-hidden">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span> 
      </span>
      Pending
    </span>
  );
}

export default async function InvoicesTable({
  query,
  currentPage,
}) {
  const invoices = await fetchFilteredInvoices(query, currentPage);
  
  return (
    <div className="mt-8">
      <div className="min-w-full">
        <div className="rounded-2xl bg-gray-50/50 p-4 md:p-6">
          
          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4">
            {invoices?.map((invoice) => {
              const gradientClass = getRandomGradient(invoice.name);
              
              return (
                <div
                  key={invoice.id}
                  className="w-full rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all  duration-200"
                >
                  <div className="flex items-start justify-between pb-4 mb-4 border-b border-gray-100">
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${gradientClass} rounded-full flex items-center justify-center shadow-sm flex-shrink-0`}>
                        <span className="text-white font-semibold text-base">
                          {invoice.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900 text-base">{invoice.name}</p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <PhoneIcon className="h-4 w-4" />
                          <span>{invoice.phone_no}</span>
                        </div>
                      </div>
                    </div>
                    {invoice.status === 'pending' ? (
                      <AnimatedPendingStatus />
                    ) : (
                      <InvoiceStatus status={invoice.status} />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CurrencyBangladeshiIcon className="h-5 w-5 text-green-600" />
                        <p className="text-xl font-semibold text-gray-900">
                          {formatCurrency(invoice.amount)} TK
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                        <p>{formatDateTimeToLocal(invoice.date)}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <UpdateInvoice id={invoice.id} />
                      <DeleteInvoice id={invoice.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View - Table */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-2xl text-left text-sm font-normal bg-white shadow-xs border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Customer
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Amount
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Date
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th scope="col" className="relative py-4 pl-6 pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 ">
              {invoices?.map((invoice) => {
                const gradientClass = getRandomGradient(invoice.name);
                
                return (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50/80 transition-colors duration-150 group hover:bg-sky-100/50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 bg-gradient-to-br ${gradientClass} rounded-full flex items-center justify-center shadow-sm flex-shrink-0`}>
                          <span className="text-white font-semibold text-sm">
                            {invoice.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900 text-base">{invoice.name}</p>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <PhoneIcon className="h-4 w-4" />
                            <span>{invoice.phone_no}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2.5">
                        <CurrencyBangladeshiIcon className="h-5 w-5 text-green-500" />
                        <span className="font-semibold text-gray-900 text-base">
                          {formatCurrency(invoice.amount)}
                        </span>
                        <span className="text-sm text-gray-500">TK</span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span>{formatDateTimeToLocal(invoice.date)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      {invoice.status === 'pending' ? (
                        <AnimatedPendingStatus />
                      ) : (
                        <InvoiceStatus status={invoice.status} />
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <UpdateInvoice id={invoice.id} />
                        <DeleteInvoice id={invoice.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table Footer */}
          {invoices.length > 0 && (
            <div className="bg-white px-6 py-4 border-t border-gray-100 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 gap-3">
                <span className="font-medium">Showing {invoices.length} invoices</span>
                <div className="flex items-center gap-6 flex-wrap">
                  <span className="flex items-center gap-2.5 whitespace-nowrap">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Paid Invoices</span>
                  </span>
                  <span className="flex items-center gap-2.5 whitespace-nowrap">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Pending Invoices</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {invoices.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <DocumentTextIcon className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">No invoices found</p>
              <p className="text-gray-400 text-base">
                {query ? `No results for "${query}"` : 'No invoices available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}