'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import Navbar from '../Header/page';
import Footer from '../Footer/page';

import { 
  Gamepad2,
  Trophy,
  Target,
  Crown,
  Flame,
  Gem,
  Shield,
  Star,
  Zap,
  Medal,
  Flag,
  Award,
  Timer,
  Sword,
  Rocket,
  
  type LucideIcon
} from 'lucide-react';

interface SportCategory {
  sports_name: string;
  sports_date: string;
}

// Array of decorative icons that will be randomly assigned
const decorativeIcons: LucideIcon[] = [
  Trophy,
  Target,
  Crown,
  Flame,
  Gem,
  Shield,
  Star,
  Zap,
  Medal,
  Flag,
  Award,
  Gamepad2,
  Sword,
  Rocket,
  // Lightning, // Removed due to linting error
];



// Function to shuffle array (Fisher-Yates algorithm)
const shuffleArray = (array: LucideIcon[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const SkeletonCard = () => (
  <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-lg bg-gray-700 animate-pulse">
        <div className="w-8 h-8" />
      </div>
    </div>
    
    <div className="h-8 bg-gray-700 rounded animate-pulse mb-4" />
    <div className="h-4 bg-gray-700 rounded animate-pulse mb-4 w-3/4" />
    
    <div className="flex justify-between mt-4">
      <div className="h-10 w-24 bg-gray-700 rounded animate-pulse" />
    </div>
  </div>
);

const HomePage = () => {
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [sportsCount, setSportsCount] = useState<number | null>(null);
  const [randomIcons, setRandomIcons] = useState<LucideIcon[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('sports')
          .select('sports_name, sports_date');

        if (error) {
          console.error('Error fetching data:', error);
          setError('Error fetching sports categories.');
        } else {
          setCategories(data || []);
          const shuffledIcons = shuffleArray(decorativeIcons);
          setRandomIcons(shuffledIcons.slice(0, data?.length || 0));
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserCount = async () => {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact' });
      if (error) {
        console.error('Error fetching user count:', error);
      } else {
        setUserCount(count || 0);
      }
    };
    //sports count
    
    const fetchSportsCount = async () => {
      const { count, error } = await supabase
        .from('sports')
        .select('*', { count: 'exact' });
      if (error) {
        console.error('Error fetching sports count:', error);
      } else {
        setSportsCount(count || 0);
      }
    };
    fetchSportsCount();
    fetchCategories();
    fetchUserCount();
  }, []);


  const handleRegisterForSportsClick = () => {
    router.push('/Registration');
  };
  const handleRegisterForPlayersClick = () => {
    router.push('/Registerd_Players');
  };
  const viewteams=()=>{
    router.push('/View_Sports_Team')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar/>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-emerald-900 to-gray-900 py-24 px-8">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            Welcome to Bengaluru Sports
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join the most exciting sports tournaments in Bengaluru. Compete with the best teams and showcase your talent.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleRegisterForSportsClick}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              Register Now
            </button>
            <button
              onClick={handleRegisterForPlayersClick}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              View Players
            </button> 
            <button
              onClick={viewteams}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              View Teams
            </button>
            
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Timer className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-300">Support Available</div>
            </div>
            <div className="text-center">
              <Medal className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2"> {sportsCount !== null ? sportsCount : '...'}</div>
              <div className="text-gray-300">Sports Categories</div>
            </div>
            <div className="text-center">
  <Target className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
  <div className="text-4xl font-bold text-white mb-2">
    {userCount !== null ? userCount : '...'}
  </div>
  <div className="text-gray-300">Active Players</div>
</div>
          </div>
        </div>
      </div>

      {/* Sports Categories Section */}
      <div id="sports-categories" className="py-16 px-8" >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Available Sports</h2>

          {error ? (
            <div className="bg-red-500 text-white rounded-lg p-4 mb-8">
              <p>{error}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(4)].map((_, index) => (
                <SkeletonCard key={index} />
              ))
            ) : categories.length === 0 ? (
              <p className="text-center text-white col-span-full">No sports categories available.</p>
            ) : (
              categories.map((category, index) => {
                const IconComponent = randomIcons[index] || Trophy;
                // Assigning different colors to icons
                const iconColors = ['text-emerald-500', 'text-blue-500', 'text-red-500', 'text-yellow-500', 'text-purple-500'];
                const randomColorIndex = Math.floor(Math.random() * iconColors.length);
                const iconColor = iconColors[randomColorIndex];
                // Assigning different background colors to icons
                const bgColors = ['bg-emerald-600', 'bg-blue-600', 'bg-red-600', 'bg-yellow-600', 'bg-purple-600'];
                const randomBgIndex = Math.floor(Math.random() * bgColors.length);
                const bgIconColor = bgColors[randomBgIndex];
                return (
                  <div
                    key={category.sports_name}
                    className="relative bg-gray-800 rounded-lg p-6 shadow-lg transform transition-all duration-300 border border-gray-700 hover:scale-105"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${bgIconColor}`}>
                        <IconComponent className={`w-8 h-8 ${iconColor}`} />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">{category.sports_name}</h3>

                    <div className="flex items-center text-gray-300">
                      <span>Starts {new Date(category.sports_date).toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => router.push(`/View_Team?sport=${encodeURIComponent(category.sports_name)}`)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors duration-200"
                      >
                        View Matches
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default HomePage;