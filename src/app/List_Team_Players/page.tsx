'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import Image from 'next/image';
import { Trophy, Users } from 'lucide-react';
import Navbar from '../Header/page';

const SkeletonCard = () => (
  <div className="bg-gray-800/50 p-6 rounded-xl animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 bg-gray-700 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
        <div className="h-3 bg-gray-700 rounded w-1/4" />
      </div>
    </div>
  </div>
);

const ListTeamPlayers = () => {
  const searchParams = useSearchParams();
  const [teamName, setTeamName] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const team = searchParams.get('team');
    if (team) {
      setTeamName(team);
    }
  }, [searchParams]);

  useEffect(() => {
    if (teamName) {
      const fetchPlayers = async () => {
        setLoading(true);
        try {
          const { data: playersData, error: playersError } = await supabase
            .from('players')
            .select('player_name, team_name')
            .eq('team_name', teamName);

          if (playersError) {
            console.error('Error fetching players:', playersError);
            return;
          }

          const playersWithImages = await Promise.all(
            playersData.map(async (player) => {
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('image_url')
                .eq('name', player.player_name)
                .single();

              if (userError) {
                console.error('Error fetching user image:', userError);
                return player;
              }

              return {
                ...player,
                image_url: userData?.image_url,
              };
            })
          );

          setPlayers(playersWithImages);
        } catch (error) {
          console.error('Error fetching players:', error);
        } finally {
          // Add artificial delay for smooth transition
          setTimeout(() => setLoading(false), 800);
        }
      };

      fetchPlayers();
    }
  }, [teamName]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center space-x-4">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                {teamName || 'Team'}
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Users className="h-5 w-5" />
              <span>{players.length} Players</span>
            </div>
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              // Skeleton loading state
              [...Array(6)].map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} />
              ))
            ) : players.length === 0 ? (
              <div className="col-span-full">
                <div className="bg-gray-800/50 rounded-xl p-8 text-center">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">
                    No players found for this team
                  </p>
                </div>
              </div>
            ) : (
              players.map((player) => (
                <div
                  key={player.player_name}
                  className="group bg-gray-800/50 hover:bg-gray-800 p-6 rounded-xl transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-gray-900/20"
                >
                  <div className="flex items-center space-x-4">
                    {player.image_url ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-gray-700 group-hover:ring-blue-500 transition-all duration-300">
                        <Image
                          src={player.image_url}
                          alt={player.player_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center ring-2 ring-gray-600 group-hover:ring-blue-500 transition-all duration-300">
                        <span className="text-2xl font-semibold text-gray-300">
                          {player.player_name[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl text-white font-medium truncate">
                        {player.player_name}
                      </h2>
                      <p className="text-sm text-gray-400 truncate">
                        {player.team_name}
                      </p>
                    </div>
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

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListTeamPlayers />
    </Suspense>
  );
}
