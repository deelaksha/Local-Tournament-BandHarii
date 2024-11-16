'use client';
import Navbar from '../Header/page';
import React, { useState, useEffect } from 'react';
import { CircleDot, Activity, Calendar, Trophy, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

// Skeleton loader component for sports cards
const SkeletonCard = () => (
  <div className="relative">
    <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
      <div className="w-14 h-14 bg-gray-700 rounded-lg mb-4" />
      <div className="space-y-3">
        <div className="h-8 bg-gray-700 rounded w-2/3" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
        <div className="h-10 bg-gray-700 rounded w-1/3 mt-6" />
      </div>
    </div>
  </div>
);

interface SportCategory {
  name: string;
  icon: React.ReactNode;
  startDate: string;
  color: string;
  glowColor: string;
}

const SportsRegistrationCards = () => {
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to get random gradient colors
  const getRandomColorScheme = () => {
    const colorSchemes = [
      { color: 'from-blue-600 to-blue-900', glow: 'group-hover:shadow-blue-500/50' },
      { color: 'from-purple-600 to-purple-900', glow: 'group-hover:shadow-purple-500/50' },
      { color: 'from-green-600 to-green-900', glow: 'group-hover:shadow-green-500/50' },
      { color: 'from-red-600 to-red-900', glow: 'group-hover:shadow-red-500/50' },
      { color: 'from-yellow-600 to-yellow-900', glow: 'group-hover:shadow-yellow-500/50' },
    ];
    return colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
  };

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const { data, error } = await supabase
          .from('sports')
          .select('sports_name, sports_date');

        if (error) throw error;

        // Artificial delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 800));

        const formattedCategories = data.map((sport) => {
          const { color, glow } = getRandomColorScheme();
          return {
            name: sport.sports_name,
            startDate: sport.sports_date,
            icon: <Activity className="w-8 h-8" />,
            color,
            glowColor: glow,
          };
        });
        
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching sports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  const handleViewTeam = (sportName: string) => {
    router.push(`/Team_List?sport=${sportName}`);
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block p-3 bg-white/5 rounded-2xl backdrop-blur-sm mb-4">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Sports category
          </h1>
         
          {!loading && (
            <div className="text-gray-500 text-sm">
              {categories.length} Sports Available
            </div>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Skeleton loading state
            [...Array(8)].map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))
          ) : (
            categories.map((category) => (
              <div
                key={category.name}
                className="group relative transform transition-all duration-500 hover:scale-105"
                onMouseEnter={() => setHoveredName(category.name)}
                onMouseLeave={() => setHoveredName(null)}
              >
                {/* Glow Effect */}
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${category.color} 
                    rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-500 ${category.glowColor}`}
                />

                {/* Card Content */}
                <div className="relative bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-r ${category.color} 
                      transform transition-all duration-500 group-hover:scale-110 mb-4`}
                  >
                    {category.icon}
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl font-bold text-white mb-4 
                    bg-clip-text transition-all duration-500
                    group-hover:text-transparent group-hover:bg-gradient-to-r ${category.color}`}>
                    {category.name}
                  </h3>

                  {/* Date */}
                  <div className="flex items-center text-gray-400 group-hover:text-white 
                    transition-colors duration-300 mb-6">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Starts {new Date(category.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => handleViewTeam(category.name)}
                    className={`w-full px-6 py-2.5 rounded-lg font-semibold text-white 
                      bg-gradient-to-r ${category.color} hover:shadow-lg
                      transform transition-all duration-300 hover:scale-[1.02]
                      active:scale-[0.98] focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white/10`}
                  >
                    View Team
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default SportsRegistrationCards;