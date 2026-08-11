import type { Company } from '../types';
import { mockCompanies } from '../data/mockCompanies';

const STORAGE_KEY = 'dealsourcing_companies';
const SHORTLIST_KEY = 'dealsourcing_shortlist_ids';

const initCompanies = (): Company[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCompanies));
  return mockCompanies;
};

const getShortlistIds = (): string[] => {
  const stored = localStorage.getItem(SHORTLIST_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveShortlistIds = (ids: string[]) => {
  localStorage.setItem(SHORTLIST_KEY, JSON.stringify(ids));
};

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const companiesApi = {
  getCompanies: async (): Promise<{ companies: Company[]; shortlistIds: string[] }> => {
    await delay(600);
    const companies = initCompanies();
    const shortlistIds = getShortlistIds();
    return { companies, shortlistIds };
  },

  getCompanyById: async (id: string): Promise<Company> => {
    await delay(400);
    const companies = initCompanies();
    const company = companies.find(c => c.id === id);
    if (!company) {
      throw new Error(`Company with ID ${id} not found.`);
    }
    return company;
  },

  toggleShortlist: async (id: string): Promise<string[]> => {
    await delay(300);
    const ids = getShortlistIds();
    const index = ids.indexOf(id);
    let newIds: string[];
    if (index > -1) {
      newIds = ids.filter(item => item !== id);
    } else {
      newIds = [...ids, id];
    }
    saveShortlistIds(newIds);
    return newIds;
  }
};
