import { fetchShopMedicines } from "@/app/lib/data";
import { DeleteShopMedicine, UpdateShopMedicine } from "./buttons";
import { formatQuantity, formatCurrency, DosageIcon, getDosageIconPath } from "@/app/lib/utils";
import {
  BuildingStorefrontIcon,
  CubeIcon,
  BeakerIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";

import StockIndicator from "./stock-indicator";
import Image from "next/image";

export default async function MedicineTable({ query, currentPage }) {
  const medicines = await fetchShopMedicines(query, currentPage);

  if (!medicines || medicines.length === 0) {
    return (
      <div className="mt-6 text-center py-16 px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <BeakerIcon className="h-10 w-10 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg font-semibold mb-2">
          No medicines found
        </p>
        <p className="text-gray-400 text-base max-w-sm mx-auto">
          {query
            ? `No results matching "${query}"`
            : "Get started by adding your first medicine"}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-3 p-4">
          {medicines.map((med) => {
            // const { borderColor } = getStockStatus(med.quantity);

            return (
              <div
                key={med.medicine_id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <div className="w-10 h-10  rounded-full flex items-center justify-center shadow-sm">
                        <DosageIcon dosageDescription={med.dosagedescription} size={30} />
                      </div>
                      <div className="">
                        <p className="text-md font-semibold">{med.brandname}</p>
                        {med.dosagedescription && (
                          <div className="flex items-center gap-1 border border-gray-200 mt-2 rounded-full px-2 py-1 bg-gray-50 shadow-sm">
                            <CubeIcon className="h-4 w-4 text-gray-400" />
                            <p className="text-sm text-center text-gray-500">
                              {med.dosagedescription}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <StockIndicator quantity={med.quantity} />
                </div>

                {/* Medicine Details */}
                <div className="grid grid-cols-2 gap-4 py-4 border-b">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Generic Name
                    </p>
                    <p className="text-md font-medium text-gray-900">
                      {med.genericname || "-"}
                    </p>
                    <p className="font-medium text-gray-600 text-sm">
                      {med.strength}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Manufacturer
                    </p>
                    <p className="text-md font-medium text-green-600">
                      {med.nameofthemanufacturer || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Quantity
                    </p>
                    <div className="flex items-center gap-1">
                      <CubeIcon className="h-4 w-4 text-blue-500" />
                      <p className="text-md font-semibold text-blue-600">
                        {formatQuantity(med.quantity)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Price</p>
                    <div className="flex items-center gap-1">
                      <span className="text-md font-semibold text-purple-600">
                        {formatCurrency(med.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <HashtagIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                          ID: {med.medicine_id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateShopMedicine id={med.medicine_id} />
                    <DeleteShopMedicine id={med.medicine_id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                  Medicine Details
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                  Manufacturer
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase  ">
                  Quantity
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                  Price
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {medicines.map((med) => {
                // const { color } = getStockStatus(med.quantity);
                return (
                  <tr
                    key={med.medicine_id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* Medicine Details */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 min-w-0">
                        
                          <DosageIcon dosageDescription={med.dosagedescription} size={30} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2  flex-wrap">
                            <h4 className="font-bold text-gray-900 text-sm truncate">
                              {med.brandname}
                            </h4>
                            {med.dosagedescription && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border flex-shrink-0">
                                {med.dosagedescription}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-gray-600 text-sm">
                            {med.strength}
                          </span>
                          <p className="text-sm text-gray-600 max-w-[250px] text-wrap">
                            {med.genericname}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Manufacturer */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <BuildingStorefrontIcon className="h-4 w-4 text-green-500" />
                        <span className="font-semibold truncate text-green-600 text-sm max-w-[180px]">
                          {med.nameofthemanufacturer || "-"}
                        </span>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <CubeIcon className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold text-blue-600 text-sm">
                          {formatQuantity(med.quantity)}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <StockIndicator quantity={med.quantity} />
                    </td>

                    {/* Price */}
                    <td className="px-4 py-4">
                      <span className="font-bold text-purple-600 text-sm">
                        {formatCurrency(med.price)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex justify-start gap-3">
                        <UpdateShopMedicine id={med.medicine_id} />
                        <DeleteShopMedicine id={med.medicine_id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Statistics */}
      {medicines.length > 0 && (
        <div className="mt-6 px-6 py-4 border border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/30 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                {medicines.length}{" "}
                {medicines.length === 1 ? ` medicine` : ` medicines`}
              </span>
              <span className="text-gray-500">found</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-2 whitespace-nowrap">
                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                <span className="font-medium text-gray-700">In Stock</span>
              </span>
              <span className="flex items-center gap-2 whitespace-nowrap">
                <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
                <span className="font-medium text-gray-700">Low Stock</span>
              </span>
              <span className="flex items-center gap-2 whitespace-nowrap">
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                <span className="font-medium text-gray-700">Out of Stock</span>
              </span>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
              <div className="font-bold text-gray-900">
                {medicines.reduce((sum, med) => sum + med.quantity, 0)}
              </div>
              <div className="text-gray-500">Total Quantity</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
              <div className="font-bold text-emerald-600">
                {medicines.filter((med) => med.quantity > 10).length}
              </div>
              <div className="text-gray-500">In Stock</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
              <div className="font-bold text-amber-600">
                {
                  medicines.filter(
                    (med) => med.quantity > 0 && med.quantity <= 10
                  ).length
                }
              </div>
              <div className="text-gray-500">Low Stock</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
              <div className="font-bold text-red-600">
                {medicines.filter((med) => med.quantity === 0).length}
              </div>
              <div className="text-gray-500">Out of Stock</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
