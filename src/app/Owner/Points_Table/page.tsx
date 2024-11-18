'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';  // Adjust path if necessary
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
  sports_name: string;
  teams1?: { team_name: string }; 
  teams2?: { team_name: string }; 
};

const AdminDashboard = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isAddingMatch, setIsAddingMatch] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [newMatch, setNewMatch] = useState({
    team1: '',
    team2: '',
    status: 'upcoming',
    team1_points: 0,
    team2_points: 0,
  });

  const [sportsName, setSportsName] = useState<string | null>(null); // Store sports_name

  const statuses = ['upcoming', 'live', 'completed'];

  // Fetch teams and matches from Supabase
  useEffect(() => {
    const fetchTeamsAndMatches = async () => {
      try {
        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('team_name');
        if (teamsError) throw teamsError;
        setTeams(teamsData || []);

        // Fetch matches with joined data for team names
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
          `);
        if (matchesError) throw matchesError;

        // Transform the matches data to match the Match type
        const transformedMatches = (matchesData || []).map((match: any) => ({
          ...match,
          teams1: match.teams1 ? match.teams1[0] : undefined, // Extract the first element or undefined
          teams2: match.teams2 ? match.teams2[0] : undefined, // Extract the first element or undefined
        }));
        setMatches(transformedMatches);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchTeamsAndMatches();
  }, []);

  // Set sports_name once the component mounts (client-side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSportsName(params.get('sport'));
    }
  }, []);

  // Handle adding a match
  const handleAddMatch = async () => {
    if (newMatch.team1 && newMatch.team2 && newMatch.team1 !== newMatch.team2 && sportsName) {
      try {
        const { data, error } = await supabase
          .from('matches')
          .insert([{
            team1: newMatch.team1,
            team2: newMatch.team2,
            team1_points: newMatch.team1_points,
            team2_points: newMatch.team2_points,
            status: newMatch.status,
            sports_name: sportsName,
          }])
          .select(); // Ensure it returns the inserted row

        if (error) {
          console.error('Error adding match:', error.message);
        } else if (data) {
          setMatches((prev) => [...prev, data[0]]);
          setNewMatch({
            team1: '',
            team2: '',
            status: 'upcoming',
            team1_points: 0,
            team2_points: 0,
          });
          setIsAddingMatch(false);
          alert('Match added successfully');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    } else {
      console.error('Please provide valid and distinct team1 and team2.');
    }
  };

  // Handle updating a match
  const handleUpdateMatch = async (matchId: number) => {
    if (editingMatch && editingMatch.team1 && editingMatch.team2) {
      try {
        const { data, error } = await supabase
          .from('matches')
          .update({
            team1: editingMatch.team1,
            team2: editingMatch.team2,
            team1_points: editingMatch.team1_points,
            team2_points: editingMatch.team2_points,
            status: editingMatch.status,
          })
          .eq('match_id', matchId);

        if (error) {
          console.error('Error updating match:', error.message, error.details, error.hint);
        } else {
          if (data && data[0]) {
            setMatches((prev) =>
              prev.map((match) => (match.match_id === matchId ? data[0] : match))
            );
          }
          setEditingMatch(null);
          alert('Match updated successfully');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    } else {
      console.error('Editing match is missing required fields.');
    }
  };

  // Handle deleting a match
  const handleDeleteMatch = async (matchId: number) => {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('match_id', matchId);

    if (error) {
      console.error('Error deleting match:', error);
    } else {
      setMatches((prev) => prev.filter((match) => match.match_id !== matchId));
      alert('Match deleted successfully');
    }
  };

  // Update score
  const updateScore = async (matchId: number, player: number, increment: boolean) => {
    const updatedMatches = matches.map((match: Match) => {
      if (match.match_id === matchId && match.status === 'live') {
        const scoreKey = player === 1 ? 'team1_points' : 'team2_points';
        const newScore = Math.max(0, match[scoreKey] + (increment ? 1 : -1));

        return { ...match, [scoreKey]: newScore };
      }
      return match;
    });

    setMatches(updatedMatches);
    const scoreKey = player === 1 ? 'team1_points' : 'team2_points';
    const newScore = updatedMatches.find(match => match.match_id === matchId)?.[scoreKey];

    if (newScore !== undefined) {
      try {
        const { error } = await supabase
          .from('matches')
          .update({ [scoreKey]: newScore })
          .eq('match_id', matchId);

        if (error) {
          console.error('Error updating score in the database:', error.message);
        }
      } catch (error) {
        console.error('Unexpected error during score update:', error);
      }
    }
  };

  // Match Card Component
  const MatchCard = ({ match }: { match: Match }) => {
    const isEditing = editingMatch?.match_id === match.match_id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-lg p-6 mb-4 border border-gray-700 hover:border-blue-500 transition-all"
      >
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="team1" className="text-white">Team 1</label>
              <select
                id="team1"
                value={editingMatch.team1}
                onChange={(e) => setEditingMatch({ ...editingMatch, team1: e.target.value })}
                className="bg-gray-700 text-white w-full p-2 rounded"
              >
                {teams.map((team) => (
                  <option key={team.team_name} value={team.team_name}>
                    {team.team_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="team2" className="text-white">Team 2</label>
              <select
                id="team2"
                value={editingMatch.team2}
                onChange={(e) => setEditingMatch({ ...editingMatch, team2: e.target.value })}
                className="bg-gray-700 text-white w-full p-2 rounded"
              >
                {teams.map((team) => (
                  <option key={team.team_name} value={team.team_name}>
                    {team.team_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="text-white">Match Status</label>
              <select
                id="status"
                value={editingMatch.status}
                onChange={(e) => setEditingMatch({ ...editingMatch, status: e.target.value })}
                className="bg-gray-700 text-white w-full p-2 rounded"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleUpdateMatch(match.match_id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Save className="w-4 h-4 mr-2" /> Save
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditingMatch(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </motion.button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-xl font-bold">{match.teams1?.team_name} vs {match.teams2?.team_name}</div>
            <div className="flex justify-between mt-2 text-gray-400">
              <span>{match.status}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateScore(match.match_id, 1, true)}
                  className="text-green-500"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <span>{match.team1_points}</span>
                <button
                  onClick={() => updateScore(match.match_id, 1, false)}
                  className="text-red-500"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span> - </span>
                <button
                  onClick={() => updateScore(match.match_id, 2, true)}
                  className="text-green-500"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <span>{match.team2_points}</span>
                <button
                  onClick={() => updateScore(match.match_id, 2, false)}
                  className="text-red-500"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex justify-end mt-2 space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditingMatch(match)}
                className="text-blue-500"
              >
                <Edit2 className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeleteMatch(match.match_id)}
                className="text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="p-4">
        <h1 className="text-3xl text-white mb-4">Admin Dashboard</h1>
        <div className="space-y-4">
          {matches.map((match) => (
            <MatchCard key={match.match_id} match={match} />
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
