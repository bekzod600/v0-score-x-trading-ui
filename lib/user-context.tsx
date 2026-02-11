'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  authenticateWebApp,
  isRunningInTelegramWebApp,
  markWebAppReady,
  expandWebApp,
  closeWebApp,
  type AuthUser,
} from './services/auth-service';

// ==========================================
// TYPES
// ==========================================

interface UserContextType {
  // Auth state
  profile: AuthUser | null;
  isLoggedIn: boolean;
  token: string | null;
  isHydrating: boolean;
  
  // WebApp state
  isWebApp: boolean;
  
  // Actions
  setToken: (token: string | null) => void;
  setProfile: (profile: AuthUser | null) => void;
  hydrateAuth: () => Promise<void>;
  logout: () => void;
  requireAuth: () => boolean;
  
  // User preferences (mavjud)
  favorites: string[];
  subscriptions: string[];
  ratings: Record<string, number>;
  votes: Record<string, 'up' | 'down'>;
  toggleFavorite: (signalId: string) => void;
  toggleSubscription: (traderId: string) => void;
  setRating: (traderId: string, rating: number) => void;
  setVote: (signalId: string, vote: 'up' | 'down' | null) => void;
}

const UserContext = createContext<UserContextType | null>(null);

// ==========================================
// PROVIDER
// ==========================================

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  // Auth state
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  
  // WebApp state
  const [isWebApp, setIsWebApp] = useState(false);
  
  // User preferences
  const [favorites, setFavorites] = useState<string[]>([]);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [votes, setVotes] = useState<Record<string, 'up' | 'down'>>({});

  // ==========================================
  // TOKEN MANAGEMENT
  // ==========================================
  
  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    
    if (typeof window !== 'undefined') {
      if (newToken) {
        localStorage.setItem('scorex_token', newToken);
      } else {
        localStorage.removeItem('scorex_token');
      }
    }
  }, []);

  // ==========================================
  // AUTH HYDRATION
  // ==========================================
  
  const hydrateAuth = useCallback(async () => {
    setIsHydrating(true);
    
    try {
      // 1. Telegram WebApp ichida ekanligini tekshirish
      const inWebApp = isRunningInTelegramWebApp();
      setIsWebApp(inWebApp);
      
      if (inWebApp) {
        console.log('[Auth] Running inside Telegram WebApp');
        
        // Avval localStorage da token bormi tekshirish (tezroq)
        const storedToken = localStorage.getItem('scorex_token');
        
        if (storedToken) {
          console.log('[Auth] WebApp: Found stored token, validating...');
          try {
            const user = await getCurrentUser(storedToken);
            setTokenState(storedToken);
            setToken(storedToken);
            setProfile(user);
            console.log('[Auth] WebApp: Stored token valid, user:', user.id);
            markWebAppReady();
            expandWebApp();
            return;
          } catch (err) {
            console.log('[Auth] WebApp: Stored token invalid, trying initData auth...');
            localStorage.removeItem('scorex_token');
          }
        }
        
        // Stored token yo'q yoki yaroqsiz — initData bilan auth
        try {
          const initData = window.Telegram!.WebApp!.initData;
          
          if (initData && initData.length > 0) {
            const result = await authenticateWebApp(initData);
            
            if (result.success && result.accessToken) {
              console.log('[Auth] WebApp auth successful');
              setToken(result.accessToken);
              
              const user = await getCurrentUser(result.accessToken);
              setProfile(user);
              
              markWebAppReady();
              expandWebApp();
              return;
            }
          }
        } catch (webAppError) {
          console.error('[Auth] WebApp initData auth failed:', webAppError);
        }
        
        // Hech narsa ishlamadi — ready qilish (auth bo'lmasa ham)
        markWebAppReady();
        expandWebApp();
        return;
      }
      
      // 2. Website: localStorage dan token olish
      const storedToken = typeof window !== 'undefined' 
        ? localStorage.getItem('scorex_token') 
        : null;
      
      if (storedToken) {
        console.log('[Auth] Found stored token, validating...');
        setTokenState(storedToken);
        
        try {
          const user = await getCurrentUser(storedToken);
          setProfile(user);
          console.log('[Auth] Token validated, user:', user.id);
        } catch (error) {
          console.error('[Auth] Token validation failed:', error);
          setToken(null);
          setProfile(null);
        }
      } else {
        console.log('[Auth] No stored token found');
      }
    } catch (error) {
      console.error('[Auth] Hydration error:', error);
    } finally {
      setIsHydrating(false);
    }
  }, [setToken]);

  // ==========================================
  // LOGOUT
  // ==========================================
  
  const logout = useCallback(() => {
    console.log('[Auth] Logging out...');
    
    setToken(null);
    setProfile(null);
    setFavorites([]);
    setSubscriptions([]);
    setRatings({});
    setVotes({});
    
    // Agar Telegram WebApp ichida bo'lsak, yopish
    if (isWebApp) {
      closeWebApp();
    } else {
      router.push('/login');
    }
  }, [setToken, isWebApp, router]);

  // ==========================================
  // REQUIRE AUTH
  // ==========================================
  
  const requireAuth = useCallback((): boolean => {
    // Hydration tugaguncha kutish
    if (isHydrating) {
      return false;
    }
    
    // Auth bo'lmasa
    if (!token || !profile) {
      // WebApp da login page ga redirect qilmaymiz
      if (!isWebApp) {
        router.push('/login');
      }
      return false;
    }
    
    return true;
  }, [isHydrating, token, profile, isWebApp, router]);

  // ==========================================
  // USER PREFERENCES
  // ==========================================
  
  const toggleFavorite = useCallback((signalId: string) => {
    setFavorites((prev) =>
      prev.includes(signalId)
        ? prev.filter((id) => id !== signalId)
        : [...prev, signalId]
    );
  }, []);

  const toggleSubscription = useCallback((traderId: string) => {
    setSubscriptions((prev) =>
      prev.includes(traderId)
        ? prev.filter((id) => id !== traderId)
        : [...prev, traderId]
    );
  }, []);

  const setRating = useCallback((traderId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [traderId]: rating }));
  }, []);

  const setVote = useCallback((signalId: string, vote: 'up' | 'down' | null) => {
    setVotes((prev) => {
      if (vote === null) {
        const { [signalId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [signalId]: vote };
    });
  }, []);

  // ==========================================
  // EFFECTS
  // ==========================================
  
  // Mount da hydrate
  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================
  
  const isLoggedIn = !!token && !!profile;

  const contextValue: UserContextType = {
    // Auth state
    profile,
    isLoggedIn,
    token,
    isHydrating,
    
    // WebApp state
    isWebApp,
    
    // Actions
    setToken,
    setProfile,
    hydrateAuth,
    logout,
    requireAuth,
    
    // User preferences
    favorites,
    subscriptions,
    ratings,
    votes,
    toggleFavorite,
    toggleSubscription,
    setRating,
    setVote,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Safe no-op defaults for prerendering (when UserProvider is not mounted yet)
const noop = () => {}
const noopAsync = async () => {}

const fallbackContext: UserContextType = {
  profile: null,
  isLoggedIn: false,
  token: null,
  isHydrating: true,
  isWebApp: false,
  setToken: noop as (token: string | null) => void,
  setProfile: noop as (profile: AuthUser | null) => void,
  hydrateAuth: noopAsync,
  logout: noop,
  requireAuth: () => false,
  favorites: [],
  subscriptions: [],
  ratings: {},
  votes: {},
  toggleFavorite: noop as (signalId: string) => void,
  toggleSubscription: noop as (traderId: string) => void,
  setRating: noop as (traderId: string, rating: number) => void,
  setVote: noop as (signalId: string, vote: 'up' | 'down' | null) => void,
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    // During SSR prerendering, return safe defaults instead of throwing
    return fallbackContext
  }
  
  return context;
}
