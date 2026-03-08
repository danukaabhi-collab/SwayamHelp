
import React from 'react';
import { Language } from '../types.ts';
import { COLORS, getTranslation } from '../constants.tsx';

interface HelpProps {
  lang: Language;
}

const Help: React.FC<HelpProps> = ({ lang }) => {
  const t = getTranslation(lang);

  const faqs = [
    {
      q: "How do I check my eligibility for a scheme?",
      a: "Simply search for a scheme using the search bar or browse categories. Once you click 'Explore', our AI will analyze your profile (if logged in) to determine your eligibility instantly."
    },
    {
      q: "Is my personal data safe with SwayamHelp?",
      a: "Yes. We use your data only to match you with relevant government schemes. We do not sell or share your personal information with third parties."
    },
    {
      q: "Where does SwayamHelp get its information?",
      a: "We aggregate data strictly from official government portals like India.gov.in, MyScheme.gov.in, and various ministry websites to ensure 100% accuracy."
    },
    {
      q: "How can I apply for a scheme?",
      a: "After selecting a scheme, we provide a step-by-step roadmap and a direct link to the official government portal where you can complete your application."
    },
    {
      q: "What if I can't find a specific scheme?",
      a: "Use our AI Chat interface to ask about any scheme. Our AI can search live government databases to find the most recent updates for you."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6" style={{ color: COLORS.primary }}>{t.help}</h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          Need assistance? We're here to help you navigate the digital seva landscape.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {[
          { icon: "💬", title: "AI Chat Support", desc: "Talk to our AI assistant 24/7 for instant answers." },
          { icon: "📧", title: "Email Support", desc: "Reach us at support@swayamhelp.gov.in for complex queries." },
          { icon: "📞", title: "Helpline", desc: "Call 1800-XXX-XXXX for direct assistance (9 AM - 6 PM)." }
        ].map((item, i) => (
          <div key={i} className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm text-center hover:shadow-md transition-all">
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-12 rounded-[40px] border border-slate-100 shadow-sm">
        <h2 className="text-3xl font-bold mb-10 text-center" style={{ color: COLORS.primary }}>Frequently Asked Questions</h2>
        <div className="space-y-8">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-slate-50 pb-8 last:border-0">
              <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-start gap-3">
                <span className="text-blue-600 font-mono">Q.</span> {faq.q}
              </h4>
              <p className="text-slate-600 leading-relaxed pl-8">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;
