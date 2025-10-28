import { UpdateInvoice, DeleteInvoice } from '@/app/ui/invoices/buttons';
import InvoiceStatus from '@/app/ui/invoices/status';
import { formatDateTimeToLocal, formatCurrency } from '@/app/lib/utils';
import { fetchFilteredInvoices } from '@/app/lib/data';
import { DocumentTextIcon, PhoneIcon, CalendarIcon, CurrencyBangladeshiIcon, PrinterIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Function to generate random gradient based on customer name
function getRandomGradient(name) {
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-violet-500 to-purple-500',
    'from-rose-500 to-pink-500',
    'from-sky-500 to-blue-500',
    'from-lime-500 to-green-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

// Modern gradient background component
function GradientAvatar({ name, className = "" }) {
  const gradientClass = getRandomGradient(name);
  
  return (
    <div className={`relative ${className}`}>
      <div className={`w-full h-full bg-gradient-to-br ${gradientClass} rounded-2xl flex items-center justify-center shadow-lg rounded-full`}>
        <span className="text-white font-bold text-lg">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="absolute inset-0 bg-white/10 rounded-2xl mix-blend-overlay"></div>
    </div>
  );
}

// Modern status badge with glow effect
function ModernStatusBadge({ status }) {
  if (status === 'pending') {
    return (
      <div className="relative">
        <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-200 backdrop-blur-sm">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </div>
          <span className="text-sm font-medium text-red-700">Pending</span>
        </div>
        <div className="absolute inset-0 bg-red-500/20 blur-sm rounded-full scale-110"></div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-200 backdrop-blur-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium text-green-700">Paid</span>
      </div>
      <div className="absolute inset-0 bg-green-500/10 blur-sm rounded-full scale-110"></div>
    </div>
  );
}

// Glass morphism card component
function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-black/5 rounded-3xl ${className}`}>
      {children}
    </div>
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
        {/* Modern Header */}
        <div className="flex items-center justify-between mb-6">
          
          {query && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100">
              <MagnifyingGlassIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                Searching for: <span className="font-semibold">`{query}`</span>
              </span>
            </div>
          )}
        </div>

        <GlassCard className="p-6">
          {/* Mobile View - Modern Cards */}
          <div className="md:hidden space-y-4">
            {invoices?.map((invoice) => (
              <div
                key={invoice.id}
                className="group relative bg-gradient-to-br from-white to-gray-50/80 rounded-2xl p-1 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
              >
                <div className="relative bg-white rounded-xl p-5">
                  {/* Header with avatar and status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <GradientAvatar name={invoice.name} className="w-12 h-12" />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">{invoice.name}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                          <PhoneIcon className="h-4 w-4" />
                          <span>{invoice.phone_no}</span>
                        </div>
                      </div>
                    </div>
                    <ModernStatusBadge status={invoice.status} />
                  </div>

                  {/* Amount and Date */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-xl border border-green-100">
                      <CurrencyBangladeshiIcon className="h-5 w-5 text-green-600" />
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </p>
                      
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDateTimeToLocal(invoice.date)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Modern Table */}
          <div className="hidden md:block">
            <div className="rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                <div className="col-span-3">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</span>
                </div>
                <div className="col-span-3">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider"></span>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100/50">
                {invoices?.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="group items-center grid grid-cols-12 gap-4 px-6 py-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 transition-all duration-200 border-b border-gray-100/50 last:border-b-0"
                  >
                    {/* Customer */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-4">
                        <GradientAvatar name={invoice.name} className="w-10 h-10" />
                        <div>
                          <p className="font-semibold text-gray-900 text-base">{invoice.name}</p>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                            <PhoneIcon className="h-4 w-4" />
                            <span>{invoice.phone_no}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <CurrencyBangladeshiIcon className="h-5 w-5 text-green-500" />
                        <span className="font-bold text-gray-900 text-base">
                          {formatCurrency(invoice.amount)}
                        </span>
                        
                      </div>
                    </div>

                    {/* Date */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span>{formatDateTimeToLocal(invoice.date)}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <ModernStatusBadge status={invoice.status} />
                    </div>

                    {/* Actions */}
                    <div className="col-span-2">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <UpdateInvoice id={invoice.id} />
                        <DeleteInvoice id={invoice.id} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modern Footer */}
          {invoices.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/30 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                    {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
                  </span>
                  <span className="text-gray-500">found</span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                    <span className="font-medium text-gray-700">Paid</span>
                  </span>
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm animate-pulse"></div>
                    <span className="font-medium text-gray-700">Pending</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Modern Empty State */}
          {invoices.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <DocumentTextIcon className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-semibold mb-2">No invoices found</p>
              <p className="text-gray-400 text-base max-w-sm mx-auto">
                {query ? `No results matching "${query}"` : 'Get started by creating your first invoice'}
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}