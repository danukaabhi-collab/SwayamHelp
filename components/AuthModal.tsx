
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, getTranslation } from '../constants.tsx';
import { Language, User } from '../types.ts';
import { supabase } from '../src/supabaseClient.js';
import { databaseService } from '../services/databaseService.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAuthSuccess: (user: User) => void;
  initialView?: 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'magic-link';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang, onAuthSuccess, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot-password' | 'reset-password' | 'magic-link'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [qualification, setQualification] = useState('');
  const [occupation, setOccupation] = useState('');
  const [residence, setResidence] = useState('');
  const [gender, setGender] = useState('');
  const [caste, setCaste] = useState('');
  const [income, setIncome] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const t = getTranslation(lang);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (view === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        }) as any;

        if (authError) {
          await databaseService.logAuthEvent({
            email,
            event_type: 'login_failed',
            details: authError.message
          });

          if (authError.message.includes('Email not confirmed')) {
            setError('Your email is not verified yet. Please check your inbox or click below to resend the verification email.');
          } else if (authError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            throw authError;
          }
          return;
        }

        if (data.session && data.user) {
          // Success: App.tsx onAuthStateChange will handle the state update
          // but we call onAuthSuccess for immediate UI feedback if needed
          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || email.split('@')[0],
            age: data.user.user_metadata?.age || '',
            gender: data.user.user_metadata?.gender || '',
            caste: data.user.user_metadata?.caste_category || '',
            qualification: data.user.user_metadata?.qualification || '',
            occupation: data.user.user_metadata?.occupation || '',
            residence: data.user.user_metadata?.state || '',
            income: data.user.user_metadata?.annual_income || '',
            appliedSchemes: []
          };
          onAuthSuccess(user);
          navigate('/dashboard');
          onClose();
        } else {
          setError('Session not established. Please try again.');
        }
      } else if (view === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: name,
              age,
              gender,
              caste_category: caste,
              qualification,
              occupation,
              state: residence,
              annual_income: income,
            }
          }
        }) as any;

        if (authError) {
          if (authError.message.includes('User already registered')) {
            setError('An account with this email already exists. Please login instead.');
          } else {
            throw authError;
          }
          return;
        }

        if (data.user) {
          // Insert into profiles table
          try {
            await databaseService.updateProfile(data.user.id, {
              email,
              full_name: name,
              age: parseInt(age),
              gender,
              caste_category: caste,
              qualification,
              occupation,
              state: residence,
              annual_income: income,
              created_at: new Date().toISOString()
            });
          } catch (profileErr) {
            console.error("Error creating profile:", profileErr);
            // We don't throw here to avoid blocking the user if auth succeeded but profile insert failed
            // (though in a real app you might want to handle this more strictly)
          }

          // Success: Show success view
          setIsSuccess(true);
          setMessage("Your account has been created! We've sent a verification link to " + email + ". Please click the link in that email to activate your account.");
          setError(null);
        }
      } else if (view === 'forgot-password') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}?type=recovery`,
        });
        if (resetError) throw resetError;
        setMessage('Password reset link has been sent to your email.');
        setError(null);
      } else if (view === 'reset-password') {
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (updateError) throw updateError;
        setMessage('Your password has been reset successfully. You can now login with your new password.');
        setError(null);
        setTimeout(() => setView('login'), 3000);
      } else if (view === 'magic-link') {
        const { error: magicError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (magicError) throw magicError;
        setMessage('A secure login link has been sent to your email. Click it to log in instantly.');
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      if (resendError) throw resendError;
      setMessage('Verification email has been resent. Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            📧
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.primary }}>
            Check your email
          </h2>
          <p className="text-slate-600 mb-8">
            {message}
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => {
                setIsSuccess(false);
                setView('login');
              }}
              className="w-full py-4 bg-[#0B3C5D] text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
            >
              Back to Login
            </button>
            <button 
              onClick={handleResendVerification}
              disabled={loading}
              className="text-blue-600 font-bold hover:underline block mx-auto"
            >
              {loading ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Detect recovery mode from URL or props
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'recovery') {
      setView('reset-password');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold" style={{ color: COLORS.primary }}>
            {view === 'login' ? t.login : 
             view === 'signup' ? t.signUp : 
             view === 'forgot-password' ? 'Reset Password' : 
             view === 'magic-link' ? 'Easy Login' :
             'Create New Password'} to SwayamHelp
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'login' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <button type="button" onClick={() => setView('forgot-password')} className="text-[10px] font-bold text-blue-600 hover:underline">Forgot Password?</button>
                  </div>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                </div>
              </div>
            )}

            {view === 'signup' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Age</label>
                  <select value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required>
                    <option value="">Select Age</option>
                    {Array.from({length: 83}, (_, i) => i + 18).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Caste Category</label>
                  <select value={caste} onChange={(e) => setCaste(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required>
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Qualification</label>
                  <select value={qualification} onChange={(e) => setQualification(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required>
                    <option value="">Select Qualification</option>
                    <option value="10th">10th Pass</option>
                    <option value="12th">12th Pass</option>
                    <option value="graduate">Graduate</option>
                    <option value="post_graduate">Post Graduate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Occupation</label>
                  <select value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required>
                    <option value="">Select Occupation</option>
                    <option value="Student">Student</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Government Employee">Government Employee</option>
                    <option value="Private Employee">Private Employee</option>
                    <option value="Self Employed">Self Employed</option>
                    <option value="Business Owner">Business Owner</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Retired">Retired</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Residence (State/UT)</label>
                  <select value={residence} onChange={(e) => setResidence(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required>
                    <option value="">Select State</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Andaman & Nicobar Islands">Andaman & Nicobar Islands</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Dadra & Nagar Haveli and Daman & Diu">Dadra & Nagar Haveli and Daman & Diu</option>
                    <option value="Lakshadweep">Lakshadweep</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Jammu & Kashmir">Jammu & Kashmir</option>
                    <option value="Ladakh">Ladakh</option>
                    <option value="Puducherry">Puducherry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Annual Income</label>
                  <select value={income} onChange={(e) => setIncome(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required>
                    <option value="">Select Range</option>
                    <option value="0-2.5L">0 - 2.5 Lakhs</option>
                    <option value="2.5L-5L">2.5 - 5 Lakhs</option>
                    <option value="5L-8L">5 - 8 Lakhs</option>
                    <option value="8L+">Above 8 Lakhs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                </div>
              </div>
            )}

            {(view === 'forgot-password' || view === 'magic-link') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                </div>
              </div>
            )}

            {view === 'reset-password' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-red-500 text-[11px] font-medium">{error}</p>
                {error.includes('not verified') && (
                  <button type="button" onClick={handleResendVerification} className="text-blue-600 text-[11px] font-bold hover:underline mt-1">Resend verification email</button>
                )}
              </div>
            )}

            {message && (
              <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl text-[11px] font-medium">
                {message}
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10">
          <button 
            onClick={(e) => handleSubmit(e as any)}
            disabled={loading}
            className={`w-full py-3.5 bg-[#0B3C5D] text-white rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 
             view === 'login' ? t.login : 
             view === 'signup' ? t.signUp : 
             view === 'forgot-password' ? 'Send Reset Link' : 
             view === 'magic-link' ? 'Send Login Link' :
             'Update Password'}
          </button>

          <div className="mt-4 text-center text-xs text-slate-500">
            {view === 'login' ? (
              <div className="space-y-3">
                <button onClick={() => setView('magic-link')} className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <span>✨</span> Login with Magic Link
                </button>
                <p>
                  New to SwayamHelp?{' '}
                  <button onClick={() => setView('signup')} className="font-bold text-blue-700 hover:underline">
                    {t.signUp}
                  </button>
                </p>
              </div>
            ) : view === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button onClick={() => setView('login')} className="font-bold text-blue-700 hover:underline">
                  {t.login}
                </button>
              </p>
            ) : (
              <button onClick={() => setView('login')} className="font-bold text-blue-700 hover:underline">
                Back to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
