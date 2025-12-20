"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { mockTraders, mockSignals, type Trader } from "./mock-data"

// Types
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
}

interface UserContextType extends UserState {
  // Auth
  login: (email: string, password: string) => boolean
  register: (email: string, password: string, username: string) => boolean
  logout: () => void
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
  getFavoriteSignals: () => typeof mockSignals
  getUserSignals: () => typeof mockSignals
}

const UserContext = createContext<UserContextType | null>(null)

// Mock current user based on first trader
const initialProfile: UserProfile = {
  id: mockTraders[0].id,
  username: mockTraders[0].username,
  displayName: mockTraders[0].username,
  bio: "Professional trader specializing in tech stocks. 5+ years of experience.",
  avatar: mockTraders[0].avatar,
  scoreXPoints: mockTraders[0].scoreXPoints,
  rank: mockTraders[0].rank,
  avgStars: mockTraders[0].avgStars,
  totalStarCount: 156,
  totalPLPercent: mockTraders[0].totalPLPercent,
  totalSignals: mockTraders[0].totalSignals,
  subscribers: mockTraders[0].subscribers,
}

const initialState: UserState = {
  profile: initialProfile,
  favorites: [],
  subscriptions: [],
  ratings: [],
  votes: [],
  isLoggedIn: false,
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>(initialState)

  const login = useCallback((email: string, password: string): boolean => {
    // Mock login - accept any email/password
    if (email && password) {
      setState((prev) => ({
        ...prev,
        isLoggedIn: true,
        favorites: mockSignals.filter((s) => s.isFavorite).map((s) => s.id),
        subscriptions: [{ traderId: "2", bellSetting: "all" }],
      }))
      return true
    }
    return false
  }, [])

  const register = useCallback((email: string, password: string, username: string): boolean => {
    // Mock register - accept any valid input
    if (email && password && username) {
      setState((prev) => ({
        ...prev,
        isLoggedIn: true,
        profile: {
          ...prev.profile,
          username,
          displayName: username,
        },
        favorites: [],
        subscriptions: [],
      }))
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setState({
      ...initialState,
      isLoggedIn: false,
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

  const getFavoriteSignals = useCallback(() => {
    return mockSignals.filter((s) => state.favorites.includes(s.id))
  }, [state.favorites])

  const getUserSignals = useCallback(() => {
    return mockSignals.filter((s) => s.trader.id === state.profile.id)
  }, [state.profile.id])

  return (
    <UserContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
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
        getFavoriteSignals,
        getUserSignals,
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
