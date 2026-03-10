
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Language, User, Scheme } from './types.ts';
import Layout from './components/Layout.tsx';
import Hero from './components/Hero.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import AuthModal from './components/AuthModal.tsx';
import Dashboard from './components/Dashboard.tsx';
import LoginPage from './components/LoginPage.tsx';
import SignUpPage from './components/SignUpPage.tsx';
import AboutUs from './components/AboutUs.tsx';
import Help from './components/Help.tsx';
import SchemeRoadmapModal from './components/SchemeRoadmapModal.tsx';
import { CATEGORIES, POPULAR_SCHEMES, COLORS, getTranslation } from './constants.tsx';
import { discoverSchemes } from './services/geminiService.ts';
import { databaseService } from './services/databaseService.ts';
import { supabase } from './src/supabaseClient.js';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.ENGLISH);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [dynamicSchemes, setDynamicSchemes] = useState<Scheme[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Roadmap Modal state
  const [selectedSchemeForRoadmap, setSelectedSchemeForRoadmap] = useState<Scheme | null>(null);
  const [savedSchemeIds, setSavedSchemeIds] = useState<Set<string>>(new Set());
  
  const t = getTranslation(lang);

  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setFilterCategory('search');
    if (location.pathname !== '/') {
      navigate('/');
    }
    const results = await discoverSchemes(query, user, lang);
    setDynamicSchemes(results);
    setIsSearching(false);
  };

  const handleAuthSuccess = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = async () => {
    console.log("Logout initiated...");
    try {
      if (user) {
        // Log event in background
        databaseService.logAuthEvent({
          user_id: user.id,
          email: user.email,
          event_type: 'logout',
          details: 'User logged out manually'
        }).catch(err => console.error("Background logout log failed:", err));
      }
      
      // Clear local state first for immediate UI feedback
      setUser(null);
      setSavedSchemeIds(new Set());
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("Supabase sign out successful");
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      // Force a full page reload to clear all memory state and ensure redirection
      // This is the most reliable way to clear all sensitive data
      window.location.href = '/login'; 
    }
  };

  const handleExploreClick = (scheme: Scheme) => {
    if (!user) {
      navigate('/login');
    } else {
      setSelectedSchemeForRoadmap(scheme);
    }
  };

  const handleToggleSave = async (scheme: Scheme) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (savedSchemeIds.has(scheme.id)) {
        await databaseService.unsaveScheme(user.id, scheme.id);
        setSavedSchemeIds(prev => {
          const next = new Set(prev);
          next.delete(scheme.id);
          return next;
        });
      } else {
        await databaseService.saveScheme(user.id, scheme);
        setSavedSchemeIds(prev => new Set(prev).add(scheme.id));
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  useEffect(() => {
    const fetchSavedSchemes = async () => {
      if (user) {
        try {
          const saved = await databaseService.getSavedSchemes(user.id);
          setSavedSchemeIds(new Set(saved.map(s => s.id)));
        } catch (error) {
          console.error("Error fetching saved schemes:", error);
        }
      } else {
        setSavedSchemeIds(new Set());
      }
    };
    fetchSavedSchemes();
  }, [user]);

  const fetchUserData = async (sessionUser: any) => {
    // Prevent redundant fetches if we already have this user
    if (user && user.id === sessionUser.id && user.profilePic) return;

    // Set basic user data immediately for faster perceived performance
    const basicUserData: User = {
      id: sessionUser.id,
      email: sessionUser.email || '',
      name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User',
      age: sessionUser.user_metadata?.age || '',
      gender: sessionUser.user_metadata?.gender || '',
      caste: sessionUser.user_metadata?.caste_category || '',
      qualification: sessionUser.user_metadata?.qualification || '',
      occupation: sessionUser.user_metadata?.occupation || '',
      residence: sessionUser.user_metadata?.state || '',
      income: sessionUser.user_metadata?.annual_income || '',
      profilePic: sessionUser.user_metadata?.avatar_url,
      appliedSchemes: []
    };
    
    // Only set if user is null or ID changed
    if (!user || user.id !== sessionUser.id) {
      setUser(basicUserData);
    }

    try {
      // Enrich with profile data in the background
      const profile = await databaseService.getProfile(sessionUser.id);
      if (profile) {
        setUser(prev => {
          if (!prev || prev.id !== sessionUser.id) return prev;
          return {
            ...prev,
            name: profile.full_name || prev.name,
            age: profile.age || prev.age,
            gender: profile.gender || prev.gender,
            caste: profile.caste_category || prev.caste,
            qualification: profile.qualification || prev.qualification,
            occupation: profile.occupation || prev.occupation,
            residence: profile.state || prev.residence,
            income: profile.annual_income || prev.income,
            profilePic: profile.profile_pic || prev.profilePic,
          };
        });
      }
    } catch (e) {
      console.error("Background profile fetch failed:", e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession() as any;
        
        if (isMounted && session?.user) {
          await fetchUserData(session.user);
        }
      } catch (error) {
        console.warn("Session check delayed or failed:", error);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      if (session?.user) {
        // Set loading to false immediately if we have a user to show the app faster
        if (isMounted) setIsAuthLoading(false);
        if (isMounted) await fetchUserData(session.user);
        
        if (event === 'SIGNED_IN') {
          await databaseService.logAuthEvent({
            user_id: session.user.id,
            email: session.user.email || '',
            event_type: 'login',
            details: 'User signed in'
          });
        }
      } else {
        if (isMounted) setUser(null);
        if (isMounted) setIsAuthLoading(false);
        
        if (event === 'SIGNED_OUT') {
          console.log("User signed out event detected");
          if (isMounted) {
            setUser(null);
            setSavedSchemeIds(new Set());
            // If we are on a protected route, redirect to login
            if (location.pathname.startsWith('/dashboard')) {
              navigate('/login');
            }
          }
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('type') === 'recovery') {
      navigate('/login?type=recovery');
    }
  }, [location.search, navigate]);

  const displayedSchemes = filterCategory 
    ? dynamicSchemes 
    : POPULAR_SCHEMES;

  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[200]">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Initializing SwayamHelp...</p>
      </div>
    );
  }

  return (
    <Layout 
      lang={lang} 
      onLanguageChange={setLang}
      user={user}
      onAuthClick={() => navigate('/login')}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/" element={
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
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1.000-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
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
                    <div key={scheme.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col h-full animate-in fade-in zoom-in-95 duration-300 group">
                      <div className="flex justify-between items-center mb-6">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-100">
                          {filterCategory && filterCategory !== 'search' ? t[`cat_${filterCategory}`] : (scheme.category ? t[`cat_${scheme.category}`] : 'Government')}
                        </span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleSave(scheme)}
                            className={`p-2 rounded-full transition-all ${savedSchemeIds.has(scheme.id) ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
                            title={savedSchemeIds.has(scheme.id) ? "Unsave" : "Save"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${savedSchemeIds.has(scheme.id) ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          {filterCategory && (
                            <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                              {t.live_ngsp}
                            </span>
                          )}
                        </div>
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

            <section id="how-it-works" className="py-24 bg-white scroll-mt-20">
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
        } />
        <Route path="/about" element={<AboutUs lang={lang} />} />
        <Route path="/help" element={<Help lang={lang} />} />
        <Route path="/login" element={<LoginPage lang={lang} onAuthSuccess={handleAuthSuccess} user={user} />} />
        <Route path="/signup" element={<SignUpPage lang={lang} onAuthSuccess={handleAuthSuccess} user={user} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} lang={lang} onClose={() => navigate('/')} onLogout={handleLogout} /> : <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm w-full"><h2 className="text-2xl font-bold mb-4 text-slate-800">Private Page</h2><p className="text-slate-600 mb-6">Please login to access your dashboard.</p><button onClick={() => navigate('/login')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">Login Now</button></div></div>} />
      </Routes>

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
