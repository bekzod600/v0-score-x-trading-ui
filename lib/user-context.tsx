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
  waitForTelegramWebApp,
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
  updateProfile: (partial: Partial<AuthUser>) => void;
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
  // UPDATE PROFILE (partial merge)
  // ==========================================

  const updateProfile = useCallback((partial: Partial<AuthUser>) => {
    setProfile((prev) => prev ? { ...prev, ...partial } : prev);
  }, []);

  // ==========================================
  // AUTH HYDRATION
  // ==========================================
  
  const hydrateAuth = useCallback(async () => {
    setIsHydrating(true);

    try {
      // 1. Telegram WebApp SDK yuklanishini kutish (max 3 soniya)
      const inWebApp = await waitForTelegramWebApp(3000, 100);
      setIsWebApp(inWebApp);

      console.log('[Auth] Environment:', inWebApp ? 'Telegram WebApp' : 'Website');

      if (inWebApp) {
        console.log('[Auth] Running inside Telegram WebApp');

        // 1a. Avval localStorage da token bormi tekshirish (tezroq)
        const existingToken = localStorage.getItem('scorex_token');

        if (existingToken) {
          console.log('[Auth] WebApp: Found existing token, validating...');
          try {
            const user = await getCurrentUser(existingToken);
            setTokenState(existingToken);
            setProfile(user);
            console.log('[Auth] WebApp: Token valid, user:', user.id);
            markWebAppReady();
            expandWebApp();
            return;
          } catch (tokenErr) {
            console.warn('[Auth] WebApp: Existing token invalid, clearing...');
            localStorage.removeItem('scorex_token');
            setTokenState(null);
          }
        }

        // 1b. Token yo'q yoki yaroqsiz — initData bilan auth
        try {
          const initData = window.Telegram?.WebApp?.initData;
          console.log('[Auth] WebApp initData:', initData ? `${initData.length} chars` : 'MISSING');

          if (initData && initData.length > 0) {
            console.log('[Auth] WebApp: Sending authenticateWebApp request...');
            const result = await authenticateWebApp(initData);
            console.log('[Auth] WebApp: authenticateWebApp response:', {
              success: result?.success,
              hasToken: !!result?.accessToken,
              userId: result?.user?.id,
            });

            if (result && result.success && result.accessToken) {
              // Token saqlash
              localStorage.setItem('scorex_token', result.accessToken);
              setTokenState(result.accessToken);

              // User profile olish
              try {
                const user = await getCurrentUser(result.accessToken);
                setProfile(user);
                console.log('[Auth] WebApp: Profile loaded:', user.id);
              } catch (profileErr) {
                console.warn('[Auth] WebApp: getCurrentUser failed, using result.user');
                // Fallback: result.user dan profile yaratish
                setProfile({
                  id: result.user.id,
                  telegramId: result.user.telegramId,
                  telegramUsername: result.user.telegramUsername || '',
                  role: result.user.role,
                } as AuthUser);
              }

              markWebAppReady();
              expandWebApp();
              return;
            }
          } else {
            console.warn('[Auth] WebApp: initData is empty — SDK loaded but no data');
          }
        } catch (webAppError: any) {
          console.error('[Auth] WebApp auth error:', {
            message: webAppError?.message,
            status: webAppError?.status,
            details: webAppError?.details,
          });
        }

        // 1c. Auth ishlamadi — baribir ready qilamiz
        console.log('[Auth] WebApp: Auth failed, showing as guest');
        markWebAppReady();
        expandWebApp();
        return; // MUHIM: website fallback ga O'TMASLIK
      }

      // 2. Website: localStorage dan token olish
      const storedToken = typeof window !== 'undefined'
        ? localStorage.getItem('scorex_token')
        : null;

      if (storedToken) {
        console.log('[Auth] Website: Validating stored token...');
        setTokenState(storedToken);

        try {
          const user = await getCurrentUser(storedToken);
          setProfile(user);
          console.log('[Auth] Website: Token valid, user:', user.id);
        } catch (error: any) {
          console.error('[Auth] Website: Token invalid:', error?.message);
          localStorage.removeItem('scorex_token');
          setTokenState(null);
          setProfile(null);
        }
      } else {
        console.log('[Auth] Website: No token found');
      }
    } catch (error) {
      console.error('[Auth] Critical hydration error:', error);
    } finally {
      setIsHydrating(false);
    }
  }, []);

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
    updateProfile,
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
  updateProfile: noop as (partial: Partial<AuthUser>) => void,
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
