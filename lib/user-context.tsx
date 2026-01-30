"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { apiRequest, type ApiError } from "./api-client"

const TOKEN_STORAGE_KEY = "scorex_token"

// Types
export interface Trader {
  id: string
  username: string
  avatar: string
  scoreXPoints: number
  rank: number
  avgStars: number
  totalPLPercent: number
  totalSignals: number
  subscribers: number
  avgDaysToResult?: number
}

export interface UserProfile {
  id: string
  username: string
  displayName: string
  bio: string
  avatar: string
  scoreXPoints: number
  rank: number
  avgStars: number
  totalStarCount: number
  totalPLPercent: number
  totalSignals: number
  subscribers: number
}

export interface Subscription {
  traderId: string
  bellSetting: "all" | "personalized" | "none"
}

export interface UserRating {
  traderId: string
  stars: number
}

export interface SignalVote {
  signalId: string
  vote: "like" | "dislike" | null
}

interface UserState {
  profile: UserProfile
  favorites: string[]
  subscriptions: Subscription[]
  ratings: UserRating[]
  votes: SignalVote[]
  isLoggedIn: boolean
  token: string | null
  isHydrating: boolean
}

interface UserContextType extends UserState {
  // Auth
  logout: () => void
  setToken: (token: string | null) => void
  hydrateAuth: () => Promise<void>
  requireAuth: (actionName?: string) => boolean
  // Profile
  updateProfile: (updates: Partial<UserProfile>) => void
  // Favorites
  toggleFavorite: (signalId: string) => void
  isFavorite: (signalId: string) => boolean
  // Subscriptions
  subscribe: (traderId: string) => void
  unsubscribe: (traderId: string) => void
  isSubscribed: (traderId: string) => boolean
  setBellSetting: (traderId: string, setting: "all" | "personalized" | "none") => void
  getBellSetting: (traderId: string) => "all" | "personalized" | "none"
  // Ratings
  rateTrader: (traderId: string, stars: number) => void
  getUserRating: (traderId: string) => number | null
  // Votes
  voteSignal: (signalId: string, vote: "like" | "dislike") => void
  getVote: (signalId: string) => "like" | "dislike" | null
  // Getters
  getTraderWithUpdatedStats: (trader: Trader) => Trader
}

const UserContext = createContext<UserContextType | null>(null)

// Default empty profile for unauthenticated users
const initialProfile: UserProfile = {
  id: "",
  username: "",
  displayName: "",
  bio: "",
  avatar: "/placeholder-user.jpg",
  scoreXPoints: 0,
  rank: 0,
  avgStars: 0,
  totalStarCount: 0,
  totalPLPercent: 0,
  totalSignals: 0,
  subscribers: 0,
}

const initialState: UserState = {
  profile: initialProfile,
  favorites: [],
  subscriptions: [],
  ratings: [],
  votes: [],
  isLoggedIn: false,
  token: null,
  isHydrating: true,
}

interface AuthMeResponse {
  id?: string
  username?: string
  scoreXPoints?: number
  avatar?: string
  displayName?: string
  bio?: string
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>(initialState)
  const router = useRouter()

