'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../Header/page';
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Dynamic Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = 'bg-blue-500', className = '' }: { children: React.ReactNode; color?: string; className?: string }) => (
  <span className={`${color} text-white px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1 ${className}`}>
    {children}
  </span>
);

// Status Icons
const LiveIcon = () => (
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
  </span>
);

const UpcomingIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor">
    <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="9" strokeWidth="2"/>
  </svg>
);

const CompletedIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor">
    <path d="M20 6L9 17L4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);



const ViewTeam = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sportsName, setSportsName] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setSportsName(searchParams.get('sport') || '');
  }, []);

  useEffect(() => {
    const fetchTeamsAndMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*');

        if (teamsError) throw new Error(`Teams fetch error: ${teamsError.message}`);

        let matchesQuery = supabase
          .from('matches')
          .select(`
            *,
            teams1:team1(team_name),
            teams2:team2(team_name)
          `);

        if (sportsName) {
          matchesQuery = matchesQuery.eq('sports_name', sportsName);
        }

        const { data: matchesData, error: matchesError } = await matchesQuery;

        if (matchesError) throw new Error(`Matches fetch error: ${matchesError.message}`);

        setTeams(teamsData || []);
        setMatches(matchesData || []);
      } catch (err) {
        console.error('Data fetching error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamsAndMatches();
  }, [sportsName]);

  const getMatchStatusDisplay = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return {
          icon: <LiveIcon />,
          label: 'LIVE',
          color: 'bg-red-500',
          textColor: 'text-red-500'
        };
      case 'upcoming':
        return {
          icon: <UpcomingIcon />,
          label: 'UPCOMING',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-500'
        };
      case 'completed':
        return {
          icon: <CompletedIcon />,
          label: 'COMPLETED',
          color: 'bg-green-500',
          textColor: 'text-green-500'
        };
      default:
        return {
          icon: <UpcomingIcon />,
          label: 'UPCOMING',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-500'
        };
    }
  };

  const MatchCard = ({ match, index }: { match: any; index: number }) => {
    const statusDisplay = getMatchStatusDisplay(match.status);
    
    return (
      <div 
        className="match-card"
        style={{
          animationDelay: `${index * 0.1}s`
        }}
      >
        <Card className="bg-gray-800 border border-gray-700 hover:border-blue-500">
          <div className="p-6">
            {/* Status Badge - Positioned at center */}
            <div className="flex justify-center mb-4">
              <Badge color={statusDisplay.color} className="uppercase text-xs tracking-wider">
                {statusDisplay.icon}
                {statusDisplay.label}
              </Badge>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Team 1 */}
              <div className="team-block text-center md:text-left">
                <h3 className="text-xl font-bold text-blue-400">
                  {match.teams1?.team_name || 'Team 1'}
                </h3>
                <p className="text-2xl font-bold text-white">
                  {match.team1_points || '0'}
                </p>
              </div>

             

              {/* Team 2 */}
              <div className="team-block text-center md:text-right">
                <h3 className="text-xl font-bold text-red-400">
                  {match.teams2?.team_name || 'Team 2'}
                </h3>
                <p className="text-2xl font-bold text-white">
                  {match.team2_points || '0'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div key={n} className="animate-pulse">
          <Card className="bg-gray-800 border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="h-12 w-32 bg-gray-700 rounded"></div>
                <div className="h-12 w-32 bg-gray-700 rounded"></div>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );

  const ErrorMessage = ({ message }: { message: string }) => (
    <Card className="bg-red-900 border-red-700">
      <div className="p-6 text-center">
        <p className="text-red-200">Error: {message}</p>
      </div>
    </Card>
  );

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient text-white">
      <style jsx global>{`
        .bg-gradient {
          background: linear-gradient(to bottom, #1a1a2e, #16213e);
        }

        .match-card {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeSlideIn 0.5s ease-out forwards;
        }

        @keyframes fadeSlideIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .team-block {
          transition: transform 0.3s ease;
        }

        .team-block:hover {
          transform: scale(1.05);
        }

        .vs-block {
          position: relative;
          transition: transform 0.3s ease;
        }

        .sport-badge {
          transition: all 0.3s ease;
        }

        .sport-badge:hover {
          transform: translateY(-2px);
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              {sportsName ? `${sportsName} Matches` : 'All Matches'}
            </span>
          </h1>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : matches.length > 0 ? (
          <div className="grid gap-4">
            {matches.map((match, index) => (
              <MatchCard key={match.match_id} match={match} index={index} />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <div className="p-6 text-center">
              <p className="text-gray-400">No matches found</p>
            </div>
          </Card>
        )}
      </div>
    </div>
    </>
  );
};

export default ViewTeam;