"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import API_BASE from '../../../lib/api';
import { motion } from 'framer-motion';
import { ShieldExclamationIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/solid';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE}/admin/login`, {
        username,
        password
      });
      
      localStorage.setItem('admin_token', response.data.access_token);
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-neutral flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md brutalist-card p-10 bg-white"
      >
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-navy-blue text-white brutalist-button">
            <ShieldExclamationIcon className="w-12 h-12" />
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-center uppercase tracking-tighter mb-8 bg-navy-blue text-white py-2">
          Admin Portal
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-black uppercase tracking-widest text-navy-blue/60 mb-2">Username</label>
            <div className="relative brutalist-card p-1 flex items-center">
              <UserIcon className="w-6 h-6 ml-3 text-navy-blue" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 font-bold focus:outline-none"
                placeholder="Admin ID"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-widest text-navy-blue/60 mb-2">Password</label>
            <div className="relative brutalist-card p-1 flex items-center">
              <LockClosedIcon className="w-6 h-6 ml-3 text-navy-blue" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 font-bold focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-4 text-red-600 font-bold uppercase text-xs text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-navy-blue text-white brutalist-button h-16 flex items-center justify-center font-black text-xl uppercase tracking-wider hover:bg-blue-900 transition-all"
          >
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>
        
        <p className="text-center mt-8 text-xs font-bold text-gray-400 uppercase">
          Authorized Personnel Only • IP: Logged
        </p>
      </motion.div>
    </div>
  );
}
