

export const formatCurrency = (amount) => {
  const formattedAmount = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formattedAmount} TK`;
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
import Image from 'next/image';

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


export function GetRandomAvatar({name}) {
  const gradients = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-teal-600",
    "from-purple-500 to-pink-600",
    "from-orange-500 to-red-600",
    "from-teal-500 to-cyan-600",
    "from-indigo-500 to-blue-600",
    "from-pink-500 to-rose-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-green-600",
    "from-violet-500 to-purple-600",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 10) - hash);
  }

  const index = Math.abs(hash) % gradients.length;

  return(
    <div className="flex-shrink-0"> {/* Add this wrapper inside component */}
      <div
        className={`w-12 h-12 bg-gradient-to-br ${gradients[index]} rounded-full flex items-center justify-center shadow-lg`}
      >
        <span className="text-white font-semibold text-lg">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
}


// Map dosage descriptions to icon filenames
const DOSAGE_ICON_MAP = {
  // Tablet
  'tablet.png': [
    'tablet', 'mups tablet', 'm r tablet', 'xr tablet', 'pr tablet', 
    'chewable tablet', 'mouth dissolving tablet', 'cr tablet', 'er tablet', 
    'ors tablet', 'odt tablet', 'rapid tablet', 'dispersible tablet', 
    'dr tablet', 'md tablet', 'sr tablet', 'effervescent tablet',
    'oral soluble film', 'orodispersible tablet'
  ],
  
  // Capsule
  'capsule.png': [
    'capsule', 'sr capsule', 'er capsule', 'delayed release capsule', 
    'extended release capsule', 'm r capsule', 'cr capsule', 
    'sprinkle capsule', 'soft gelatin capsule', 'inhalation capsule',
    'cozycap'
  ],
  
  // Eyedrops
  'eyedrops.png': [
    'eye drops', 'eye solution', 
    'eye cleanser solution', 'ophthalmic emulsion', 'eye & nasal drops', 
    'eye and ear drops', 'eye, ear & nasal drops'
  ],
  
  // Injection
  'injection.png': [
    'injection', 'iv injection', 'im injection', 'iv/im injection', 
    'solution for injection', 'water for injection', 'iv infusion',
    'needle for syringe', 'syringe'
  ],
  
  // Inhaler
  'inhaler.png': [
    'inhaler', 'inhalation aerosol', 'metered dose inhaler', 'hfa inhaler', 
    'dry powder inhaler', 'aerosol inhalation', 'inhalation liquid', 
    'inhalation solution', 'nebuliser solution', 'nebuliser suspension',
    'respirator suspension', 'inhalation capsule'
  ],
  
  // Suppository
  'suppository.png': [
    'suppository', 'vaginal suppository', 'per rectal', 'vaginal pessary',
    'vaginal tablet', 'implant', 'bolus'
  ],
  
  // Syrup solutions
  'syrup-solutions.png': [
    'solution', 'viscoelastic solution', 'resperitory solution',
    'dialysis solution', 'solution fo root cannel', 'solution for infusion',
    'irrigation solution', 'canal irrigation', 'root canal agent',
    'oral solution', 'inhalation solution', 'nebuliser solution',
    'pour on (solution)', 'tincture', 'gas', 'blood bag', 'pvc bag',
    'blood tubing set'
  ],
  
  // Traditional syrup
  'syrup.png': [
    'syrup', 'oral syrup', 'cough syrup', 'oral liquid', 'elixir', 'linctus',
    'oral suspension', 'oral emulsion', 'oral paste', 'oral dental gel', 
    'oral gel', 'oral saline', 'oral drops', 'paediatric drops', 'oral solution', 'suspension'
  ],
  
  // Cream (includes ointment, gel, lotion)
  'cream.png': [
    'cream', 'vaginal cream', 'ointment', 'lotion', 'gel', 'emulgel',
    'vaginal gel', 'cervical gel', 'hand rub', 'rectal ointment',
    'scalp lotion', 'scalp ointment', 'shampoo', 'scrub',
    'topical solution', 'topical suspension', 'butterfly',
    'mouth wash', 'mouth wash antiseptic', 'gargle & mouth wash','eye and ear ointment', 'eye ointment',
    'eye gel', 'Eye Ointment'
  ],
  
  // Powder
  'powder.png': [
    'powder', 'oral powder', 'sached powder', 'powder for suspension',
    'powder for solution', 'powder for oral solution', 'powder for pedriatric drop',
    'water soluble powder', 'effervescent granules', 'pellets',
    'granules for suspension', 'pellets for suspension',
    'dr granules for suspension'
  ],
  
  // Spray
  'spray.png': [
    'spray', 'nasal spray', 'ear spray', 'aerosol inhalation'
  ]
};

const DEFAULT_ICON = 'tablet.png';

/**
 * Get icon filename for a dosage description
 */
const getIconFilename = (dosageDescription) => {
  if (!dosageDescription) return DEFAULT_ICON;
  
  const lowerCaseDescription = dosageDescription.toLowerCase().trim();
  
  // Priority checks
  if (lowerCaseDescription.includes('inject') || 
      lowerCaseDescription.includes('infusion') ||
      lowerCaseDescription.includes('iv') || 
      lowerCaseDescription.includes('im') ||
      lowerCaseDescription.includes('syringe')) {
    return 'injection.png';
  }
  if (lowerCaseDescription.includes('ointment') || 
      lowerCaseDescription.includes('cream') ||
      lowerCaseDescription.includes('gel')
      ) {
    return 'cream.png';
  }
  
  if (lowerCaseDescription.includes('eye') || 
      lowerCaseDescription.includes('ophthalmic')) {
    return 'eyedrops.png';
  }
  
  if (lowerCaseDescription.includes('inhal') || 
      lowerCaseDescription.includes('nebuliser')) {
    return 'inhaler.png';
  }
  
  if (lowerCaseDescription.includes('suppository') ||
      lowerCaseDescription.includes('per rectal') ||
      lowerCaseDescription.includes('vaginal') && 
      (lowerCaseDescription.includes('suppos') || lowerCaseDescription.includes('pessary'))) {
    return 'suppository.png';
  }
  
  // Check map
  for (const [icon, keywords] of Object.entries(DOSAGE_ICON_MAP)) {
    for (const keyword of keywords) {
      if (lowerCaseDescription.includes(keyword.toLowerCase())) {
        return icon;
      }
    }
  }
  
  // Fallback categories
  if (lowerCaseDescription.includes('tablet')) return 'tablet.png';
  if (lowerCaseDescription.includes('capsule')) return 'capsule.png';
  if (lowerCaseDescription.includes('spray')) return 'spray.png';
  if (lowerCaseDescription.includes('powder') || lowerCaseDescription.includes('granule')) return 'powder.png';
  if (lowerCaseDescription.includes('solution') || lowerCaseDescription.includes('liquid')) return 'syrup-solutions.png';
  if (lowerCaseDescription.includes('ointment') || lowerCaseDescription.includes('lotion') || 
      lowerCaseDescription.includes('cream') || lowerCaseDescription.includes('gel')) return 'cream.png';
  if (lowerCaseDescription.includes('syrup')) return 'syrup.png';
  
  return DEFAULT_ICON;
};

/**
 * Main component: DosageIcon
 * Usage: <DosageIcon dosageDescription="Tablet" />
 */
export function DosageIcon({ dosageDescription, size = 32, className = '' }) {
  const iconFilename = getIconFilename(dosageDescription);
  const iconPath = `/icons/${iconFilename}`;
  
  return (
    <div className={`flex-shrink-0 ${className}`}>
      <Image
        src={iconPath}
        alt={`${dosageDescription || 'Dosage'} icon`}
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  );
}

/**
 * DosageIcon with label
 * Usage: <DosageIconWithLabel dosageDescription="Eye Drops" />
 */
export function DosageIconWithLabel({ dosageDescription, size = 32, showLabel = true }) {
  return (
    <div className="flex flex-col items-center">
      <DosageIcon dosageDescription={dosageDescription} size={size} />
      {showLabel && (
        <span className="mt-1 text-xs text-gray-600 text-center max-w-[80px] truncate">
          {dosageDescription}
        </span>
      )}
    </div>
  );
}

/**
 * DosageIcon in a circular container (similar to avatar)
 * Usage: <DosageIconCircle dosageDescription="Capsule" />
 */
export function DosageIconCircle({ dosageDescription, size = 48, bgColor = "bg-blue-50" }) {
  const iconSize = Math.floor(size * 0.6);
  
  return (
    <div className="flex-shrink-0">
      <div className={`${bgColor} rounded-full flex items-center justify-center`} 
           style={{ width: size, height: size }}>
        <DosageIcon dosageDescription={dosageDescription} size={iconSize} />
      </div>
    </div>
  );
}

/**
 * DosageIcon with gradient background (similar to GetRandomAvatar)
 * Usage: <DosageIconGradient dosageDescription="Injection" />
 */
export function DosageIconGradient({ dosageDescription, size = 56 }) {
  const gradients = [
    "from-blue-500 to-cyan-400",
    "from-green-500 to-emerald-400",
    "from-purple-500 to-pink-400",
    "from-orange-500 to-amber-400",
    "from-indigo-500 to-blue-400",
    "from-teal-500 to-green-400",
    "from-rose-500 to-pink-400",
    "from-violet-500 to-purple-400",
  ];
  
  // Generate consistent gradient based on dosage description
  let hash = 0;
  for (let i = 0; i < (dosageDescription || '').length; i++) {
    hash = dosageDescription.charCodeAt(i) + ((hash << 10) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  const iconSize = Math.floor(size * 0.5);
  
  return (
    <div className="flex-shrink-0">
      <div
        className={`w-${size} h-${size} bg-gradient-to-br ${gradients[index]} rounded-full flex items-center justify-center shadow-lg`}
        style={{ width: size, height: size }}
      >
        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
          <DosageIcon dosageDescription={dosageDescription} size={iconSize} />
        </div>
      </div>
    </div>
  );
}

/**
 * DosageIcon in a card layout
 * Usage: <DosageIconCard dosageDescription="Tablet" name="Paracetamol" />
 */
export function DosageIconCard({ dosageDescription, name, subtitle }) {
  return (
    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <DosageIcon dosageDescription={dosageDescription} size={40} />
      <div className="ml-3">
        <h4 className="font-medium text-gray-900">{name}</h4>
        {subtitle && (
          <p className="text-sm text-gray-600">{subtitle}</p>
        )}
        <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
          {dosageDescription}
        </span>
      </div>
    </div>
  );
}

/**
 * Helper function to get icon path only
 * Usage: const iconPath = getDosageIconPath("Tablet");
 */
export function getDosageIconPath(dosageDescription) {
  const iconFilename = getIconFilename(dosageDescription);
  return `/icons/${iconFilename}`;
}

/**
 * Get all available icon names for debugging/reference
 */
export function getAvailableIcons() {
  return Object.keys(DOSAGE_ICON_MAP);
}