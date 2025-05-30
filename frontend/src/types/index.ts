export interface SyncStats {
  processed: number;
  inserted: number;
  timeElapsed: number;
}

export interface TopSender {
  email: string;
  count: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}