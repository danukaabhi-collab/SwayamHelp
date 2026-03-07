
import React, { useState, useEffect } from 'react';
import { Language, User, Scheme } from './types.ts';
import Layout from './components/Layout.tsx';
import Hero from './components/Hero.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import AuthModal from './components/AuthModal.tsx';
import Dashboard from './components/Dashboard.tsx';
import SchemeRoadmapModal from './components/SchemeRoadmapModal.tsx';
import { CATEGORIES, POPULAR_SCHEMES, COLORS, getTranslation } from './constants.tsx';
import { discoverSchemes } from './services/geminiService.ts';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.ENGLISH);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [view, setView] = useState<'home' | 'dashboard'>('home');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [dynamicSchemes, setDynamicSchemes] = useState<Scheme[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Roadmap Modal state
  const [selectedSchemeForRoadmap, setSelectedSchemeForRoadmap] = useState<Scheme | null>(null);
  
  const t = getTranslation(lang);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setFilterCategory('search');
    const results = await discoverSchemes(query, user, lang);
    setDynamicSchemes(results);
    setIsSearching(false);
  };

  const handleAuthSuccess = (newUser: User) => {
    setUser(newUser);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  const handleExploreClick = (scheme: Scheme) => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setSelectedSchemeForRoadmap(scheme);
    }
  };

  useEffect(() => {
    const fetchCategoricalSchemes = async () => {
      if (filterCategory && filterCategory !== 'search') {
        setIsSearching(true);
        const results = await discoverSchemes(t[`cat_${filterCategory}`] || filterCategory, user, lang);
        setDynamicSchemes(results);
        setIsSearching(false);
      } else if (!filterCategory) {
        setDynamicSchemes([]);
      }
    };
    fetchCategoricalSchemes();
  }, [filterCategory, lang, user]);

  const displayedSchemes = filterCategory 
    ? dynamicSchemes 
    : POPULAR_SCHEMES;

  return (
    <Layout 
      lang={lang} 
      onLanguageChange={setLang}
      user={user}
      onAuthClick={() => setIsAuthModalOpen(true)}
      onDashboardClick={() => setView('dashboard')}
      onLogout={handleLogout}
    >
      {view === 'dashboard' && user ? (
        <Dashboard user={user} lang={lang} onClose={() => setView('home')} />
      ) : (
        <>
          <Hero lang={lang} user={user} onSearch={handleSearch} />

          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold" style={{ color: COLORS.text }}>{t.cat_title}</h2>
                <button 
                  onClick={() => setFilterCategory(null)}
                  className={`text-blue-700 font-bold hover:underline transition-all ${!filterCategory ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                  {t.clear_filter}
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {CATEGORIES.map(cat => (
                  <div 
                    key={cat.id} 
                    onClick={() => setFilterCategory(cat.id)}
                    className={`group p-8 rounded-3xl border transition-all cursor-pointer text-center relative overflow-hidden ${filterCategory === cat.id ? 'border-blue-600 bg-blue-50 shadow-inner ring-2 ring-blue-600/20' : 'border-slate-100 bg-[#E8F5E9] hover:border-green-200 hover:shadow-xl'}`}
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform relative z-10">{cat.icon}</div>
                    <h3 className="font-bold text-slate-800 mb-1 relative z-10">{t[`cat_${cat.id}`]}</h3>
                    {filterCategory === cat.id && (
                      <div className="absolute top-2 right-2 text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20" style={{ backgroundColor: '#F8FAFC' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <h2 className="text-3xl font-bold flex items-center gap-3" style={{ color: COLORS.text }}>
                  {filterCategory === 'search' ? t.search : (filterCategory ? `${t[`cat_${filterCategory}`]}` : t.popularTitle)}
                  {isSearching && (
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                  )}
                </h2>
                {isSearching && (
                  <p className="text-blue-600 mt-2 font-medium">
                    {t.fetching_live}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedSchemes.length > 0 ? displayedSchemes.map(scheme => (
                  <div key={scheme.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-100">
                        {filterCategory && filterCategory !== 'search' ? t[`cat_${filterCategory}`] : (scheme.category ? t[`cat_${scheme.category}`] : 'Government')}
                      </span>
                      {filterCategory && (
                         <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                           <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                           {t.live_ngsp}
                         </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-3" style={{ color: COLORS.primary }}>{scheme.name}</h3>
                    <p className="text-slate-600 text-xs mb-6 flex-grow leading-relaxed">
                      {t[`${scheme.id.replace(/-/g, '_')}_desc`] || scheme.objective || scheme.description || 'Connecting to India.gov.in for detailed overview...'}
                    </p>
                    <div className="space-y-2 mb-8 border-t border-slate-50 pt-4">
                      {scheme.benefits && scheme.benefits.slice(0, 3).map((b, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-slate-700">
                          <div className="w-1 h-1 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>{b}
                        </div>
                      ))}
                    </div>
                    <button 
                      className="w-full py-3.5 rounded-2xl font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-lg bg-[#138808]"
                      onClick={() => handleExploreClick(scheme)}
                    >
                      {user ? t.explore_btn : t.login_view_btn}
                    </button>
                  </div>
                )) : !isSearching && filterCategory && (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-slate-400 italic">No specific live records found for this category currently. Try voice searching!</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.primary }}>{t.flow_title}</h2>
                <p className="text-slate-600">{t.flow_sub}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-12 text-center">
                {[
                  { id: 1, icon: '🔍' },
                  { id: 2, icon: '✅' },
                  { id: 3, icon: '📝' }
                ].map((step) => (
                  <div key={step.id}>
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner transition-transform hover:rotate-6">{step.icon}</div>
                    <h4 className="text-xl font-bold mb-3">{t[`step${step.id}_title`]}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{t[`step${step.id}_desc`]}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} lang={lang} onAuthSuccess={handleAuthSuccess} />
      
      {user && selectedSchemeForRoadmap && (
        <SchemeRoadmapModal 
          isOpen={!!selectedSchemeForRoadmap}
          onClose={() => setSelectedSchemeForRoadmap(null)}
          lang={lang}
          user={user}
          scheme={selectedSchemeForRoadmap}
        />
      )}

      <ChatInterface lang={lang} />
    </Layout>
  );
};

export default App;
