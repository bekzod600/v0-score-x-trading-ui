# ScoreX Frontend-Backend Integration Guide

## Overview
This document covers the complete integration of the ScoreX frontend with the NestJS backend. All mock data has been removed and the frontend now communicates exclusively with real API endpoints.

## Environment Setup

### Required Environment Variables
Add these to your `.env.local` file:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

The backend server should be running on `http://localhost:3000` for development.

## Architecture Overview

### Authentication Flow
1. **Telegram Integration**: User initiates login via POST `/auth/telegram/initiate`
2. **Deep Link**: Backend returns deep link for Telegram bot
3. **Confirmation**: Backend receives webhook from Telegram
4. **Status Check**: Frontend polls or listens via WebSocket for confirmation
5. **Token Storage**: JWT token stored in localStorage under key `scorex_token`
6. **Hydration**: On app mount, frontend validates token with GET `/auth/me`

### API Client
- **Location**: `lib/api-client.ts`
- **Features**:
  - Automatic token injection in Authorization header
  - Timeout handling (15s default, configurable)
  - CORS support with ngrok bypass
  - Error handling with specific status codes
  - Network failure detection

### Service Layer
All services use `apiRequest()` function with NO mock data fallbacks:

1. **Auth Service** (`lib/services/auth-service.ts`)
   - `initiateTelegramLogin()`: POST /auth/telegram/initiate
   - `getTelegramStatus()`: GET /auth/telegram/status/:loginId
   - `getCurrentUser()`: GET /auth/me
   - `logout()`: POST /auth/logout

2. **Signals Service** (`lib/services/signals-service.ts`)
   - `listSignals()`: GET /signals?tab=live|results
   - `getSignal()`: GET /signals/:id
   - `buySignal()`: POST /signals/:id/buy
   - `listTraders()`: GET /traders
   - `getTraderByUsername()`: GET /traders/:username
   - `getTraderSignals()`: GET /traders/:username/signals
   - `getMySignals()`: GET /me/signals

3. **Wallet Service** (`lib/services/wallet-service.ts`)
   - `getWallet()`: GET /wallet
   - `getWalletTransactions()`: GET /wallet/transactions

4. **Notifications Service** (`lib/services/notifications-service.ts`)
   - `listNotifications()`: GET /notifications
   - `markRead()`: POST /notifications/:id/read

5. **Filters Service** (`lib/services/filters-service.ts`)
   - `listFilters()`: GET /filters
   - `createFilter()`: POST /filters

## Page Implementations

### Login Page (`app/(main)/login/page.tsx`)
- **Features**:
  - Telegram authentication initiation
  - Countdown timer for session expiry
  - Deep link button + copyable login ID
  - Polling fallback (2-second intervals)
  - Error handling and retry logic
  - Loading states throughout flow

### Register Page (`app/(main)/register/page.tsx`)
- **Features**:
  - Explains Telegram registration
  - Redirects to login (registration happens on first login)
  - No email/password collection

### Signals Page (`app/(main)/signals/page.tsx`)
- **Features**:
  - Real-time signal loading from API
  - Live/Results tab switching
  - Advanced filtering (status, price, halal, trader stats)
  - Saved filter management
  - Responsive design

### Signal Detail Page (`app/(main)/signals/[id]/page.tsx`)
- **Features**:
  - Individual signal details
  - Signal purchase flow
  - Real-time status updates
  - Locked signal handling (prices hidden until purchased)

### Rating/Leaderboard Page (`app/(main)/rating/page.tsx`)
- **Features**:
  - Trader leaderboard
  - Sorting by ScoreX points, profit, or stars
  - Real-time trader data
  - Trading center management for admins

### User Profile Page (`app/(main)/u/[username]/page.tsx`)
- **Features**:
  - Public trader profiles
  - Live and closed signals
  - Star ratings
  - Subscription management

### Wallet Page (`app/(main)/wallet/page.tsx`)
- **Features**:
  - Real-time balance display
  - Transaction history
  - Refresh functionality

## User Context (`lib/user-context.tsx`)

### State Management
- `profile`: Current user profile data
- `isLoggedIn`: Authentication status
- `token`: JWT token for API requests
- `isHydrating`: Prevents action spam during auth check
- `favorites`, `subscriptions`, `ratings`, `votes`: User preferences

