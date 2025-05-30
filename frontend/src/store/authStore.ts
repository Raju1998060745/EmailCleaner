import { create } from 'zustand';
import { AuthState, User } from '../types';

// This is a mock implementation. Replace with actual API calls.
const mockAuth = async (email: string, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: '1',
    email,
    name: email.split('@')[0]
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    try {
      const user = await mockAuth(email, password);
      set({ user, isAuthenticated: true });
    } 
    catch (error) {
      throw new Error('Login failed');
    }
  },
  
  register: async (email: string, password: string, name: string) => {
    try {
      const user = await mockAuth(email, password);
      set({ user, isAuthenticated: true });
    } catch (error) {
      throw new Error('Registration failed');
    }
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  }
}));