'use client'
import React, { useState } from 'react';
import { 
  CircleDot, 
  Activity,
  Users,
  Calendar,
  Clock,
  Star,
  Trophy
} from 'lucide-react';

interface SportCategory {
  id: number;
  name: string;
  icon: React.ReactNode;
  availableSlots: number;
  startDate: string;
  timing: string;
  registrationFee: number;
  registrationOpen: boolean;
  level: string;
  color: string;
  glowColor: string;
}

const SportsRegistrationCards = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const categories: SportCategory[] = [
    {
      id: 1,
      name: 'Football',
      icon: <CircleDot className="w-8 h-8" />,
      availableSlots: 24,
      startDate: '2024-11-15',
      timing: '4:00 PM - 6:00 PM',
      registrationFee: 50,
      registrationOpen: true,
      level: 'Pro League',
      color: 'from-emerald-600 to-emerald-900',
      glowColor: 'group-hover:shadow-emerald-500/50'
    },
    {
      id: 2,
      name: 'Basketball',
      icon: <CircleDot className="w-8 h-8" />,
      availableSlots: 12,
      startDate: '2024-11-20',
      timing: '5:00 PM - 7:00 PM',
      registrationFee: 45,
      registrationOpen: true,
      level: 'Elite Division',
      color: 'from-purple-600 to-purple-900',
      glowColor: 'group-hover:shadow-purple-500/50'
    },
    {
      id: 3,
      name: 'Baseball',
      icon: <Activity className="w-8 h-8" />,
      availableSlots: 18,
      startDate: '2024-11-25',
      timing: '3:00 PM - 5:00 PM',
      registrationFee: 55,
      registrationOpen: false,
      level: 'Champion Tier',
      color: 'from-blue-600 to-blue-900',
      glowColor: 'group-hover:shadow-blue-500/50'
    },
    {
      id: 4,
      name: 'Tennis',
      icon: <Activity className="w-8 h-8" />,
      availableSlots: 8,
      startDate: '2024-11-18',
      timing: '6:00 PM - 8:00 PM',
      registrationFee: 60,
      registrationOpen: true,
      level: 'Master Class',
      color: 'from-red-600 to-red-900',
      glowColor: 'group-hover:shadow-red-500/50'
    }
  ];

  const handleRegistration = (category: SportCategory) => {
    if (!category.registrationOpen) {
      alert('Registration is currently closed for this sport.');
      return;
    }
    if (category.availableSlots === 0) {
      alert('No slots available for this sport.');
      return;
    }
    console.log(`Registering for ${category.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {/* Landing Section */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Bengaluru Sports</h1>
        <p className="text-lg text-gray-300">Hosted by Haribasegowda</p>
      </div>

      {/* Registration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div 
            key={category.id}
            className={`group relative transform transition-all duration-300 
              ${category.registrationOpen ? 'hover:scale-105' : 'opacity-75'}
              cursor-pointer`}
            onMouseEnter={() => setHoveredId(category.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Animated Background Glow */}
            <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${category.color} 
              opacity-0 group-hover:opacity-100 blur transition-opacity duration-300`} />
            
            {/* Card Content */}
            <div className={`relative bg-gray-800 rounded-lg p-6 shadow-lg 
              ${category.glowColor} transform transition-all duration-300
              border border-gray-700 group-hover:border-opacity-50`}>
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} 
                  transform transition-transform duration-300 group-hover:scale-110`}>
                  {category.icon}
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-500 font-bold">{category.level}</span>
                </div>
              </div>

              {/* Title with Glow Effect */}
              <h3 className={`text-2xl font-bold text-white mb-4 
                transform transition-all duration-300 group-hover:text-transparent 
                group-hover:bg-clip-text group-hover:bg-gradient-to-r ${category.color}`}>
                {category.name}
              </h3>

              {/* Details with Hover Animation */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300 group-hover:text-white transition-colors duration-300">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{category.availableSlots} slots available</span>
                </div>
                <div className="flex items-center text-gray-300 group-hover:text-white transition-colors duration-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Starts {new Date(category.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-300 group-hover:text-white transition-colors duration-300">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{category.timing}</span>
                </div>
              </div>

              {/* Price and Register Button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-white">₹{category.registrationFee}</span>
                </div>
                <button
                  onClick={() => handleRegistration(category)}
                  className={`px-6 py-2 rounded-lg font-bold text-white 
                    transform transition-all duration-300 
                    ${category.registrationOpen 
                      ? `bg-gradient-to-r ${category.color} hover:scale-105 ${category.glowColor}` 
                      : 'bg-gray-700 cursor-not-allowed'}`}
                  disabled={!category.registrationOpen}
                >
                  {category.registrationOpen ? 'Join Now' : 'Closed'}
                </button>
              </div>

              {/* Status Indicator */}
              {hoveredId === category.id && category.registrationOpen && (
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-green-500 
                  animate-pulse shadow-lg shadow-green-500/50" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SportsRegistrationCards;
