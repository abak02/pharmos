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
import { formatCurrency, formatQuantity } from "@/app/lib/utils";

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

      toast.success(`${medicineName} added to inventory`);
      
    } catch (err) {
      console.error("Error adding medicine:", err);
      toast.error("Failed to add medicine");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className=" rounded-md bg-gray-50 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl mb-3 border border-blue-200">
            <CircleStackIcon className="h-6 w-6 text-blue-600" />
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
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Medicine Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </div>
              <input
                className="block w-full rounded-md border border-gray-300 py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 transition-all duration-200"
                placeholder="Search medicine name..."
                onChange={(e) => {
                  setMedicineName(e.target.value);
                  handleSearch(e.target.value);
                }}
                autoComplete="off"
                value={medicineName}
              />
            </div>

            {showSuggestions && medicines.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {medicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    onClick={() => handleSuggestionClick(medicine)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          {medicine.brandname} <span className="text-xs ml-1 text-gray-500">{medicine.dosagedescription}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {medicine.genericname} {medicine.strength}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        {medicine.price} Tk
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quantity and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <HashtagIcon className="h-5 w-5" />
                </div>
                <input
                  type="number"
                  placeholder="Enter quantity"
                  className="block w-full rounded-md border border-gray-300 py-3 pl-12 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 placeholder:text-gray-400 transition-all duration-200"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (per unit)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <CurrencyBangladeshiIcon className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Auto-filled or enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-3 pl-12 pr-4 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 placeholder:text-gray-400 transition-all duration-200"
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
            className="w-full max-w-md transform hover:scale-[1.02] transition-transform duration-200"
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
                      <div className="text-xs text-gray-600">Qunatity: {formatQuantity(medicine.quantity)}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-green-600">{formatCurrency(medicine.price)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}