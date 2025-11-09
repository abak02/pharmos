// app/ui/invoices/table.tsx
import { UpdateInvoice, DeleteInvoice } from "@/app/ui/invoices/buttons";
import InvoiceStatus from "@/app/ui/invoices/status";
import StatusFilter from "@/app/ui/invoices/status-filter";
import { formatDateTimeToLocal, formatCurrency, GetRandomAvatar } from "@/app/lib/utils";
import { fetchFilteredInvoices } from "@/app/lib/data";

import {
  PhoneIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";

export default async function InvoicesTable({
  query,
  currentPage,
  customerId = null,
  customerName = null,
  status = null // Add status prop with default value
}) {
  const invoices = await fetchFilteredInvoices(
    query,
    currentPage,
    customerId,
    status
  );

  // Calculate pending amount for each invoice
  const invoicesWithPending = invoices.map((invoice) => ({
    ...invoice,
    pending_amount: invoice.amount - (invoice.paid_amount || 0),
  }));

  // Calculate statistics
  const totalAmount = invoicesWithPending.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoicesWithPending.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
  const totalPending = invoicesWithPending.reduce((sum, inv) => sum + inv.pending_amount, 0);
  const totalGiven = invoicesWithPending.reduce((sum, inv) => sum + (inv.total_given || 0), 0);

  if (!invoicesWithPending || invoicesWithPending.length === 0) {
    return (
      <div className="mt-6">
        <StatusFilter />
        <div className="text-center py-16 px-4 bg-white rounded-xl border border-gray-200">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <DocumentTextIcon className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-semibold mb-2">
            No invoices found
          </p>
          <p className="text-gray-400 text-base max-w-sm mx-auto">
            {status !== 'all' 
              ? `No ${status} invoices found${query ? ` matching "${query}"` : ''}`
              : customerId
              ? `No invoices found for ${customerName}${query ? ` matching "${query}"` : ''}`
              : query
              ? `No results matching "${query}"`
              : "Get started by creating your first invoice"
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Status Filter */}
      <StatusFilter />

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-3 p-4">
          {invoicesWithPending?.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <InvoiceTableDesktop invoices={invoicesWithPending} />
        </div>
      </div>

      {/* Footer Statistics */}
      <InvoiceFooterStats 
        invoiceCount={invoicesWithPending.length}
        customerName={customerName}
        customerId={customerId}
        totalAmount={totalAmount}
        totalPaid={totalPaid}
        totalPending={totalPending}
        totalGiven={totalGiven}
        currentFilter={status}
      />
    </div>
  );
}

// Mobile Card Component
function InvoiceCard({ invoice }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <GetRandomAvatar name={invoice.name} />
            <div className="">
              <p className="text-md font-semibold">{invoice.name}</p>
              <div className="flex items-center gap-1 border border-gray-200 mt-2 rounded-full px-2 py-1 bg-gray-50 shadow-sm">
                <PhoneIcon className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-500">{invoice.phone_no}</p>
              </div>
            </div>
          </div>
        </div>
        <InvoiceStatus
          status={invoice.status}
          paidAmount={invoice.paid_amount}
          totalAmount={invoice.amount}
        />
      </div>

      {/* Amount Details */}
      <div className="grid grid-cols-2 gap-4 py-4 border-b">
        <div>
          <p className="text-sm text-gray-600 font-medium">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(invoice.amount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">Paid Amount</p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(invoice.paid_amount || 0)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">Pending</p>
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4 text-orange-500" />
            <p className="text-lg font-bold text-orange-600">
              {formatCurrency(invoice.pending_amount)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-between pt-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900 bg-blue-50 px-2 py-1 rounded-md">
                {formatDateTimeToLocal(invoice.date)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <UpdateInvoice id={invoice.id} />
          <DeleteInvoice id={invoice.id} />
        </div>
      </div>
    </div>
  );
}

// Desktop Table Component
function InvoiceTableDesktop({ invoices }) {
  return (
    <table className="min-w-full table-auto border-collapse">
      <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
        <tr className="border-b border-gray-200">
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
          <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Total Amount</th>
          <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Paid</th>
          <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Pending</th>
          <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
          <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
          <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {invoices?.map((invoice) => (
          <tr key={invoice.id} className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <GetRandomAvatar name={invoice.name} />
                <div>
                  <p className="font-semibold text-gray-900 text-base">{invoice.name}</p>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{invoice.phone_no}</span>
                  </div>
                </div>
              </div>
            </td>
            <td className="px-4 py-4 font-semibold text-gray-900 text-sm">
              {formatCurrency(invoice.amount)}
            </td>
            <td className="px-4 py-4">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-green-600 text-sm">
                  {formatCurrency(invoice.paid_amount || 0)}
                </span>
              </div>
            </td>
            <td className="px-4 py-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-orange-500" />
                <span className={`font-semibold text-sm ${
                  invoice.pending_amount > 0 ? "text-orange-600" : "text-gray-600"
                }`}>
                  {formatCurrency(invoice.pending_amount)}
                </span>
              </div>
            </td>
            <td className="px-4 py-4 text-sm text-gray-600">
              {formatDateTimeToLocal(invoice.date)}
            </td>
            <td className="px-4 py-4">
              <InvoiceStatus
                status={invoice.status}
                paidAmount={invoice.paid_amount}
                totalAmount={invoice.amount}
              />
            </td>
            <td className="px-4 py-4">
              <div className="flex justify-start gap-3">
                <UpdateInvoice id={invoice.id} />
                <DeleteInvoice id={invoice.id} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Footer Statistics Component
function InvoiceFooterStats({ 
  invoiceCount, 
  customerName, 
  customerId, 
  totalAmount, 
  totalPaid, 
  totalPending, 
  totalGiven,
  currentFilter 
}) {
  return (
    <div className="mt-6 px-6 py-4 border border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/30 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            {invoiceCount} {invoiceCount === 1 ? 'invoice' : 'invoices'}
          </span>
          <span className="text-gray-500">found</span>
          {customerId && (
            <span className="text-blue-600 font-medium">for {customerName}</span>
          )}
          {currentFilter !== 'all' && (
            <span className="text-blue-600 font-medium">({currentFilter})</span>
          )}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
            <span className="font-medium text-gray-700">Paid</span>
          </span>
          <span className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
            <span className="font-medium text-gray-700">Pending</span>
          </span>
          <span className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
            <span className="font-medium text-gray-700">Partial</span>
          </span>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
        <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
          <div className="font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
          <div className="text-gray-500">Total Amount</div>
        </div>
        <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
          <div className="font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          <div className="text-gray-500">Total Paid</div>
        </div>
        <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
          <div className="font-bold text-orange-600">{formatCurrency(totalPending)}</div>
          <div className="text-gray-500">Total Pending</div>
        </div>
        
      </div>
    </div>
  );
}