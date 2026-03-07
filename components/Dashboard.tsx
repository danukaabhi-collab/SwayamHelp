
import React, { useState, useEffect } from 'react';
import { User, Language, Scheme } from '../types.ts';
import { COLORS, getTranslation } from '../constants.tsx';
import { discoverSchemes } from '../services/geminiService.ts';

interface DashboardProps {
  user: User;
  lang: Language;
  onClose: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, lang, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'about' | 'eligible' | 'apps'>('profile');
  const [recommendations, setRecommendations] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const t = getTranslation(lang);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    const categoryQuery = user.occupation || "All";
    const schemes = await discoverSchemes(categoryQuery, user, lang);
    setRecommendations(schemes);
    setIsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'eligible' && recommendations.length === 0) {
      fetchRecommendations();
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-2xl font-bold" style={{ color: COLORS.primary }}>{t.aboutUs}</h3>
            <div className="space-y-6 text-slate-600 leading-relaxed">
              <div className="p-6 bg-blue-50 rounded-2xl">
                <p className="font-bold text-blue-900 mb-2">Our Mission</p>
                <p>To empower every Indian citizen with direct access to digital government services and awareness of public schemes through human-centric AI.</p>
              </div>
              <div className="p-6 bg-green-50 rounded-2xl">
                <p className="font-bold text-green-900 mb-2">Our Vision</p>
                <p>A transparent, inclusive India where no citizen misses a benefit due to complexity or lack of information.</p>
              </div>
            </div>
          </div>
        );
      case 'eligible':
        return (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-2xl font-bold" style={{ color: COLORS.primary }}>{t.findEligible}</h3>
            <p className="text-slate-500">Based on your {user.occupation || 'citizen'} profile, here are recommended schemes:</p>
            
            {isLoading ? (
              <div className="py-20 text-center animate-pulse text-blue-600 font-bold">
                Checking live eligibility criteria...
              </div>
            ) : (
              <div className="grid gap-6">
                {recommendations.map((scheme, idx) => (
                  <div key={idx} className="p-6 border border-blue-100 rounded-3xl bg-blue-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md">
                    <div>
                      <h4 className="font-bold text-lg">{scheme.name}</h4>
                      <p className="text-sm text-slate-500">{scheme.description.substring(0, 100)}...</p>
                    </div>
                    <button className="bg-blue-900 text-white px-6 py-2 rounded-xl font-bold whitespace-nowrap">Explore</button>
                  </div>
                ))}
                <div className="p-8 border border-slate-100 border-dashed rounded-3xl flex flex-col items-center justify-center text-center">
                  <span className="text-4xl mb-4">🔍</span>
                  <p className="italic text-slate-400">Completing more profile fields helps narrow down eligibility.</p>
                  <button onClick={fetchRecommendations} className="mt-4 text-blue-600 font-bold hover:underline">Refresh Recommendations</button>
                </div>
              </div>
            )}
          </div>
        );
      case 'apps':
        return (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-2xl font-bold" style={{ color: COLORS.primary }}>{t.myApps}</h3>
            {user.appliedSchemes.length === 0 ? (
              <div className="py-20 text-center text-slate-400 italic flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl opacity-50">📝</div>
                No active applications found.
              </div>
            ) : (
              <div className="space-y-4">
                {user.appliedSchemes.map((id, i) => (
                  <div key={i} className="p-4 border border-slate-200 rounded-xl flex justify-between">
                    <span className="font-medium">{id}</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-4 border-white shadow-xl overflow-hidden relative group">
                  {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : '👤'}
                </div>
                <h3 className="text-xl font-bold" style={{ color: COLORS.primary }}>{user.name}</h3>
                <p className="text-sm text-slate-500 mb-6">{user.email}</p>
                <div className="p-6 rounded-3xl bg-slate-50 border border-dashed border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">{t.uniqueId}</span>
                  <code className="text-xl font-mono font-bold text-blue-900 tracking-wider">{user.id}</code>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                  Personal Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Age</div>
                    <div className="font-semibold text-slate-700">{user.age || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Gender</div>
                    <div className="font-semibold text-slate-700">{user.gender || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Caste Category</div>
                    <div className="font-semibold text-slate-700">{user.caste || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Qualification</div>
                    <div className="font-semibold text-slate-700">{user.qualification || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Occupation</div>
                    <div className="font-semibold text-slate-700">{user.occupation || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Residence</div>
                    <div className="font-semibold text-slate-700">{user.residence || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Income Range</div>
                    <div className="font-semibold text-slate-700">{user.income || '—'}</div>
                  </div>
                </div>
                <button className="mt-10 text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
                  Edit Profile Information
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold" style={{ color: COLORS.primary }}>{t.dashboard}</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back Home
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        {[
          { id: 'profile', label: t.profile, icon: '👤' },
          { id: 'about', label: t.aboutUs, icon: '🏛️' },
          { id: 'eligible', label: t.findEligible, icon: '🔍' },
          { id: 'apps', label: t.myApps, icon: '📝' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-[#0B3C5D] text-white shadow-xl scale-105' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">{renderContent()}</div>
    </div>
  );
};

export default Dashboard;
