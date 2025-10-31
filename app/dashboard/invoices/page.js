// app/dashboard/invoices/page.js
import Pagination from "@/app/ui/invoices/pagination";
import Search from "@/app/ui/search";
import Table from "@/app/ui/invoices/table";
import { CreateInvoice } from "@/app/ui/invoices/buttons";
import { lusitana } from "@/app/ui/fonts";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";
import { fetchInvoicesPages } from "@/app/lib/data";
import { XMarkIcon, UserIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default async function Page({ searchParams }) {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const customerId = searchParams?.customer;
  const customerName = searchParams?.name;
  const status = searchParams?.status;

  const totalPages = await fetchInvoicesPages(query, customerId);

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>

      {/* Customer Filter Banner */}
      {customerId && (
        <div className="mb-6 mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-xl">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  Invoices for {customerName || "Customer"}
                </h3>
                <p className="text-sm text-blue-700">
                  Showing invoices filtered by this customer
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/invoices"
              className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              <XMarkIcon className="h-4 w-4" />
              Clear Filter
            </Link>
          </div>
        </div>
      )}

      <Suspense
        key={query + currentPage + customerId}
        fallback={<InvoicesTableSkeleton />}
      >
        <Table
          query={query}
          currentPage={currentPage}
          customerId={customerId}
          customerName={customerName}
          status={status}
        />
      </Suspense>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </>
  );
}
