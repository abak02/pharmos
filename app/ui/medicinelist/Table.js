import { formatCurrency, formatQuantity } from '@/app/lib/utils';
import { fetchFilteredMedicine } from '@/app/lib/data';

// Helper function to determine stock status and color
function getStockStatus(quantity) {
  if (quantity === 0) {
    return { 
      status: 'out-of-stock', 
      color: 'text-red-600', 
      bgColor: 'bg-red-50', 
      borderColor: 'border-red-200',
    };
  } else if (quantity <= 10) {
    return { 
      status: 'low-stock', 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-50', 
      borderColor: 'border-orange-200',
    };
  } else {
    return { 
      status: 'in-stock', 
      color: 'text-green-600', 
      bgColor: 'bg-green-50', 
      borderColor: 'border-green-200',
    };
  }
}

// Minimal Stock Indicator component
function StockIndicator({ quantity }) {
  const { status, color, bgColor } = getStockStatus(quantity);
  
  const getStockText = (qty) => {
    if (qty === 0) return 'Out of Stock';
    if (qty <= 10) return 'Low Stock';
    return 'In Stock';
  };

  const getDotColor = () => {
    if (quantity === 0) return 'bg-red-500 animate-pulse';
    if (quantity <= 10) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${bgColor} ${color} border ${getStockStatus(quantity).borderColor}`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${getDotColor()}`}></span>
      {getStockText(quantity)}
    </div>
  );
}

export default async function MedicineTable({
    query,
    currentPage,
}) {
    const medicines = await fetchFilteredMedicine(query, currentPage);

    if (!medicines || medicines.length === 0) {
        return (
            <div className="mt-6 text-center py-12">
                <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">💊</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No medicines found</h3>
                    <p className="text-gray-500">
                        {query ? `No results for "${query}"` : 'Try searching for medicines'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                
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
                                        {formatCurrency(medicine.price)} TK
                                    </div>
                                </div>

                                {medicine.genericname && (
                                    <p className="text-gray-700 text-sm mb-3">
                                        {medicine.genericname}
                                    </p>
                                )}

                                {medicine.nameofthemanufacturer && (
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs text-gray-500">By</span>
                                        <span className="text-sm text-green-600">
                                            {medicine.nameofthemanufacturer}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <span className={`font-semibold ${getStockStatus(medicine.quantity || 0).color}`}>
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
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                    Medicine Details
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                    Generic Name
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                    Manufacturer
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                    Stock Status
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                    Price
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
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">
                                                    {medicine.brandname}
                                                </span>
                                                {medicine.dosagedescription && (
                                                    <span className="text-sm text-gray-600 mt-1">
                                                        {medicine.dosagedescription}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 max-w-[300px]">
                                            <div className="text-gray-700">
                                                {medicine.genericname}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="text-green-600 font-medium">
                                                {medicine.nameofthemanufacturer}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`font-semibold ${color}`}>
                                                    {formatQuantity(medicine.quantity || 0)}
                                                </span>
                                                <StockIndicator quantity={medicine.quantity || 0} />
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="font-bold text-blue-600">
                                                {formatCurrency(medicine.price)} TK
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