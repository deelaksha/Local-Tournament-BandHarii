'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import Navbar from '@/app/Owner/Header/page';
import { Calendar, Trash2, Plus, AlertCircle, Check, Loader2 } from 'lucide-react';

// Enhanced dynamic input component
const DynamicInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  icon: Icon,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (name: string, value: string) => void;
  icon?: React.ElementType;
  error?: string;
}) => (
  <div className="space-y-2">
    <label htmlFor={name} className="text-gray-200 font-medium flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      {label}
    </label>
    <div className="relative">
      <input
        id={name}
        name={name}
        type={type}
        required
        className={`w-full p-3 rounded-lg bg-gray-700/50 border ${
          error ? 'border-red-500' : 'border-gray-600'
        } text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200`}
        value={value}
        onChange={(e) => onChange(e.target.name, e.target.value)}
      />
      {error && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
      )}
    </div>
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

const SportsRegistrationForm = () => {
  const [formData, setFormData] = useState({
    sportName: '',
    sportDate: '',
  });
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const fetchSports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .order('sports_date', { ascending: true });

      if (error) throw error;
      setSports(data || []);
    } catch (error) {
      console.error('Error fetching sports:', error);
      showNotification('error', 'Failed to fetch sports');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: null, message: '' }), 5000);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.sportName.trim()) {
      newErrors.sportName = 'Sport name is required';
    }
    if (!formData.sportDate) {
      newErrors.sportDate = 'Sport date is required';
    } else {
      const selectedDate = new Date(formData.sportDate);
      const today = new Date();
      if (selectedDate < today) {
        newErrors.sportDate = 'Date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitLoading(true);
    try {
      const { data: existingData, error: fetchError } = await supabase
        .from('sports')
        .select('*')
        .eq('sports_name', formData.sportName)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingData) {
        setErrors({ sportName: 'This sport name already exists' });
        return;
      }

      const { error: insertError } = await supabase
        .from('sports')
        .insert([{ sports_name: formData.sportName, sports_date: formData.sportDate }]);

      if (insertError) throw insertError;

      showNotification('success', 'Sport created successfully!');
      setFormData({ sportName: '', sportDate: '' });
      fetchSports();
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('error', 'Failed to create sport');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (sports_name: string) => {
    const confirmation = confirm(`Are you sure you want to delete the sport "${sports_name}"?`);
    if (!confirmation) return;
  
    try {
      const { error } = await supabase.from('sports').delete().eq('sports_name', sports_name);
      if (error) throw error;
  
      showNotification('success', 'Sport deleted successfully');
      fetchSports();
    } catch (error) {
      console.error('Error deleting sport:', error);
      showNotification('error', 'Failed to delete sport');
    }
  };
  

  useEffect(() => {
    fetchSports();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />

      {/* Notification */}
      {notification.type && (
        <div className={`fixed top-4 right-4 z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300`}>
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {notification.message}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gray-750 border-b border-gray-700">
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
              Sports Management Dashboard
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Form Section */}
            <div className="w-full lg:w-1/2 p-6 lg:p-8">
              <div className="bg-gray-750 rounded-xl p-6 shadow-inner">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Sport
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <DynamicInput
                    label="Sport Name"
                    name="sportName"
                    value={formData.sportName}
                    onChange={handleChange}
                    error={errors.sportName}
                  />
                  <DynamicInput
                    label="Sport Date"
                    name="sportDate"
                    type="date"
                    value={formData.sportDate}
                    onChange={handleChange}
                    icon={Calendar}
                    error={errors.sportDate}
                  />
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {submitLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                    {submitLoading ? 'Creating...' : 'Create Sport'}
                  </button>
                </form>
              </div>
            </div>

            {/* Sports List Section */}
            <div className="w-full lg:w-1/2 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-700">
              <div className="bg-gray-750 rounded-xl p-6 shadow-inner h-full">
                <h2 className="text-xl font-bold text-white mb-6">Registered Sports</h2>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : sports.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No sports registered yet</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {sports.map((sport) => (
                      <div
                        key={sport.sports_name}
                        className="bg-gray-700/50 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-600 hover:border-emerald-500/50 group"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {sport.sports_name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {new Date(sport.sports_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(sport.sports_name)}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsRegistrationForm;