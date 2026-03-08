
import React from 'react';
import { Language } from '../types.ts';
import { COLORS, getTranslation } from '../constants.tsx';

interface AboutUsProps {
  lang: Language;
}

const AboutUs: React.FC<AboutUsProps> = ({ lang }) => {
  const t = getTranslation(lang);

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6" style={{ color: COLORS.primary }}>{t.aboutUs}</h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          SwayamHelp is a digital bridge connecting citizens to the vast ecosystem of Indian Government welfare schemes.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-20">
        <div className="p-10 bg-blue-50 rounded-[40px] border border-blue-100">
          <div className="text-4xl mb-6">🎯</div>
          <h3 className="text-2xl font-bold mb-4 text-blue-900">Our Mission</h3>
          <p className="text-slate-700 leading-relaxed">
            To ensure that no citizen is left behind due to a lack of information. We leverage AI to simplify complex government notifications into actionable guidance.
          </p>
        </div>
        <div className="p-10 bg-green-50 rounded-[40px] border border-green-100">
          <div className="text-4xl mb-6">👁️</div>
          <h3 className="text-2xl font-bold mb-4 text-green-900">Our Vision</h3>
          <p className="text-slate-700 leading-relaxed">
            To become the most trusted digital companion for every Indian household, fostering a transparent and inclusive digital democracy.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 p-12 rounded-[40px] border border-slate-200">
        <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: COLORS.primary }}>Why SwayamHelp?</h2>
        <div className="grid sm:grid-cols-2 gap-8">
          {[
            { title: "AI-Powered Discovery", desc: "Our intelligent engine matches your profile with hundreds of schemes instantly." },
            { title: "Multilingual Support", desc: "Access information in your native language, breaking the barrier of official jargon." },
            { title: "Official Sources Only", desc: "We strictly aggregate data from India.gov.in and ministry portals." },
            { title: "Step-by-Step Guidance", desc: "From documentation to portal links, we guide you through the entire application." }
          ].map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600 font-bold flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
