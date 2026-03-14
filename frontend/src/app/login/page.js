"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE from '../../lib/api';
import { PhoneIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/auth/send-otp`, {
        name,
        phone_number: phone
      });
      console.log("Demo OTP:", response.data.demo_otp);
      setStep(2);
    } catch (err) {
      setError('Failed to send OTP. Please check your number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/auth/verify-otp`, {
        phone_number: phone,
        otp
      });
      localStorage.setItem('user', JSON.stringify({ name, phone, role: 'citizen' }));
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-warm-neutral px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="brutalist-card bg-white p-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-navy-blue text-white brutalist-button flex items-center justify-center mx-auto mb-6 text-3xl font-black">
            B
          </div>
          <h1 className="text-4xl font-black text-navy-blue uppercase tracking-tighter">
            {step === 1 ? 'Citizen Login' : 'Secure OTP'}
          </h1>
          <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs">
            Bengaluru Sahaya Portal 2026
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-black uppercase text-navy-blue mb-2">Full Name</label>
              <div className="relative brutalist-card p-1 flex items-center">
                <UserIcon className="w-6 h-6 ml-3 text-navy-blue" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 font-bold focus:outline-none"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black uppercase text-navy-blue mb-2">Phone Number</label>
              <div className="relative brutalist-card p-1 flex items-center">
                <PhoneIcon className="w-6 h-6 ml-3 text-navy-blue" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-4 font-bold focus:outline-none"
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-xs font-bold uppercase border-2 border-red-500 p-3 bg-red-50">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-navy-blue text-white h-16 brutalist-button font-black text-xl uppercase tracking-widest hover:bg-blue-900 transition-all"
            >
              {loading ? 'Sending...' : 'Request OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-black uppercase text-navy-blue mb-2">Enter 4-Digit OTP</label>
              <div className="relative brutalist-card p-1 flex items-center">
                <ShieldCheckIcon className="w-6 h-6 ml-3 text-navy-blue" />
                <input 
                  type="text" 
                  maxLength="4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-4 font-black text-3xl tracking-[1em] text-center focus:outline-none"
                  placeholder="0000"
                  required
                />
              </div>
              <p className="mt-4 text-xs font-bold text-gray-400 text-center uppercase">
                An OTP was sent to {phone}
              </p>
            </div>

            {error && <p className="text-red-600 text-xs font-bold uppercase border-2 border-red-500 p-3 bg-red-50">{error}</p>}

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border-4 border-navy-blue h-16 brutalist-button font-black uppercase"
              >
                Back
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-navy-blue text-white h-16 brutalist-button font-black text-xl uppercase tracking-widest"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
