'use client';

import React, { useState } from 'react';
import { useRouter} from 'next/navigation';
import { Menu, X, ArrowLeft } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleBackClick = () => {
    router.back();
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
              onClick={() => router.push('/Owner/Sports_Category')}
              className="hover:text-gray-300 transition-colors"
            >
              Sports_Category
            </button>
            {/* Create Sports Name */}
            <button
              onClick={() => router.push('/Owner/Create_Sports')}
              className="hover:text-gray-300 transition-colors"
            >
              Create_Sports
            </button>

            {/* Manage Sports Coupon Code */}

            <button
              onClick={() => router.push('/Owner/Coupon_Code')}
              className="hover:text-gray-300 transition-colors"
            >
              Coupon_Code
            </button>

            {/* Players List */}
            <button
              onClick={() => router.push('/Owner/Registerd_Players')}
              className="hover:text-gray-300 transition-colors"
            >
              Players List
            </button>
            {/* Registration Status */}
        
            <button
              onClick={() => router.push('/Owner/Registration_Status')}
              className="hover:text-gray-300 transition-colors"
            >
              Registartion_Status
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
              onClick={() => router.push('/Owner/Sports_Category')}
              className="block px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Sports_Category
              </button>
              <button
              onClick={() => router.push('/Owner/Create_Sports')}
              className="block px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Create_Sports
              </button>
              {/* Coupon_Code */}
              <button
              onClick={() => router.push('/Owner/Coupon_Code')}
              className="block px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Coupon_Code
              </button>
              {/* Players List */}
               {/* Players List */}
            <button
              onClick={() => router.push('/Owner/Registerd_Players')}
              className="block px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Players List
            </button>
            <button
              onClick={() => router.push('/Owner/Registration_Status')}
              className="block px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Registartion_Status
            </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
