'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';
import Navbar from '@/app/Owner/Header/page';
import { Loader2, Search, UserX } from 'lucide-react';


interface UserData {
  image_url: string;
  name: string;
}

interface UserCardProps {
  imageUrl: string;
  name: string;
  onClick: () => void; // Callback for click
  index: number;
}

const UserCard: React.FC<UserCardProps> = ({
  imageUrl,
  name,
  onClick,
  index,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group relative w-full bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
      onClick={onClick} // Trigger the click callback
    >
      <div className="p-4 flex items-center space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-xl font-bold text-white">#{index}</span>
        </div>
        <div className="flex-shrink-0 relative w-16 h-16 rounded-full overflow-hidden bg-gray-700">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <UserX className="w-8 h-8 text-gray-600" />
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className={`object-cover transition-all duration-500 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          )}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{name}</h3>
        </div>
      </div>
    </div>
  );
};

const UserSearchCards: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null); // Track the selected user

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, image_url');

        if (error) {
          setError('Error fetching users: ' + error.message);
        } else {
          setUsers(data || []);
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching users.');
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      setIsClient(true);
      fetchUsers();
    }
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
        {error && (
          <div className="max-w-xl mx-auto mb-8 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user, index) => (
              <UserCard
                key={user.name}
                imageUrl={user.image_url}
                name={user.name}
                onClick={() => setSelectedUser(user)} // Set the selected user on click
                index={index + 1}
              />
            ))}
          </div>
        )}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
              <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden mb-4">
                <Image
                  src={selectedUser.image_url}
                  alt={selectedUser.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-center text-white text-xl font-bold mb-2">
                {selectedUser.name}
              </h2>
              <button
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearchCards;
