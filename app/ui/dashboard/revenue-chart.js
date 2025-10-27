import { CalendarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

import { fetchInvoices } from '@/app/lib/data';
import { processInvoices, formatCurrency } from '@/app/lib/utils';
import RevenueLineChart from './revenue-line-chart';

export default async function RevenueChart() {
  const invoices = await fetchInvoices();
  const revenue = processInvoices(invoices);

  if (!revenue || revenue.length === 0) {
    return (
      <div className="w-full md:col-span-4">
        <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-sm border border-gray-200">
          <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl font-bold text-gray-800`}>
            Recent Revenue
          </h2>
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-400 text-lg">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the last 6 months of revenue data
  const lastSixMonthsRevenue = revenue.slice(-6);
  
  // Calculate monthly growth between the last two months
  const currentMonth = lastSixMonthsRevenue[lastSixMonthsRevenue.length - 1];
  const previousMonth = lastSixMonthsRevenue[lastSixMonthsRevenue.length - 2];
  
  const currentRevenue = currentMonth?.revenue || 0;
  const previousRevenue = previousMonth?.revenue || 0;
  
  // Calculate monthly growth percentage
  const monthlyGrowthPercentage = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue * 100)
    : currentRevenue > 0 ? 100 : 0;

  const isPositiveGrowth = monthlyGrowthPercentage >= 0;

  // Format month names for display
  const formatMonthName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const currentMonthName = currentMonth ? formatMonthName(currentMonth.month) : 'Current';
  const previousMonthName = previousMonth ? formatMonthName(previousMonth.month) : 'Previous';

  return (
    <div className="w-full md:col-span-4">
      <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
        {/* Header with Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className={`${lusitana.className} text-2xl font-bold text-gray-800 mb-2`}>
              Revenue Overview
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Last 6 months</span>
              </div>
              
              {/* Monthly Growth Indicator */}
              {previousMonth && (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  isPositiveGrowth 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <ArrowTrendingUpIcon className={`h-4 w-4 ${
                    isPositiveGrowth ? 'text-green-600' : 'text-red-600 rotate-180'
                  }`} />
                  <span className="font-semibold">
                    {isPositiveGrowth ? '+' : ''}{monthlyGrowthPercentage.toFixed(1)}%
                  </span>
                  <span className="text-xs ml-1 opacity-75">
                    vs {previousMonthName}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Current Revenue Display */}
          <div className="mt-4 lg:mt-0 text-right">
            <p className="text-sm text-gray-600">
              {currentMonthName} Month Revenue
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(currentRevenue)}
            </p>
            {previousMonth && (
              <p className="text-xs text-gray-500 mt-1">
                {previousMonthName}: {formatCurrency(previousRevenue)}
              </p>
            )}
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative">
          <RevenueLineChart revenue={lastSixMonthsRevenue} />
        </div>

        {/* Chart Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Monthly Revenue</span>
          </div>
          <div className="text-xs text-gray-500">
            {previousMonth ? `Monthly growth: ${isPositiveGrowth ? '+' : ''}${monthlyGrowthPercentage.toFixed(1)}%` : 'Updated just now'}
          </div>
        </div>
      </div>
    </div>
  );
}