"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

// Types for Training Centers
export interface TrainingCenter {
  id: string
  ownerId: string
  ownerUsername: string
  ownerAvatar: string
  name: string
  city: string
  address: string
  phone: string
  telegram: string
  website: string
  description: string
  logo: string
  status: "pending" | "approved" | "rejected" | "unlisted"
  rating: number
  ratingCount: number
  studentsCount: number
  students: CenterStudent[]
  createdAt: string
  approvedAt?: string
}

export interface CenterStudent {
  userId: string
  username: string
  avatar: string
  joinedAt: string
}

// Types for News
export interface NewsPost {
  id: string
  title: string
  summary: string
  content: string
  coverImage: string
  published: boolean
  authorId: string
  authorUsername: string
  createdAt: string
  updatedAt: string
}

// Types for P2P Approvals
export interface P2PPayment {
  id: string
  userId: string
  username: string
  avatar: string
  amount: number
  cardType: string
  screenshot: string
  status: "pending" | "approved" | "rejected"
  rejectionReason?: string
  createdAt: string
  processedAt?: string
}

// User role type
export type UserRole = "user" | "admin"

interface AdminState {
  currentUserRole: UserRole
  trainingCenters: TrainingCenter[]
  newsPosts: NewsPost[]
  p2pPayments: P2PPayment[]
  userStudiedCenters: string[] // IDs of centers the user has marked as "studied"
}

interface AdminContextType extends AdminState {
  // Role
  setRole: (role: UserRole) => void
  isAdmin: boolean
  // Training Centers
  registerCenter: (
    center: Omit<
      TrainingCenter,
      "id" | "status" | "rating" | "ratingCount" | "studentsCount" | "students" | "createdAt"
    >,
  ) => void
  approveCenter: (id: string) => void
  rejectCenter: (id: string, reason?: string) => void
  toggleCenterListing: (id: string) => void
  updateCenter: (id: string, updates: Partial<TrainingCenter>) => void
  getUserCenter: (userId: string) => TrainingCenter | undefined
  markStudiedAt: (centerId: string) => void
  hasStudiedAt: (centerId: string) => boolean
  rateCenter: (centerId: string, rating: number) => void
  // News
  createNewsPost: (post: Omit<NewsPost, "id" | "createdAt" | "updatedAt">) => void
  updateNewsPost: (id: string, updates: Partial<NewsPost>) => void
  deleteNewsPost: (id: string) => void
  togglePublishNews: (id: string) => void
  // P2P
  approveP2P: (id: string) => void
  rejectP2P: (id: string, reason: string) => void
}

const AdminContext = createContext<AdminContextType | null>(null)

// Generate unique IDs
let idCounter = 100
const generateId = () => `${++idCounter}`

// Mock data
const mockTrainingCenters: TrainingCenter[] = [
  {
    id: "tc-1",
    ownerId: "user-10",
    ownerUsername: "TradingAcademy",
    ownerAvatar: "/trading-academy-logo.jpg",
    name: "Tashkent Trading Academy",
    city: "Tashkent",
    address: "Amir Temur Street 45, Mirzo Ulugbek",
    phone: "+998 90 123 45 67",
    telegram: "@tashkent_trading",
    website: "https://tradingacademy.uz",
    description:
      "Leading trading education center in Uzbekistan. We offer comprehensive courses on stock market analysis, technical indicators, and risk management strategies.",
    logo: "/trading-academy-logo-gold.jpg",
    status: "approved",
    rating: 4.7,
    ratingCount: 45,
    studentsCount: 156,
    students: [
      { userId: "s-1", username: "investor_pro", avatar: "/investor-man.jpg", joinedAt: "2024-01-10" },
      { userId: "s-2", username: "stock_learner", avatar: "/student-woman.png", joinedAt: "2024-01-08" },
      { userId: "s-3", username: "market_newbie", avatar: "/young-trader.jpg", joinedAt: "2024-01-05" },
    ],
    createdAt: "2023-06-15T10:00:00Z",
    approvedAt: "2023-06-16T14:00:00Z",
  },
  {
    id: "tc-2",
    ownerId: "user-11",
    ownerUsername: "SamarkandFinance",
    ownerAvatar: "/finance-school-logo.jpg",
    name: "Samarkand Finance School",
    city: "Samarkand",
    address: "Registan Square 12",
    phone: "+998 91 234 56 78",
    telegram: "@samarkand_finance",
    website: "",
    description: "Professional trading courses with focus on halal investing and Islamic finance principles.",
    logo: "/islamic-finance-logo-green.jpg",
    status: "approved",
    rating: 4.5,
    ratingCount: 28,
    studentsCount: 89,
    students: [
      { userId: "s-4", username: "halal_investor", avatar: "/muslim-investor.jpg", joinedAt: "2024-01-12" },
    ],
    createdAt: "2023-08-20T08:00:00Z",
    approvedAt: "2023-08-21T10:00:00Z",
  },
  {
    id: "tc-3",
    ownerId: "user-12",
    ownerUsername: "ProTraderUz",
    ownerAvatar: "/pro-trader-logo.jpg",
    name: "Pro Trader Education",
    city: "Tashkent",
    address: "Navoi Street 78",
    phone: "+998 93 345 67 89",
    telegram: "@protrader_uz",
    website: "https://protrader.uz",
    description: "Advanced trading strategies and mentorship program for serious traders.",
    logo: "/professional-trading-logo-blue.jpg",
    status: "pending",
    rating: 0,
    ratingCount: 0,
    studentsCount: 0,
    students: [],
    createdAt: "2024-01-14T16:00:00Z",
  },
]

