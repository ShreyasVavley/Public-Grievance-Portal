"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE from '../../lib/api';
import { 
  CheckBadgeIcon, 
  ArrowPathIcon, 
  MagnifyingGlassIcon,
  MapPinIcon
} from '@heroicons/react/24/solid';

import { Suspense } from 'react';

function TrackContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [ackId, setAckId] = useState(searchParams.get('id') || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 'submitted', label: t('submitted'), color: 'bg-green-500' },
    { id: 'verified', label: t('verified'), color: 'bg-blue-500' },
    { id: 'assigned', label: t('assigned'), color: 'bg-gray-300' },
    { id: 'resolution', label: t('resolution'), color: 'bg-gray-300' },
    { id: 'resolved', label: t('resolved'), color: 'bg-gray-300' },
  ];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!ackId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/grievances/${ackId}`);
      setData({
        ...response.data,
        status: response.data.status === "AI Verified" ? "verified" : "submitted"
      });
    } catch (err) {
      console.error("Search failed:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ackId) handleSearch();
  }, []);

  return (
    <div className="container mx-auto py-12 px-4 text-navy-blue">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">{t('track_status')}</h1>
          <p className="text-xl font-bold text-gray-500 uppercase tracking-widest">Enter your Acknowledgement ID</p>
        </header>

        <div className="mb-12">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-8 h-8 absolute left-4 top-1/2 -translate-y-1/2 text-navy-blue/20" />
              <input 
                value={ackId}
                onChange={(e) => setAckId(e.target.value)}
                placeholder="e.g. BLR-ACK-2026-XXXXXX"
                className="w-full pl-16 pr-4 py-5 border-4 border-navy-blue font-black text-xl focus:outline-none shadow-[8px_8px_0px_0px_rgba(26,35,126,1)] uppercase"
              />
            </div>
            <button className="bg-navy-blue text-white px-10 py-5 brutalist-button font-black text-2xl uppercase tracking-widest hover:scale-105 transition-all">
              Search
            </button>
          </form>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <ArrowPathIcon className="w-16 h-16 text-navy-blue animate-spin" />
          </div>
        )}

        {data && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="brutalist-card bg-white overflow-hidden border-4 border-navy-blue"
          >
            <div className="bg-navy-blue text-white p-10 md:flex justify-between items-center border-b-4 border-navy-blue">
              <div>
                <span className="text-action-gold font-black text-xs uppercase tracking-[0.2em] mb-2 block">{t('blru_ack_id')}</span>
                <h3 className="text-5xl font-black tracking-tighter">{data.ack_id}</h3>
              </div>
              <div className="mt-8 md:mt-0 px-8 py-3 bg-action-gold text-navy-blue brutalist-card flex items-center gap-3">
                <CheckBadgeIcon className="w-6 h-6" />
                <span className="font-black uppercase tracking-widest">{t('verified')}</span>
              </div>
            </div>

            <div className="p-10 grid md:grid-cols-2 gap-16">
              {/* Stepper */}
              <div>
                <h4 className="font-black text-navy-blue mb-10 uppercase text-xs tracking-[0.25em]">Operational Timeline</h4>
                <div className="relative pl-10 space-y-12">
                  <div className="absolute left-[19px] top-2 bottom-2 w-2 bg-navy-blue/10"></div>
                  {steps.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[45px] top-1 w-9 h-9 border-4 border-navy-blue shadow-[4px_4px_0px_white] ${
                        step.id === data.status || steps.findIndex(s => s.id === data.status) > idx ? step.color : 'bg-white'
                      }`}></div>
                      <div>
                        <p className={`text-xl font-black uppercase tracking-tight ${
                          step.id === data.status || steps.findIndex(s => s.id === data.status) > idx ? 'text-navy-blue' : 'text-gray-300'
                        }`}>{step.label}</p>
                        {step.id === data.status && <p className="text-xs font-black text-gray-500 uppercase mt-1">Last Update: {new Date(data.created_at).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-8">
                <div className="p-8 border-4 border-navy-blue bg-warm-neutral/30 italic">
                   <p className="text-lg font-bold text-navy-blue/60 leading-relaxed uppercase">
                     "Citizen action verified by Bengaluru Sahaya AI Core. Issue dispatched to relevant jurisdictional authorities."
                   </p>
                </div>
                
                <div className="space-y-6">
                  <DetailItem icon={<MapPinIcon className="w-6 h-6" />} label="Jurisdiction" value={data.ward} />
                  <DetailItem label="Department" value="Municipal Waste Mgmt" />
                  <DetailItem label="Priority" value="High (Citizen Action)" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="border-b-4 border-navy-blue pb-4">
      <label className="block text-[10px] font-black text-navy-blue/40 uppercase tracking-[0.2em] mb-1">{label}</label>
      <div className="flex items-center gap-3 text-navy-blue font-black text-lg uppercase">
        {icon}
        {value}
      </div>
    </div>
  );
}

export default function Track() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-warm-neutral">
        <ArrowPathIcon className="w-20 h-20 text-navy-blue animate-spin" />
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
