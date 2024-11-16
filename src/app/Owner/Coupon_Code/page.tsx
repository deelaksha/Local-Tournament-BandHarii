'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import Navbar from '@/app/Owner/Header/page';

const TournamentCodeInput = () => {
  const [tournamentCode, setTournamentCode] = useState('');
  const [message, setMessage] = useState('');
  const [codes, setCodes] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tournamentCode.trim()) {
      setMessage('Please enter a valid tournament code.');
      return;
    }

    try {
      const { error } = await supabase
        .from('tournament_code')
        .insert([{ code: tournamentCode }]);

      if (error) {
        console.error('Error inserting tournament code:', error);
        setMessage('Error submitting tournament code. Please try again.');
      } else {
        setMessage(`Tournament code "${tournamentCode}" submitted successfully!`);
        setTournamentCode('');
        fetchCodes(); // Refresh the list of codes after insertion
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase.from('tournament_code').select('code');

      if (error) {
        console.error('Error fetching codes:', error);
        setError('Error fetching coupon codes.');
      } else {
        setCodes(data.map((item: { code: string }) => item.code));
        setError('');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred while fetching codes.');
    }
  };

  const handleDelete = async (codeToDelete: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the code "${codeToDelete}"?`
    );

    if (!confirmed) return; // Exit if the user cancels

    try {
      const { error } = await supabase
        .from('tournament_code')
        .delete()
        .eq('code', codeToDelete);

      if (error) {
        console.error('Error deleting code:', error);
        setMessage('Error deleting code. Please try again.');
      } else {
        setMessage(`Code "${codeToDelete}" deleted successfully!`);
        fetchCodes(); // Refresh the list of codes after deletion
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage('An unexpected error occurred while deleting code.');
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-8 bg-gray-800 p-6 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Code Submission Form */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Enter Tournament Code</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="tournamentCode"
                className="block text-sm font-medium text-gray-300"
              >
                Tournament Code
              </label>
              <input
                id="tournamentCode"
                type="text"
                value={tournamentCode}
                onChange={(e) => setTournamentCode(e.target.value)}
                className="mt-1 block w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter your code"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-all"
            >
              Submit
            </button>
          </form>
          {message && (
            <div className="mt-4 text-sm text-center text-emerald-400 bg-gray-700 p-2 rounded-md">
              {message}
            </div>
          )}
        </div>

        {/* Display Coupon Codes */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Available Coupon Codes</h2>
          {error ? (
            <div className="bg-red-500 text-white p-2 rounded-md">{error}</div>
          ) : (
            <ul className="space-y-2">
              {codes.length > 0 ? (
                codes.map((code, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-700 text-white p-2 rounded-md border border-gray-600"
                  >
                    <span>{code}</span>
                    <button
                      onClick={() => handleDelete(code)}
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md transition-all"
                    >
                      Delete
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-300">No codes available.</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default TournamentCodeInput;
