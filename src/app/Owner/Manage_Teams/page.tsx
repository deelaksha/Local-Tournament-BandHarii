'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

const ManageTeamsPage = () => {
  const searchParams = useSearchParams();
  const sportName = searchParams.get('sport'); // Get the 'sport' query parameter
  const [teams, setTeams] = useState<any[]>([]); // State to store teams for the selected sport
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      if (!sportName) {
        setError('No sport selected.');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('sports_name', sportName); // Filter teams by the selected sport

        if (error) {
          console.error('Error fetching teams:', error.message);
          setError('Error fetching teams for the selected sport.');
        } else {
          setTeams(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [sportName]);

  // Delete a team
  const handleDeleteTeam = async (team_name: string) => {
    const confirmation = confirm(
      `Are you sure you want to delete the team "${team_name}"? This will also delete all matches involving this team.`
    );
    if (!confirmation) return;
  
    try {
      // Start a transaction to delete related matches and the team
      const { error: matchError } = await supabase
        .from('matches')
        .delete()
        .or(`team1.eq.${team_name},team2.eq.${team_name}`); // Delete matches where the team is either team1 or team2
  
      if (matchError) {
        console.error('Error deleting matches:', matchError.message);
        alert('Failed to delete matches involving the team.');
        return;
      }
  
      const { error: teamError } = await supabase.from('teams').delete().eq('team_name', team_name);
  
      if (teamError) {
        console.error('Error deleting team:', teamError.message);
        alert('Failed to delete the team.');
        return;
      }
  
      alert('Team and related matches deleted successfully!');
      // Refresh the team list after deletion
      setTeams((prevTeams) => prevTeams.filter((team) => team.team_name !== team_name));
    } catch (err) {
      console.error('Unexpected error during deletion:', err);
      alert('An unexpected error occurred.');
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6">Manage Teams</h1>

        {/* Sport Name Display */}
        {sportName ? (
          <h2 className="text-2xl font-semibold mb-4">
            Sport: <span className="text-emerald-400">{sportName}</span>
          </h2>
        ) : (
          <p className="text-red-400 mb-4">Sport not specified.</p>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-lg p-4 mb-4">
            {error}
          </div>
        )}

        {/* Teams List */}
        {loading ? (
          <p>Loading teams...</p>
        ) : teams.length === 0 ? (
          <p className="text-gray-400">No teams available for this sport.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.team_name}
                className="bg-gray-800 rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700"
              >
                <h3 className="text-xl font-bold text-white mb-2">{team.team_name}</h3>
                <p className="text-sm text-gray-400">Sport: {team.sports_name}</p>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteTeam(team.team_name)}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTeamsPage;
