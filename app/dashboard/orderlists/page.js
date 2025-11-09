// app/dashboard/orderlist/page.js
import ManufacturerList from '@/app/ui/orderlists/manufacturer-list';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
  return (
    <main className="p-6 space-y-6">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          {
            label: 'Order Lists',
            href: '/dashboard/orderlists',
            active: true,
          },
        ]}
      />
      
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className={` ${lusitana.className} text-2xl font-bold text-blue-600`}>📋 Order List - By Manufacturer</h1>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-600">
            Select a manufacturer to view their low stock items that need to be reordered.
          </p>
        </div>

        <ManufacturerList />
      </div>
    </main>
  );
}