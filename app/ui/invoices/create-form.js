'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useDebouncedCallback } from 'use-debounce';
import { fetchCustomer } from '@/app/lib/data';
import { lusitana } from '../fonts';

import { createInvoice } from '@/app/lib/actions';
import MedicineForm from './medicine-from';
import { EnvelopeIcon, PhoneIcon, PlusIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function CreateInvoice() {
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
        const formData = new FormData(e.target);
        
        // Add the calculated price data to formData
        formData.append('totalPrice', priceData.totalPrice.toString());
        formData.append('discountedPrice', priceData.discountedPrice.toString());
        formData.append('discountPercentage', priceData.discountPercentage.toString());
        formData.append('givenAmount', priceData.givenAmount.toString());
        formData.append('changeAmount', priceData.changeAmount.toString());
        
        await createInvoice(formData, selectedMedicines);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
            <p className={`${lusitana.className} text-xl mb-2 text-blue-500`}>Customer Details</p>
                <div className="mb-4">
                    <label htmlFor="customerName" className="mb-2 block text-sm font-medium">
                        Customer Name
                    </label>
                    <div className="relative mt-2 rounded-md">
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
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                        />
                        <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                        {showSuggestions && customersList.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-60 overflow-y-auto">
                                {customersList.map((customer) => (
                                    <li
                                        key={customer.id}
                                        onClick={() => handleSuggestionClick(customer)}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        {customer.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="customerEmail" className="mb-2 block text-sm font-medium">
                        Customer Phone No
                    </label>
                    <div className="relative mt-2 rounded-md">
                        <input
                            type="text"
                            id="customerEmail"
                            name="customerEmail"
                            autoComplete='off'
                            placeholder="Enter customer Phone No."
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                        />
                        <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                </div>
                <MedicineForm onAddMedicine={handleAddMedicine} onPriceUpdate={handlePriceUpdate} />
                <div className="mt-6 flex justify-end gap-4">
                    <Link
                        href="/dashboard/invoices"
                        className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                    >
                        <XMarkIcon  className="h-5 w-5 mr-2 text-red-500" />
                        Cancel
                    </Link>
                    <button className="flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50" type="submit">
                    <PlusIcon className="h-5 w-5 mr-2" />
                        Create Invoice
                    </button>
                </div>
            </div>
        </form>
    );
}