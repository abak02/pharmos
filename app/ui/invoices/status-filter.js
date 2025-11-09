// app/ui/invoices/status-filter.tsx
'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { 
  FunnelIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  CurrencyBangladeshiIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

export default function StatusFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilter = (status) => {
    const params = new URLSearchParams(searchParams);
    
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    
    // Reset to page 1 when filter changes
    params.delete('page');
    
    replace(`${pathname}?${params.toString()}`);
  };

  const currentFilter = searchParams.get('status') || 'all';

  const filters = [
    {
      key: 'all',
      label: 'All Invoices',
      icon: DocumentTextIcon,
      bgColor: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-600',
      activeColor: 'bg-gray-600'
    },
    {
      key: 'pending',
      label: 'Pending',
      icon: ClockIcon,
      bgColor: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      activeColor: 'bg-orange-600'
    },
    {
      key: 'partial',
      label: 'Partial',
      icon: CurrencyBangladeshiIcon,
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      activeColor: 'bg-blue-600'
    },
    {
      key: 'paid',
      label: 'Paid',
      icon: CheckCircleIcon,
      bgColor: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      activeColor: 'bg-green-600'
    }
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-gray-700">
          <FunnelIcon className="h-5 w-5" />
          <span className="text-sm font-semibold">Filter by:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = currentFilter === filter.key;
            
            return (
              <button
                key={filter.key}
                onClick={() => handleFilter(filter.key)}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive 
                    ? `${filter.activeColor} text-white shadow-md` 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {filter.label}
                {isActive && (
                  <span className="ml-1 bg-white bg-opacity-20 px-1.5 py-0.5 rounded text-xs">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Badge */}
      {currentFilter !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Active filter:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {filters.find(f => f.key === currentFilter)?.label}
            <button
              onClick={() => handleFilter('all')}
              className="ml-1 hover:text-blue-900"
            >
              ×
            </button>
          </span>
        </div>
      )}
    </div>
  );
}