  const setToken = useCallback((token: string | null) => {
    setState((prev) => ({ ...prev, token }))
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token)
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      }
    }
  }, [])

  const hydrateAuth = useCallback(async () => {
    if (typeof window === "undefined") {
      setState((prev) => ({ ...prev, isHydrating: false }))
      return
    }

    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)

    if (!storedToken) {
      setState((prev) => ({ ...prev, isHydrating: false, isLoggedIn: false, token: null }))
      return
    }

    try {
      const userData = await apiRequest<AuthMeResponse>({
        method: "GET",
        path: "/auth/me",
        token: storedToken,
        timeoutMs: 5000, // Shorter timeout for auth check
      })

      setState((prev) => ({
        ...prev,
        isLoggedIn: true,
        token: storedToken,
        isHydrating: false,
        profile: {
          ...prev.profile,
          ...(userData.id && { id: userData.id }),
          ...(userData.username && {
            username: userData.username,
            displayName: userData.displayName || userData.username,
          }),
          ...(userData.scoreXPoints !== undefined && { scoreXPoints: userData.scoreXPoints }),
          ...(userData.avatar && { avatar: userData.avatar }),
          ...(userData.bio && { bio: userData.bio }),
        },
      }))
    } catch (err) {
      // On any error (network, 401, 403, timeout), clear token and continue as guest
      const apiErr = err as ApiError
      console.log("[v0] Auth hydration failed:", apiErr.message)
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      setState((prev) => ({
        ...prev,
        isLoggedIn: false,
        token: null,
        isHydrating: false,
      }))
    }
  }, [])

  useEffect(() => {
    hydrateAuth()
  }, [hydrateAuth])

  const requireAuth = useCallback(
    (actionName?: string): boolean => {
      // Block actions while still hydrating
      if (state.isHydrating) {
        console.log(`[v0] Auth check blocked - still hydrating (action: ${actionName || "unknown"})`)
        return false
      }

      if (state.isLoggedIn) {
        return true
      }

      // Not logged in - show message and redirect
      console.log(`[v0] Auth required for action: ${actionName || "unknown"} - redirecting to login`)

      // Use window for toast since we can't use hook here
      // The redirect will happen, and user will see login page
      router.push("/login")

      return false
    },
    [state.isHydrating, state.isLoggedIn, router],
  )

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
    setState({
      ...initialState,
      isLoggedIn: false,
      token: null,
      isHydrating: false,
    })
  }, [])

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }))
  }, [])

  const toggleFavorite = useCallback((signalId: string) => {
    setState((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(signalId)
        ? prev.favorites.filter((id) => id !== signalId)
        : [...prev.favorites, signalId],
    }))
  }, [])

  const isFavorite = useCallback(
    (signalId: string) => {
      return state.favorites.includes(signalId)
    },
    [state.favorites],
  )

  const subscribe = useCallback((traderId: string) => {
    setState((prev) => {
      if (prev.subscriptions.some((s) => s.traderId === traderId)) return prev
      return {
        ...prev,
        subscriptions: [...prev.subscriptions, { traderId, bellSetting: "all" }],
      }
    })
  }, [])

  const unsubscribe = useCallback((traderId: string) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.filter((s) => s.traderId !== traderId),
    }))
  }, [])

  const isSubscribed = useCallback(
    (traderId: string) => {
      return state.subscriptions.some((s) => s.traderId === traderId)
    },
    [state.subscriptions],
  )

  const setBellSetting = useCallback((traderId: string, setting: "all" | "personalized" | "none") => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) => (s.traderId === traderId ? { ...s, bellSetting: setting } : s)),
    }))
  }, [])

  const getBellSetting = useCallback(
    (traderId: string): "all" | "personalized" | "none" => {
      const sub = state.subscriptions.find((s) => s.traderId === traderId)
      return sub?.bellSetting ?? "all"
    },
    [state.subscriptions],
  )

  const rateTrader = useCallback((traderId: string, stars: number) => {
    setState((prev) => {
      const existing = prev.ratings.find((r) => r.traderId === traderId)
      if (existing) {
        return {
          ...prev,
          ratings: prev.ratings.map((r) => (r.traderId === traderId ? { ...r, stars } : r)),
        }
      }
      return {
        ...prev,
        ratings: [...prev.ratings, { traderId, stars }],
      }
    })
  }, [])

  const getUserRating = useCallback(
    (traderId: string): number | null => {
      const rating = state.ratings.find((r) => r.traderId === traderId)
      return rating?.stars ?? null
    },
    [state.ratings],
  )

  const voteSignal = useCallback((signalId: string, vote: "like" | "dislike") => {
    setState((prev) => {
      const existing = prev.votes.find((v) => v.signalId === signalId)
      if (existing) {
        if (existing.vote === vote) {
          return {
            ...prev,
            votes: prev.votes.map((v) => (v.signalId === signalId ? { ...v, vote: null } : v)),
          }
        }
        return {
          ...prev,
          votes: prev.votes.map((v) => (v.signalId === signalId ? { ...v, vote } : v)),
        }
      }
      return {
        ...prev,
        votes: [...prev.votes, { signalId, vote }],
      }
    })
  }, [])

  const getVote = useCallback(
    (signalId: string): "like" | "dislike" | null => {
      const vote = state.votes.find((v) => v.signalId === signalId)
      return vote?.vote ?? null
    },
    [state.votes],
  )

  const getTraderWithUpdatedStats = useCallback(
    (trader: Trader): Trader => {
      const userRating = state.ratings.find((r) => r.traderId === trader.id)
      if (userRating) {
        const adjustedAvg = (trader.avgStars * 10 + userRating.stars) / 11
        return { ...trader, avgStars: Number(adjustedAvg.toFixed(1)) }
      }
      return trader
    },
    [state.ratings],
  )

  return (
    <UserContext.Provider
      value={{
        ...state,
        logout,
        setToken,
        hydrateAuth,
        requireAuth,
        updateProfile,
        toggleFavorite,
        isFavorite,
        subscribe,
        unsubscribe,
        isSubscribed,
        setBellSetting,
        getBellSetting,
        rateTrader,
        getUserRating,
        voteSignal,
        getVote,
        getTraderWithUpdatedStats,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
