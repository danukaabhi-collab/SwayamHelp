
import React, { useState, useRef, useEffect } from 'react';
import { COLORS, getTranslation } from '../constants.tsx';
import { Language, Scheme, User } from '../types.ts';
import { discoverSchemes } from '../services/geminiService.ts';

interface HeroProps {
  lang: Language;
  user?: User | null;
  onSearch?: (query: string) => void;
}

const Hero: React.FC<HeroProps> = ({ lang, user, onSearch }) => {
  const t = getTranslation(lang);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          handleSearch(transcript);
        }
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [lang]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === Language.ENGLISH ? 'en-IN' : `${lang}-IN`;
    }
  }, [lang]);

  const handleSearch = async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await discoverSchemes(trimmedQuery, user || null, lang);
      setResults(data);
      if (onSearch) onSearch(trimmedQuery);
      
      if (data.length === 0) {
        setError("No schemes found for this query. Try something else!");
      }
    } catch (err) {
      console.error("Search Error:", err);
      setError("Failed to fetch results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (isListening) recognitionRef.current?.stop();
    else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
        setIsListening(false);
      }
    }
  };

  const openChatWithQuery = (query: string) => {
    window.dispatchEvent(new CustomEvent('open-swayamhelp-chat', { detail: { query } }));
  };

  return (
    <div className="relative overflow-hidden pt-20 pb-24 hero-animate min-h-[600px] flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            {t.hero_title}
          </h1>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed font-medium drop-shadow-md">
            {t.hero_sub}
          </p>
          
          <div className="relative max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isListening ? t.speechStart : t.search_placeholder}
                className={`w-full pl-14 pr-32 py-5 rounded-2xl shadow-2xl border-none text-lg focus:ring-4 focus:ring-green-400/30 transition-all outline-none bg-white/95 backdrop-blur-sm ${isListening ? 'ring-2 ring-red-400' : ''}`}
                style={{ color: COLORS.text }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch(query);
                }}
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button 
                  onClick={toggleSpeech}
                  className={`p-2.5 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg' : 'bg-slate-100 text-slate-400 hover:text-blue-600'}`}
                  title="Voice Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleSearch(query)}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : t.search}
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="max-w-5xl mx-auto">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-10 text-white">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="font-medium animate-pulse">{t.fetching_live}</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="bg-red-500/20 border border-red-500/30 backdrop-blur-md text-white p-4 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-4">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {results.length > 0 && !isLoading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                {results.map((scheme) => (
                  <div 
                    key={scheme.id} 
                    className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/20 hover:scale-[1.02] transition-all text-left flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-100">
                        {scheme.category || 'Government'}
                      </span>
                      <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        {scheme.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-800 line-clamp-2">{scheme.name}</h3>
                    <p className="text-slate-600 text-xs mb-4 line-clamp-3 leading-relaxed">
                      {scheme.objective || scheme.description}
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <button 
                        className="w-full py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all text-sm"
                        onClick={() => {
                          if (onSearch) onSearch(scheme.name);
                        }}
                      >
                        {t.explore_btn}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isLoading && results.length === 0 && !error && (
            <>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <span className="text-white/80 text-sm font-bold">Trending:</span>
                {['PM-KISAN', 'Ayushman Bharat', 'Lakhpati Didi', 'PM Vishwakarma'].map(item => (
                  <button 
                    key={item} 
                    onClick={() => { setQuery(item); handleSearch(item); }}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-xs transition-colors backdrop-blur-sm border border-white/20"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Special Quick Access Buttons */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <button 
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white p-4 rounded-2xl border border-white/20 backdrop-blur-md transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">ℹ️</span>
                  <div className="text-left">
                    <div className="text-xs font-bold uppercase tracking-wider opacity-60">{t.quick_how_it_works}</div>
                    <div className="text-sm font-bold">Project Guide</div>
                  </div>
                </button>

                <button 
                  onClick={() => openChatWithQuery("Can you check my eligibility for government schemes based on my profile?")}
                  className="flex items-center justify-center gap-3 bg-green-500/20 hover:bg-green-500/30 text-white p-4 rounded-2xl border border-green-500/30 backdrop-blur-md transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">✅</span>
                  <div className="text-left">
                    <div className="text-xs font-bold uppercase tracking-wider opacity-60">{t.quick_eligibility}</div>
                    <div className="text-sm font-bold">Check Now</div>
                  </div>
                </button>

                <div className="relative group">
                  <button 
                    className="w-full flex items-center justify-center gap-3 bg-blue-500/20 hover:bg-blue-500/30 text-white p-4 rounded-2xl border border-blue-500/30 backdrop-blur-md transition-all group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🏛️</span>
                    <div className="text-left">
                      <div className="text-xs font-bold uppercase tracking-wider opacity-60">{t.quick_resources}</div>
                      <div className="text-sm font-bold">Official Portals</div>
                    </div>
                  </button>
                  
                  {/* Dropdown for Resources */}
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-slate-100">
                    <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-bottom border-slate-50">
                      <span className="text-xl">🇮🇳</span>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-800">{t.resource_india}</div>
                        <div className="text-[10px] text-slate-500">National Portal of India</div>
                      </div>
                    </a>
                    <a href="https://myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-bottom border-slate-50">
                      <span className="text-xl">📋</span>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-800">{t.resource_myscheme}</div>
                        <div className="text-[10px] text-slate-500">Scheme Discovery Platform</div>
                      </div>
                    </a>
                    <a href="https://digitalindia.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                      <span className="text-xl">⚡</span>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-800">{t.resource_digital_india}</div>
                        <div className="text-[10px] text-slate-500">Power To Empower</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
