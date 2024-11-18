'use client'
import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Edit2, Trash2, Save, X, CheckCircle } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';  // Adjust path if necessary
import Navbar from '@/app/Owner/Header/page';

type Team = {
  team_name: string;
};

type Match = {
  match_id: number;
  team1: string; // Assuming it's the team name or ID
  team2: string;
  team1_points: number;
  team2_points: number;
  status: 'upcoming' | 'live' | 'completed';
  sports_name: string;
  teams1?: { team_name: string }; // Nested team1 info
  teams2?: { team_name: string }; // Nested team2 info
};

const AdminDashboard = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  
  const [isAddingMatch, setIsAddingMatch] = useState(false);
  
  const [sportsName, setSportsName] = useState<string | null>(null); // Declare state for sports_name
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const [newMatch, setNewMatch] = useState({
    team1: '',
    team2: '',
    status: 'upcoming',
    team1_points: 0,
    team2_points: 0
  });

  const statuses = ['upcoming', 'live', 'completed'];

  // Fetch sports_name from the URL only on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSportsName(params.get('sport'));
    }
  }, []); // Empty dependency array to run only once after mount

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
          sports_name: sportsName
        }])
        .select(); // Ensure it returns the inserted row

      if (error) {
        console.error('Error adding match:', error.message);
      } else if (data) {
        // Update the matches state with the new match
        setMatches((prev) => [...prev, data[0]]);
        // Reset new match form
        setNewMatch({
          team1: '',
          team2: '',
          status: 'upcoming',
          team1_points: 0,
          team2_points: 0,
        });
        setIsAddingMatch(false);
        // Show success message
        alert('Match added successfully');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  } else {
    console.error('Please provide valid and distinct team1 and team2.');
  }
};



  // Update match
  const handleUpdateMatch = async (matchId: number) => {
    // Ensure editingMatch has all required fields
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
  

  // Delete match
  const handleDeleteMatch = async (matchId: number) => {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('match_id', matchId);

    if (error) {
      console.error('Error deleting match:', error);
    } else {
      setMatches((prev) => prev.filter((match) => match.match_id !== matchId));
      // Show success message
      alert('Match deleted successfully');
    }
  };

  // Update score
// Update score function
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


  const MatchCard = ({ match }: { match: Match}) => {
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
            <FormSelect
              label="Team 1"
              value={editingMatch.team1}
              onChange={(e) => setEditingMatch({ ...editingMatch, team1: e.target.value })}
              options={teams.map((team) => team.team_name)}
            />
            <FormSelect
              label="Team 2"
              value={editingMatch.team2}
              onChange={(e) => setEditingMatch({ ...editingMatch, team2: e.target.value })}
              options={teams.map((team) => team.team_name)}
            />
             
            <div className="flex justify-end space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleUpdateMatch(match.match_id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
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
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className="text-blue-400 font-bold text-lg">
                  {match.teams1?.team_name || 'Team 1'}
                </span>
                <span className="text-gray-500 mx-4">vs</span>
                <span className="text-red-400 font-bold text-lg">
                  {match.teams2?.team_name || 'Team 2'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingMatch(match)}
                  className="p-2 bg-blue-600 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteMatch(match.match_id)}
                  className="p-2 bg-red-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-xl font-bold">{match.team1_points} - {match.team2_points}</div>
              <div className="text-lg font-semibold">{sportsName}</div>
              {match.status === 'live' && (
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateScore(match.match_id, 1, true)}
                    disabled={match.status !== 'live'}
                    className="p-1 bg-gray-700 rounded-full disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                  <span className="text-2xl font-bold text-white w-8 text-center">
                    {match.team1_points}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateScore(match.match_id, 1, false)}
                    disabled={match.status !== 'live'}
                    className="p-1 bg-gray-700 rounded-full disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateScore(match.match_id, 2, true)}
                    disabled={match.status !== 'live'}
                    className="p-1 bg-gray-700 rounded-full disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                  <span className="text-2xl font-bold text-white w-8 text-center">
                    {match.team2_points}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateScore(match.match_id, 2, false)}
                    disabled={match.status !== 'live'}
                    className="p-1 bg-gray-700 rounded-full disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    );
  };

  const FormSelect = ({ label, value, onChange, options }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[] }) => (
    <div className="flex flex-col">
      <label className="text-gray-400 text-sm">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="p-2 bg-gray-800 border border-gray-700 rounded-lg w-full"
      >
        <option value="">Select {label}</option>
        {options && options.length > 0 ? (
          options.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))
        ) : (
          <option value="">No teams available</option>
        )}
      </select>
    </div>
  );

  return (
    <>
    <Navbar/>
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {isAddingMatch ? (
        <div className="space-y-4">
          <FormSelect
            label="Team 1"
            value={newMatch.team1}
            onChange={e => setNewMatch({ ...newMatch, team1: e.target.value })}
            options={teams.map((team) => team.team_name)}
          />
          <FormSelect
            label="Team 2"
            value={newMatch.team2}
            onChange={e => setNewMatch({ ...newMatch, team2: e.target.value })}
            options={teams.map((team) => team.team_name)}
          />
          <FormSelect
            label="Status"
            value={newMatch.status}
            onChange={e => setNewMatch({ ...newMatch, status: e.target.value })}
            options={statuses}
          />
          <div className="flex justify-end space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddMatch}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Add Match
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddingMatch(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <X className="w-4 h-4 mr-2" /> Cancel
            </motion.button>
          </div>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddingMatch(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Match
        </motion.button>
      )}

      <div className="mt-6">
        <AnimatePresence>
          {matches.map(match => (
            <MatchCard key={match.match_id} match={match} />
          ))}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
};

export default function PageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}> {/* Wrap the ManageTeamsPage with Suspense */}
      <AdminDashboard />
    </Suspense>
  );
}