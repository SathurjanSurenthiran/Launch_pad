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
  throw new Error('VITE_API_BASE_URL must be set for production builds.');
}

export const BASE_URL = apiBaseUrl || 'http://localhost:3000/api';
