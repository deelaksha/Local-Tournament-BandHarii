'use client';
import Navbar from '@/app/Owner/Header/page';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

const RegistrationControlPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the current status from the database
  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('registration_status')
        .select('status')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching status:', error);
        throw error;
      }

      setStatus(data?.status || 'closed'); // Default to 'closed' if no data
    } catch (err) {
      setError('Failed to fetch registration status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle status between 'open' and 'closed'
  const toggleStatus = async () => {
    setLoading(true);
    try {
      // Fetch the current status
      const { data, error: fetchError } = await supabase
        .from('registration_status')
        .select('status')
        .eq('id', 1)
        .single();

      if (fetchError) {
        console.error('Error fetching status for update:', fetchError);
        throw fetchError;
      }

      // Determine the new status
      const currentStatus = data?.status;
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';

      // Update the status in the database
      const { error: updateError } = await supabase
        .from('registration_status')
        .update({ status: newStatus })
        .eq('id', 1);

      if (updateError) {
        console.error('Error updating status:', updateError);
        throw updateError;
      }

      setStatus(newStatus);
    } catch (err) {
      setError('Failed to toggle registration status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch status on component mount
  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 text-white w-full max-w-md p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Registration Control</h1>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div className="space-y-4">
              {error && <p className="text-red-500">{error}</p>}
              <p>
                Current Status:{' '}
                <span
                  className={`font-bold ${status === 'open' ? 'text-green-500' : 'text-red-500'}`}
                >
                  {status === 'open' ? 'Open' : 'Closed'}
                </span>
              </p>
              <button
                onClick={toggleStatus}
                className={`px-4 py-2 rounded-lg text-white ${
                  status === 'open' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                } transition-all duration-300`}
                disabled={loading}
              >
                {status === 'open' ? 'Close Registration' : 'Open Registration'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RegistrationControlPage;
