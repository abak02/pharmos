import React from 'react'

import Pagination from '@/app/ui/medicinelist/pagination';
import Search from '@/app/ui/search';
import { lusitana } from '@/app/ui/fonts';
import Table from '@/app/ui/medicinelist/Table';
import { MedicinesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchMedicinePages} from '@/app/lib/data';
export default async function page({searchParams}) {
    
   const query = searchParams?.query||'';
   const currentPage = Number(searchParams?.page)||1;
   const totalPages = await fetchMedicinePages(query);
  return (
    <div >
    
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-3xl text-sky-500`}>Medicine List</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search by Brand Name or Generic Name ..." />
        {/* <CreateInvoice /> */}
      </div>
       <Suspense key={query + currentPage} fallback={<MedicinesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
    </div>
  )
}
