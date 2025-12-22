'use client';

import { formatDateTimeToLocal, formatPrintCurrency, formatCurrency } from '@/app/lib/utils';


export default function POSReceipt({ invoice, customer, medicineList, showPreview = false, invoiceSummary }) {
  return (
    <div
      id="pos-receipt"
      className={`${showPreview ? 'block' : 'hidden print:block'} p-2 max-w-[58mm] mx-auto font-sans text-xs bg-white ${showPreview ? 'border-2 border-dashed border-blue-500 shadow-lg' : ''}`}
    >
      {/* Header - Compact */}
      <div className="text-center mb-2 border-b border-black pb-1">
        <h2 className="text-sm font-bold leading-tight">
          SHAMSER DRUG HOUSE
        </h2>
        <p className="text-[10px] text-gray-600">Collegemore, Kushtia</p>
        <p className="text-[10px]">{formatDateTimeToLocal(invoice.date)}</p>
      </div>

      {/* Invoice & Customer Info - Single Line */}
      <div className="mb-2 space-y-[1px] text-[10px]">
        <div className="flex justify-between">
          <span>Invoice:</span>
          <span className="font-bold">#{invoice.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer:</span>
          <span>{customer.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Phone:</span>
          <span>{customer.phone_no}</span>
        </div>
      </div>

      {/* Items Table - Ultra Compact */}
      <div className="mb-2">
        {/* Table Header */}
        <div className="grid grid-cols-10 gap-0 text-[10px] font-bold border-b border-black pb-[1px] mb-1">
          <div className="col-span-5">ITEM</div>
          <div className="col-span-1 text-right">QTY</div>
          <div className="col-span-2 text-right">PRICE</div>
          <div className="col-span-2 text-right">TOTAL</div>
        </div>

        {/* Items */}
        <div className="space-y-1 text-[10px]">
          {medicineList.map((medicine, idx) => (
            <div
              key={idx}
              className="grid grid-cols-10 gap-0 border-b border-dashed border-gray-300 pb-1"
            >
              <div className="col-span-5 truncate leading-tight">
                {medicine.brandname}
              </div>
              <div className="col-span-1 text-right">{medicine.quantity}</div>
              <div className="col-span-2 text-right">
                {formatPrintCurrency(medicine.price_per_unit)}
              </div>
              <div className="col-span-2 text-right font-bold">
                {formatPrintCurrency(
                  medicine.quantity * medicine.price_per_unit
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Section - Compact */}
      <div className="border-t border-black pt-1 space-y-[1px] text-[10px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>
            {formatCurrency(
              medicineList.reduce(
                (sum, m) => sum + m.quantity * m.price_per_unit,
                0
              )
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Discount:</span>
          <span>
            -{" "}
            {formatCurrency(
              invoiceSummary.discounted_amount
            )}
          </span>
        </div>

        <div className="flex justify-between font-bold border-t border-black pt-[1px]">
          <span>Total:</span>
          <span>{formatCurrency(invoice.amount)}</span>
        </div>

        <div className="flex justify-between">
          <span>Given:</span>
          <span>{formatCurrency(invoiceSummary.total_given)}</span>
        </div>

        <div className="flex justify-between font-bold border-t border-black pt-[1px]">
          <span>Change:</span>
          <span>{formatCurrency(invoiceSummary.total_change)}</span>
        </div>
      </div>

      {/* Footer - Minimal */}
      <div className="text-center mt-2 pt-1 border-t border-black">
        <p className="text-[9px] font-bold">Thank You!</p>
        <p className="text-[8px] text-gray-600">Visit Again</p>
      </div>

      {/* Preview Info */}
      {showPreview && (
        <div className="text-center mt-4 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-[10px] font-bold text-blue-700">POS Receipt Preview</p>
          <p className="text-[8px] text-blue-600">This is how it will look when printed</p>
        </div>
      )}
    </div>
  );
}