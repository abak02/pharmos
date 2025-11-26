'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDebouncedCallback } from 'use-debounce';
import { useRouter } from 'next/navigation';
import { fetchCustomer } from '@/app/lib/data';
import { lusitana } from '../fonts';
import toast from 'react-hot-toast';
import { createInvoice } from '@/app/lib/actions';
import MedicineForm from './medicine-from';
import { 
    EnvelopeIcon, 
    PhoneIcon, 
    PlusIcon, 
    UserCircleIcon, 
    XMarkIcon,
    BuildingStorefrontIcon 
} from '@heroicons/react/24/outline';

export default function CreateInvoice() {
    const router = useRouter();
    const [customersList, setCustomers] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [selectedMedicines, setSelectedMedicines] = useState([]);
    const [priceData, setPriceData] = useState({
        totalPrice: 0,
        discountedPrice: 0,
        discountPercentage: 0,
        givenAmount: 0,
        changeAmount: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCustomerChange = useDebouncedCallback(async (term) => {
        if (term) {
            const customers = await fetchCustomer(term);
            setCustomers(customers);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, 300);

    const handleSuggestionClick = (customer) => {
        setInputValue(customer.name);
        setCustomerEmail(customer.phone_no);
        setShowSuggestions(false);
    };

    const handleAddMedicine = (medicines) => {
        setSelectedMedicines(medicines);
    };

    const handlePriceUpdate = (data) => {
        setPriceData(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (selectedMedicines.length === 0) {
            toast.error('Please add at least one medicine to the invoice');
            return;
        }
        
        if (!inputValue.trim() || !customerEmail.trim()) {
            toast.error('Please fill in all customer details');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const formData = new FormData(e.target);
            
            formData.append('totalPrice', priceData.totalPrice.toString());
            formData.append('discountedPrice', priceData.discountedPrice.toString());
            formData.append('discountPercentage', priceData.discountPercentage.toString());
            formData.append('givenAmount', priceData.givenAmount.toString());
            formData.append('changeAmount', priceData.changeAmount.toString());
            
            const result = await createInvoice(formData, selectedMedicines);
            
            if (result?.success) {
                toast.success('Invoice created successfully!');
                setTimeout(() => {
                    router.push('/dashboard/invoices');
                    router.refresh();
                }, 1000);
            } else {
                throw new Error(result?.message || 'Failed to create invoice');
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast.error(error.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center justify-between pt-4">
                <div>
                    <h1 className={` ${lusitana.className} text-2xl font-bold text-blue-600`}>Create New Invoice</h1>
                    <p className="text-gray-600 mt-1">Add customer details and medicines</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className={` ${lusitana.className} text-lg font-semibold text-blue-500`}>Customer Information</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Name */}
                        <div className="space-y-2">
                            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                                Customer Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="customerName"
                                    name="customerName"
                                    autoComplete='off'
                                    placeholder="Enter customer name"
                                    value={inputValue}
                                    onChange={(e) => {
                                        setInputValue(e.target.value);
                                        handleCustomerChange(e.target.value);
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-11 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    
                                />
                                <UserCircleIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                {showSuggestions && customersList.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
                                        {customersList.map((customer) => (
                                            <li
                                                key={customer.id}
                                                onClick={() => handleSuggestionClick(customer)}
                                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                            >
                                                <div className="font-medium text-gray-900">{customer.name}</div>
                                                <div className="text-sm text-gray-500">{customer.phone_no}</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Customer Phone */}
                        <div className="space-y-2">
                            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
                                Customer Phone No
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="customerEmail"
                                    name="customerEmail"
                                    autoComplete='off'
                                    placeholder="Enter customer phone number"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-11 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    
                                />
                                <PhoneIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medicine Form Card */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <h2 className={` ${lusitana.className} text-lg font-semibold text-blue-500`}>Medicines</h2>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <MedicineForm 
                            onAddMedicine={handleAddMedicine} 
                            onPriceUpdate={handlePriceUpdate} 
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
                    <Link
                        href="/dashboard/invoices"
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-red-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        <XMarkIcon className="h-4 w-4 text-red-300" />
                        Cancel
                    </Link>
                    
                    <button 
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                        type="submit"
                        disabled={isSubmitting}
                    >
                        <PlusIcon className="h-4 w-4" />
                        {isSubmitting ? 'Creating Invoice...' : 'Create Invoice'}
                    </button>
                </div>
            </form>
        </div>
    );
}