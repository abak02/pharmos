import { fetchShopMedicines } from '@/app/lib/data';
import { DeleteShopMedicine, UpdateShopMedicine } from './buttons';
import { formatQuantity, formatCurrency } from '@/app/lib/utils';
import {
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CubeIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

// Helper function to determine stock status and color
function getStockStatus(quantity) {
  if (quantity === 0) {
    return { 
      status: 'out-of-stock', 
      color: 'text-red-600', 
      bgColor: 'bg-red-50', 
      borderColor: 'border-red-200',
      icon: XCircleIcon,
      iconColor: 'text-red-500'
    };
  } else if (quantity <= 10) {
    return { 
      status: 'low-stock', 
      color: 'text-amber-600', 
      bgColor: 'bg-amber-50', 
      borderColor: 'border-amber-200',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-amber-500'
    };
  } else {
    return { 
      status: 'in-stock', 
      color: 'text-emerald-600', 
      bgColor: 'bg-emerald-50', 
      borderColor: 'border-emerald-200',
      icon: CheckCircleIcon,
      iconColor: 'text-emerald-500'
    };
  }
}

// Stock indicator component with modern design
function StockIndicator({ quantity }) {
  const { status, color, bgColor, borderColor, icon: Icon, iconColor } = getStockStatus(quantity);
  
  const getStockText = (qty) => {
    if (qty === 0) return 'Out of Stock';
    if (qty <= 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${borderColor} ${bgColor} transition-all duration-200`}>
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <span className={`text-sm font-semibold ${color}`}>
        {getStockText(quantity)}
      </span>
    </div>
  );
}

// Compact stock indicator for mobile
function MobileStockIndicator({ quantity }) {
  const { status, color, bgColor, borderColor, icon: Icon, iconColor } = getStockStatus(quantity);
  
  const getStockText = (qty) => {
    if (qty === 0) return 'Out of Stock';
    if (qty <= 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg border ${borderColor} ${bgColor}`}>
      <Icon className={`h-3 w-3 ${iconColor}`} />
      <span className={`text-xs font-semibold ${color}`}>
        {getStockText(quantity)}
      </span>
    </div>
  );
}

export default async function Table({ query, currentPage }) {
  const medicines = await fetchShopMedicines(query, currentPage);

  if (!medicines || medicines.length === 0) {
    return (
      <div className="mt-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BeakerIcon className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No medicines found</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          {query ? `No results for "${query}"` : 'Get started by adding your first medicine.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 md:p-6">
          
          {/* Mobile View - Modern Cards */}
          <div className="md:hidden space-y-4">
            {medicines.map((med) => {
              const { borderColor } = getStockStatus(med.quantity);
              
              return (
                <div 
                  key={med.medicine_id} 
                  className={`group bg-white rounded-2xl p-5 border-2 ${borderColor} shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                          <BeakerIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg truncate">{med.brandname}</h3>
                          {med.dosagedescription && (
                            <p className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600 mt-1 border">{med.dosagedescription}</p>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">{med.genericname}</p>
                      
                      {med.nameofthemanufacturer && (
                        <div className="flex items-center gap-2 mt-2">
                          <BuildingStorefrontIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{med.nameofthemanufacturer}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${getStockStatus(med.quantity).bgColor} border transition-all duration-200`}>
                      <CubeIcon className={`h-4 w-4 ${getStockStatus(med.quantity).color}`} />
                      <span className={`text-sm font-bold ${getStockStatus(med.quantity).color}`}>
                        {formatQuantity(med.quantity)}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                      <span className="text-sm font-semibold">{formatCurrency(med.price)}</span>
                      
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-4">
                    <MobileStockIndicator quantity={med.quantity} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-medium">
                      ID: {med.medicine_id.slice(0, 8)}...
                    </span>
                    <div className="flex gap-2">
                      <UpdateShopMedicine id={med.medicine_id} />
                      <DeleteShopMedicine id={med.medicine_id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View - Modern table with original structure */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal bg-gradient-to-r from-gray-50 to-gray-50">
              <tr>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Medicine
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Manufacturer
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Quantity
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Price
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {medicines.map((med) => {
                const { color, bgColor, borderColor } = getStockStatus(med.quantity);
                return (
                  <tr
                    key={med.medicine_id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none
                      [&:first-child>td:first-child]:rounded-tl-lg
                      [&:first-child>td:last-child]:rounded-tr-lg
                      [&:last-child>td:first-child]:rounded-bl-lg
                      [&:last-child>td:last-child]:rounded-br-lg
                      hover:bg-gray-50/80 transition-all duration-200 group"
                  >
                    {/* Medicine Details */}
                    <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                              <BeakerIcon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-bold text-gray-900 text-sm truncate">{med.brandname}</h4>
                                {med.dosagedescription && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border flex-shrink-0">
                                    {med.dosagedescription}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 max-w-[250px] text-wrap">{med.genericname}</p>
                            </div>
                          </div>
                        </td>

                    

                    {/* Manufacturer */}
                    <td className="whitespace-nowrap px-3 py-3">
                      {med.nameofthemanufacturer ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BuildingStorefrontIcon className="h-4 w-4 text-gray-400" />
                          <span>{med.nameofthemanufacturer}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${bgColor} border ${borderColor} transition-all duration-200`}>
                        <CubeIcon className={`h-4 w-4 ${color}`} />
                        <span className={`font-bold ${color}`}>
                          {formatQuantity(med.quantity)}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-3 py-3">
                      <StockIndicator quantity={med.quantity} />
                    </td>

                    {/* Price */}
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                        <span className="font-semibold">{formatCurrency(med.price)}</span>
                        
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        <UpdateShopMedicine id={med.medicine_id} />
                        <DeleteShopMedicine id={med.medicine_id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {medicines.length > 0 && (
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 gap-2">
                    <span>Showing {medicines.length} medicines</span>
                  </div>
                </div>
              )}

          {/* Empty State */}
          {medicines.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BeakerIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No medicines found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {query ? `No results for "${query}"` : 'No medicines available at the moment.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}