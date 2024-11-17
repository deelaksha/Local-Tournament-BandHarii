'use client';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Camera, Gamepad2, Trophy, Loader2, CheckCircle, X, AlertCircle} from 'lucide-react';
import Navbar from '@/app/Header/page';

// Component for loading button
const LoadingButton = ({ loading, children, onClick, className, disabled }) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    className={`relative flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    } ${className}`}
  >
    {loading ? <Loader2 className="animate-spin" size={24} /> : children}
  </button>
);

// Component for validation messages
const ValidationMessage = ({ isValid, message, isChecking }) => {
  if (isChecking) {
    return (
      <div className="mt-1 space-y-2">
        <div className="h-2 bg-gray-700 rounded animate-pulse w-2/3"></div>
      </div>
    );
  }

  if (message) {
    return (
      <div className={`flex items-center gap-2 mt-1 text-sm ${isValid ? 'text-green-500' : 'text-red-500'}`}>
        {isValid ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
        {message}
      </div>
    );
  }

  return null;
};

// Component for input fields
const InputField = ({ 
  icon: Icon, 
  placeholder, 
  value, 
  onChange, 
  name, 
  type = 'text',
  isValid,
  isChecking,
  validationMessage,
  onBlur
}) => (
  <div className="relative group space-y-1">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 transition-all duration-300 group-hover:scale-110">
      <Icon size={20} />
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`w-full pl-12 pr-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:outline-none transition-all duration-300 text-white placeholder-gray-400 group-hover:border-purple-400 ${
        isValid === true ? 'border-green-500 focus:ring-green-600' :
        isValid === false ? 'border-red-500 focus:ring-red-600' :
        'border-purple-500 focus:ring-purple-600'
      }`}
    />
    <ValidationMessage isValid={isValid} message={validationMessage} isChecking={isChecking} />
  </div>
);

// Component for image preview
const ImagePreview = ({ image, onRemove }) => (
  <div className="relative">
    <Image 
      src={image} 
      alt="Preview" 
      width={128}
      height={128}
      className="w-32 h-32 object-cover rounded-lg border-2 border-purple-500" 
    />
    <button 
      onClick={onRemove} 
      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors duration-300"
    >
      <X size={16} className="text-white" />
    </button>
  </div>
);

