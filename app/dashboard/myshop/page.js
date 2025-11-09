import Pagination from '@/app/ui/myshop/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/myshop/table';
import { CreateShopMedicine } from '@/app/ui/myshop/buttons';
import { lusitana } from '@/app/ui/fonts';
import { ShopTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchShopPages } from '@/app/lib/data';

export const metadata = {
  title: 'Shop Inventory',
};

export default async function Page({ searchParams }) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchShopPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-3xl text-blue-600`}>Shop Inventory</h1>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search medicines..." />
        <CreateShopMedicine />
      </div>

      <Suspense key={query + currentPage} fallback={<ShopTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