### Key Functions
- `hydrateAuth()`: Called on app mount to validate stored token
- `requireAuth()`: Blocks actions during hydration, redirects if not logged in
- `setToken()`: Updates token and syncs to localStorage
- `logout()`: Clears token and resets state

## Error Handling

### API Errors
- **401 Unauthorized**: Token invalid/expired → redirect to login
- **400 Bad Request**: Validation error → show specific message
- **500 Server Error**: Backend issue → show "try again" message
- **Network Errors**: Connection refused → show CORS/connectivity message
- **Timeout**: Request took too long → show retry option

### Component-Level Error Handling
Each page that fetches data:
1. Shows loading skeleton while fetching
2. Displays error message with retry button on failure
3. Shows empty state if no data
4. Updates UI on successful data load

## Testing Checklist

### Authentication
- [ ] Login initiates correctly with POST /auth/telegram/initiate
- [ ] Countdown timer displays and counts down
- [ ] Deep link opens Telegram with correct format
- [ ] Login ID can be copied to clipboard
- [ ] Polling fetches status every 2 seconds
- [ ] Token saved to localStorage on confirmation
- [ ] Token persists across page refreshes
- [ ] Invalid/expired token redirects to login
- [ ] Logout clears token completely

### Signals
- [ ] Signals page loads live signals on mount
- [ ] Tab switch between live/results works
- [ ] Filters apply correctly
- [ ] Trader leaderboard sorts correctly
- [ ] Signal detail page displays full info
- [ ] Purchase flow shows wallet balance
- [ ] Locked signals hide prices until purchased
- [ ] Purchased signals show all details

### Wallet
- [ ] Wallet balance displays correctly
- [ ] Transaction history loads
- [ ] Transactions show correct types/statuses
- [ ] Balance updates after purchase

### Notifications
- [ ] Notifications load in header
- [ ] Click mark-as-read works
- [ ] Unread count updates correctly
- [ ] Navigation links work

### Protected Routes
- [ ] Unauthenticated users redirected to login
- [ ] Cannot access protected pages without token
- [ ] Hydration blocks actions until complete
- [ ] Logout from protected page works

## Troubleshooting

### "Cannot connect to API" Error
1. Ensure backend server is running on http://localhost:3000
2. Check CORS configuration in backend
3. Verify NEXT_PUBLIC_API_BASE_URL in .env.local

### Login Stuck in "Awaiting Confirmation"
1. Verify Telegram bot is responding to webhooks
2. Check /auth/telegram/status endpoint returns correct response
3. Verify polling is running (check network tab)

### Token Not Persisting
1. Check localStorage is enabled in browser
2. Verify TOKEN_STORAGE_KEY = "scorex_token" matches backend
3. Check token is being set in hydrateAuth()

### API Returning 401 on Valid Token
1. Verify token format: "Bearer {token}"
2. Check Authorization header in network tab
3. Verify token hasn't expired on backend
4. Clear localStorage and re-login

## Performance Optimizations

1. **Request Timeouts**: Set appropriately per endpoint
2. **Polling Intervals**: 2 seconds for login status (configurable)
3. **Cache Control**: etag support via 304 Not Modified
4. **Lazy Loading**: Suspense boundaries on signals page
5. **Token Refresh**: Implement refresh token flow if needed

## Future Enhancements

1. **WebSocket Connection**: Upgrade from polling to real-time updates
2. **Offline Support**: Cache recent signals locally
3. **Image Uploads**: Support for avatar/signal screenshots
4. **Pagination**: Infinite scroll for signals list
5. **Real-time Notifications**: WebSocket events instead of polling

## File Reference

### Core Integration Files
- `lib/api-client.ts` - HTTP client
- `lib/user-context.tsx` - Auth state management
- `lib/hooks/use-auth-websocket.ts` - WebSocket for login flow

### Service Files
- `lib/services/auth-service.ts` - Authentication
- `lib/services/signals-service.ts` - Trading signals
- `lib/services/wallet-service.ts` - Wallet data
- `lib/services/notifications-service.ts` - Notifications
- `lib/services/filters-service.ts` - Saved filters

### Page Files
- `app/(main)/login/page.tsx` - Login
- `app/(main)/register/page.tsx` - Registration
- `app/(main)/signals/page.tsx` - Signals list
- `app/(main)/signals/[id]/page.tsx` - Signal detail
- `app/(main)/rating/page.tsx` - Leaderboard
- `app/(main)/u/[username]/page.tsx` - User profile
- `app/(main)/wallet/page.tsx` - Wallet
