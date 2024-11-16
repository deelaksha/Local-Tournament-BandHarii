'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, ArrowLeft } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // To check current page

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleCategoryClick = () => {
    if (pathname === '/') {
      // Smooth scroll to the sports-categories section
      document.getElementById('sports-categories')?.scrollIntoView({
        behavior: 'smooth',
      });
    } else {
      // Navigate to the homepage with the hash
      router.push('/#sports-categories');
    }
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-xl font-bold hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={24} />
            <span>Back</span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
          <button
              onClick={() => router.push('/Home')}
              className="hover:text-gray-300 transition-colors"
            >
              Home
            </button>

            {/* Teams List */}
            <button
              onClick={() => router.push('/View_Sports_Team')}
              className="hover:text-gray-300 transition-colors"
            >
              View Teams
            </button>

            <button
              onClick={handleCategoryClick}
              className="hover:text-gray-300 transition-colors"
            >
              Watch Match
            </button>
            <button
              onClick={() => router.push('/Registration')}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
            >
              Registration
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
            <button
                onClick={() => router.push('/Home')}
                className="block px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Home
              </button>
              {/* team list */}
              <button
              onClick={() => router.push('/View_Sports_Team')}
              className="block px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
              View Teams
            </button>
              <button
                onClick={handleCategoryClick}
                className="block px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Watch Match
              </button>
              <button
                onClick={() => router.push('/Registration')}
                className="block px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Registration
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
