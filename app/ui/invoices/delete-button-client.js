// app/ui/invoices/delete-button-client.jsx
'use client';

import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function DeleteInvoiceClient({ deleteAction, id }) {
  const [isPending, setIsPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setShowConfirm(false);
    setIsPending(true);

    try {
      const result = await deleteAction(id);
      
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred while deleting the invoice');
      console.error('Delete error:', error);
    } finally {
      setIsPending(false);
    }
  };

  const openConfirm = () => setShowConfirm(true);
  const closeConfirm = () => setShowConfirm(false);

  return (
    <>
      <button 
        onClick={openConfirm}
        disabled={isPending}
        className="rounded-md border p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="sr-only">Delete</span>
        <TrashIcon className={`w-5 ${isPending ? 'text-gray-400' : 'text-red-500'}`} />
      </button>

      {/* Modern Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeConfirm}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl transform transition-all">
            {/* Close Button */}
            <button
              onClick={closeConfirm}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <TrashIcon className="w-6 h-6 text-red-500" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Invoice
              </h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete this invoice? This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeConfirm}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}