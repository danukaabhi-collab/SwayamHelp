
export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  BENGALI = 'bn',
  TELUGU = 'te',
  MARATHI = 'mr',
  TAMIL = 'ta',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de'
}

export interface User {
  id: string;
  email: string;
  name: string;
  age?: string;
  gender?: string;
  caste?: string;
  qualification?: string;
  occupation?: string;
  residence?: string;
  income?: string;
  profilePic?: string;
  appliedSchemes: string[];
}

export interface Scheme {
  id: string;
  name: string;
  category: string;
  description?: string;
  objective?: string;
  benefits: string[];
  eligibility: string[];
  status: 'Active Scheme' | 'Upcoming Scheme' | 'Recently Announced' | 'Pilot Scheme' | 'Replaced Scheme' | 'Discontinued Scheme' | 'Live' | 'Upcoming';
  ministry?: string;
  type?: string;
  launch_year?: string;
  application_process?: string;
  official_url?: string;
  source?: string;
  last_updated?: string;
}

export interface Category {
  id: string;
  icon: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
