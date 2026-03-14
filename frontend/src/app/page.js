"use client";

import { useTranslation } from 'react-i18next';
import MayaChatbot from '../components/MayaChatbot';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen bg-warm-neutral">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden border-b-[12px] border-navy-blue">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale-[50%] hover:grayscale-0 transition-all duration-700"
          style={{ backgroundImage: "url('/vidhana-soudha.png')" }}
          aria-hidden="true"
        ></div>
        <div className="absolute inset-0 z-10 bg-navy-blue/70 backdrop-blur-[1px]" aria-hidden="true"></div>
        
        <div className="relative z-20 text-center px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-white text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none mb-6">
              Bengaluru <br /> <span className="text-action-gold italic">Sahaya</span>
            </h1>
            <p className="text-white text-xl md:text-2xl font-bold uppercase tracking-widest bg-navy-blue inline-block px-6 py-2 mb-12 shadow-[8px_8px_0px_#FFD700]">
              The Unified Citizen Command Center
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link 
                href="/login" 
                className="bg-action-gold text-navy-blue px-12 py-6 brutalist-button font-black text-2xl uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-105 transition-all"
              >
                <UserIcon className="w-8 h-8" />
                Citizen Login
              </Link>
              <Link 
                href="/admin/login" 
                className="bg-white text-navy-blue px-12 py-6 brutalist-button font-black text-2xl uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-105 transition-all"
              >
                <ShieldCheckIcon className="w-8 h-8" />
                Admin Portal
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="container mx-auto py-24 px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <Link href="/about" className="group">
            <div className="brutalist-card bg-white p-12 h-full hover:bg-navy-blue transition-colors border-navy-blue border-4">
              <h3 className="text-4xl font-black uppercase text-navy-blue group-hover:text-white mb-6 tracking-tighter">About Our Mission</h3>
              <p className="text-xl font-bold text-gray-500 group-hover:text-blue-100/60 leading-relaxed uppercase">
                Learn how we are rebuilding trust in city administration through AI verification and transparent tracking.
              </p>
              <div className="mt-12 flex items-center text-navy-blue group-hover:text-action-gold font-black uppercase tracking-widest">
                Read History <ArrowRightIcon className="w-6 h-6 ml-4" />
              </div>
            </div>
          </Link>

          <Link href="/track" className="group">
            <div className="brutalist-card bg-navy-blue p-12 h-full hover:bg-white transition-colors border-navy-blue border-4 shadow-[15px_15px_0px_#FFD700]">
              <h3 className="text-4xl font-black uppercase text-white group-hover:text-navy-blue mb-6 tracking-tighter">Track Reality</h3>
              <p className="text-xl font-bold text-blue-100/60 group-hover:text-gray-500 leading-relaxed uppercase">
                Got an ID? Monitor the real-time resolution of your reports. No hidden processes.
              </p>
              <div className="mt-12 flex items-center text-action-gold group-hover:text-navy-blue font-black uppercase tracking-widest">
                Check Status <ArrowRightIcon className="w-6 h-6 ml-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      <div className="h-32"></div> 
      <MayaChatbot />
    </div>
  );
}
