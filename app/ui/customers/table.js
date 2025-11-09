// app/ui/customers/table.js
import { fetchFilteredCustomers } from "@/app/lib/data";
import { formatCurrency, GetRandomAvatar } from "@/app/lib/utils";
import {
  EnvelopeIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  PhoneIcon,
} from "@heroicons/react/24/solid";
import FilterButtons from "./filter-button";
import { CustomerActionButtons } from "./action-button";


function filterCustomers(customers, filterType) {
  if (filterType === "all") return customers;

  return customers.filter((customer) => {
    if (filterType === "pending") {
      return customer.total_pending > 0;
    }
    if (filterType === "paid") {
      return customer.total_pending === 0 && customer.total_paid > 0;
    }
    return true;
  });
}

function getFilterCounts(customers) {
  const total = customers.length;
  const pending = customers.filter((c) => c.total_pending > 0).length;
  const paid = customers.filter(
    (c) => c.total_pending === 0 && c.total_paid > 0
  ).length;

  return { total, pending, paid };
}

export default async function CustomersTable({
  query,
  currentPage,
  filter = "all",
}) {
  const customers = await fetchFilteredCustomers(query, currentPage);

  // Filter customers based on URL parameter
  const filteredCustomers = filterCustomers(customers, filter);
  const filterCounts = getFilterCounts(customers);

  return (
    <div className="w-full">
      <FilterButtons currentFilter={filter} filterCounts={filterCounts} />

      <div className="mt-6">
        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredCustomers?.map((customer) => {
            

            return (
              <div
                key={customer.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
              >
                {/* Customer Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GetRandomAvatar name={customer.name} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {customer.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        {customer.phone_no && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <PhoneIcon className="h-3 w-3" />
                            <span>{customer.phone_no}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DocumentTextIcon className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium text-gray-700">
                        Invoices
                      </span>
                    </div>
                    <p className="text-base font-bold text-gray-900">
                      {customer.total_invoices}
                    </p>
                  </div>

                  <div
                    className={`text-center p-2 rounded-lg border ${
                      customer.total_pending > 0
                        ? "bg-red-50 border-red-100"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <ClockIcon
                          className={`h-3 w-3 ${
                            customer.total_pending > 0
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            customer.total_pending > 0
                              ? "text-red-700"
                              : "text-gray-600"
                          }`}
                        >
                          Pending
                        </span>
                      </div>
                      <p
                        className={`text-sm font-bold leading-tight ${
                          customer.total_pending > 0
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {formatCurrency(customer.total_pending+customer.total_partial)}
                      </p>
                    </div>
                  </div>

                  <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <CheckCircleIcon className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-green-700">
                          Paid
                        </span>
                      </div>
                      <p className="text-sm font-bold text-green-600 leading-tight">
                        {formatCurrency(customer.total_paid)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span className="truncate">
                    ID: {customer.id.slice(0, 8)}...
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.total_pending > 0
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-green-100 text-green-700 border border-green-200"
                      }`}
                    >
                      {customer.total_pending > 0 ? "Has Pending" : "All Paid"}
                    </div>
                    <CustomerActionButtons
                      customerId={customer.id}
                      customerName={customer.name}
                      currentFilter={filter}
                      pendingAmount={customer.total_pending+customer.total_partial}
                      layout="horizontal"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table - Fixed scrollbar issue */}
        <div className="hidden md:block rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-3 lg:px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-3 lg:px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-1 lg:gap-2">
                      <DocumentTextIcon className="h-4 w-4" />
                      <span className="hidden lg:inline">Invoices</span>
                      <span className="lg:hidden">Inv.</span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 lg:px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-1 lg:gap-2">
                      <ClockIcon className="h-4 w-4 text-orange-500" />
                      Pending
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 lg:px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-1 lg:gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      Paid
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 lg:px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => {
                  

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-blue-50 transition-colors duration-150 group cursor-pointer"
                    >
                      {/* Customer Name with Avatar */}
                      <td className="px-3 lg:px-4 py-4">
                        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                          <GetRandomAvatar name={customer.name} />
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm lg:text-base text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {customer.name}
                            </div>
                            {customer.phone_no && (
                              <div className="flex items-center gap-1 text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1">
                                <PhoneIcon className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                  {customer.phone_no}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Total Invoices */}
                      <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <span className="hidden lg:inline">
                            {customer.total_invoices} invoices
                          </span>
                          <span className="lg:hidden">
                            {customer.total_invoices}
                          </span>
                        </div>
                      </td>

                      {/* Pending Amount */}
                      <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 lg:gap-2">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              (customer.total_pending+customer.total_partial) > 0
                                ? "bg-red-500 animate-pulse"
                                : "bg-gray-400"
                            }`}
                          ></div>
                          <span
                            className={`font-semibold text-xs lg:text-sm ${
                              (customer.total_pending+customer.total_partial) > 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {formatCurrency(customer.total_pending+customer.total_partial)}
                          </span>
                        </div>
                      </td>

                      {/* Paid Amount */}
                      <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 lg:gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span className="font-semibold text-xs lg:text-sm text-green-600">
                            {formatCurrency(customer.total_paid)}
                          </span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                        <CustomerActionButtons
                          customerId={customer.id}
                          customerName={customer.name}
                          currentFilter={filter}
                          pendingAmount={customer.total_pending+customer.total_partial}
                          layout="horizontal"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredCustomers.length > 0 && (
            <div className="bg-gray-50 px-3 lg:px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs lg:text-sm text-gray-600 gap-2">
                <span>
                  Showing {filteredCustomers.length}{" "}
                  {filter !== "all" && ` ${filter} `}
                  customers
                  {filter !== "all" && ` (${filterCounts.total} total)`}
                </span>
                <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Paid customers
                  </span>
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Pending payments
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No customers found
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {filter !== "all"
                ? `No ${filter} customers match your current filter.`
                : query
                ? `No customers match your search for "${query}". Try a different search term.`
                : "No customers available at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}