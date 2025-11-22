"use client";

import React, { useState } from "react";
import {
  CurrencyBangladeshiIcon,
  HashtagIcon,
  PencilSquareIcon,
  XMarkIcon,
  MedicalIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { lusitana } from "../fonts";
import { formatCurrency } from "@/app/lib/utils";

export default function ShopInventoryForm({
  shopMedicineList,
  medicineDetails,
  onEditMedicine,
}) {
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(medicineDetails?.price || "");

  const handleEdit = () => {
    onEditMedicine({
      id: shopMedicineList?.medicine_id,
      quantity,
      price,
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleEdit();
      }}
      className="rounded-md bg-gray-50 p-4 md:p-6"
    >
      {/* Medicine Details Section */}
      <div className="rounded-2xl bg-white p-6 mb-6 border border-blue-100 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <HeartIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h2
            className={`text-2xl font-bold text-gray-900 ${lusitana.className}`}
          >
            Pharmaceutical Details
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-blue-600 mb-1">
                Brand Name
              </label>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="font-medium text-gray-900">
                  {medicineDetails?.brandname || "Not available"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-600 mb-1">
                Generic Name
              </label>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="font-medium text-gray-900">
                  {medicineDetails?.genericname || "Not available"} {medicineDetails?.strength || ""}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-purple-600 mb-1">
                Dosage Form
              </label>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="font-medium text-gray-900">
                  {medicineDetails?.dosagedescription || "Not available"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-orange-600 mb-1">
                Manufacturer
              </label>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="font-medium text-gray-900">
                  {medicineDetails?.nameofthemanufacturer || "Not available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="rounded-md bg-gray-50 p-4 md:p-6 mb-4 border border-gray-200">
        <h2
          className={`text-xl mb-4 text-blue-500 font-semibold ${lusitana.className}`}
        >
          Edit Stock Information
        </h2>
        {/* Warning Message */}
        <div className="mb-6 rounded-md border-l-4 border-red-500 bg-red-50 p-4">
          <h4 className="text-sm font-semibold text-red-700 mb-1">
            ⚠ Important Notice
          </h4>
          <p className="text-sm text-red-600">
            If you want to{" "}
            <span className="font-semibold">update price only</span>, set the
            quantity to <span className="font-semibold">0</span>.<br />
            If you insert the quantity by mistake, please{" "}
            <span className="font-semibold">
              delete the medicine from the shop inventory
            </span>{" "}
            and add it again.
          </p>
        </div>

        {/* Quantity Section */}
        <div className="mb-4">
          <label
            htmlFor="quantity"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Quantity to Add
          </label>

          <p className="text-md text-blue-500 mb-2">
            Current stock:{" "}
            <span className="font-semibold">{shopMedicineList?.quantity}</span>{" "}
            units
          </p>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <HashtagIcon className="h-5 w-5 text-gray-500" />
            </span>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter quantity to add (0 to update price only)"
              min="0"
            />
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <label
            htmlFor="price"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Price (per unit)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <CurrencyBangladeshiIcon className="h-5 w-5 text-gray-500" />
            </span>
            <input
              type="text"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter price"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/myshop"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          <XMarkIcon className="h-5 w-5 mr-2 text-red-500" />
          Cancel
        </Link>

        <button
          type="submit"
          className="flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        >
          <PencilSquareIcon className="h-5 w-5 mr-2" />
          Edit Medicine
        </button>
      </div>
    </form>
  );
}
