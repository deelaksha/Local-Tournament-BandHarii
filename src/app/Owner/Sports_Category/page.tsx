'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { CircleDot, Trophy, Users } from 'lucide-react';
import Navbar from '@/app/Owner/Header/page';

interface SportCategory {
  sports_name: string;
  sports_date: string;
}

const SkeletonCard = () => (
  <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
    </div>
    <div className="h-7 bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="h-5 bg-gray-700 rounded w-1/2 mb-6"></div>
    <div className="flex justify-between gap-4">
      <div className="h-10 bg-gray-700 rounded w-1/2"></div>
      <div className="h-10 bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
);

const SportsRegistrationCards = () => {
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Simulate network delay for smoother skeleton animation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { data: fetchedData, error } = await supabase
          .from<SportCategory>('sports')
          .select('sports_name, sports_date');

        if (error) {
          console.error('Error fetching data:', error);
          setError('Error fetching sports categories.');
        } else {
          setCategories(fetchedData || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCardClick = (sportsName: string) => {
    router.push(`/Owner/Create_Team?sport=${encodeURIComponent(sportsName)}`);
  };

  const handlePointsTableClick = (sportsName: string) => {
    router.push(`/Owner/Points_Table?sport=${encodeURIComponent(sportsName)}`);
  };

  const handleManageTeamsClick = (sportsName: string) => {
    router.push(`/Owner/Manage_Teams?sport=${encodeURIComponent(sportsName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-4 animate-fade-in">
            Bengaluru Sports
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-medium">
            Hosted by Haribasegowda
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-lg p-4 text-center">
              {error}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            // Skeleton Loading Grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            // Empty State
            <div className="text-center py-12">
              <div className="inline-block p-4 rounded-full bg-gray-800 mb-4">
                <Trophy className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-xl text-gray-300">No sports categories available yet.</p>
            </div>
          ) : (
            // Sports Cards Grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div
                  key={category.sports_name}
                  className="group bg-gray-800 rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700 hover:border-emerald-500/50"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-900 group-hover:from-emerald-500 group-hover:to-emerald-800 transition-all duration-300">
                      <CircleDot className="w-8 h-8" />
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Users className="w-5 h-5 mr-2" />
                      <span className="text-sm">Open</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                    {category.sports_name}
                  </h3>

                  <div className="flex items-center text-gray-300 mb-6">
                    <span className="text-sm">
                      Starts{' '}
                      {new Date(category.sports_date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleCardClick(category.sports_name)}
                      className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                    >
                      Create Team
                    </button>

                    <button
                      onClick={() => handlePointsTableClick(category.sports_name)}
                      className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                    >
                      Points Table
                    </button>

                    <button
                      onClick={() => handleManageTeamsClick(category.sports_name)}
                      className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                    >
                      Manage Teams
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SportsRegistrationCards;
