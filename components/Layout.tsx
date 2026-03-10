
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Language, User } from '../types.ts';
import { COLORS, getTranslation, SUPPORTED_LANGUAGES } from '../constants.tsx';

interface LayoutProps {
  children: React.ReactNode;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  user: User | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, lang, onLanguageChange, user, onAuthClick, onLogout }) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const t = getTranslation(lang);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: COLORS.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-xl overflow-hidden shadow-inner">
                <span style={{ color: COLORS.accent }}>SH</span>
              </div>
              <span className="text-white font-bold text-lg hidden md:block">SwayamHelp</span>
            </div>
            
            <div className="flex items-center gap-6 text-white/90 text-sm font-medium">
              <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
              <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">{t.aboutUs}</button>
              <button onClick={() => navigate('/help')} className="hover:text-white transition-colors">{t.help}</button>
              
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all border border-transparent hover:border-white/20"
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm border border-white/30 overflow-hidden">
                        {user.profilePic ? (
                          <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="font-bold hidden sm:block">{user.name.split(' ')[0]}</span>
                    </button>
                    
                    {/* Hover Dropdown */}
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-2xl py-2 z-[60] border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="px-4 py-2 border-b border-slate-50 mb-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                      </div>
                      <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <span>👤</span> {t.dashboard}
                      </button>
                      <button 
                        onClick={() => navigate('/help')}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <span>❓</span> {t.help}
                      </button>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-2"
                      >
                        <span>🚪</span> {t.logout}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={onAuthClick} className="bg-white text-blue-900 px-4 py-1.5 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                  {t.nav_login}
                </button>
              )}
              
              <div className="relative">
                <button 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center border border-white/30 rounded-full px-3 py-1.5 gap-2 bg-white/10 hover:bg-white/20 transition-all"
                >
                  <span className="text-xs">{SUPPORTED_LANGUAGES.find(l => l.code === lang)?.name.split(' ')[0]}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 z-[60] border border-slate-100 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          onLanguageChange(l.code as Language);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${lang === l.code ? 'text-blue-900 font-bold bg-blue-50/50' : 'text-slate-600'}`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          <p>{t.copy}</p>
          <div className="flex justify-center gap-6 mt-4 font-medium">
            <button onClick={() => navigate('/about')} className="hover:text-slate-900 transition-colors">{t.aboutUs}</button>
            <button onClick={() => navigate('/help')} className="hover:text-slate-900 transition-colors">{t.help}</button>
            <button className="hover:text-slate-900 transition-colors">Privacy Policy</button>
          </div>
          <p className="mt-8 text-xs max-w-2xl mx-auto opacity-70 leading-relaxed">
            Digital Seva is a commitment to public welfare. SwayamHelp provides awareness and guidance. Always verify official notifications on India.gov.in.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
