import { formatCurrency, formatQuantity } from '@/app/lib/utils';
import { fetchFilteredMedicine } from '@/app/lib/data';

// Helper function to determine stock status and color
function getStockStatus(quantity) {
  if (quantity === 0) {
    return { status: 'out-of-stock', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  } else if (quantity <= 10) {
    return { status: 'low-stock', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
  } else {
    return { status: 'in-stock', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
  }
}

// Stock indicator component
function StockIndicator({ quantity }) {
  const { status, color, bgColor } = getStockStatus(quantity);
  
  const getStockText = (qty) => {
    if (qty === 0) return 'Out of Stock';
    if (qty <= 10) return 'Low Stock';
    return 'In Stock';
  };

  // Get dot color based on status
  const getDotColor = () => {
    if (quantity === 0) return 'bg-red-600';
    if (quantity <= 10) return 'bg-orange-600';
    return 'bg-green-600';
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${color}`}>
      <span className={`w-2 h-2 rounded-full mr-1 ${getDotColor()}`}></span>
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
            <div className="mt-6 text-center py-8">
                <p className="text-gray-500 text-lg">No medicines found</p>
                <p className="text-gray-400 text-sm mt-2">
                    {query ? `No results for "${query}"` : 'Try searching for a medicine'}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    
                    {/* Mobile View - Cards */}
                    <div className="md:hidden">
                        {medicines.map((medicine) => {
                            const { color, borderColor } = getStockStatus(medicine.quantity || 0);
                            return (
                                <div 
                                    key={medicine.id} 
                                    className={`mb-2 w-full rounded-md bg-white p-4 border-l-4 ${borderColor}`}
                                >
                                    <div className="flex items-center justify-between border-b pb-3">
                                        <div className="w-full">
                                            <p className="font-medium text-lg text-gray-900">{medicine.brandname}</p>
                                            {medicine.dosagedescription && (
                                                <p className="text-xs text-gray-500 mt-1">{medicine.dosagedescription}</p>
                                            )}
                                            <p className="text-sm text-gray-600 mt-1 break-words">{medicine.genericname}</p>
                                            <p className="text-sm text-green-600 font-medium mt-1">
                                                {medicine.nameofthemanufacturer}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex w-full items-center justify-between pt-3">
                                        <div>
                                            <p className="text-lg font-semibold text-blue-600">
                                                {formatCurrency(medicine.price)} TK
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className={`text-md font-semibold ${color}`}>
                                                    Qty: {formatQuantity(medicine.quantity || 0)}
                                                </p>
                                                <StockIndicator quantity={medicine.quantity || 0} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop View - Table */}
                    <table className="hidden min-w-full text-gray-900 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal bg-gray-100">
                            <tr>
                                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                    Brand Name
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Generic Name
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Manufacturer
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Quantity & Status
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Price
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white">
                            {medicines.map((medicine) => {
                                const { color } = getStockStatus(medicine.quantity || 0);
                                return (
                                    <tr
                                        key={medicine.id}
                                        className="w-full border-b py-3 text-sm last-of-type:border-none
                                            [&:first-child>td:first-child]:rounded-tl-lg
                                            [&:first-child>td:last-child]:rounded-tr-lg
                                            [&:last-child>td:first-child]:rounded-bl-lg
                                            [&:last-child>td:last-child]:rounded-br-lg
                                            hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{medicine.brandname}</span>
                                                {medicine.dosagedescription && (
                                                    <span className="text-xs text-gray-500 mt-1">
                                                        {medicine.dosagedescription}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="max-w-[300px] px-3 py-3 break-words">
                                            {medicine.genericname}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            <span className="text-green-600 font-medium">
                                                {medicine.nameofthemanufacturer}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`font-semibold ${color}`}>
                                                    {formatQuantity(medicine.quantity || 0)}
                                                </span>
                                                <StockIndicator quantity={medicine.quantity || 0} />
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            <span className="font-medium text-blue-600">
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