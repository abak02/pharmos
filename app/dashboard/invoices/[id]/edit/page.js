import Form from '@/app/ui/invoices/edit-form';

import { fetchInvoiceById, fetchCustomerById, fetchMedicineByInvoiceID, fetchInvoiceSummary } from '@/app/lib/data';
 import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
export default async function Page({params}) {
    const id = params.id;
    const invoice = await fetchInvoiceById(id);
    const customer = await fetchCustomerById(invoice?.customer_id);
    const medicineList = await fetchMedicineByInvoiceID(id);
    const invoiceSummary = await fetchInvoiceSummary(id);
    if(!invoice){
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
      <Form invoice={invoice}  customer={customer} medicineList={medicineList} invoiceSummary={invoiceSummary} />
    </main>
  );
}