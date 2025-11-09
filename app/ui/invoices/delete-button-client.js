// app/ui/invoices/delete-button-client.jsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit"
      disabled={pending}
      className="rounded-md border p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="sr-only">Delete</span>
      <TrashIcon className={`w-5 ${pending ? 'text-gray-400' : 'text-red-500'}`} />
    </button>
  );
}

export function DeleteInvoiceClient({ deleteAction, id }) {
  const [state, formAction] = useFormState(deleteAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <DeleteButton />
    </form>
  );
}