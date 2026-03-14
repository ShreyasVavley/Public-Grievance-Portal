"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE from '../../lib/api';
import { 
  CameraIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

import { BENGALURU_WARDS } from '../../data/wards';

export default function Dashboard() {
  const { t } = useTranslation();
  const [portal, setPortal] = useState('grievance'); // 'grievance' or 'feedback'
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    mail_id: '',
    phone_number: '',
    title: '',
    description: '',
    category: 'garbage',
    ward: BENGALURU_WARDS[0],
    photoValid: false,
    photoName: '',
    imageUrl: '',
    detectedObjects: [],
    categoryMatch: null,
  });
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    phone_number: '',
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [ackId, setAckId] = useState('');

  const categories = [
    { id: 'garbage', name: t('garbage') },
    { id: 'pothole', name: t('pothole') },
    { id: 'water_leak', name: t('water_leak') },
    { id: 'electricity', name: t('electricity') },
  ];

  const handleGrievanceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        mail_id: formData.mail_id,
        phone_number: formData.phone_number,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        ward: formData.ward,
        location: { type: "Point", coordinates: [77.5946, 12.9716] },
        image_url: formData.imageUrl || null,
        detected_objects: formData.detectedObjects || [],
        category_match: formData.categoryMatch,
      };
      const response = await axios.post(`${API_BASE}/grievances/`, payload);
      setAckId(response.data.ack_id);
      setStep(3);
    } catch (err) {
      setAckId(`BLR-ACK-${new Date().getFullYear()}-FALLBACK`);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/feedback/`, feedbackData);
      alert("Thank you for your feedback!");
      setPortal('grievance');
    } catch (err) {
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen bg-warm-neutral">
      <div className="max-w-4xl mx-auto">
        {/* Portal Switcher */}
        <div className="flex gap-4 mb-12">
          <button 
            onClick={() => setPortal('grievance')}
            className={`flex-1 py-4 brutalist-button font-black uppercase tracking-widest ${
              portal === 'grievance' ? 'bg-navy-blue text-white' : 'bg-white text-navy-blue'
            }`}
          >
            Grievance Portal
          </button>
          <button 
            onClick={() => setPortal('feedback')}
            className={`flex-1 py-4 brutalist-button font-black uppercase tracking-widest ${
              portal === 'feedback' ? 'bg-navy-blue text-white' : 'bg-white text-navy-blue'
            }`}
          >
            Feedback Portal
          </button>
        </div>

        {portal === 'grievance' ? (
          <>
            <header className="mb-12">
              <h1 className="text-5xl font-black text-navy-blue mb-4 uppercase tracking-tighter">{t('file_complaint')}</h1>
              <p className="text-xl font-bold text-gray-500 uppercase tracking-widest">Formal Citizen Action Report</p>
            </header>

            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-8">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFormData({...formData, category: cat.id});
                      setStep(2);
                    }}
                    className="p-10 brutalist-card bg-white text-left group hover:bg-navy-blue transition-all"
                  >
                    <h3 className="text-3xl font-black text-navy-blue mb-4 group-hover:text-white uppercase tracking-tight">{cat.name}</h3>
                    <p className="text-gray-500 group-hover:text-white/80 font-bold uppercase tracking-widest text-xs">File digital report →</p>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.form 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                onSubmit={handleGrievanceSubmit}
                className="brutalist-card bg-white p-10 space-y-8"
              >
                {/* Contact Information */}
                <div className="grid md:grid-cols-3 gap-6 pb-8 border-b-4 border-gray-100">
                  <div>
                    <label className="block text-xs font-black uppercase text-navy-blue/40 mb-2 tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full border-4 border-navy-blue p-3 font-bold focus:outline-none"
                      placeholder="Required"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-navy-blue/40 mb-2 tracking-widest">Email ID</label>
                    <input 
                      type="email" 
                      value={formData.mail_id}
                      onChange={(e) => setFormData({...formData, mail_id: e.target.value})}
                      className="w-full border-4 border-navy-blue p-3 font-bold focus:outline-none"
                      placeholder="Required"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-navy-blue/40 mb-2 tracking-widest">Phone</label>
                    <input 
                      type="tel" 
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                      className="w-full border-4 border-navy-blue p-3 font-bold focus:outline-none"
                      placeholder="Required"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-navy-blue mb-2 tracking-widest">Issue Title</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full border-4 border-navy-blue p-4 font-black text-xl uppercase tracking-tight focus:outline-none shadow-[4px_4px_0px_0px_rgba(26,35,126,1)]"
                      placeholder="Enter specific title..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-navy-blue mb-2 tracking-widest">Detailed Description</label>
                    <textarea 
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full border-4 border-navy-blue p-4 font-bold focus:outline-none"
                      placeholder="Provide all facts..."
                      required
                    ></textarea>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 pb-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-navy-blue mb-2">Ward</label>
                      <select 
                        value={formData.ward}
                        onChange={(e) => setFormData({...formData, ward: e.target.value})}
                        className="w-full border-4 border-navy-blue p-3 font-bold focus:outline-none"
                      >
                        {BENGALURU_WARDS.map((ward, idx) => (
                          <option key={idx} value={ward}>{ward}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-navy-blue mb-2">Photo Evidence</label>
                      <input 
                        type="file" 
                        id="photo-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setLoading(true);
                          try {
                            const formDataAPI = new FormData();
                            formDataAPI.append('file', file);
                            formDataAPI.append('category', formData.category);
                            const response = await axios.post(`${API_BASE}/verify-photo/`, formDataAPI);
                            if (response.data.valid) {
                              setFormData({
                                ...formData,
                                photoValid: true,
                                photoName: file.name,
                                imageUrl: response.data.image_url || '',
                                detectedObjects: response.data.detected_objects || [],
                                categoryMatch: response.data.category_match ?? null,
                              });
                              window.dispatchEvent(new CustomEvent('maya-message', { detail: { text: response.data.maya_response || 'Photo verified by AI!' } }));
                            } else {
                              alert(response.data.message);
                            }
                          } catch (err) { alert("AI Check failed"); } finally { setLoading(false); }
                        }}
                      />
                      <label htmlFor="photo-upload" className="brutalist-button bg-action-gold w-full p-3 text-center cursor-pointer font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                        <CameraIcon className="w-5 h-5" />
                        {formData.photoValid ? formData.photoName : 'Capture / Upload'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 border-4 border-navy-blue py-4 brutalist-button font-black uppercase tracking-widest">Edit Category</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-navy-blue text-white py-4 brutalist-button font-black uppercase tracking-widest text-xl">
                    {loading ? 'Processing...' : 'Official Submit'}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="brutalist-card bg-white p-12 text-center">
                <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-4xl font-black text-navy-blue mb-4 uppercase tracking-tighter">Report Active</h2>
                <div className="bg-blue-50 p-6 border-4 border-navy-blue mb-8">
                  <span className="block text-xs font-black uppercase text-navy-blue/40 tracking-widest mb-1">Acknowledgement ID</span>
                  <span className="text-3xl font-black text-navy-blue">{ackId}</span>
                </div>
                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                  <button onClick={() => window.location.href = '/track?id=' + ackId} className="w-full bg-navy-blue text-white py-4 brutalist-button font-black uppercase">Track Progress</button>
                  <button onClick={() => setStep(1)} className="w-full text-navy-blue font-black uppercase text-xs">Home</button>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.form 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            onSubmit={handleFeedbackSubmit}
            className="brutalist-card bg-white p-10 space-y-8"
          >
            <h2 className="text-4xl font-black text-navy-blue uppercase tracking-tighter">Citizen Feedback</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase text-navy-blue mb-2">Name</label>
                <input type="text" value={feedbackData.name} onChange={(e) => setFeedbackData({...feedbackData, name: e.target.value})} className="w-full border-4 border-navy-blue p-4 font-bold" required />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-navy-blue mb-2">Phone</label>
                <input type="tel" value={feedbackData.phone_number} onChange={(e) => setFeedbackData({...feedbackData, phone_number: e.target.value})} className="w-full border-4 border-navy-blue p-4 font-bold" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-navy-blue mb-2">Service Rating (1-5)</label>
              <input type="range" min="1" max="5" value={feedbackData.rating} onChange={(e) => setFeedbackData({...feedbackData, rating: parseInt(e.target.value)})} className="w-full h-8 cursor-pointer accent-navy-blue" />
              <div className="flex justify-between text-xs font-black text-navy-blue/40 mt-1">
                <span>POOR</span><span>ELITE</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-navy-blue mb-2">Experience Comment</label>
              <textarea rows="4" value={feedbackData.comment} onChange={(e) => setFeedbackData({...feedbackData, comment: e.target.value})} className="w-full border-4 border-navy-blue p-4 font-bold" placeholder="How can we improve governance?" required></textarea>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-navy-blue text-white py-4 brutalist-button font-black uppercase tracking-widest text-xl">
              Submit Feedback
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}
