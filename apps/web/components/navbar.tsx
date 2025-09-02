'use client';

import Link from 'next/link';
import { useAuth } from './providers';
import { Book, Video, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, loading, login, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <Book className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ByteBoost</span>
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/courses" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600">
                Courses
              </Link>
              <Link href="/live-classes" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600">
                Live Classes
              </Link>
              {user?.role === 'instructor' && (
                <Link href="/instructor" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600">
                  Instructor Dashboard
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600">
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link href="/my-courses" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  My Courses
                </Link>
                <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  <Settings className="h-5 w-5" />
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-500">{user.full_name}</span>
              </div>
            ) : (
              <button
                onClick={login}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Sign in with Google
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/courses"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              Courses
            </Link>
            <Link
              href="/live-classes"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              Live Classes
            </Link>
            {user ? (
              <>
                <Link
                  href="/my-courses"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  My Courses
                </Link>
                <Link
                  href="/profile"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={login}
                className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-blue-600 hover:bg-gray-50"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}