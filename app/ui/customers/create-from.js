import Link from "next/link"
import '@/app/globals.css'
import { createCustomer } from "@/app/lib/actions"
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { lusitana } from "../fonts"

export default async function Form() {
    return (
        <div className="max-w-md mx-auto">
            <form action={createCustomer} className="space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className={`text-2xl font-light text-blue-600 mb-2 ${lusitana.className}`}>Add New Customer</h1>
                    <p className="text-sm text-gray-500">Enter customer details below</p>
                </div>

                <div className="space-y-4">
                    {/* Customer Name */}
                    <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            id="customerName"
                            name="customerName"
                            placeholder="Full name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                    </div>

                    {/* Customer Email */}
                    <div>
                        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone No.
                        </label>
                        <input
                            type="tel"
                            id="customerPhone"
                            name="customerPhone"
                            placeholder="Phone number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Link
                        href="/dashboard/invoices"
                        className="flex-1 flex items-center justify-center gap-2 h-11 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <XMarkIcon className="h-4 w-4" />
                        Cancel
                    </Link>
                    <button 
                        className="flex-1 flex items-center justify-center gap-2 h-11 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
                        type="submit"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Create Customer
                    </button>
                </div>
            </form>
        </div>
    )
}