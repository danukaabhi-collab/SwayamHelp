
import React from 'react';
import { COLORS, getTranslation } from '../constants.tsx';
import { Language, User, Scheme } from '../types.ts';

interface SchemeRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  user: User;
  scheme: Scheme;
}

const SchemeRoadmapModal: React.FC<SchemeRoadmapModalProps> = ({ isOpen, onClose, lang, user, scheme }) => {
  const t = getTranslation(lang);

  if (!isOpen) return null;

  const handleRedirect = () => {
    const url = (scheme as any).official_url || 'https://www.india.gov.in';
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-start mb-10">
            <div>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest block mb-2">{t.roadmap_title}</span>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: COLORS.primary }}>
                {scheme.name}
              </h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {scheme.ministry && <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">{scheme.ministry}</span>}
                {scheme.type && <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{scheme.type}</span>}
                {scheme.launch_year && <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold">Launched: {scheme.launch_year}</span>}
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 bg-slate-50 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <h4 className="font-bold text-sm mb-2 text-slate-800">Objective</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{scheme.objective || scheme.description}</p>
          </div>

          <div className="space-y-8 relative before:absolute before:left-[1.65rem] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
            {/* Step 1: Eligibility */}
            <div className="flex gap-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm border border-blue-100">1</div>
              <div>
                <h4 className="font-bold text-lg mb-2" style={{ color: COLORS.primary }}>{t.roadmap_step1}</h4>
                <ul className="space-y-1.5">
                  {scheme.eligibility.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-400"></div> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step 2: Documents */}
            <div className="flex gap-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm border border-green-100">2</div>
              <div>
                <h4 className="font-bold text-lg mb-2" style={{ color: COLORS.primary }}>{t.roadmap_step2}</h4>
                <div className="flex flex-wrap gap-2">
                  {['Aadhaar Card', 'Bank Passbook', 'Land Records', 'Photo ID'].map((doc, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-slate-600">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Final Action */}
            <div className="flex gap-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm border border-orange-100">3</div>
              <div>
                <h4 className="font-bold text-lg mb-2" style={{ color: COLORS.primary }}>{t.roadmap_step3}</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  {t.reassurance_msg.replace('{{id}}', user.id)}
                </p>
                <button 
                  onClick={handleRedirect}
                  className="w-full md:w-auto px-8 py-4 bg-[#138808] text-white rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3"
                >
                  {t.go_official_btn}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </button>
              </div>
            </div>
          </div>
          
          <p className="mt-10 text-[10px] text-slate-400 text-center italic border-t border-slate-50 pt-6">
            {t.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchemeRoadmapModal;
