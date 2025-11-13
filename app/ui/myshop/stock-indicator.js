
import {ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,} from "@heroicons/react/24/solid";

// Helper function to determine stock status and color
function getStockStatus(quantity) {
  if (quantity === 0) {
    return {
      status: "out-of-stock",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      icon: XCircleIcon,
      iconColor: "text-red-500",
      animation: "animate-pulse"
    };
  } else if (quantity <= 10) {
    return {
      status: "low-stock",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      icon: ExclamationTriangleIcon,
      iconColor: "text-amber-500",
    };
  } else {
    return {
      status: "in-stock",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      icon: CheckCircleIcon,
      iconColor: "text-emerald-500",
    };
  }
}

// Stock indicator component matching InvoiceStatus design
export default function StockIndicator({ quantity }) {
  const {
    status,
    color,
    bgColor,
    borderColor,
    icon: Icon,
    iconColor,
    animation
  } = getStockStatus(quantity);

  const getStockText = (qty) => {
    if (qty === 0) return "Out of Stock";
    if (qty <= 10) return "Low Stock";
    return "In Stock";
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${borderColor} ${bgColor} transition-all duration-200`}
    >
      <Icon className={`h-4 w-4 ${animation} ${iconColor}`} />
      <span className={`text-sm font-semibold ${color}`}>
        {getStockText(quantity)}
      </span>
    </div>
  );
}