'use client';

import React from 'react';
import { Phone } from 'lucide-react';

const contacts = [
  { name: 'Support 1', phone: '+1 (123) 456-7890' },
  { name: 'Support 2', phone: '+1 (987) 654-3210' },
  { name: 'Support 3', phone: '+1 (555) 123-4567' },
];

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Contact Support</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="bg-gray-700 p-4 rounded-lg shadow-lg transform transition-transform hover:scale-105"
            >
              <Phone className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              <div className="text-xl font-semibold text-gray-100">{contact.name}</div>
              <div className="text-gray-300 text-lg">{contact.phone}</div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
