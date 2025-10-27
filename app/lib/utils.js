

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// This will display: ৳50.00, ৳123.45 etc.


export const formatQuantity = (quantity) => {
  if (quantity == null || isNaN(quantity)) return '0 pcs';
  return `${quantity} pcs`;
};

export const formatPrintCurrency = (amount) => {
  return amount.toFixed(2);
};


export function formatDateTimeToLocal(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',  // Your local timezone
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}



export const formatTimeToLocal = (
  dateStr,
  locale = 'en-US',
) => {
  const date = new Date(dateStr);
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true, // Change to false for 24-hour format if needed
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};


export const generatePagination = (currentPage, totalPages) => {
    // If the total number of pages is 7 or less,
    // display all pages without any ellipsis.
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
  
    // If the current page is among the first 3 pages,
    // show the first 3, an ellipsis, and the last 2 pages.
    if (currentPage <= 2) {
      return [1, 2, 3, '...', totalPages - 1, totalPages];
    }
    
    if(currentPage===3){
        return [1, '...', 3,4,5, '...', totalPages - 1, totalPages];
    }

    // If the current page is among the last 3 pages,
    // show the first 2, an ellipsis, and the last 3 pages.
    if (currentPage >= totalPages - 2) {
      return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
    }
  
    // If the current page is somewhere in the middle,
    // show the first page, an ellipsis, the current page and its neighbors,
    // another ellipsis, and the last page.
    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ];
  };
  



export function processInvoices(invoices) {
  const revenueMap = {};
  let latestDate = null;

  invoices.forEach(invoice => {
    const date = new Date(invoice.date); // ✅ ISO format — safe to use directly
    if (isNaN(date)) return;

    // Update latest invoice date
    if (!latestDate || date > latestDate) {
      latestDate = date;
    }

    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;

    if (invoice.status === 'paid') {
      if (!revenueMap[key]) {
        revenueMap[key] = 0;
      }
      revenueMap[key] += invoice.amount;
    }
  });

  if (!latestDate) return []; // No valid data

  // Generate last 6 months keys
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(latestDate.getFullYear(), latestDate.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "Feb 2025"
    result.push({
      month: label,
      revenue: revenueMap[key] || 0,
    });
  }

  return result;
}



export function generateYAxis(revenue) {
  const maxRevenue = Math.max(...revenue.map(r => r.revenue));
  const steps = 5; // Number of steps on Y-axis
  const increment = Math.ceil(maxRevenue / steps);
  const yAxisLabels = Array.from({ length: steps + 1 }, (_, i) => (increment * i).toFixed(0)).reverse();

  return { yAxisLabels, topLabel: increment * steps };
}

import { clsx } from 'clsx';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';

class Breadcrumb {
  label;
  href;
  active;
}

export default function Breadcrumbs({
  breadcrumbs,
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 block">
      <ol className={clsx(lusitana.className, 'flex text-xl md:text-2xl')}>
        {breadcrumbs.map((breadcrumb, index) => (
          <li
            key={breadcrumb.href}
            aria-current={breadcrumb.active}
            className={clsx(
              breadcrumb.active ? 'text-gray-900' : 'text-gray-500',
            )}
          >
            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
            {index < breadcrumbs.length - 1 ? (
              <span className="mx-3 inline-block">/</span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}


