export const USER_ROLES = {
  STUDENT: 'STUDENT',
  RECRUITER: 'RECRUITER',
  ADMIN: 'ADMIN',
};

export const PROJECT_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  HIDDEN: 'HIDDEN',
};

export const PROJECT_CATEGORIES = [
  'WEB DEVELOPMENT',
  'MOBILE DEVELOPMENT',
  'DESKTOP APPLICATION',
  'ARTIFICIAL INTELLIGENCE',
  'MACHINE LEARNING',
  'INTERNET OF THINGS',
  'CYBER SECURITY',
  'CLOUD COMPUTING',
  'DATA SCIENCE',
  'GAME DEVELOPMENT',
  'BLOCKCHAIN',
  'OTHER',
];

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.PROD && !apiBaseUrl) {
  console.warn('VITE_API_BASE_URL is not set for production builds. Falling back to relative path "/api".');
}

export const BASE_URL = apiBaseUrl || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');
