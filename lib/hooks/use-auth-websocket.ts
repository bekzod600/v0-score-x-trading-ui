CRITICAL TASK: Full Backend Integration for ScoreX Trading Platform

PROJECT CONTEXT:
I have a Next.js 15 frontend (currently using mock data) and a production-ready NestJS backend with Telegram authentication. I need to integrate them completely, replacing ALL mock data with real API calls.

BACKEND ARCHITECTURE:
- Base URL: process.env.NEXT_PUBLIC_API_BASE_URL (default: http://localhost:3000)
- Auth: Telegram login flow (no email/password)
- JWT tokens in localStorage: 'scorex_token'
- Database: PostgreSQL with users, signals, wallets, notifications, etc.

AUTHENTICATION FLOW (HIGHEST PRIORITY):
The backend uses a 3-step Telegram authentication process:

1. **Initiate Login** (POST /auth/telegram/initiate)
   - Frontend calls this endpoint
   - Backend returns: { loginId, botUsername, deepLink, expiresIn }
   - Frontend shows QR/deep link to user

2. **User Opens Telegram**
   - Deep link: t.me/bot_username?start=LOGIN_ID
   - User presses /start in Telegram
   - Bot webhook confirms login (POST /auth/telegram/confirm)

3. **Frontend Gets Token** (2 options):
   a) WebSocket (preferred): Listen on /auth namespace for 'login_confirmed' event
   b) Polling (fallback): GET /auth/telegram/status/:loginId every 2 seconds

REQUIRED CHANGES:

1. UPDATE app/(main)/login/page.tsx:
   - Replace entire component with proper Telegram login flow
   - Use initiateTelegramLogin() from lib/services/auth-service.ts
   - Implement WebSocket connection to /auth namespace
   - Subscribe to login_confirmed event
   - Fallback to polling if WebSocket fails
   - Show countdown timer (expiresIn seconds)
   - Display deep link button + copyable login ID
   - Handle success: save token, call hydrateAuth(), redirect to home

2. UPDATE app/(main)/register/page.tsx:
   - Simplify to explain Telegram registration
   - Remove email/password form
   - Add "Sign up with Telegram" button
   - Redirect to /login (registration happens automatically on first login)

3. UPDATE lib/user-context.tsx:
   - Remove mock login/register logic
   - Keep hydrateAuth() - it already works correctly
   - Ensure requireAuth() blocks during hydration
   - Token management is already correct

4. UPDATE lib/services/auth-service.ts:
   - File exists but needs WebSocket integration example
   - Add WebSocket helper for login status listening

5. INTEGRATE SIGNALS API (lib/services/signals-service.ts):
   - Replace mockSignals usage throughout app
   - Call listSignals() in signals page
   - Call getSignal() in signal detail pages
   - Call buySignal() when purchasing
   - Handle locked signals (ticker/prices null until purchased)
   - Map backend status strings correctly (WAIT_EP → WAITING_ENTRY)

6. INTEGRATE WALLET API:
   - Replace WalletContext mock data
   - Call getWallet() and getWalletTransactions()
   - Update balance after purchases
   - Real-time balance updates

7. INTEGRATE NOTIFICATIONS API:
   - Call listNotifications() in header
   - Call markRead() on notification click
   - Replace notification mock data

8. UPDATE API CLIENT (lib/api-client.ts):
   - Add 'ngrok-skip-browser-warning': 'true' header (already present)
   - Handle 401 errors by clearing token and redirecting to /login
   - Better error messages for CORS issues

9. CREATE WebSocket Hook (lib/hooks/use-websocket.ts):
```typescript
   export function useAuthWebSocket(loginId: string, onConfirmed: (data) => void) {
     // Connect to /auth namespace
     // Subscribe to login_confirmed event
     // Handle disconnection
     // Cleanup on unmount
   }
```

10. ENVIRONMENT VARIABLES (.env.local):
