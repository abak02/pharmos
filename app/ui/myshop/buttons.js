import { deleteShopMedicine } from '@/app/lib/actions';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function CreateShopMedicine() {
  return (
    <Link
      href="/dashboard/myshop/addmedicine"
      className="flex h-10 items-center rounded-md bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
    >
      <span className="hidden md:block">Add Medicine</span>
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateShopMedicine({ id }) {
  return (
    <Link
      href={`/dashboard/myshop/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteShopMedicine({ id }) {
  const deleteMedicineWithId = deleteShopMedicine.bind(null, id);

  return (
    <form action={deleteMedicineWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5 text-red-500" />
      </button>
    </form>
  );
}
