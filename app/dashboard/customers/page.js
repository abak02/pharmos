import React from 'react'
import Search from '@/app/ui/search'
import { CreateCustomer } from '@/app/ui/customers/buttons'
import { lusitana } from '@/app/ui/fonts'
import { fetchCustomerPages } from '@/app/lib/data'
import { Suspense } from 'react'
import { InvoicesTableSkeleton } from '@/app/ui/skeletons'
import CustomersTable from '@/app/ui/customers/table'
import Pagination from '@/app/ui/customers/pagination'


export default async function page({ searchParams }) {

  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchCustomerPages(query);
  const filter = searchParams?.filter || 'all';

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-3xl text-blue-600`}>Customers</h1>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 md:mt-8">
        <Suspense>
          <Search placeholder="Search customers..." />
        </Suspense>
        <CreateCustomer />
      </div>

      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <CustomersTable query={query} currentPage={currentPage} filter={filter} />
      </Suspense>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>

    </>
  )
}
