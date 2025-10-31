import { UpdateInvoice, DeleteInvoice } from "@/app/ui/invoices/buttons";
import InvoiceStatus from "@/app/ui/invoices/status";
import { formatDateTimeToLocal, formatCurrency } from "@/app/lib/utils";
import { fetchFilteredInvoices } from "@/app/lib/data";
import GetRandomAvatar from "./gradient-avatar";
import {
  PhoneIcon,
  DocumentTextIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default async function InvoicesTable({
  query,
  currentPage,
  customerId = null,
  customerName = null,
  status = null,
}) {
  const invoices = await fetchFilteredInvoices(
    query,
    currentPage,
    customerId,
    status
  );

  return (
    <>
      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              {invoices?.map((invoice) => (
                <div
                  key={invoice.id}
                  className="mb-2 w-full rounded-md bg-white p-4"
                >
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <GetRandomAvatar name={invoice.name} />

                        <div className="">
                          <p className="text-md font-semibold">
                            {invoice.name}
                          </p>
                          <div className=" flex items-center gap-1 border border-gray-200 mt-2 rounded-full px-2 py-1 bg-gray-50 shadow-sm">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            <p className="text-sm text-gray-500">
                              {invoice.phone_no}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <InvoiceStatus status={invoice.status} />
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <div>
                      <p
                        className={` ${
                          invoice.status === "pending"
                            ? "text-red-400"
                            : "text-gray-600"
                        } whitespace-nowrap font-semibold text-xl mb-2`}
                      >
                        {formatCurrency(invoice.amount)}
                      </p>
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
              ))}
            </div>
            <table className="hidden min-w-full text-gray-900 md:table">
              <thead className="rounded-lg text-left text-md ">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-5 text-md uppercase font-Semibold text-gray-600 sm:pl-6"
                  >
                    Customer
                  </th>

                  <th
                    scope="col"
                    className="px-3 py-5 text-md uppercase font-Semibold text-gray-600"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-5 text-md uppercase font-Semibold text-gray-600"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-5  text-md uppercase font-Semibold text-gray-600"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative py-3 pl-6 pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {invoices?.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  >
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-4">
                        <GetRandomAvatar name={invoice.name} />
                        <div>
                          <p className="font-semibold text-gray-900 text-base">
                            {invoice.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                            <PhoneIcon className="h-4 w-4" />
                            <span>{invoice.phone_no}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      className={` ${
                        invoice.status === "pending"
                          ? "text-red-400"
                          : "text-gray-600"
                      } whitespace-nowrap font-semibold text-sm px-3 py-3`}
                    >
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 ">
                      {formatDateTimeToLocal(invoice.date)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <InvoiceStatus status={invoice.status} />
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        <UpdateInvoice id={invoice.id} />
                        <DeleteInvoice id={invoice.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modern Footer */}
      {invoices.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/30 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                {invoices.length}{" "}
                {invoices.length === 1 ? ` invoice` : ` invoices`}
              </span>
              <span className="text-gray-500">found</span>
              {customerId && (
                <span className="text-blue-600 font-medium">
                  for {customerName}
                </span>
              )}
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
          <p className="text-gray-500 text-lg font-semibold mb-2">
            No invoices found
          </p>
          <p className="text-gray-400 text-base max-w-sm mx-auto">
            {customerId
              ? `No invoices found for ${customerName}${
                  query ? ` matching "${query}"` : ""
                }`
              : query
              ? `No results matching "${query}"`
              : "Get started by creating your first invoice"}
          </p>
        </div>
      )}
    </>
  );
}
