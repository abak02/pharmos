"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { lusitana } from "../fonts";
import { fetchFilteredMedicineWithStockForSuggestion } from "@/app/lib/data";
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
  const [discount, setDiscount] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [givenAmount, setGivenAmount] = useState("");
  const [changeAmount, setChangeAmount] = useState(0);
  const [errors, setErrors] = useState({});

  // Memoize the price update function to prevent infinite loops
  const updateParentPrices = useCallback(() => {
    if (onPriceUpdate) {
      onPriceUpdate({
        totalPrice: parseFloat(totalPrice) || 0,
        discountedPrice: parseFloat(discountedPrice) || 0,
        discountPercentage: parseFloat(discount) || 0,
        givenAmount: parseFloat(givenAmount) || 0,
        changeAmount: parseFloat(changeAmount) || 0
      });
    }
  }, [totalPrice, discountedPrice, discount, givenAmount, changeAmount, onPriceUpdate]);

  // Use a ref to track if this is the initial render
  const initialRender = React.useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    // Debounce the price update to parent
    const timeoutId = setTimeout(updateParentPrices, 100);
    return () => clearTimeout(timeoutId);
  }, [updateParentPrices]);

  const handleSearch = useDebouncedCallback(async (term) => {
    if (term && term.length >= 2) {
      const filteredMedicines = await fetchFilteredMedicineWithStockForSuggestion(term);
      setMedicines(filteredMedicines);
      setSuggestions(true);
    } else {
      setSuggestions(false);
    }
  }, 300);

  const handleSuggestionClick = (medicine) => {
    setPrice(medicine.price);
    setMedicineName(medicine.brandname);
    setType(medicine.dosagedescription);
    setId(medicine.id);
    setSuggestions(false);
    if (errors.medicineName) {
      setErrors(prev => ({ ...prev, medicineName: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!medicineName.trim()) {
      newErrors.medicineName = 'Medicine name is required';
    }
    
    if (!quantity || parseInt(quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    
    if (!price || parseFloat(price.toString().replace(/[^\d.-]/g, '')) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMedicine = () => {
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
      type 
    };
    
    const updatedMedicines = [...addedMedicines, newMedicine];
    setAddedMedicines(updatedMedicines);
    setMedicineName("");
    setQuantity("");
    setPrice("");
    setType("");
    setId("");
    setErrors({});
    
    // Call onAddMedicine after state update
    if (onAddMedicine) {
      onAddMedicine(updatedMedicines);
    }
  };

  const handleDeleteMedicine = (index) => {
    const updatedMedicines = addedMedicines.filter((_, i) => i !== index);
    setAddedMedicines(updatedMedicines);
    if (onAddMedicine) {
      onAddMedicine(updatedMedicines);
    }
  };

  const handleEditMedicine = (index) => {
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
  };

  // Calculate prices without triggering infinite updates
  useEffect(() => {
    const total = addedMedicines.reduce(
      (acc, medicine) => acc + parseFloat(medicine.totalPrice),
      0
    );
    setTotalPrice(total.toFixed(2));

    const discountAmount = discount ? (total * parseFloat(discount)) / 100 : 0;
    const discounted = Math.round(total - discountAmount);
    setDiscountedPrice(discounted.toFixed(2));

    const given = parseFloat(givenAmount) || 0;
    setChangeAmount((given - discounted).toFixed(2));
  }, [addedMedicines, discount, givenAmount]);

  const getStockStatusStyle = (stockQuantity) => {
    if (stockQuantity > 10) {
      return { color: "green", text: `In Stock: ${stockQuantity}` };
    } else if (stockQuantity > 0) {
      return { color: "orange", text: `Low Stock: ${stockQuantity}` };
    } else {
      return { color: "red", text: "Out of Stock" };
    }
  };

  return (
    <>
      <p className={`${lusitana.className} text-xl mb-2 text-blue-500`}>
        Medicine List
      </p>

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
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              placeholder="Enter Medicine Name (min 2 characters)"
              onChange={(e) => {
                setMedicineName(e.target.value);
                handleSearch(e.target.value);
                if (errors.medicineName) {
                  setErrors(prev => ({ ...prev, medicineName: '' }));
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
                      <div className="font-medium text-gray-900">{medicine.brandname}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {medicine.dosagedescription}
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
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                if (errors.quantity) {
                  setErrors(prev => ({ ...prev, quantity: '' }));
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
                  setErrors(prev => ({ ...prev, price: '' }));
                }
              }}
              className={`peer block w-full rounded-md border py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 ${
                errors.price 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.price && (
            <p className="mt-1 text-xs text-red-500">{errors.price}</p>
          )}
        </div>
      </div>

      <AddButton onClick={handleAddMedicine}></AddButton>


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
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
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
                        onClick={() => handleEditMedicine(index)}
                        className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                        title="Edit medicine"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
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
                    <span className="flex-shrink-0">{medicine.quantity} pcs</span>
                    <span>×</span>
                    <span className="flex-shrink-0">{medicine.price} Tk</span>
                    <span>=</span>
                    <span className="font-medium text-blue-600 flex-shrink-0">
                      {medicine.totalPrice} Tk
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEditMedicine(index)}
                      className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                      title="Edit medicine"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
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
        
        <hr className="my-4" />
        
        {/* Total Price and Payment Section */}
        <div className="flex justify-end">
          <span className="font-medium text-md">
            Total Price: <span className="text-blue-500">{totalPrice}</span> Tk
          </span>
        </div>
        <div className="mt-4 flex justify-end items-center gap-4">
          <label htmlFor="discount" className="text-m font-medium">
            Discount (%):
          </label>
          <div className="relative rounded-md">
            <input
              type="number"
              id="discount"
              name="discount"
              placeholder="e.g., 10"
              step="0.01"
              value={discount}
              onChange={(e) => {
                let val = e.target.value;
                if (val === "") {
                  setDiscount("");
                  return;
                }
                const num = parseFloat(val);
                if (!isNaN(num)) {
                  const clamped = Math.min(Math.max(num, 0), 10);
                  setDiscount(clamped.toString());
                }
              }}
              className="w-24 rounded-md border border-gray-200 py-1.5 px-2 text-sm"
              min="0"
              max="10"
            />
          </div>
        </div>
        <div className="flex flex-col items-end text-right space-y-1 mt-4">
          {discount && (
            <span className="font-medium text-base">
              Discounted Price:{" "}
              <span className="text-green-600">{discountedPrice}</span> Tk
            </span>
          )}
        </div>
        <div className="mt-4 flex justify-end items-center gap-4">
          <label
            htmlFor="givenAmount"
            className="mb-2 block text-m font-medium"
          >
            Given Amount (Tk):
          </label>
          <input
            type="number"
            id="givenAmount"
            name="givenAmount"
            min={discountedPrice}
            step="1"
            placeholder="Enter given amount"
            value={givenAmount}
            onChange={(e) => setGivenAmount(e.target.value)}
            className="peer block w-32 rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>
        <div className="mt-4 flex justify-end font-medium text-md">
          <span className="mb-4">
            Change Amount:{" "}
            <span className="text-red-600">
              {changeAmount >= 0 ? changeAmount : "0.00"}
            </span>{" "}
            Tk
          </span>
        </div>
        
        <fieldset className="mt-6">
          <legend className="mb-2 block text-sm font-medium">
            Set the invoice status *
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  required
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
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
        </fieldset>
      </div>
    </>
  );
}