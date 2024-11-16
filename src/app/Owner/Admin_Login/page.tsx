'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    const ADMIN_PASSWORD = 'admin@123';

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/Owner/SportsCategory'); // Redirect after successful login
    } else {
      alert('Invalid password. Please try again.');
    }
  };

  return (
    <div>
      <h1>Admin Login</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default AdminLogin;
