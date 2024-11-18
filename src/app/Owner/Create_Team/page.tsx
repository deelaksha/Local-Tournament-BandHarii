'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import Navbar from '@/app/Owner/Header/page';

const CreateTeamPage = () => {
  const searchParams = useSearchParams();
  const sportsName = searchParams.get('sport');
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<{ phone_number: string; name: string }[]>([]);
  const [playerDropdowns, setPlayerDropdowns] = useState<number[]>([]);
  const [playerOptions, setPlayerOptions] = useState<{ phone_number: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('phone_number, name');

      if (error) {
        console.error('Error fetching players:', error);
        setError('Failed to fetch player list.');
      } else {
        const playerNames = data?.map((player) => ({
          phone_number: player.phone_number,
          name: player.name,
        })) || [];
        setPlayerOptions(playerNames);
      }
      setLoading(false);
    };

    fetchPlayers();
  }, []);

  const handleAddPlayerDropdown = () => {
    setPlayerDropdowns([...playerDropdowns, playerDropdowns.length]);
    setPlayers([...players, { phone_number: '', name: '' }]);
  };

  const handlePlayerChange = (id: number, phone_number: string, name: string) => {
    setPlayers(players.map((player, index) => (index === id ? { phone_number, name } : player)));
    setPlayerOptions(playerOptions.filter((option) => option.phone_number !== phone_number));
  };

  const handleRemovePlayerDropdown = (id: number) => {
    const removedPlayer = players[id];
    setPlayerDropdowns(playerDropdowns.filter((dropdownId) => dropdownId !== id));
    setPlayers(players.filter((_, index) => index !== id));

    if (removedPlayer.phone_number) {
      setPlayerOptions([...playerOptions, removedPlayer]);
    }
  };

  const handleRegisterTeam = async () => {
    if (!teamName) {
      setError('Please enter a team name.');
      return;
    }
    if (players.length === 0 || players.some((player) => !player.name)) {
      setError('Please add valid players.');
      return;
    }

    setLoading(true);

    try {
      const { error: teamError } = await supabase
        .from('teams')
        .insert([{ team_name: teamName, sports_name: sportsName }])
        .select();

      if (teamError) {
        console.error('Error registering team:', teamError.message);
        setError(`Failed to register team: ${teamError.message}`);
        setLoading(false);
        return;
      }

      const playerInsertions = players.map((player) => ({
        phone_number: player.phone_number,
        team_name: teamName,
        player_name: player.name,
      }));

      const { error: playersError } = await supabase
        .from('players')
        .insert(playerInsertions);

      if (playersError) {
        console.error('Error registering players:', playersError.message);
        setError(`Failed to register players: ${playersError.message}`);
      } else {
        alert('Team and players registered successfully!');
        setTeamName('');
        setPlayers([]);
        setPlayerDropdowns([]);
        setPlayerOptions([]);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Unexpected error occurred while registering the team.');
    }

    setLoading(false);
  };

  if (loading) return <p className="text-gray-400">Loading player options...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <>
      <Navbar />
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-300 mb-4">Create Team</h1>

        <input
          type="text"
          placeholder="Enter Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="border-gray-600 bg-gray-700 p-2 mb-4 w-full rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-gray-800"
        />

        <button
          onClick={handleAddPlayerDropdown}
          className="px-4 py-2 bg-purple-600 text-gray-300 rounded mb-4 hover:bg-purple-700 transition duration-300"
        >
          Add Player
        </button>

        {playerDropdowns.map((id) => (
          <div key={id} className="flex items-center mb-2">
            <CustomDropdown
              options={playerOptions}
              selectedPlayer={players[id]?.name || ''}
              onSelect={(phone_number, name) => handlePlayerChange(id, phone_number, name)}
            />
            <button
              onClick={() => handleRemovePlayerDropdown(id)}
              className="px-2 py-1 bg-red-600 text-gray-300 rounded ml-2 hover:bg-red-700 transition duration-300"
            >
              Delete
            </button>
          </div>
        ))}

        <button
          onClick={handleRegisterTeam}
          className="px-4 py-2 bg-green-600 text-gray-300 rounded mt-4 hover:bg-green-700 transition duration-300"
        >
          Register Team
        </button>

        {sportsName ? (
          <div>
            <h2 className="text-2xl font-semibold text-gray-300 mt-4">Create Team For: {sportsName}</h2>
          </div>
        ) : (
          <p className="text-gray-400">No sport selected</p>
        )}
        <h1 className="text-2xl font-semibold text-gray-300 mt-4">
          Remaining Players to Add: {playerOptions.length}
        </h1>
      </div>
    </>
  );
};

const CustomDropdown = ({
  options,
  selectedPlayer,
  onSelect,
}: {
  options: { phone_number: string; name: string }[];
  selectedPlayer: string;
  onSelect: (phone_number: string, name: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={selectedPlayer}
        onClick={() => setIsOpen(!isOpen)}
        onChange={(e) => {
          setSearchText(e.target.value);
          setIsOpen(true);
        }}
        placeholder="Select or search player"
        className="border-gray-600 bg-gray-700 p-2 w-full rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-gray-800"
      />

      {isOpen && (
        <ul className="absolute z-10 bg-gray-800 border-gray-600 w-full mt-1 max-h-40 overflow-y-auto rounded-md shadow-lg">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              onClick={() => {
                onSelect(option.phone_number, option.name);
                setIsOpen(false);
                setSearchText('');
              }}
              className="p-2 hover:bg-gray-600 cursor-pointer text-gray-300"
            >
              {option.name}
            </li>
          ))}
          {filteredOptions.length === 0 && (
            <li className="p-2 text-gray-500">No matching players</li>
          )}
        </ul>
      )}
    </div>
  );
};

const PageWrapper = () => (
  <Suspense fallback={<p>Loading...</p>}>
    <CreateTeamPage />
  </Suspense>
);

export default PageWrapper;
