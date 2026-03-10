
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal.tsx';
import { Language, User } from '../types.ts';

interface LoginPageProps {
  lang: Language;
  onAuthSuccess: (user: User) => void;
  user: User | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ lang, onAuthSuccess, user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <AuthModal 
        isOpen={true} 
        onClose={() => navigate('/')} 
        lang={lang} 
        onAuthSuccess={onAuthSuccess} 
      />
    </div>
  );
};

export default LoginPage;
