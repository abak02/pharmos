import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData } from '@/app/lib/data';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

const colorMap = {
  green: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    icon: 'text-green-600',
    value: 'text-green-700',
    border: 'border-green-200',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100',
    icon: 'text-red-600',
    value: 'text-red-700',
    border: 'border-red-200',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    icon: 'text-blue-600',
    value: 'text-blue-700',
    border: 'border-blue-200',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
    icon: 'text-orange-600',
    value: 'text-orange-700',
    border: 'border-orange-200',
  },
};

export default async function CardWrapper() {
  const {
    totalPaidInvoices,
    totalPendingInvoices,
    numberOfCustomers,
    numberOfInvoices,
  } = await fetchCardData();
  
  return (
    <>
      <Card title="Collected" value={totalPaidInvoices} type="collected" color="green" />
      <Card title="Pending" value={totalPendingInvoices} type="pending" color="red"/>
      <Card title="Total Invoices" value={numberOfInvoices} type="invoices" color="blue" />
      <Card
        title="Total Customers"
        value={numberOfCustomers}
        type="customers"
        color="orange"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
  color
}) {
  const Icon = iconMap[type];
  const colors = colorMap[color] || colorMap.blue;
  
  return (
    <div className={`rounded-2xl ${colors.bg} p-6 shadow-lg border ${colors.border} hover:shadow-xl transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
            {Icon ? <Icon className={`h-6 w-6 ${colors.icon}`} /> : null}
          </div>
          <h3 className="ml-3 text-sm font-semibold text-gray-700">{title}</h3>
        </div>
        
        {/* Optional: Add trending indicator */}
        <div className={`p-1 rounded-full ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity`}>
          <ArrowTrendingUpIcon className={`h-4 w-4 ${colors.icon}`} />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <p className={`${lusitana.className} text-3xl font-bold ${colors.value}`}>
          {value}
        </p>
        
      </div>
      
      {/* Progress bar or additional info */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${colors.bg.replace('bg-gradient-to-br', 'bg').replace('50', '400').replace('100', '500')}`}
            style={{ width: '75%' }}
          ></div>
        </div>
      </div>
    </div>
  );
}