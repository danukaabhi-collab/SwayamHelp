
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal.tsx';
import { Language, User } from '../types.ts';

interface SignUpPageProps {
  lang: Language;
  onAuthSuccess: (user: User) => void;
  user: User | null;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ lang, onAuthSuccess, user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* We can pass a prop to AuthModal to force signup view if we want, 
          but for now it defaults to login. I'll modify AuthModal to accept a defaultView. */}
      <AuthModal 
        isOpen={true} 
        onClose={() => navigate('/')} 
        lang={lang} 
        onAuthSuccess={onAuthSuccess} 
        initialView="signup"
      />
    </div>
  );
};

export default SignUpPage;
