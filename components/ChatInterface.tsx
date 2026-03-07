
import React, { useState, useRef, useEffect } from 'react';
import { Message, Language } from '../types.ts';
import { COLORS, getTranslation, SUPPORTED_LANGUAGES } from '../constants.tsx';
import { getSwayamsevaResponse } from '../services/geminiService.ts';

interface ChatInterfaceProps {
  lang: Language;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ lang: initialLang }) => {
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);
  
  useEffect(() => {
    setCurrentLang(initialLang);
  }, [initialLang]);

  const t = getTranslation(currentLang);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `${t.namaste}. ${t.chatPrompt}`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => (prev.trim() + ' ' + transcript).trim());
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Update recognition language when currentLang changes
  useEffect(() => {
    if (recognitionRef.current) {
      // Map our language codes to BCP 47 tags if needed, but most match
      const langMap: Record<string, string> = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'bn': 'bn-IN',
        'te': 'te-IN',
        'mr': 'mr-IN',
        'ta': 'ta-IN',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE'
      };
      recognitionRef.current.lang = langMap[currentLang] || currentLang;
    }
  }, [currentLang]);

  const toggleSpeechInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string, index: number) => {
    if (isSpeaking === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Clean text for speech (remove markdown symbols)
    const cleanText = text.replace(/[#*`_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const langMap: Record<string, string> = {
      'en': 'en',
      'hi': 'hi',
      'bn': 'bn',
      'te': 'te',
      'mr': 'mr',
      'ta': 'ta',
      'es': 'es',
      'fr': 'fr',
      'de': 'de'
    };
    const targetLang = langMap[currentLang] || currentLang;
    const voice = voices.find(v => v.lang.startsWith(targetLang));
    if (voice) utterance.voice = voice;
    utterance.lang = targetLang;

    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    
    setIsSpeaking(index);
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: textToSend, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getSwayamsevaResponse(textToSend, currentLang);
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: responseText, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 bg-[#138808] group overflow-hidden"
        aria-label="Open SwayamHelp Assistant"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="text-2xl group-hover:animate-bounce relative z-10">🙏</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-md h-[650px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b shadow-sm" style={{ backgroundColor: COLORS.primary }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-inner">🙏</div>
          <div>
            <h3 className="text-white font-bold leading-none">SwayamHelp AI</h3>
            <span className="text-green-300 text-[10px] font-bold tracking-wider uppercase">Digital Seva Companion</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={currentLang}
            onChange={(e) => setCurrentLang(e.target.value as Language)}
            className="bg-white/10 text-white text-xs border-none rounded px-2 py-1 outline-none focus:ring-1 focus:ring-white/50"
          >
            {SUPPORTED_LANGUAGES.map(l => (
              <option key={l.code} value={l.code} className="text-slate-800">{l.name}</option>
            ))}
          </select>
          <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed relative ${
              msg.role === 'user' ? 'bg-[#0B3C5D] text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
            }`}>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">{msg.content}</div>
              <div className="flex items-center justify-between mt-2 opacity-50 text-[10px]">
                <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => speakText(msg.content, i)} 
                    className={`p-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-1 ${isSpeaking === i ? 'text-blue-600 font-bold' : ''}`}
                    title={isSpeaking === i ? "Stop" : "Listen"}
                  >
                    {isSpeaking === i ? (
                      <>
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        Stop
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                        Listen
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-end gap-2">
          <div className="relative flex-grow">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' && !e.shiftKey) { 
                  e.preventDefault(); 
                  handleSend(); 
                } 
              }}
              placeholder={isListening ? "Listening..." : "Ask SwayamHelp..."}
              rows={1}
              className={`w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none max-h-32 text-sm ${isListening ? 'ring-2 ring-red-400 border-red-400' : ''}`}
            />
            <button 
              onClick={toggleSpeechInput} 
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all flex items-center justify-center ${isListening ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
              title="Voice Input"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
          </div>
          <button 
            onClick={() => handleSend()} 
            disabled={!input.trim() || isLoading} 
            className="p-3.5 rounded-2xl bg-[#138808] text-white disabled:opacity-30 transition-all hover:scale-105 active:scale-95 shadow-md flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
