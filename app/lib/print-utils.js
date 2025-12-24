'use client';

import { fetchInvoiceSummary } from '@/app/lib/data';
import { formatDateTimeToLocal, formatPrintCurrency, formatCurrency } from '@/app/lib/utils';

export async function handlePrintInvoice(invoice) {
  try {
    // Fetch the detailed invoice summary
    const invoiceSummary = await fetchInvoiceSummary(invoice.id);
    
    const printWindow = window.open("", "_blank", "width=240,height=600");
    
    // Generate the receipt HTML using the same format as your POSReceipt
    const receiptHTML = generateReceiptHTML(invoiceSummary, invoiceSummary);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${invoiceSummary.id}</title>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { 
                margin: 0 !important; 
                padding: 0 !important; 
                font-family: 'Courier New', monospace !important;
                background: white !important;
              }
              @page { 
                margin: 0 !important; 
                size: 58mm auto !important;
              }
              * {
                box-sizing: border-box !important;
              }
              .print-hidden {
                display: none !important;
              }
            }
            body {
              font-family: 'Courier New', monospace !important;
              margin: 0 !important;
              padding: 4px !important;
              background: white !important;
              width: 58mm !important;
            }
          </style>
        </head>
        <body class="bg-white">
          ${receiptHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 300);
    
  } catch (error) {
    console.error('Error printing invoice:', error);
    throw new Error('Failed to print invoice');
  }
}

function generateReceiptHTML(invoice, invoiceSummary) {
  const medicineList = invoiceSummary.medicines || [];
  const customer = {
    name: invoiceSummary.customer_name,
    phone_no: invoiceSummary.customer_phone
  };

  // Calculate subtotal from medicines
  const subtotal = medicineList.reduce(
    (sum, medicine) => sum + (medicine.quantity * medicine.price_per_unit),
    0
  );

  // Calculate discount amount
  const discountAmount = invoiceSummary.discounted_amount;

  return `
    <div class="p-2 max-w-[58mm] mx-auto font-sans text-xs bg-white">
      <!-- Header - Compact -->
      <div class="text-center mb-2 border-b border-black pb-1">
        <h2 class="text-sm font-bold leading-tight">
          SHAMSER DRUG HOUSE
        </h2>
        <p class="text-[10px] text-gray-600">Collegemore, Kushtia</p>
        <p class="text-[10px]">${formatDateTimeToLocal(invoice.date)}</p>
      </div>

      <!-- Invoice & Customer Info - Single Line -->
      <div class="mb-2 space-y-[1px] text-[10px]">
        <div class="flex justify-between">
          <span>Invoice:</span>
          <span class="font-bold">#${invoice.id}</span>
        </div>
        <div class="flex justify-between">
          <span>Customer:</span>
          <span>${customer.name}</span>
        </div>
        <div class="flex justify-between">
          <span>Phone:</span>
          <span>${customer.phone_no}</span>
        </div>
      </div>

      <!-- Items Table - Ultra Compact -->
      <div class="mb-2">
        <!-- Table Header -->
        <div class="grid grid-cols-10 gap-0 text-[10px] font-bold border-b border-black pb-[1px] mb-1">
          <div class="col-span-5">ITEM</div>
          <div class="col-span-1 text-right">QTY</div>
          <div class="col-span-2 text-right">PRICE</div>
          <div class="col-span-2 text-right">TOTAL</div>
        </div>

        <!-- Items -->
        <div class="space-y-1 text-[10px]">
          ${medicineList.map((medicine, idx) => `
            <div class="grid grid-cols-10 gap-0 border-b border-dashed border-gray-300 pb-1">
              <div class="col-span-5 truncate leading-tight">
                ${medicine.brandname} ${medicine.strength}
              </div>
              <div class="col-span-1 text-right">${medicine.quantity}</div>
              <div class="col-span-2 text-right">
                ${formatPrintCurrency(medicine.price_per_unit)}
              </div>
              <div class="col-span-2 text-right font-bold">
                ${formatPrintCurrency(medicine.quantity * medicine.price_per_unit)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Totals Section - Compact -->
      <div class="border-t border-black pt-1 space-y-[1px] text-[10px]">
        <div class="flex justify-between">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>

        <div class="flex justify-between">
          <span>Discount:</span>
          <span>- ${formatCurrency(discountAmount)}</span> 
        </div>

        <div class="flex justify-between font-bold border-t border-black pt-[1px]">
          <span>Total:</span>
          <span>${formatCurrency(invoice.amount)}</span>
        </div>

        <div class="flex justify-between">
          <span>Given:</span>
          <span>${formatCurrency(invoiceSummary.total_given || 0)}</span>
        </div>

        <div class="flex justify-between font-bold border-t border-black pt-[1px]">
          <span>Change:</span>
          <span>${formatCurrency(invoiceSummary.total_change || 0)}</span>
        </div>
      </div>

      <!-- Footer - Minimal -->
      <div class="text-center mt-2 pt-1 border-t border-black">
        <p class="text-[9px] font-bold">Thank You!</p>
        <p class="text-[8px] text-gray-600">Visit Again</p>
      </div>

      <!-- Print-only spacer -->
      <div class="h-2 print-hidden"></div>
    </div>
  `;
}