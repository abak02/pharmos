"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { lusitana } from "../fonts";
import { fetchFilteredMedicineWithStockForSuggestion } from "@/app/lib/data";
import { formatCurrency } from "@/app/lib/utils";
import AddButton from "./addbutton";
import {
  CheckIcon,
  CircleStackIcon,
  ClockIcon,
  CurrencyBangladeshiIcon,
  HashtagIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon } from "@heroicons/react/24/outline";

export default function MedicineForm({ onAddMedicine, onPriceUpdate }) {
  const [medicines, setMedicines] = useState([]);
  const [showSuggestions, setSuggestions] = useState(false);
  const [price, setPrice] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("");
  const [addedMedicines, setAddedMedicines] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [id, setId] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [givenAmount, setGivenAmount] = useState("");
  const [changeAmount, setChangeAmount] = useState(0);
  const [errors, setErrors] = useState({});
  const [discountAmount, setDiscountAmount] = useState(0);
  const [autoSelectedStatus, setAutoSelectedStatus] = useState("pending");
  const [remainingAmount, setRemainingAmount] = useState(0);

  // Use refs to track previous values and prevent infinite loops
  const prevValuesRef = useRef({});
  const isInitialMount = useRef(true);

  // Main calculation effect - runs only when needed dependencies change
  useEffect(() => {
    // Skip initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Calculate total from added medicines
    const total = addedMedicines.reduce(
      (acc, medicine) => acc + parseFloat(medicine.totalPrice),
      0
    );
    
    // Only update if total actually changed
    if (Math.abs(total - totalPrice) > 0.01) {
      setTotalPrice(total);
    }

    // Calculate discount amount (max 10%)
    const discountPercent = parseFloat(discountPercentage) || 0;
    const cappedDiscountPercent = Math.min(discountPercent, 10);
    let discountAmt = (total * cappedDiscountPercent) / 100;

    // Calculate discounted price (rounded UP to ceiling)
    let discounted = Math.ceil(total - discountAmt);

    // Calculate ACTUAL discount after rounding (not theoretical)
    let actualDiscountAmt = total - discounted;
    actualDiscountAmt = Math.max(actualDiscountAmt, 0); // Ensure not negative

    // If rounding eliminated the discount, adjust
    if (actualDiscountAmt === 0 && discountAmt > 0) {
      discounted = Math.ceil(total); // Just round the original total
    }

    // Only update state if values actually changed
    if (Math.abs(discounted - discountedPrice) > 0.01) {
      setDiscountedPrice(discounted);
    }
    
    if (Math.abs(actualDiscountAmt - discountAmount) > 0.01) {
      setDiscountAmount(actualDiscountAmt);
    }

    // Calculate change and remaining
    const given = parseFloat(givenAmount) || 0;
    const change = Math.max(0, given - discounted);
    const remaining = Math.max(0, discounted - given);

    if (Math.abs(change - changeAmount) > 0.01) {
      setChangeAmount(change);
    }
    
    if (Math.abs(remaining - remainingAmount) > 0.01) {
      setRemainingAmount(remaining);
    }

    // Auto-determine status
    let newStatus = autoSelectedStatus;
    if (given === 0) {
      newStatus = "pending";
    } else if (given >= discounted) {
      newStatus = "paid";
    } else if (given > 0) {
      newStatus = "partial";
    }

    if (newStatus !== autoSelectedStatus) {
      setAutoSelectedStatus(newStatus);
    }
  }, [addedMedicines, autoSelectedStatus, changeAmount, discountAmount, discountPercentage, discountedPrice, givenAmount, remainingAmount, totalPrice]);

  // Update parent when prices change - with infinite loop prevention
  useEffect(() => {
    if (!onPriceUpdate) return;

    const currentValues = {
      totalPrice: totalPrice || 0,
      discountedPrice: discountedPrice || 0,
      discountPercentage: totalPrice > 0 ? (discountAmount / totalPrice) * 100 : 0,
      givenAmount: parseFloat(givenAmount) || 0,
      changeAmount: changeAmount || 0,
      remainingAmount: remainingAmount || 0,
      status: autoSelectedStatus,
    };

    // Check if values actually changed
    const prevValues = prevValuesRef.current;
    const hasChanged = 
      Math.abs(prevValues.totalPrice - currentValues.totalPrice) > 0.01 ||
      Math.abs(prevValues.discountedPrice - currentValues.discountedPrice) > 0.01 ||
      Math.abs(prevValues.discountPercentage - currentValues.discountPercentage) > 0.01 ||
      Math.abs(prevValues.givenAmount - currentValues.givenAmount) > 0.01 ||
      Math.abs(prevValues.changeAmount - currentValues.changeAmount) > 0.01 ||
      Math.abs(prevValues.remainingAmount - currentValues.remainingAmount) > 0.01 ||
      prevValues.status !== currentValues.status;

    if (hasChanged) {
      prevValuesRef.current = currentValues;
      onPriceUpdate(currentValues);
    }
  }, [
    totalPrice,
    discountedPrice,
    discountAmount,
    givenAmount,
    changeAmount,
    remainingAmount,
    autoSelectedStatus,
    onPriceUpdate,
  ]);

  // Handle discount input with validation
  const handleDiscountChange = useCallback((value) => {
    if (value === "") {
      setDiscountPercentage("");
      return;
    }

    const num = parseFloat(value);
    if (!isNaN(num)) {
      // Cap at 10%
      const clamped = Math.min(Math.max(num, 0), 10);
      setDiscountPercentage(clamped.toString());
    }
  }, []);

  // Handle given amount change
  const handleGivenAmountChange = useCallback((amount) => {
    const cleaned = amount.replace(/[^\d.]/g, "");
    
    if (cleaned === "") {
      setGivenAmount("");
      return;
    }
    
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      setGivenAmount(num.toString());
    }
  }, []);

  // Handle manual status selection
  const handleStatusChange = useCallback((status) => {
    setAutoSelectedStatus(status);

    if (status === "paid") {
      setGivenAmount(discountedPrice.toString());
    } else if (status === "pending") {
      setGivenAmount("");
    }
  }, [discountedPrice]);

  // Medicine search with debouncing
  const handleSearch = useDebouncedCallback(async (term) => {
    if (term && term.length >= 2) {
      const filteredMedicines =
        await fetchFilteredMedicineWithStockForSuggestion(term);
      setMedicines(filteredMedicines);
      setSuggestions(true);
    } else {
      setSuggestions(false);
    }
  }, 300);

  const handleSuggestionClick = useCallback((medicine) => {
    setPrice(medicine.price);
    setMedicineName(medicine.brandname);
    setType(medicine.dosagedescription);
    setId(medicine.id);
    setSuggestions(false);
    if (errors.medicineName) {
      setErrors((prev) => ({ ...prev, medicineName: "" }));
    }
  }, [errors.medicineName]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!medicineName.trim()) {
      newErrors.medicineName = "Medicine name is required";
    }

    if (!quantity || parseInt(quantity) <= 0) {
      newErrors.quantity = "Valid quantity is required";
    }

    if (!price || parseFloat(price.toString().replace(/[^\d.-]/g, "")) <= 0) {
      newErrors.price = "Valid price is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [medicineName, quantity, price]);

  const handleAddMedicine = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    const priceString = price.toString();
    const numericPrice = parseFloat(priceString.replace(/[^\d.]/g, ""));
    const totalPrice = (quantity * numericPrice).toFixed(2);
    const newMedicine = {
      id,
      medicineName,
      quantity,
      price: numericPrice,
      totalPrice,
      type,
    };

    const updatedMedicines = [...addedMedicines, newMedicine];
    setAddedMedicines(updatedMedicines);
    setMedicineName("");
    setQuantity("");
    setPrice("");
    setType("");
    setId("");
    setErrors({});

    if (onAddMedicine) {
      onAddMedicine(updatedMedicines);
    }
  }, [validateForm, price, quantity, medicineName, type, id, addedMedicines, onAddMedicine]);

  const handleDeleteMedicine = useCallback((index) => {
    const updatedMedicines = addedMedicines.filter((_, i) => i !== index);
    setAddedMedicines(updatedMedicines);
    if (onAddMedicine) {
      onAddMedicine(updatedMedicines);
    }
  }, [addedMedicines, onAddMedicine]);

  const handleEditMedicine = useCallback((index) => {
    const medicineToEdit = addedMedicines[index];
    const updatedMedicines = addedMedicines.filter((_, i) => i !== index);
    setAddedMedicines(updatedMedicines);
    if (onAddMedicine) {
      onAddMedicine(updatedMedicines);
    }

    setMedicineName(medicineToEdit.medicineName);
    setQuantity(medicineToEdit.quantity);
    setPrice(medicineToEdit.price);
    setType(medicineToEdit.type);
    setId(medicineToEdit.id);
    setErrors({});
  }, [addedMedicines, onAddMedicine]);

  const getStockStatusStyle = useCallback((stockQuantity) => {
    if (stockQuantity > 10) {
      return { color: "green", text: `In Stock: ${stockQuantity}` };
    } else if (stockQuantity > 0) {
      return { color: "orange", text: `Low Stock: ${stockQuantity}` };
    } else {
      return { color: "red", text: "Out of Stock" };
    }
  }, []);

  return (
    <>
      <p className={`${lusitana.className} text-xl mb-2 text-blue-500`}>
        Medicine List
      </p>

      {/* Medicine input fields */}
      <div className="gap-4 mb-4 md:flex">
        <div className="relative flex-1">
          <label
            htmlFor="medicineName"
            className="mb-2 block text-sm font-medium"
          >
            Medicine Name *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <CircleStackIcon className="h-[18px] w-[18px] text-gray-500" />
            </span>
            <input
              id="medicineName"
              name="medicineName"
              className={`peer block w-full rounded-md border py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 ${
                errors.medicineName
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-blue-500"
              }`}
              placeholder="Enter Medicine Name (min 2 characters)"
              onChange={(e) => {
                setMedicineName(e.target.value);
                handleSearch(e.target.value);
                if (errors.medicineName) {
                  setErrors((prev) => ({ ...prev, medicineName: "" }));
                }
              }}
              autoComplete="off"
              value={medicineName}
            />
          </div>
          {errors.medicineName && (
            <p className="mt-1 text-xs text-red-500">{errors.medicineName}</p>
          )}

          {showSuggestions && medicines.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
              {medicines.map((medicine) => {
                const stockStatus = getStockStatusStyle(
                  medicine.stock_quantity
                );
                return (
                  <li
                    key={medicine.id}
                    onClick={() => handleSuggestionClick(medicine)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {medicine.brandname}
                        <span className="text-xs ml-1 text-gray-500">
                          {medicine.dosagedescription}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {medicine.genericname} {medicine.strength}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          medicine.stock_quantity > 10
                            ? "text-green-700 bg-green-100 border border-green-200"
                            : medicine.stock_quantity > 0
                            ? "text-orange-700 bg-orange-100 border border-orange-200"
                            : "text-red-700 bg-red-100 border border-red-200"
                        }`}
                      >
                        {stockStatus.text}
                      </span>
                      <span className="text-sm font-medium text-blue-600 whitespace-nowrap">
                        {medicine.price} Tk
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="relative flex-1">
          <label htmlFor="quantity" className="mb-2 block text-sm font-medium">
            Quantity *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <HashtagIcon className="h-[18px] w-[18px] text-gray-500" />
            </span>
            <input
              type="number"
              id="quantity"
              name="quantity"
              placeholder="Enter quantity"
              className={`peer block w-full rounded-md border py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 ${
                errors.quantity
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-blue-500"
              }`}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                if (errors.quantity) {
                  setErrors((prev) => ({ ...prev, quantity: "" }));
                }
              }}
              min="1"
            />
          </div>
          {errors.quantity && (
            <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
          )}
        </div>
        <div className="relative flex-1">
          <label htmlFor="price" className="mb-2 block text-sm font-medium">
            Price *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <CurrencyBangladeshiIcon className="h-[18px] w-[18px] text-gray-500" />
            </span>
            <input
              type="text"
              id="price"
              name="price"
              placeholder="Enter price"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (errors.price) {
                  setErrors((prev) => ({ ...prev, price: "" }));
                }
              }}
              className={`peer block w-full rounded-md border py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 ${
                errors.price
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-blue-500"
              }`}
            />
          </div>
          {errors.price && (
            <p className="mt-1 text-xs text-red-500">{errors.price}</p>
          )}
        </div>
      </div>

      <AddButton onClick={handleAddMedicine} />

      {/* Added Medicines Section */}
      <div className="mt-4">
        <h2 className={`${lusitana.className} text-xl mb-2 text-blue-500`}>
          Added Medicines
        </h2>

        {addedMedicines.length === 0 ? (
          <p className="text-gray-500 text-sm p-4 text-center bg-gray-50 rounded-lg">
            No medicines added yet
          </p>
        ) : (
          <div className="space-y-3">
            {addedMedicines.map((medicine, index) => (
              <div
                key={index}
                className="bg-white-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="block md:hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-base">
                        {medicine.medicineName}
                      </h3>
                      {medicine.type && (
                        <p className="text-xs text-gray-500 mt-1">
                          {medicine.type}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        type="button"
                        onClick={() => handleEditMedicine(index)}
                        className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                        title="Edit medicine"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMedicine(index)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        title="Delete medicine"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Quantity:</span>
                      <span className="ml-1">{medicine.quantity} pcs</span>
                    </div>
                    <div>
                      <span className="font-medium">Price:</span>
                      <span className="ml-1">{medicine.price} Tk</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Total:</span>
                      <span className="ml-1 text-blue-600 font-medium">
                        {medicine.totalPrice} Tk
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex justify-between items-center">
                  <div className="flex items-center gap-3 text-sm flex-1">
                    <span className="font-medium text-gray-900 min-w-0 flex-1">
                      {medicine.medicineName}
                    </span>
                    {medicine.type && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({medicine.type})
                      </span>
                    )}
                    <span className="text-gray-300">|</span>
                    <span className="flex-shrink-0">
                      {medicine.quantity} pcs
                    </span>
                    <span>×</span>
                    <span className="flex-shrink-0">{medicine.price} Tk</span>
                    <span>=</span>
                    <span className="font-medium text-blue-600 flex-shrink-0">
                      {medicine.totalPrice} Tk
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleEditMedicine(index)}
                      className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                      title="Edit medicine"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMedicine(index)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Delete medicine"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Section */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="space-y-2 sm:space-y-3 max-w-md ml-auto">
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Subtotal:</span>
            <span className="font-semibold text-gray-900 text-sm sm:text-base">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          {/* Discount Input */}
          <div className="flex justify-between items-center py-1">
            <label
              htmlFor="discount"
              className="text-xs sm:text-sm text-gray-600"
            >
              Discount (%):
            </label>
            <div className="relative">
              <input
                type="number"
                id="discount"
                name="discount"
                placeholder="0"
                step="0.01"
                value={discountPercentage}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="w-20 rounded-md border border-gray-300 py-1.5 px-2 text-right text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                min="0"
                max="10"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                %
              </span>
            </div>
          </div>

          {/* Discount Amount Display */}
          {discountAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">
                Discount ({((discountAmount / totalPrice) * 100).toFixed(1)}%):
              </span>
              <span className="font-semibold text-red-600 text-sm sm:text-base">
                -{formatCurrency(discountAmount)}
              </span>
            </div>
          )}

          {/* Final Amount (rounded to ceiling) */}
          <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-gray-300">
            <span className="text-gray-900 font-semibold text-sm sm:text-base">
              Final Amount (rounded up):
            </span>
            <span className="font-bold text-green-600 text-base sm:text-lg">
              {formatCurrency(discountedPrice)}
            </span>
          </div>

          {/* Given Amount Input */}
          <div className="flex justify-between items-center py-1">
            <label
              htmlFor="givenAmount"
              className="text-xs sm:text-sm text-gray-600"
            >
              Given Amount:
            </label>
            <div className="relative">
              <input
                type="number"
                id="givenAmount"
                name="givenAmount"
                min="0"
                step="1"
                placeholder="TK"
                value={givenAmount}
                onChange={(e) => handleGivenAmountChange(e.target.value)}
                className="w-24 rounded-md border border-gray-300 py-1.5 px-2 text-right text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dynamic Status Display */}
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Status:</span>
            <span
              className={`font-semibold text-sm sm:text-base ${
                autoSelectedStatus === "paid"
                  ? "text-green-600"
                  : autoSelectedStatus === "partial"
                  ? "text-blue-600"
                  : "text-orange-600"
              }`}
            >
              {autoSelectedStatus === "paid" && "Paid ✅"}
              {autoSelectedStatus === "partial" && "Partial Payment"}
              {autoSelectedStatus === "pending" && "Pending"}
            </span>
          </div>

          {/* Change Amount for Paid invoices */}
          {autoSelectedStatus === "paid" && changeAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">
                Change Amount:
              </span>
              <span className="font-semibold text-blue-600 text-sm sm:text-base">
                {formatCurrency(changeAmount)}
              </span>
            </div>
          )}

          {/* Remaining Amount for Partial invoices */}
          {autoSelectedStatus === "partial" && remainingAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">
                Remaining Amount:
              </span>
              <span className="font-semibold text-orange-600 text-sm sm:text-base">
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Status Section */}
      <fieldset className="mt-6">
        <legend className="mb-2 block text-sm font-medium">
          Invoice Status *
        </legend>
        <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Pending Status */}
            <div className="flex items-center">
              <input
                id="pending"
                name="status"
                type="radio"
                value="pending"
                checked={autoSelectedStatus === "pending"}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                required
              />
              <label
                htmlFor="pending"
                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-orange-100 border border-orange-200 px-3 py-1.5 text-xs font-medium text-orange-600"
              >
                Pending <ClockIcon className="h-4 w-4" />
              </label>
            </div>

            {/* Partial Status */}
            <div className="flex items-center">
              <input
                id="partial"
                name="status"
                type="radio"
                value="partial"
                checked={autoSelectedStatus === "partial"}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                required
              />
              <label
                htmlFor="partial"
                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600"
              >
                Partial <CurrencyBangladeshiIcon className="h-4 w-4" />
              </label>
            </div>

            {/* Paid Status */}
            <div className="flex items-center">
              <input
                id="paid"
                name="status"
                type="radio"
                value="paid"
                checked={autoSelectedStatus === "paid"}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                required
              />
              <label
                htmlFor="paid"
                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
              >
                Paid <CheckIcon className="h-4 w-4" />
              </label>
            </div>
          </div>
        </div>
        <input type="hidden" name="status" value={autoSelectedStatus} />
      </fieldset>
    </>
  );
}