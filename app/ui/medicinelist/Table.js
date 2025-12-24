import { DosageIcon, formatCurrency, formatQuantity } from "@/app/lib/utils";
import { fetchFilteredMedicine } from "@/app/lib/data";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import {
  PuzzlePieceIcon,
  BeakerIcon,
  BuildingLibraryIcon,
  ArchiveBoxIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
// Helper function to determine stock status
function getStockStatus(quantity) {
  if (quantity === 0) {
    return {
      status: "out-of-stock",
      color: "text-red-600",
      bgColor: "bg-red-50",
      dotColor: "bg-red-500",
      animation: "animate-pulse",
      borderColor: "border-red-300",
    };
  } else if (quantity <= 10) {
    return {
      status: "low-stock",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      dotColor: "bg-amber-500",
      borderColor: "border-amber-300",
    };
  } else {
    return {
      status: "in-stock",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      dotColor: "bg-emerald-500",
      borderColor: "border-emerald-300",
    };
  }
}

// Minimal Stock Indicator component
function StockIndicator({ quantity }) {
  const { color, bgColor, dotColor, animation } = getStockStatus(quantity);

  const getStockText = () => {
    if (quantity === 0) return "Out of stock";
    if (quantity <= 10) return "Low stock";
    return "In stock";
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${bgColor} ${color} `}
    >
      <span className={`w-2 h-2 ${animation} rounded-full ${dotColor}`}></span>
      {getStockText()}
    </div>
  );
}

export default async function MedicineTable({ query, currentPage }) {
  const medicines = await fetchFilteredMedicine(query, currentPage);

  if (!medicines || medicines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">💊</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No medicines found
        </h3>
        <p className="text-gray-500 max-w-sm">
          {query
            ? `No results found for "${query}"`
            : "Try searching for medicines by name or brand"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3 p-4">
        {medicines.map((medicine) => {
          const { borderColor } = getStockStatus(medicine.quantity || 0);
          return (
            <div
              key={medicine.id}
              className={`rounded-lg bg-white p-4 border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {medicine.brandname}
                  </h3>
                  {medicine.dosagedescription && (
                    <p className="text-sm text-gray-600 mt-1">
                      {medicine.dosagedescription}
                    </p>
                  )}
                </div>
                <div className="text-blue-600 font-bold ml-2">
                  {formatCurrency(medicine.price)}
                </div>
              </div>

              {medicine.genericname && (
                <p className="text-gray-700 text-sm mb-1">
                  {medicine.genericname}
                </p>
              )}
              {medicine.strength && (
                <p className="text-gray-700 font-semibold text-sm mb-3">
                  {medicine.strength}
                </p>
              )}

              {medicine.nameofthemanufacturer && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500">By</span>
                  <span className="text-sm text-green-600 font-semibold">
                    {medicine.nameofthemanufacturer}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span
                  className={`font-semibold ${
                    getStockStatus(medicine.quantity || 0).color
                  }`}
                >
                  {formatQuantity(medicine.quantity || 0)}
                </span>
                <StockIndicator quantity={medicine.quantity || 0} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <PuzzlePieceIcon className="h-4 w-4 text-blue-600" />
                    Medicine Name
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <BeakerIcon className="h-4 w-4 text-purple-600" />
                    Generic Name
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <BuildingLibraryIcon className="h-4 w-4 text-amber-600" />
                    Manufacturer
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <ArchiveBoxIcon className="h-4 w-4 text-emerald-600" />
                    Stock
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                    Price
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {medicines.map((medicine) => {
                const { color } = getStockStatus(medicine.quantity || 0);
                return (
                  <tr
                    key={medicine.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* Medicine Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DosageIcon
                          dosageDescription={medicine.dosagedescription}
                          size={30}
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 text-sm">
                            {medicine.brandname}
                          </span>
                          {medicine.dosagedescription && (
                            <span className="text-sm text-gray-500 mt-1">
                              {medicine.dosagedescription}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Generic Name */}
                    <td className="px-6 py-4">
                      <div>
                        <span className="bg-white text-gray-800 max-w-[200px] line-clamp-2 px-3 py-1.5 rounded-full border border-gray-300 text-sm font-semibold shadow-sm hover:shadow-md transition-shadow duration-200">
                          {medicine.strength}
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm max-w-[200px] line-clamp-2 mt-2">
                        {medicine.genericname}
                      </div>
                    </td>

                    {/* Manufacturer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <BuildingStorefrontIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-green-600 text-sm font-medium truncate max-w-[180px]">
                          {medicine.nameofthemanufacturer}
                        </span>
                      </div>
                    </td>

                    {/* Stock Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`font-medium text-sm ${color}`}>
                          {formatQuantity(medicine.quantity || 0)}
                        </span>
                        <StockIndicator quantity={medicine.quantity || 0} />
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600 text-sm">
                        {formatCurrency(medicine.price)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