const GamingRegistrationForm = () => {
  const [formData, setFormData] = useState({ name: '', mobile: '', tournamentCode: '' });
  const [validation, setValidation] = useState({
    name: { isValid: null, message: '', isChecking: false },
    mobile: { isValid: null, message: '', isChecking: false },
    tournamentCode: { isValid: null, message: '', isChecking: false }
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState('loading'); // 'open', 'closed', 'loading'

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('registration_status')
          .select('status')
          .eq('id', 1)
          .single();

        if (error) throw error;
        setRegistrationStatus(data?.status || 'closed');
      } catch (err) {
        console.error('Failed to fetch registration status:', err);
        setRegistrationStatus('closed');
      }
    };

    fetchRegistrationStatus();
  }, []);

  const validateField = async (name, value) => {
    setValidation(prev => ({
      ...prev,
      [name]: { ...prev[name], isChecking: true }
    }));

    try {
      switch (name) {
        case 'name': {
          if (!value.trim()) {
            return { isValid: false, message: 'Name is required' };
          }
          const { data } = await supabase
            .from('users')
            .select('name')
            .eq('name', value)
            .single();
          
          return {
            isValid: !data,
            message: data ? 'Name already exists' : 'Name is available'
          };
        }
        case 'mobile': {
          if (!value.trim()) {
            return { isValid: false, message: 'Mobile number is required' };
          }
          if (!/^\d{10}$/.test(value)) {
            return { isValid: false, message: 'Invalid mobile number format' };
          }
          const { data } = await supabase
            .from('users')
            .select('phone_number')
            .eq('phone_number', value)
            .single();
          
          return {
            isValid: !data,
            message: data ? 'Mobile number already registered' : 'Mobile number is available'
          };
        }
        case 'tournamentCode': {
          if (!value.trim()) {
            return { isValid: false, message: 'Tournament code is required' };
          }
          const { data } = await supabase
            .from('tournament_codes')
            .select('code')
            .eq('code', value)
            .single();
          
          return {
            isValid: !!data,
            message: data ? 'Valid tournament code' : 'Invalid tournament code'
          };
        }
        default:
          return { isValid: null, message: '' };
      }
    } catch (error) {
      console.error(`Error validating ${name}:`, error);
      return { isValid: false, message: 'Error checking availability' };
    } finally {
      setValidation(prev => ({
        ...prev,
        [name]: { ...prev[name], isChecking: false }
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInputBlur = async (e) => {
    const { name, value } = e.target;
    const result = await validateField(name, value);
    setValidation(prev => ({
      ...prev,
      [name]: { ...result, isChecking: false }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 1:
        return validation.name.isValid;
      case 2:
        return validation.mobile.isValid && validation.tournamentCode.isValid;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      if (imageFile) {
        const { data, error: imageError } = await supabase.storage
          .from('images')
          .upload(`players/${Date.now()}-${imageFile.name}`, imageFile);
        
        if (imageError) throw imageError;
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${data.path}`;
      }

      const { error: insertError } = await supabase.from('users').insert({
        name: formData.name,
        phone_number: formData.mobile,
        tournament_code: formData.tournamentCode,
        image_url: imageUrl,
      });

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (error) {
      console.error('Error:', error.message);
      alert('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (registrationStatus === 'loading') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <Loader2 className="animate-spin text-purple-500 w-10 h-10" />
        </div>
      </>
    );
  }

  if (registrationStatus === 'closed') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center space-y-4">
            <AlertCircle className="text-red-500 w-16 h-16 mx-auto" />
            <h2 className="text-2xl font-bold">Registration Closed</h2>
            <p className="text-gray-400">Unfortunately, the registration is not open at the moment.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-xl p-6 space-y-6">
          {!submitted ? (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-purple-500 flex items-center justify-center gap-2">
                  <Trophy className="animate-pulse" />
                  Tournament Registration
                </h2>
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${step >= i ? 'bg-purple-500' : 'bg-gray-600'} transition-colors duration-300`}
                    />
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <InputField 
                      icon={Gamepad2}
                      placeholder="Player Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      isValid={validation.name.isValid}
                      isChecking={validation.name.isChecking}
                      validationMessage={validation.name.message}
                    />
                    <LoadingButton 
                      loading={validation.name.isChecking}
                      onClick={() => setStep(2)}
                      disabled={!canProceedToNextStep()}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Next Level →
                    </LoadingButton>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <InputField
                      icon={Gamepad2}
                      placeholder="Mobile Number"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      isValid={validation.mobile.isValid}
                      isChecking={validation.mobile.isChecking}
                      validationMessage={validation.mobile.message}
                    />
                    <InputField
                      icon={Trophy}
                      placeholder="Tournament Code"
                      name="tournamentCode"
                      value={formData.tournamentCode}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      isValid={validation.tournamentCode.isValid}
                      isChecking={validation.tournamentCode.isChecking}
                      validationMessage={validation.tournamentCode.message}
                    />
                    <div className="flex gap-2">
                      <LoadingButton 
                      loading={false}
                      onClick={() => setStep(1)}
                      className="w-1/2 bg-gray-600 hover:bg-gray-700 text-white"
                        disabled={validation.tournamentCode.isChecking || !validation.tournamentCode.isValid} // Example condition
                        >
                          ← Back
                      </LoadingButton>

                      <LoadingButton 
                        loading={validation.mobile.isChecking || validation.tournamentCode.isChecking}
                        onClick={() => setStep(3)}
                        disabled={!canProceedToNextStep()}
                        className="w-1/2 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Next Level →
                      </LoadingButton>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        accept="image/*"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-500 rounded-lg cursor-pointer hover:border-purple-400 transition-colors duration-300"
                      >
                        {imagePreview ? (
                          <ImagePreview image={imagePreview} onRemove={() => {
                            setImagePreview(null);
                            setImageFile(null);
                          }} />
                        ) : (
                          <>
                            <Camera className="w-8 h-8 text-purple-500" />
                            <span className="mt-2 text-sm text-purple-500">Upload your gamer pic</span>
                          </>
                        )}
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <LoadingButton
  loading={false}
  onClick={() => setStep(2)}
  className="w-1/2 bg-gray-600 hover:bg-gray-700 text-white"
  disabled={false} // Add the disabled prop here
>
  ← Back
</LoadingButton>

                      <LoadingButton
                        loading={loading}
                        onClick={handleSubmit}
                        disabled={!imageFile}
                        className="w-1/2 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Submit 🚀
                      </LoadingButton>
                    </div>
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 animate-fadeIn">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-xl font-bold text-purple-500">
                Registration Successful!
              </h2>
              <p className="text-gray-400">
                Thank you for registering. We wish you the best of luck in the tournament!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GamingRegistrationForm;
