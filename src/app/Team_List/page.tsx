'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Trophy, ChevronRight, Users, Loader2 } from 'lucide-react';
import Navbar from '../Header/page';

// Skeleton loader component for teams
const SkeletonTeam = () => (
  <div className="bg-gray-800/50 p-6 rounded-xl animate-pulse">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-48 h-6 bg-gray-700 rounded" />
        <div className="w-6 h-6 bg-gray-700 rounded" />
      </div>
      <div className="w-32 h-4 bg-gray-700 rounded" />
    </div>
  </div>
);



const TeamList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sportName, setSportName] = useState<string | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
   
 


  useEffect(() => {
    const sport = searchParams.get('sport');
    if (sport) {
      setSportName(sport);
    }
  }, [searchParams]);

  useEffect(() => {
    if (sportName) {
      const fetchTeams = async () => {
        try {
          const { data, error } = await supabase
            .from('teams')
            .select('team_name, sports_name')
            .eq('sports_name', sportName);

          if (error) {
            console.error('Error fetching teams:', error);
            return;
          }

          // Artificial delay for smooth transition
          await new Promise(resolve => setTimeout(resolve, 800));
          setTeams(data);
        } catch (error) {
          console.error('Error fetching teams:', error);
        } finally {
          setLoading(false);
          setInitialLoad(false);
        }
      };

      fetchTeams();
    }
  }, [sportName]);

  const handleTeamClick = (teamName: string) => {
    router.push(`/List_Team_Players?team=${teamName}`);
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                {sportName || 'Sport'} Teams
              </h1>
              <p className="text-gray-400 mt-2">
                {!loading && `${teams.length} teams available`}
              </p>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            // Skeleton loading state
            [...Array(6)].map((_, index) => (
              <SkeletonTeam key={`skeleton-${index}`} />
            ))
          ) : teams.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-gray-800/50 rounded-xl p-8 text-center">
                <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  No teams found for {sportName}
                </p>
              </div>
            </div>
          ) : (
            teams.map((team) => (
              <div
                key={team.team_name}
                onClick={() => handleTeamClick(team.team_name)}
                className="group bg-gray-800/50 hover:bg-gray-800 p-6 rounded-xl transition-all duration-300 ease-in-out cursor-pointer hover:shadow-lg hover:shadow-gray-900/20"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">
                      {team.team_name}
                    </h2>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Users className="h-4 w-4 mr-2" />
                      <span>View players</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Loading Overlay for transitions */}
        {loading && !initialLoad && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-gray-800 p-4 rounded-full">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default  TeamList;