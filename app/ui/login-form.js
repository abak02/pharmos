'use client';
 
import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';
 
export default function LoginForm() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);
 
  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1 rounded-2xl bg-white p-8 shadow-2xl border border-gray-100">
        {/* Modern Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <KeyIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <h1 className={`${lusitana.className} text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3`}>
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm">
            Sign in to access your dashboard
          </p>
        </div>

        <div className="w-full space-y-6">
          {/* Email Field */}
          <div className="group">
            <label
              className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600"
              htmlFor="email"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-xl border border-gray-300 py-4 pl-12 pr-4 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:text-gray-400 bg-white hover:border-gray-400"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 peer-focus:text-blue-500">
                <AtSymbolIcon className="h-5 w-5 text-gray-400 peer-focus:text-blue-500" />
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="group">
            <label
              className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-xl border border-gray-300 py-4 pl-12 pr-4 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:text-gray-400 bg-white hover:border-gray-400"
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 peer-focus:text-blue-500">
                <KeyIcon className="h-5 w-5 text-gray-400 peer-focus:text-blue-500" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Login Button */}
        <div className="mt-8">
          <LoginButton />
        </div>
        
        {/* Error Message */}
        <div
          className="flex h-8 items-end space-x-1 mt-4"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <div className="flex items-center space-x-2 w-full p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Secure authentication • Encrypted connection
          </p>
        </div>
      </div>
    </form>
  );
}
 
function LoginButton() {
  const { pending } = useFormStatus();
 
  return (
    <Button 
      className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      aria-disabled={pending}
    >
      {pending ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Signing in...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-2">
          <span>Continue to Dashboard</span>
          <ArrowRightIcon className="h-5 w-5" />
        </div>
      )}
    </Button>
  );
}