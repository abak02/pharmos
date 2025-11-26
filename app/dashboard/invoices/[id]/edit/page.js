import Form from '@/app/ui/invoices/edit-form';

import { fetchInvoiceById, fetchCustomerById, fetchMedicineByInvoiceID, fetchInvoiceSummary } from '@/app/lib/data';
 import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
export default async function Page({params}) {
    const id = params.id;
    const invoiceSummary = await fetchInvoiceSummary(id);
    if(!invoiceSummary){
        notFound();
    }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form  invoiceSummary={invoiceSummary} />
    </main>
  );
}