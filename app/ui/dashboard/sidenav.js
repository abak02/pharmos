import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon, CubeIcon } from '@heroicons/react/24/outline';
import { signOut } from '@/auth';
import { lusitana } from '../fonts';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-6 md:px-4 bg-white border-r border-gray-200">
      {/* Logo Section */}
      <Link
        className="mb-8 flex items-center justify-start p-4  rounded-2xl transition-all duration-200 group md:h-40"
        href="/"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
            <CubeIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className={`${lusitana.className} text-2xl font-bold text-gray-800`}>Pharmo<span className="text-blue-600">S</span></h2>
            <p className="text-xs text-gray-500 mt-1">Pharmacy System</p>
          </div>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        
          <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        
        {/* Sign Out Button */}
        <form 
          action={async () => {
            'use server';
            await signOut();
          }}
          className="mt-auto"
        >
          <button className="flex h-[48px] w-full items-center gap-3 rounded-xl p-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group">
            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
              <PowerIcon className="h-5 w-5" />
            </div>
            <span className="hidden md:block">Sign Out</span>
          </button>
        </form>
      </div>

      {/* User Info (Optional) */}
      <div className="mt-6 p-4 bg-gray-50 rounded-2xl hidden md:block border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="font-semibold text-sm text-white">S</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">Shamser Drug House</p>
            <p className="text-xs text-gray-500 truncate">admin@medicineapp.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}