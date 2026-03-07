
import React, { useState } from 'react';
import { COLORS, getTranslation } from '../constants.tsx';
import { Language, User } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAuthSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [qualification, setQualification] = useState('');
  const [occupation, setOccupation] = useState('');
  const [residence, setResidence] = useState('');

  const t = getTranslation(lang);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockId = `SH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const mockUser: User = {
      id: mockId,
      email: email,
      name: name || email.split('@')[0],
      age: age,
      qualification,
      occupation,
      residence,
      appliedSchemes: []
    };
    onAuthSuccess(mockUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-8">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.primary }}>
              {isLogin ? t.login : t.signUp} to SwayamHelp
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                    <select value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">Select Age</option>
                      {Array.from({length: 83}, (_, i) => i + 18).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Qualification</label>
                    <select value={qualification} onChange={(e) => setQualification(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">Select</option>
                      <option value="10th">10th Pass</option>
                      <option value="12th">12th Pass</option>
                      <option value="graduate">Graduate</option>
                      <option value="post_graduate">Post Graduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Occupation</label>
                    <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Farmer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Residence (State/UT)</label>
                    <input type="text" value={residence} onChange={(e) => setResidence(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Tamil Nadu" />
                  </div>
                </div>
              </>
            )}

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>

            <button type="submit" className="w-full py-4 bg-[#0B3C5D] text-white rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg mt-4">
              {isLogin ? t.login : t.signUp}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            {isLogin ? "New to SwayamHelp?" : "Already have an account?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-blue-700 hover:underline">
              {isLogin ? t.signUp : t.login}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
