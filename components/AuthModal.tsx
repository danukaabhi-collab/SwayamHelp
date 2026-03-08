
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, getTranslation } from '../constants.tsx';
import { Language, User } from '../types.ts';
import { supabase } from '../src/supabaseClient.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAuthSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [qualification, setQualification] = useState('');
  const [occupation, setOccupation] = useState('');
  const [residence, setResidence] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const t = getTranslation(lang);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.session && data.user) {
          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || email.split('@')[0],
            age: data.user.user_metadata?.age || '',
            qualification: data.user.user_metadata?.qualification || '',
            occupation: data.user.user_metadata?.occupation || '',
            residence: data.user.user_metadata?.residence || '',
            appliedSchemes: []
          };
          onAuthSuccess(user);
          navigate('/');
          onClose();
        } else {
          setError('Session not established. Please try again.');
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              age,
              qualification,
              occupation,
              residence,
            }
          }
        });

        if (authError) throw authError;

        if (data.user) {
          // Success: Switch to login view, keep email, show message
          setIsLogin(true);
          setPassword(''); // Clear password for the login step
          setMessage("Your account has been created. Please check your email and verify your address before logging in.");
          setError(null);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
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
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>

            {error && (
              <p className="text-red-500 text-xs font-medium mt-2">{error}</p>
            )}

            {message && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-xs font-medium mt-2">
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 bg-[#0B3C5D] text-white rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : (isLogin ? t.login : t.signUp)}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            {isLogin ? "New to SwayamHelp?" : "Already have an account?"}{' '}
            <button onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setMessage(null);
            }} className="font-bold text-blue-700 hover:underline">
              {isLogin ? t.signUp : t.login}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
