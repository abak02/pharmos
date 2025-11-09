import CreateInvoice from '@/app/ui/invoices/create-form'
import React from 'react'
import { fetchFilteredMedicineForSuggestion } from '@/app/lib/data'
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';


export default async function page({searchParams}) {
  const query = searchParams?.query;
  const filteredMedicines = await fetchFilteredMedicineForSuggestion(query);
  return (
    <>
    <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      
      <div className=" w-full">
        
          <CreateInvoice filteredMedicines={filteredMedicines} />
        
      </div>


    </>
  )
}
