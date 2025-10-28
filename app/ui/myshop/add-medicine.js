"use client";

import React, { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { lusitana } from "../fonts";
import { fetchFilteredMedicineForSuggestion } from "@/app/lib/data";
import AddButton from "../invoices/addbutton";
import { addMedicineToShop } from "@/app/lib/actions";
import toast from 'react-hot-toast';

import {
  CircleStackIcon,
  CurrencyBangladeshiIcon,
  HashtagIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function CreateInventoryForm({ onAddMedicine = () => {} }) {
  const [medicines, setMedicines] = useState([]);
  const [showSuggestions, setSuggestions] = useState(false);
  const [price, setPrice] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("");
  const [addedMedicines, setAddedMedicines] = useState([]);
  const [id, setId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState({
    medicineName: false,
    quantity: false,
    price: false
  });

  const handleSearch = useDebouncedCallback(async (term) => {
    if (term) {
      const filteredMedicines = await fetchFilteredMedicineForSuggestion(term);
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
    setQuantity("");
    setSuggestions(false);
  };

  const handleAddMedicine = async () => {
    if (!medicineName || !quantity || !price || !id) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await addMedicineToShop({
        id,
        quantity: parseInt(quantity),
        price: price.toString(),
      });

      const updatedMedicines = [
        ...addedMedicines,
        { id, medicineName, quantity, price, type },
      ];
      setAddedMedicines(updatedMedicines);

      // Reset inputs
      setMedicineName("");
      setQuantity("");
      setPrice("");
      setType("");
      setId("");
      
      if (typeof onAddMedicine === 'function') {
        onAddMedicine(updatedMedicines);
      }

      toast.success(`${medicineName} added to your shop inventory`);
      
    } catch (err) {
      console.error("Error adding medicine:", err);
      toast.error("Failed to add medicine. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-3">
          <CircleStackIcon className="h-6 w-6 text-white" />
        </div>
        <h2 className={`${lusitana.className} text-2xl font-bold text-gray-800 mb-2`}>
          Add Medicine to Inventory
        </h2>
        <p className="text-gray-500 text-sm">
          Search and add medicines to your shop inventory
        </p>
      </div>

      {/* Medicine input fields */}
      <div className="space-y-6 mb-6">
        {/* Medicine Name */}
        <div className="relative group">
          <label
            htmlFor="medicineName"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Medicine Name
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 flex items-center pl-3 transition-all duration-300 ${
              isFocused.medicineName ? 'text-blue-500 scale-110' : 'text-gray-400'
            }`}>
              <MagnifyingGlassIcon className="h-5 w-5" />
            </div>
            <input
              id="search"
              className={`peer block w-full rounded-xl border-2 py-3 pl-12 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-gray-400 ${
                isFocused.medicineName 
                  ? 'border-blue-400 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50'
              }`}
              placeholder="Search medicine name..."
              onChange={(e) => {
                setMedicineName(e.target.value);
                handleSearch(e.target.value);
              }}
              onFocus={() => handleFocus('medicineName')}
              onBlur={() => handleBlur('medicineName')}
              autoComplete="off"
              value={medicineName}
            />
          </div>

          {showSuggestions && medicines.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-sm">
              {medicines.map((medicine) => (
                <div
                  key={medicine.id}
                  onClick={() => handleSuggestionClick(medicine)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200 group/item"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 group-hover/item:text-blue-600">
                        {medicine.brandname}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {medicine.dosagedescription}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
                      ৳{medicine.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quantity and Price in grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quantity */}
          <div className="relative group">
            <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 flex items-center pl-3 transition-all duration-300 ${
                isFocused.quantity ? 'text-green-500 scale-110' : 'text-gray-400'
              }`}>
                <HashtagIcon className="h-5 w-5" />
              </div>
              <input
                type="number"
                id="quantity"
                name="quantity"
                placeholder="Enter quantity"
                className={`peer block w-full rounded-xl border-2 py-3 pl-12 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-gray-400 ${
                  isFocused.quantity 
                    ? 'border-green-400 bg-green-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onFocus={() => handleFocus('quantity')}
                onBlur={() => handleBlur('quantity')}
                min="1"
              />
            </div>
          </div>

          {/* Price */}
          <div className="relative group">
            <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
              Price (per unit)
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 flex items-center pl-3 transition-all duration-300 ${
                isFocused.price ? 'text-amber-500 scale-110' : 'text-gray-400'
              }`}>
                <CurrencyBangladeshiIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                id="price"
                name="price"
                placeholder="Auto-filled or enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onFocus={() => handleFocus('price')}
                onBlur={() => handleBlur('price')}
                className={`peer block w-full rounded-xl border-2 py-3 pl-12 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-gray-400 ${
                  isFocused.price 
                    ? 'border-amber-400 bg-amber-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-center">
        <AddButton 
          onClick={handleAddMedicine}
          disabled={isSubmitting}
          className="w-full max-w-xs transform hover:scale-105 transition-transform duration-300"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Adding to Inventory...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CircleStackIcon className="h-5 w-5 mr-2" />
              Add to Inventory
            </div>
          )}
        </AddButton>
      </div>

      {/* Added Medicines Preview */}
      {addedMedicines.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recently Added</h3>
          <div className="space-y-2">
            {addedMedicines.slice(-3).map((medicine, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CircleStackIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{medicine.medicineName}</div>
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border flex-shrink-0">{medicine.type}</div>
                    <div className="text-md text-gray-600">Qty: {medicine.quantity}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-green-600">৳{medicine.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}