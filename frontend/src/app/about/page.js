"use client";

import { motion } from 'framer-motion';
import { ShieldCheckIcon, UserGroupIcon, BuildingLibraryIcon } from '@heroicons/react/24/solid';

export default function About() {
  return (
    <div className="min-h-screen bg-warm-neutral pb-20">
      {/* Hero Header */}
      <section className="bg-navy-blue text-white py-32 px-4 border-b-[12px] border-action-gold">
        <div className="container mx-auto text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8"
          >
            Empowering <br /> <span className="text-action-gold">Bengaluru</span>
          </motion.h1>
          <p className="text-2xl max-w-3xl mx-auto font-bold opacity-80 uppercase tracking-widest leading-relaxed">
            Leading the transformation of public governance through technology, transparency, and direct citizen action.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="container mx-auto py-32 px-4">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="brutalist-card bg-white p-12">
            <h2 className="text-5xl font-black text-navy-blue uppercase mb-8 leading-none">Our digital <br /> philosophy</h2>
            <p className="text-xl font-bold text-gray-600 mb-8 leading-relaxed">
              Bengaluru Sahaya 2026 is built on the principle of "Active Accountability." We believe that every citizen is an observer, and every observation is a step toward a better city.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <ShieldCheckIcon className="w-8 h-8 text-navy-blue mt-1 shrink-0" />
                <div>
                  <h4 className="font-black uppercase text-lg">Bank-Grade Security</h4>
                  <p className="font-bold text-gray-400">Your personal data is encrypted and protected under GIGW 3.0 standards.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <UserGroupIcon className="w-8 h-8 text-navy-blue mt-1 shrink-0" />
                <div>
                  <h4 className="font-black uppercase text-lg">Citizen Centric</h4>
                  <p className="font-bold text-gray-400">Designed for accessibility, ensuring every resident can participate regardless of tech-savviness.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-12">
            <div className="p-12 border-l-[8px] border-navy-blue bg-white shadow-[10px_10px_0px_#1A237E]">
              <BuildingLibraryIcon className="w-16 h-16 text-navy-blue mb-6" />
              <h3 className="text-3xl font-black uppercase mb-4">Legacy of Trust</h3>
              <p className="text-lg font-bold text-gray-400 italic">"Serving the garden city since the late 19th century, now rebooted for the AI age."</p>
            </div>
            
            <motion.div 
              whileHover={{ x: 10 }}
              className="p-8 bg-action-gold text-navy-blue brutalist-card"
            >
              <h3 className="text-2xl font-black uppercase mb-2">Our Mission</h3>
              <p className="text-lg font-bold">To resolve 100% of reported civic issues within 72 hours through intelligent routing and IoT monitoring.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Civic Directory Section */}
      <section className="container mx-auto py-20 px-4">
        <h2 className="text-5xl font-black text-navy-blue uppercase mb-12 text-center">Emergency & Civic Directory</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <ContactCard title="BBMP" number="1533" desc="Bruhat Bengaluru Mahanagara Palike" />
          <ContactCard title="BWSSB" number="1916" desc="Water Supply & Sewerage" />
          <ContactCard title="BESCOM" number="1912" desc="Electricity & Power" />
          <ContactCard title="Emergency" number="112" desc="Police, Fire & Ambulance" />
        </div>
      </section>

      {/* Impact Stats */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox value="243" label="Wards Managed" />
          <StatBox value="1M+" label="Resolved Cases" />
          <StatBox value="4.9" label="Citizen Rating" />
          <StatBox value="2026" label="The Standard" />
        </div>
      </section>
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="bg-white p-10 brutalist-card text-center border-4 border-navy-blue">
      <h3 className="text-5xl font-black text-navy-blue mb-2">{value}</h3>
      <p className="text-xs font-black uppercase text-gray-400 tracking-widest">{label}</p>
    </div>
  );
}

function ContactCard({ title, number, desc }) {
  return (
    <div className="bg-white p-8 brutalist-card border-4 border-navy-blue hover:bg-action-gold transition-colors group">
      <h4 className="text-2xl font-black text-navy-blue uppercase mb-2 group-hover:text-navy-blue">{title}</h4>
      <p className="text-4xl font-black text-navy-blue mb-4">{number}</p>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{desc}</p>
    </div>
  );
}
