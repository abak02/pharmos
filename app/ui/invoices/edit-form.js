"use client";

import { useState, useEffect } from "react";
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
  CurrencyBangladeshiIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { updateInvoice } from "@/app/lib/actions";
import { formatCurrency, formatDateTimeToLocal } from "@/app/lib/utils";
import { lusitana } from "../fonts";
import POSReceipt from "./pos-receipt";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function EditInvoiceForm({ invoiceSummary }) {
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [givenAmount, setGivenAmount] = useState(
    invoiceSummary?.latest_given_amount?.toString() || ""
  );
  const [changeAmount, setChangeAmount] = useState(0);
  const [autoSelectedStatus, setAutoSelectedStatus] = useState(
    invoiceSummary?.status || "pending"
  );

  const router = useRouter();

  // Calculate derived values - these can be after hooks but before conditional returns
  const totalAmount =
    invoiceSummary?.medicines?.reduce(
      (sum, medicine) => sum + medicine.quantity * medicine.price_per_unit,
      0
    ) || 0;
  const discountAmount = invoiceSummary?.discounted_amount || 0;
  const finalAmount = invoiceSummary?.amount || 0;
  const paidAmount = invoiceSummary?.paid_amount || 0;
  const pendingAmount = finalAmount - paidAmount;

  // Check invoice status
  const isPaidInvoice = invoiceSummary?.status === "paid";
  const isPartialInvoice = invoiceSummary?.status === "partial";
  const isPendingInvoice = invoiceSummary?.status === "pending";

  // Payment calculation effect
  useEffect(() => {
    if (!invoiceSummary) return;

    const autoSetStatus = (givenAmount, changeAmount) => {
      if (isPartialInvoice) {
        // For partial invoices
        if (givenAmount >= pendingAmount) {
          setAutoSelectedStatus("paid");
        } else if (givenAmount > 0) {
          setAutoSelectedStatus("partial");
        } else {
          setAutoSelectedStatus(invoiceSummary.status);
        }
      } else {
        // For pending invoices
        if (givenAmount >= finalAmount) {
          setAutoSelectedStatus("paid");
        } else if (givenAmount > 0) {
          setAutoSelectedStatus("partial");
        } else {
          setAutoSelectedStatus("pending");
        }
      }
    };

    if (givenAmount && !isNaN(givenAmount)) {
      const given = parseFloat(givenAmount);
      let change = 0;

      if (isPartialInvoice) {
        change = given - pendingAmount;
        setChangeAmount(change >= 0 ? change : 0);
      } else {
        change = given - finalAmount;
        setChangeAmount(change >= 0 ? change : 0);
      }

      autoSetStatus(given, change);
    } else {
      setChangeAmount(0);
      if (invoiceSummary.status === "pending") {
        setAutoSelectedStatus("pending");
      }
    }
  }, [
    givenAmount,
    finalAmount,
    pendingAmount,
    isPartialInvoice,
    invoiceSummary,
  ]);

  // Function to handle manual status selection
  const handleAutoStatus = (selectedStatus) => {
    setAutoSelectedStatus(selectedStatus);

    if (selectedStatus === "paid") {
      const requiredAmount = isPartialInvoice ? pendingAmount : finalAmount;
      if (!givenAmount || parseFloat(givenAmount) < requiredAmount) {
        setGivenAmount(requiredAmount.toString());
      }
    }

    if (selectedStatus === "pending") {
      setGivenAmount("");
      setChangeAmount(0);
    }
  };

  // Function to get auto-status message
  const getAutoStatusMessage = () => {
    if (!givenAmount || parseFloat(givenAmount) === 0) {
      return "No payment entered - will remain as Pending";
    }

    const given = parseFloat(givenAmount);
    const requiredAmount = isPartialInvoice ? pendingAmount : finalAmount;

    if (given >= requiredAmount) {
      return `Payment covers full amount (${formatCurrency(
        given
      )} ≥ ${formatCurrency(requiredAmount)}) - will mark as Paid`;
    } else if (given > 0) {
      return `Partial payment (${formatCurrency(given)} of ${formatCurrency(
        requiredAmount
      )}) - will mark as Partial`;
    }

    return "Enter payment amount to auto-detect status";
  };

  const handlePrint = () => {
    const printContent = document.getElementById("pos-receipt");
    const printWindow = window.open("", "_blank", "width=240,height=400");

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoiceSummary.id}</title>
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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isPaidInvoice) {
      toast.error("Cannot update a paid invoice.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("status", autoSelectedStatus);
      formData.append("givenAmount", givenAmount || "0");

      const result = await updateInvoice(invoiceSummary.id, formData);

      if (result?.success) {
        toast.success("Invoice updated successfully!");
        setTimeout(() => {
          router.push("/dashboard/invoices");
          router.refresh();
        }, 1000);
      } else {
        throw new Error(result?.message || "Failed to update invoice");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
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
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
              {invoiceSummary.id}
            </span>
            <span
              className={clsx("px-2 py-1 rounded text-xs font-medium", {
                "bg-green-100 text-green-800": isPaidInvoice,
                "bg-blue-100 text-blue-800": isPartialInvoice,
                "bg-orange-100 text-orange-800": isPendingInvoice,
              })}
            >
              {isPaidInvoice
                ? "PAID"
                : isPartialInvoice
                ? "PARTIAL"
                : "PENDING"}
            </span>
          </div>
        </div>

        {isPaidInvoice && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckIcon className="h-5 w-5" />
              <span className="font-medium">
                This invoice has been fully paid.
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Paid invoices cannot be modified. If you need to make changes,
              please create a new invoice.
            </p>
          </div>
        )}

        {isPartialInvoice && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <CurrencyBangladeshiIcon className="h-5 w-5" />
              <span className="font-medium">
                This invoice has partial payment.
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Paid: {formatCurrency(paidAmount)} | Pending:{" "}
              {formatCurrency(pendingAmount)}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h2
              className={`${lusitana.className} text-base text-blue-500 text-lg font-semibold mb-3 sm:mb-4`}
            >
              Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <UserCircleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Customer Name</span>
                </div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {invoiceSummary.customer_name}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Phone Number</span>
                </div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {invoiceSummary.customer_phone}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Invoice Date</span>
                </div>
                <p className="font-medium text-gray-900 text-xs sm:text-sm">
                  {formatDateTimeToLocal(invoiceSummary.date)}
                </p>
                <p className="font-medium text-gray-500 text-xs sm:text-sm">
                  Last Updated: {formatDateTimeToLocal(invoiceSummary.time)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Status Summary */}
          {(isPaidInvoice || isPartialInvoice) && invoiceSummary && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Payment Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(invoiceSummary.amount)}
                  </div>
                  <div className="text-gray-600">Total Amount</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(invoiceSummary.total_paid)}
                  </div>
                  <div className="text-green-600">Paid Amount</div>
                </div>
                {isPartialInvoice && (
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {formatCurrency(invoiceSummary.remaining_amount)}
                    </div>
                    <div className="text-orange-600">Pending Amount</div>
                  </div>
                )}
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(invoiceSummary.total_given || 0)}
                  </div>
                  <div className="text-blue-600">Total Given</div>
                </div>
              </div>

              {(invoiceSummary.total_change || 0) > 0 && (
                <div className="mt-3 text-center">
                  <span className="text-sm text-gray-600">
                    Total Change Returned:{" "}
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(invoiceSummary.total_change)}
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Purchased Medicines */}
          <div className="rounded-md bg-gray-50 p-4 md:p-6 mb-4 mt-4">
            <h2 className={`${lusitana.className} text-lg mb-2 text-blue-500`}>
              Purchased Medicines
            </h2>
            {invoiceSummary.medicines.map((medicine, index) => (
              <li
                key={medicine.id || index}
                className="mb-4 p-3 bg-white rounded-lg border border-gray-200 list-none"
              >
                <div className="md:hidden">
                  <div className="mb-2">
                    <span className="font-medium text-gray-900 text-m">
                      {medicine.brandname}
                    </span>
                    {medicine.dosagedescription && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({medicine.dosagedescription})
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Quantity:</span>{" "}
                      <span className="ml-1">{medicine.quantity} pcs</span>
                    </div>
                    <div>
                      <span className="font-medium">Price:</span>{" "}
                      <span className="ml-1">
                        {formatCurrency(medicine.price_per_unit)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Total:</span>
                      <span className="ml-1 text-blue-600 font-medium">
                        {formatCurrency(
                          medicine.quantity * medicine.price_per_unit
                        )}{" "}
                        Tk
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex justify-between items-center">
                  <div className="flex items-center gap-3 text-sm flex-1">
                    <span className="font-medium text-gray-900 min-w-0 flex-1">
                      {medicine.brandname}
                    </span>
                    {medicine.dosagedescription && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({medicine.dosagedescription})
                      </span>
                    )}
                    <span className="text-gray-300">|</span>
                    <span className="flex-shrink-0">
                      {medicine.quantity} pcs
                    </span>
                    <span>×</span>
                    <span className="flex-shrink-0">
                      {formatCurrency(medicine.price_per_unit)}
                    </span>
                    <span>=</span>
                    <span className="font-medium text-blue-600 flex-shrink-0">
                      {formatCurrency(
                        medicine.quantity * medicine.price_per_unit
                      )}{" "}
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
                  <span className="text-xs sm:text-sm text-gray-600">
                    Subtotal:
                  </span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Discount:
                  </span>
                  <span className="font-semibold text-red-600 text-sm sm:text-base">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Total Amount:
                  </span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    {formatCurrency(invoiceSummary.amount)}
                  </span>
                </div>

                {/* Show previous payments and pending amount for partial invoices */}
                {isPartialInvoice && (
                  <>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Paid Amount:
                      </span>
                      <span className="font-semibold text-green-600 text-sm sm:text-base">
                        {formatCurrency(paidAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Pending Amount:
                      </span>
                      <span className="font-semibold text-orange-600 text-sm sm:text-base">
                        {formatCurrency(pendingAmount)}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-gray-300">
                  <span className="text-gray-900 font-semibold text-sm sm:text-base">
                    {isPartialInvoice ? "Amount Due:" : "Final Amount:"}
                  </span>
                  <span
                    className={`font-bold text-sm sm:text-lg ${
                      isPartialInvoice ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    {formatCurrency(
                      isPartialInvoice ? pendingAmount : finalAmount
                    )}
                  </span>
                </div>

                {/* Payment Section - Only show for pending/partial invoices */}
                {(isPendingInvoice || isPartialInvoice) && (
                  <>
                    <div className="flex justify-between items-center py-1 pt-4">
                      <label
                        htmlFor="givenAmount"
                        className="text-xs sm:text-sm text-gray-600"
                      >
                        Payment Amount:
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="givenAmount"
                          name="givenAmount"
                          placeholder="0"
                          value={givenAmount}
                          onChange={(e) => setGivenAmount(e.target.value)}
                          className="w-24 rounded-md border border-gray-300 py-1.5 px-3 text-right text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          min={0}
                          step="1"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                          TK
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Change Amount:
                      </span>
                      <span className="font-semibold text-blue-600 text-sm sm:text-base">
                        {formatCurrency(changeAmount)}
                      </span>
                    </div>

                    {isPartialInvoice && (
                      <div className="flex justify-between items-center text-xs text-orange-600">
                        <span>Remaining after this payment:</span>
                        <span className="font-semibold">
                          {changeAmount > 0
                            ? formatCurrency(0)
                            : formatCurrency(
                                pendingAmount - parseFloat(givenAmount || 0)
                              )}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Show payment details for paid invoices */}
                {isPaidInvoice && (
                  <>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Total Given Amount:
                      </span>
                      <span className="font-semibold text-yellow-600 text-sm sm:text-base">
                        {formatCurrency(invoiceSummary.total_given)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Total Change Amount:
                      </span>
                      <span className="font-semibold text-blue-600 text-sm sm:text-base">
                        {formatCurrency(invoiceSummary.total_change)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Field - Only show for pending/partial invoices */}
          {(isPendingInvoice || isPartialInvoice) && (
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
              <fieldset>
                <legend className="mb-2 block text-sm font-medium">
                  Payment Status
                </legend>
                <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <input
                        id="pending"
                        name="status"
                        type="radio"
                        value="pending"
                        checked={autoSelectedStatus === "pending"}
                        onChange={() => handleAutoStatus("pending")}
                        className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                      />
                      <label
                        htmlFor="pending"
                        className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-orange-100 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600"
                      >
                        Pending <ClockIcon className="h-4 w-4" />
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="partial"
                        name="status"
                        type="radio"
                        value="partial"
                        checked={autoSelectedStatus === "partial"}
                        onChange={() => handleAutoStatus("partial")}
                        className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                      />
                      <label
                        htmlFor="partial"
                        className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600"
                      >
                        Partial <CurrencyBangladeshiIcon className="h-4 w-4" />
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="paid"
                        name="status"
                        type="radio"
                        value="paid"
                        checked={autoSelectedStatus === "paid"}
                        onChange={() => handleAutoStatus("paid")}
                        className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                      />
                      <label
                        htmlFor="paid"
                        className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                      >
                        Paid <CheckIcon className="h-4 w-4" />
                      </label>
                    </div>
                  </div>

                  {/* Auto-status indicator */}
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Auto-detection:</span>
                      <span className="text-yellow-700">
                        {getAutoStatusMessage()}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-gray-600">
                    💡 The system will automatically determine the final status
                    based on the payment amount. You can manually override by
                    selecting a specific status.
                  </p>
                </div>
              </fieldset>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-4 sm:pt-6 border-t border-gray-200">
            <Link
              href="/dashboard/invoices"
              className="flex h-10 items-center rounded-md bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
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

            {/* Update Button - Disabled for paid invoices */}
            <button
              className={`flex h-10 items-center rounded-md px-4 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isPaidInvoice
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-400 focus-visible:outline-blue-500 active:bg-blue-600"
              }`}
              type="submit"
              disabled={isSubmitting || isPaidInvoice}
            >
              <PencilSquareIcon className="h-5 w-5 mr-2" />
              {isSubmitting
                ? "Updating..."
                : isPaidInvoice
                ? "Invoice Paid"
                : "Update Invoice"}
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
                invoice={invoiceSummary}
                customer={{
                  name: invoiceSummary.customer_name,
                  phone_no: invoiceSummary.customer_phone,
                }}
                medicineList={invoiceSummary.medicines}
                showPreview={true}
                invoiceSummary={invoiceSummary}
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
            invoice={invoiceSummary}
            customer={{
              name: invoiceSummary.customer_name,
              phone_no: invoiceSummary.customer_phone,
            }}
            medicineList={invoiceSummary.medicines}
            showPreview={false}
            invoiceSummary={invoiceSummary}
          />
        </div>
      </div>
    </>
  );
}
