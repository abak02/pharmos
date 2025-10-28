"use client";

import { useState } from 'react';
import {
  CheckIcon,
  ClockIcon,
  PencilSquareIcon,
  PrinterIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  UserCircleIcon,
  PhoneIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { updateInvoice } from "@/app/lib/actions";
import {
  formatCurrency,
  formatDateTimeToLocal,
} from "@/app/lib/utils";
import { lusitana } from "../fonts";
import POSReceipt from "./pos-receipt";
import toast from 'react-hot-toast'; // Import toast
import { useRouter } from 'next/navigation'; // Import useRouter

export default function EditInvoiceForm({ invoice, customer, medicineList }) {
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);

  const totalAmount = medicineList.reduce((sum, medicine) => sum + medicine.quantity * medicine.price_per_unit, 0);
  const discountAmount = totalAmount - invoice.amount;
  const changeAmount = invoice.given_amount - invoice.amount;

  const handlePrint = () => {
    const printContent = document.getElementById('pos-receipt');
    const printWindow = window.open('', '_blank', 'width=240,height=400');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoice.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              @page { margin: 0; size: 58mm auto; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    // printWindow.close();
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    
    try {
      const result = await updateInvoice(invoice.id, formData); 
      
      if (result?.success) {
        toast.success('Invoice updated successfully!');
        // Wait a bit for toast to show, then redirect
        setTimeout(() => {
          router.push('/dashboard/invoices');
          router.refresh();
        }, 1000);
      } else {
        throw new Error(result?.message || 'Failed to update invoice');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
          <span>Invoice ID:</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{invoice.id}</span>
        </div>
      </div>
      <form action={handleSubmit}>
        {/* Your existing form content */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h2 className={` ${lusitana.className} text-base text-blue-500 text-lg font-semibold  mb-3 sm:mb-4`}>Customer Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <UserCircleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Customer Name</span>
              </div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{customer.name}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Phone Number</span>
              </div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{customer.phone_no}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Invoice Date</span>
              </div>
              <p className="font-medium text-gray-900 text-xs sm:text-sm">{formatDateTimeToLocal(invoice.date)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-gray-50 p-4 md:p-6 mb-4 mt-4">
          <h2 className={`${lusitana.className} text-lg mb-2 text-blue-500`}>
            Purchased Medicines
          </h2>
          {medicineList.map((medicine, index) => (
            <li key={index} className="mb-4 p-3 bg-white rounded-lg border border-gray-200 list-none">
              <div className="md:hidden">
                <div className="mb-2">
                  <span className="font-medium text-gray-900 text-m">{medicine.brandname}</span>
                  {medicine.dosagedescription && (
                    <span className="text-xs text-gray-500 ml-1">({medicine.dosagedescription})</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div><span className="font-medium">Quantity:</span> <span className="ml-1">{medicine.quantity} pcs</span></div>
                  <div><span className="font-medium">Price:</span> <span className="ml-1">{formatCurrency(medicine.price_per_unit)}</span></div>
                  <div className="col-span-2">
                    <span className="font-medium">Total:</span>
                    <span className="ml-1 text-blue-600 font-medium">
                      {formatCurrency(medicine.quantity * medicine.price_per_unit)} Tk
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex justify-between items-center">
                <div className="flex items-center gap-3 text-sm flex-1">
                  <span className="font-medium text-gray-900 min-w-0 flex-1">{medicine.brandname}</span>
                  {medicine.dosagedescription && (
                    <span className="text-xs text-gray-500 flex-shrink-0">({medicine.dosagedescription})</span>
                  )}
                  <span className="text-gray-300">|</span>
                  <span className="flex-shrink-0">{medicine.quantity} pcs</span>
                  <span>×</span>
                  <span className="flex-shrink-0">{formatCurrency(medicine.price_per_unit)}</span>
                  <span>=</span>
                  <span className="font-medium text-blue-600 flex-shrink-0">
                    {formatCurrency(medicine.quantity * medicine.price_per_unit)} Tk
                  </span>
                </div>
              </div>
            </li>
          ))}
          <hr className="my-4" />
          {/* Summary */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-2 sm:space-y-3 max-w-md ml-auto">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(totalAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Discount:</span>
                  <span className="font-semibold text-red-600 text-sm sm:text-base">-{formatCurrency(discountAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-gray-300">
                  <span className="text-gray-900 font-semibold text-sm sm:text-base">Final Amount:</span>
                  <span className="font-bold text-green-600 text-base sm:text-lg">{formatCurrency(invoice.amount)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">Change Amount:</span>
                  <span className="font-semibold text-blue-600 text-sm sm:text-base">{formatCurrency(changeAmount)}</span>
                </div>
              </div>
            </div>
        </div>

        <div className="rounded-md bg-gray-50 p-4 md:p-6">
          <fieldset>
            <legend className="mb-2 block text-sm font-medium">Set the invoice status</legend>
            <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input id="pending" name="status" type="radio" value="pending" defaultChecked={invoice.status === "pending"} className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2" />
                  <label htmlFor="pending" className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                    Pending <ClockIcon className="h-4 w-4" />
                  </label>
                </div>
                <div className="flex items-center">
                  <input id="paid" name="status" type="radio" value="paid" defaultChecked={invoice.status === "paid"} className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2" />
                  <label htmlFor="paid" className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white">
                    Paid <CheckIcon className="h-4 w-4" />
                  </label>
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-4 sm:pt-6 border-t border-gray-200">
          <Link href="/dashboard/invoices" className="flex h-10 items-center rounded-md bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200">
            <XMarkIcon className="h-5 w-5 mr-2 text-red-500" />
            Cancel
          </Link>
          
          {/* Preview Toggle Button */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex h-10 items-center rounded-md bg-purple-500 px-4 text-sm font-medium text-white transition-colors hover:bg-purple-400"
          >
            {showPreview ? (
              <>
                <EyeSlashIcon className="h-5 w-5 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <EyeIcon className="h-5 w-5 mr-2" />
                Show Preview
              </>
            )}
          </button>
          
          <button 
            type="button" 
            onClick={handlePrint} 
            className="flex h-10 items-center rounded-md bg-green-500 px-4 text-sm font-medium text-white transition-colors hover:bg-green-400"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print Receipt
          </button>
          
          <button 
            className="flex h-10 items-center rounded-md bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50" 
            type="submit"
            disabled={isSubmitting}
          >
            <PencilSquareIcon className="h-5 w-5 mr-2" />
            {isSubmitting ? 'Updating...' : 'Edit Invoice'}
          </button>
        </div>
      </form>

      {/* Preview Section */}
      {showPreview && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <EyeIcon className="h-5 w-5 mr-2 text-blue-500" />
            POS Receipt Preview
          </h3>
          <div className="flex justify-center">
            <POSReceipt 
              invoice={invoice}
              customer={customer}
              medicineList={medicineList}
              showPreview={true}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              This is how the receipt will look when printed on thermal paper
            </p>
          </div>
        </div>
      )}

      {/* Hidden POS Receipt Component for actual printing */}
      <div className="hidden">
        <POSReceipt 
          invoice={invoice}
          customer={customer}
          medicineList={medicineList}
          showPreview={false}
        />
      </div>
      </div>
    </>
  );
}