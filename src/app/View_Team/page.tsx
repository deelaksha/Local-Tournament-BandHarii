'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabaseClient';
import Navbar from '@/app/Owner/Header/page';

type Team = {
  team_name: string;
};

type Match = {
  match_id: number;
  team1: string;
  team2: string;
  team1_points: number;
  team2_points: number;
  status: 'upcoming' | 'live' | 'completed';
  teams1?: { team_name: string };
  teams2?: { team_name: string };
};

const ViewTeam = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sportsName, setSportsName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSportsName(params.get('sport'));
    }
  }, []);

  useEffect(() => {
    const fetchTeamsAndMatches = async () => {
      try {
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('team_name');
        if (teamsError) throw teamsError;
        setTeams(teamsData || []);

        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            match_id,
            team1,
            team2,
            team1_points,
            team2_points,
            status,
            teams1:team1 (team_name),
            teams2:team2 (team_name),
            sports_name
          `)
          .eq('sports_name', sportsName);
        if (matchesError) throw matchesError;

        const transformedMatches = (matchesData || []).map((match: any) => ({
          ...match,
          teams1: match.teams1 ? match.teams1[0] : undefined,
          teams2: match.teams2 ? match.teams2[0] : undefined,
        }));

        setMatches(transformedMatches);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchTeamsAndMatches();
  }, [sportsName]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-700 text-yellow-200';
      case 'live': return 'bg-green-700 text-green-100 animate-pulse';
      case 'completed': return 'bg-blue-700 text-blue-200';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-4 sm:py-8 px-2 sm:px-4 lg:px-8">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <Navbar />
        <div className="p-4 sm:p-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-center mb-6 text-white">
            {sportsName ? `${sportsName} Matches` : 'Team Matches'}
          </h1>

          <div className="space-y-4 sm:space-y-6">
            {matches.length === 0 ? (
              <div className="text-center text-gray-400 text-lg sm:text-xl">
                No matches found for {sportsName}
              </div>
            ) : (
              matches.map((match) => (
                <motion.div
                  key={match.match_id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  <div className="p-4 sm:p-6 relative">
                    <div className="flex flex-col items-center">
                      {/* Match Status for Desktop */}
                      <div className="hidden sm:flex flex-col items-center space-y-1">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(match.status)}`}
                        >
                          {match.status}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-3 space-y-4 sm:space-y-0">
                        {/* Team 1 */}
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-cyan-400 text-lg sm:text-xl font-bold">
                            {match.teams1?.team_name || 'Team 1'}
                          </span>
                          <span className="text-white text-2xl sm:text-3xl font-extrabold">
                            {match.team1_points}
                          </span>
                        </div>

                        {/* "vs" for desktop */}
                        <div className="flex flex-col items-center space-y-1">
                          <span className="hidden sm:inline text-gray-400 text-lg font-semibold">
                            vs
                          </span>
                          <span
                            className={`block sm:hidden px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(match.status)}`}
                          >
                            {match.status}
                          </span>
                        </div>

                        {/* Team 2 */}
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-pink-400 text-lg sm:text-xl font-bold">
                            {match.teams2?.team_name || 'Team 2'}
                          </span>
                          <span className="text-white text-2xl sm:text-3xl font-extrabold">
                            {match.team2_points}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTeam;
