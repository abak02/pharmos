// app/ui/customers/FilterButtons.js
'use client';

import { FunnelIcon } from "@heroicons/react/24/outline";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

function FilterButton({ active, onClick, children, count, color = 'blue' }) {
  const colorConfig = {
    blue: {
      active: 'from-blue-500 to-blue-600 border-blue-500 shadow-blue-500/25',
      hover: 'hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700'
    },
    orange: {
      active: 'from-orange-500 to-orange-600 border-orange-500 shadow-orange-500/25',
      hover: 'hover:border-orange-300 hover:bg-orange-50/50 hover:text-orange-700'
    },
    green: {
      active: 'from-green-500 to-green-600 border-green-500 shadow-green-500/25',
      hover: 'hover:border-green-300 hover:bg-green-50/50 hover:text-green-700'
    }
  };

  const config = colorConfig[color];

  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border-2 backdrop-blur-sm ${
        active
          ? `bg-gradient-to-r ${config.active} text-white shadow-lg scale-105`
          : `bg-white/80 text-gray-600 border-gray-200/80 ${config.hover} hover:shadow-md`
      } group overflow-hidden`}
    >
      {/* Animated background for active state */}
      {active && (
        <div className={`absolute inset-0 bg-gradient-to-r ${config.active.split(' ')[0]} ${config.active.split(' ')[1]}`} />
      )}
      
      {/* Hover effect */}
      <div className={`absolute inset-0 ${config.hover.split(' ')[0].replace('hover:', '')} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {count !== undefined && (
          <span className={`px-2 py-1 rounded-full text-xs font-bold min-w-6 transition-all duration-300 ${
            active 
              ? 'bg-white/20 text-white' 
              : `bg-gray-100 text-gray-600 ${config.hover.replace('hover:', 'group-hover:').replace('border-', 'bg-').split(' ')[0]} ${config.hover.replace('hover:', 'group-hover:').replace('border-', 'bg-').split(' ')[1]}`
          }`}>
            {count}
          </span>
        )}
      </span>
      
      {/* Active indicator dot */}
      {active && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg" />
      )}
    </button>
  );
}

export default function FilterButtons({ currentFilter, filterCounts }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleFilterChange = (filter) => {
    const params = new URLSearchParams(searchParams);
    if (filter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', filter);
    }
    // Reset to page 1 when changing filters
    params.set('page', '1');
    
    router.replace(`${pathname}?${params.toString()}`);
  };

  const getProgressColor = () => {
    switch (currentFilter) {
      case 'pending': return 'from-orange-500 to-orange-600';
      case 'paid': return 'from-green-500 to-green-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50/80 rounded-2xl shadow-sm border border-gray-200/60 backdrop-blur-sm p-6 mb-6 mt-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Header with icon and title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl shadow-lg">
            <FunnelIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
              Filter Customers
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Sort by payment status
            </p>
          </div>
        </div>
        
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3">
          <FilterButton
            active={currentFilter === 'all'}
            onClick={() => handleFilterChange('all')}
            count={filterCounts.total}
            color="blue"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            All
          </FilterButton>
          
          <FilterButton
            active={currentFilter === 'pending'}
            onClick={() => handleFilterChange('pending')}
            count={filterCounts.pending}
            color="orange"
          >
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            Pending
          </FilterButton>
          
          <FilterButton
            active={currentFilter === 'paid'}
            onClick={() => handleFilterChange('paid')}
            count={filterCounts.paid}
            color="green"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Paid
          </FilterButton>
        </div>

        {/* Results counter */}
        {currentFilter !== 'all' && (
          <div className="lg:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/80 border border-gray-200/60 rounded-lg text-sm">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  currentFilter === 'pending' ? 'bg-orange-500' : 'bg-green-500'
                } animate-pulse`} />
                <span className="font-semibold text-gray-700">
                  {filterCounts[currentFilter]}
                </span>
                <span className="text-gray-500">of</span>
                <span className="font-semibold text-gray-900">
                  {filterCounts.total}
                </span>
                <span className="text-gray-500 text-xs capitalize">
                  {currentFilter}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar for visual indication */}
      {currentFilter !== 'all' && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Showing {currentFilter} customers</span>
            <span>{Math.round((filterCounts[currentFilter] / filterCounts.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200/60 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${getProgressColor()}`}
              style={{ width: `${(filterCounts[currentFilter] / filterCounts.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}