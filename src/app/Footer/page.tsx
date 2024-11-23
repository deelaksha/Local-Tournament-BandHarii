'use client';
import React from 'react';
import { Instagram } from 'lucide-react';

const contacts = [
  { 
    name: 'Instagram', 
    instagram: 'https://www.instagram.com/boodhimutluofficials/profilecard/?igsh=MTl2Yjg2cHVuN3Mxag=='
  },
];

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Connect With Us</h2>
        <div className="flex justify-center">
          {contacts.map((contact, index) => (
            <a
              key={index}
              href={contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-72 block cursor-pointer"
            >
              <div className="bg-gray-700 p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:bg-gray-600">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-600 p-3 rounded-full mb-4 hover:bg-gray-500">
                    <Instagram className="w-8 h-8 text-pink-400" />
                  </div>
                  <div className="text-xl font-semibold text-gray-100 mb-2">
                    {contact.name}
                  </div>
                  <span className="text-pink-400 text-sm sm:text-base truncate max-w-full">
                    Follow Us
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;