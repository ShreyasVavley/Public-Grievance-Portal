"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import API_BASE from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  MapPinIcon,
  TrashIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';

export default function AdminDashboard() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchGrievances();
  }, [router]);

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/grievances/`);
      setGrievances(response.data);
    } catch (err) {
      setError('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (ackId) => {
    try {
      await axios.post(`${API_BASE}/admin/confirm/${ackId}`);
      // Optimistic update
      setGrievances(prev => prev.map(g => 
        g.ack_id === ackId ? { ...g, status: 'Resolved' } : g
      ));
    } catch (err) {
      alert('Action failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-warm-neutral flex items-center justify-center">
      <ArrowPathIcon className="w-12 h-12 text-navy-blue animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-warm-neutral p-4 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-navy-blue">Management Hub</h1>
            <p className="font-bold text-gray-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span> Live Operations Center
            </p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('admin_token');
              router.push('/admin/login');
            }}
            className="bg-navy-blue text-white brutalist-button px-8 py-3 font-black uppercase tracking-widest text-sm"
          >
            Logout
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <StatCard title="Total Tickets" val={grievances.length} color="navy-blue" />
          <StatCard title="AI Verified" val={grievances.filter(g => g.status === 'AI Verified').length} color="green-600" />
          <StatCard title="Pending Review" val={grievances.filter(g => g.status === 'Verification Pending' || g.status === 'Submitted').length} color="amber-500" />
        </div>

        <h2 className="text-3xl font-black uppercase tracking-tight mb-8">Active Grievances</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {grievances.map((g, idx) => (
              <GrievanceCard key={g.ack_id} g={g} onConfirm={handleConfirm} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function GrievanceCard({ g, onConfirm }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imageFullUrl = g.image_url ? `${process.env.NEXT_PUBLIC_API_URL}${g.image_url}` : null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="brutalist-card bg-white flex flex-col h-full overflow-hidden"
      >
        {/* Image Thumbnail — only shown when image exists */}
        {imageFullUrl ? (
          <button
            onClick={() => setLightboxOpen(true)}
            className="relative w-full h-48 overflow-hidden group"
          >
            <img
              src={imageFullUrl}
              alt="Evidence photo"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-navy-blue/0 group-hover:bg-navy-blue/30 transition-all duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white font-black uppercase tracking-widest text-xs bg-navy-blue/80 px-4 py-2 transition-opacity duration-200">
                🔍 View Full Image
              </span>
            </div>
          </button>
        ) : (
          <div className="w-full h-20 bg-gray-100 flex items-center justify-center border-b-4 border-gray-200">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">No Photo Submitted</span>
          </div>
        )}

        <div className="p-8 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-6">
            <span className={`px-4 py-1 text-xs font-black uppercase tracking-widest border-2 border-navy-blue ${
              g.status === 'Resolved' ? 'bg-green-500 text-white' : 
              g.status === 'AI Verified' ? 'bg-blue-100 text-navy-blue' : 'bg-amber-100'
            }`}>
              {g.status}
            </span>
            <span className="text-[10px] font-bold text-gray-400 font-mono">{g.ack_id}</span>
          </div>

          <h3 className="text-2xl font-black uppercase tracking-tight mb-4 leading-none">{g.title}</h3>
          <p className="text-gray-600 font-medium mb-6 flex-grow truncate-3-lines">{g.description}</p>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-2 text-sm font-bold text-navy-blue">
              <MapPinIcon className="w-4 h-4" />
              {g.ward}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
              <ChartBarIcon className="w-4 h-4" />
              Category: {g.category}
            </div>
            {/* YOLOv8 Detection Badges */}
            {g.detected_objects && g.detected_objects.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">🤖 YOLOv8 Detected</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.detected_objects.slice(0, 4).map((obj, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide bg-navy-blue/5 border border-navy-blue/20 text-navy-blue">
                      {obj.label} <span className="text-gray-400">{Math.round(obj.confidence * 100)}%</span>
                    </span>
                  ))}
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${g.category_match ? 'text-green-600' : 'text-amber-500'}`}>
                  {g.category_match ? '✅ Category Match' : '⚠️ Category Mismatch'}
                </p>
              </div>
            )}
          </div>

          {g.status !== 'Resolved' ? (
            <button 
              onClick={() => onConfirm(g.ack_id)}
              className="w-full bg-action-gold text-navy-blue brutalist-button py-4 font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-6 h-6" />
              Confirm & Resolve
            </button>
          ) : (
            <div className="w-full bg-green-50 text-green-700 py-4 font-black uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-green-500 opacity-60">
              <CheckCircleIcon className="w-6 h-6" />
              Action Completed
            </div>
          )}
        </div>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && imageFullUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white brutalist-card max-w-3xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b-4 border-navy-blue">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Evidence Photo</p>
                  <h3 className="text-xl font-black uppercase tracking-tight text-navy-blue leading-none">{g.title}</h3>
                </div>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="w-10 h-10 flex items-center justify-center border-4 border-navy-blue font-black text-navy-blue hover:bg-navy-blue hover:text-white transition-colors text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Full Image */}
              <div className="bg-gray-50 flex items-center justify-center p-2 max-h-[50vh] overflow-hidden">
                <img
                  src={imageFullUrl}
                  alt="Evidence photo full view"
                  className="max-h-[48vh] max-w-full object-contain"
                />
              </div>

              {/* YOLOv8 ML Results */}
              {g.detected_objects && g.detected_objects.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t-2 border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">🤖 YOLOv8n Detection Results</p>
                  <div className="flex flex-wrap gap-2">
                    {g.detected_objects.map((obj, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wide border-2 border-navy-blue/20 bg-white text-navy-blue">
                        <span className={`w-2 h-2 rounded-full ${obj.confidence >= 0.7 ? 'bg-green-500' : obj.confidence >= 0.4 ? 'bg-amber-400' : 'bg-red-400'}`}></span>
                        {obj.label} — {Math.round(obj.confidence * 100)}%
                      </span>
                    ))}
                  </div>
                  <p className={`text-xs font-black uppercase tracking-widest mt-2 ${g.category_match ? 'text-green-600' : 'text-amber-500'}`}>
                    {g.category_match
                      ? `✅ Matches reported category: ${g.category}`
                      : `⚠️ No objects matching "${g.category}" detected — admin review required`}
                  </p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-white flex flex-col sm:flex-row items-center gap-4 border-t-4 border-gray-100">
                <div className="flex-grow text-sm font-bold text-gray-500 uppercase tracking-widest">
                  <span className="text-navy-blue">{g.ward}</span> · {g.category} · {g.ack_id}
                </div>
                {g.status !== 'Resolved' ? (
                  <button
                    onClick={() => { onConfirm(g.ack_id); setLightboxOpen(false); }}
                    className="bg-action-gold text-navy-blue brutalist-button px-8 py-3 font-black uppercase tracking-widest text-sm flex items-center gap-2 whitespace-nowrap"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Mark as Resolved
                  </button>
                ) : (
                  <div className="text-green-600 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    Already Resolved
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StatCard({ title, val, color }) {
  return (
    <div className="brutalist-card bg-white p-8">
      <p className="text-sm font-black uppercase tracking-widest text-gray-400 mb-2">{title}</p>
      <p className={`text-6xl font-black text-${color}`}>{val}</p>
    </div>
  );
}
