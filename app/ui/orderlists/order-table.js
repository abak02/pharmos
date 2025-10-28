// app/ui/orderlist/order-table.js
import { formatQuantity, formatCurrency } from '@/app/lib/utils';
import { useState, useEffect } from 'react';

export default function OrderTable({ medicines, manufacturer }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!medicines || medicines.length === 0) {
    return (
      <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="text-yellow-600 text-lg font-semibold">No low stock items found</div>
        <p className="text-yellow-500 mt-2">All items from {manufacturer} are well stocked.</p>
      </div>
    );
  }

  const outOfStock = medicines.filter(med => med.quantity === 0);
  const lowStock = medicines.filter(med => med.quantity > 0 && med.quantity <= 10);

  return (
    <div>
      {/* Summary Cards - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Out of Stock Card */}
        <div 
          className={`bg-white p-4 rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-all duration-300 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: '0ms' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              <h3 className="text-sm font-semibold text-red-700">Out of Stock</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{outOfStock.length}</p>
              <p className="text-xs text-gray-500 mt-1">items</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-red-100 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(outOfStock.length / medicines.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Low Stock Card */}
        <div 
          className={`bg-white p-4 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <h3 className="text-sm font-semibold text-orange-700">Low Stock</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">{lowStock.length}</p>
              <p className="text-xs text-gray-500 mt-1">items</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-orange-100 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(lowStock.length / medicines.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Total to Order Card */}
        <div 
          className={`bg-white p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <h3 className="text-sm font-semibold text-blue-700">Total to Order</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{medicines.length}</p>
              <p className="text-xs text-gray-500 mt-1">items</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-blue-100 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full w-full"></div>
          </div>
        </div>
      </div>

      {/* Medicines Table - Rest of your existing code remains the same */}
      <div className="bg-gray-50 rounded-lg">
        {/* Mobile View */}
        <div className="md:hidden">
          {medicines.map((med, index) => (
            <div 
              key={med.medicine_id} 
              className={`p-4 border-b transform transition-all duration-300 ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              } ${
                med.quantity === 0 ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
              }`}
              style={{ transitionDelay: `${300 + (index * 50)}ms` }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{med.brandname}</h3>
                  {med.dosagedescription && (
                    <p className="text-xs text-gray-500">{med.dosagedescription}</p>
                  )}
                  <p className="text-sm text-gray-600">{med.genericname}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  med.quantity === 0 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {med.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Current Stock</p>
                  <p className={`font-semibold ${
                    med.quantity === 0 ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {formatQuantity(med.quantity)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="font-semibold text-green-600">{formatCurrency(med.price)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Suggested Order</p>
                  <p className="font-semibold text-blue-600">
                    {med.quantity === 0 ? '20-30 pcs' : `${10 - med.quantity}+ pcs`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <table className="hidden min-w-full md:table">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medicine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Quantity
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {medicines.map((med, index) => (
              <tr 
                key={med.medicine_id}
                className={`transform transition-all duration-300 ${
                  isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                } ${med.quantity === 0 ? 'bg-red-50' : 'bg-orange-50'}`}
                style={{ transitionDelay: `${300 + (index * 30)}ms` }}
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{med.brandname}</div>
                    {med.dosagedescription && (
                      <div className="text-sm text-gray-500">{med.dosagedescription}</div>
                    )}
                    <div className="text-sm text-gray-600">{med.genericname}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-semibold ${
                    med.quantity === 0 ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {formatQuantity(med.quantity)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    med.quantity === 0 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {med.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(med.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-blue-600">
                    {med.quantity === 0 ? '20-30 pcs' : `${10 - med.quantity}+ pcs`}
                  </div>
                  <div className="text-xs text-gray-500">recommended</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}