const mockNewsPosts: NewsPost[] = [
  {
    id: "news-1",
    title: "ScoreX Platform Update v2.0",
    summary: "Major improvements to the platform including faster signal delivery and enhanced mobile experience.",
    content:
      "We are excited to announce major improvements to the platform including faster signal delivery, improved leaderboard analytics, and enhanced mobile experience. This update brings a completely redesigned signals page with advanced filtering options, real-time price updates, and better performance across all devices.",
    coverImage: "/platform-update-announcement.jpg",
    published: true,
    authorId: "admin-1",
    authorUsername: "ScoreX Team",
    createdAt: "2024-01-15T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  },
  {
    id: "news-2",
    title: "New Payment Methods Available",
    summary: "P2P payments are now available with 0% fees. Support for local cards has been added.",
    content:
      "P2P payments are now available with 0% fees. Support for Visa, MasterCard, Uzcard, and Humo cards has been added. Users can now top up their wallets using local bank cards without any additional fees through our P2P payment system.",
    coverImage: "/payment-methods-cards.jpg",
    published: true,
    authorId: "admin-1",
    authorUsername: "ScoreX Team",
    createdAt: "2024-01-14T10:00:00Z",
    updatedAt: "2024-01-14T10:00:00Z",
  },
  {
    id: "news-3",
    title: "Monthly Trading Competition",
    summary: "Join our monthly trading competition starting February 1st with exciting prizes.",
    content:
      "Join our monthly trading competition starting February 1st. Top 10 traders will receive bonus ScoreX points and exclusive badges. The competition will run for the entire month and winners will be announced on March 1st.",
    coverImage: "/trading-competition-trophy.jpg",
    published: true,
    authorId: "admin-1",
    authorUsername: "ScoreX Team",
    createdAt: "2024-01-13T09:00:00Z",
    updatedAt: "2024-01-13T09:00:00Z",
  },
  {
    id: "news-4",
    title: "Training Centers Launch (Draft)",
    summary: "Exciting news about our upcoming training centers feature.",
    content:
      "We are working on a new Training Centers feature that will allow verified educators to offer trading courses directly on ScoreX. Stay tuned for more updates!",
    coverImage: "/education-training-center.jpg",
    published: false,
    authorId: "admin-1",
    authorUsername: "ScoreX Team",
    createdAt: "2024-01-16T08:00:00Z",
    updatedAt: "2024-01-16T08:00:00Z",
  },
]

const mockP2PPayments: P2PPayment[] = [
  {
    id: "p2p-1",
    userId: "user-5",
    username: "trader_ali",
    avatar: "/ali-trader-man.jpg",
    amount: 50,
    cardType: "Uzcard",
    screenshot: "/payment-screenshot-receipt.jpg",
    status: "pending",
    createdAt: "2024-01-15T14:30:00Z",
  },
  {
    id: "p2p-2",
    userId: "user-6",
    username: "investor_sara",
    avatar: "/placeholder.svg?height=40&width=40",
    amount: 100,
    cardType: "Humo",
    screenshot: "/placeholder.svg?height=300&width=200",
    status: "pending",
    createdAt: "2024-01-15T13:15:00Z",
  },
  {
    id: "p2p-3",
    userId: "user-7",
    username: "market_watcher",
    avatar: "/placeholder.svg?height=40&width=40",
    amount: 25,
    cardType: "Visa",
    screenshot: "/placeholder.svg?height=300&width=200",
    status: "pending",
    createdAt: "2024-01-15T11:45:00Z",
  },
]

const initialState: AdminState = {
  currentUserRole: "user",
  trainingCenters: mockTrainingCenters,
  newsPosts: mockNewsPosts,
  p2pPayments: mockP2PPayments,
  userStudiedCenters: ["tc-1"],
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminState>(initialState)

  const setRole = useCallback((role: UserRole) => {
    setState((prev) => ({ ...prev, currentUserRole: role }))
  }, [])

  const isAdmin = state.currentUserRole === "admin"

  // Training Center actions
  const registerCenter = useCallback(
    (
      center: Omit<
        TrainingCenter,
        "id" | "status" | "rating" | "ratingCount" | "studentsCount" | "students" | "createdAt"
      >,
    ) => {
      const newCenter: TrainingCenter = {
        ...center,
        id: `tc-${generateId()}`,
        status: "pending",
        rating: 0,
        ratingCount: 0,
        studentsCount: 0,
        students: [],
        createdAt: new Date().toISOString(),
      }
      setState((prev) => ({
        ...prev,
        trainingCenters: [...prev.trainingCenters, newCenter],
      }))
    },
    [],
  )

  const approveCenter = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      trainingCenters: prev.trainingCenters.map((c) =>
        c.id === id ? { ...c, status: "approved" as const, approvedAt: new Date().toISOString() } : c,
      ),
    }))
  }, [])

  const rejectCenter = useCallback((id: string, reason?: string) => {
    setState((prev) => ({
      ...prev,
      trainingCenters: prev.trainingCenters.map((c) => (c.id === id ? { ...c, status: "rejected" as const } : c)),
    }))
  }, [])

  const toggleCenterListing = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      trainingCenters: prev.trainingCenters.map((c) =>
        c.id === id ? { ...c, status: c.status === "unlisted" ? ("approved" as const) : ("unlisted" as const) } : c,
      ),
    }))
  }, [])

  const updateCenter = useCallback((id: string, updates: Partial<TrainingCenter>) => {
    setState((prev) => ({
      ...prev,
      trainingCenters: prev.trainingCenters.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }))
  }, [])

  const getUserCenter = useCallback(
    (userId: string) => {
      return state.trainingCenters.find((c) => c.ownerId === userId)
    },
    [state.trainingCenters],
  )

  const markStudiedAt = useCallback((centerId: string) => {
    setState((prev) => {
      if (prev.userStudiedCenters.includes(centerId)) return prev
      // Also add current user to center's students list
      const userId = "1" // Mock current user ID
      const username = "AlphaTrader"
      const avatar = "/trader-avatar-1.jpg"
      return {
        ...prev,
        userStudiedCenters: [...prev.userStudiedCenters, centerId],
        trainingCenters: prev.trainingCenters.map((c) =>
          c.id === centerId
            ? {
                ...c,
                studentsCount: c.studentsCount + 1,
                students: [
                  ...c.students,
                  { userId, username, avatar, joinedAt: new Date().toISOString().split("T")[0] },
                ],
              }
            : c,
        ),
      }
    })
  }, [])

  const hasStudiedAt = useCallback(
    (centerId: string) => {
      return state.userStudiedCenters.includes(centerId)
    },
    [state.userStudiedCenters],
  )

  const rateCenter = useCallback((centerId: string, rating: number) => {
    setState((prev) => ({
      ...prev,
      trainingCenters: prev.trainingCenters.map((c) => {
        if (c.id !== centerId) return c
        const newCount = c.ratingCount + 1
        const newRating = (c.rating * c.ratingCount + rating) / newCount
        return { ...c, rating: Number(newRating.toFixed(1)), ratingCount: newCount }
      }),
    }))
  }, [])

  // News actions
  const createNewsPost = useCallback((post: Omit<NewsPost, "id" | "createdAt" | "updatedAt">) => {
    const newPost: NewsPost = {
      ...post,
      id: `news-${generateId()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setState((prev) => ({
      ...prev,
      newsPosts: [newPost, ...prev.newsPosts],
    }))
  }, [])

  const updateNewsPost = useCallback((id: string, updates: Partial<NewsPost>) => {
    setState((prev) => ({
      ...prev,
      newsPosts: prev.newsPosts.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p,
      ),
    }))
  }, [])

  const deleteNewsPost = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      newsPosts: prev.newsPosts.filter((p) => p.id !== id),
    }))
  }, [])

  const togglePublishNews = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      newsPosts: prev.newsPosts.map((p) =>
        p.id === id ? { ...p, published: !p.published, updatedAt: new Date().toISOString() } : p,
      ),
    }))
  }, [])

  // P2P actions
  const approveP2P = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      p2pPayments: prev.p2pPayments.map((p) =>
        p.id === id ? { ...p, status: "approved" as const, processedAt: new Date().toISOString() } : p,
      ),
    }))
  }, [])

  const rejectP2P = useCallback((id: string, reason: string) => {
    setState((prev) => ({
      ...prev,
      p2pPayments: prev.p2pPayments.map((p) =>
        p.id === id
          ? { ...p, status: "rejected" as const, rejectionReason: reason, processedAt: new Date().toISOString() }
          : p,
      ),
    }))
  }, [])

  return (
    <AdminContext.Provider
      value={{
        ...state,
        setRole,
        isAdmin,
        registerCenter,
        approveCenter,
        rejectCenter,
        toggleCenterListing,
        updateCenter,
        getUserCenter,
        markStudiedAt,
        hasStudiedAt,
        rateCenter,
        createNewsPost,
        updateNewsPost,
        deleteNewsPost,
        togglePublishNews,
        approveP2P,
        rejectP2P,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
