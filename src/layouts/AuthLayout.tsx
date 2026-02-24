'use client';

import React from 'react';
import { Link } from 'wouter';
import { Church } from 'lucide-react';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30">
              <Church className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">ChurchAdmin</h1>
              <p className="text-sm text-blue-200">Church Management System</p>
            </div>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white/95 px-8 py-10 shadow-2xl backdrop-blur-sm sm:px-10">
            {/* Render children */}
            {children}
          </div>

          {/* Help Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-200">
              Need help?{' '}
              <a href="/help" className="font-medium text-white hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-blue-200">
            &copy; {new Date().getFullYear()} ChurchAdmin. All rights reserved.
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-blue-300">
            <a href="/privacy" className="hover:text-white">
              Privacy Policy
            </a>
            <span className="text-blue-400">|</span>
            <a href="/terms" className="hover:text-white">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Auth page components that can be used within the AuthLayout

interface AuthPageHeaderProps {
  title: string;
  description?: string;
}

export function AuthPageHeader({ title, description }: AuthPageHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
}

interface AuthFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function AuthForm({ children, onSubmit }: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {children}
    </form>
  );
}

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, id, ...props }: AuthInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="mt-1">
        <input
          id={id}
          className={`block w-full appearance-none rounded-lg border px-3 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function AuthButton({ loading, children, ...props }: AuthButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

interface AuthDividerProps {
  text?: string;
}

export function AuthDivider({ text = 'Or continue with' }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-4 text-gray-500">{text}</span>
      </div>
    </div>
  );
}

interface AuthLinkProps {
  to: string;
  children: React.ReactNode;
}

export function AuthLink({ to, children }: AuthLinkProps) {
  return (
    <Link
      href={to}
      className="font-medium text-blue-600 hover:text-blue-500"
    >
      {children}
    </Link>
  );
}
