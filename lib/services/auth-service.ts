import { apiRequest } from '../api-client';

// ==========================================
// TYPES
// ==========================================

export interface TelegramLoginResponse {
  loginId: string;
  botUsername: string;
  deepLink: string;
  expiresIn: number;
}

export interface TelegramStatusResponse {
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED';
  accessToken?: string;
  user?: {
    id: string;
    telegramId: number;
    telegramUsername?: string;
    role: string;
  };
}

export interface AuthUser {
  id: string;
  telegramId: number;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  role: string;
  balance?: number;
  createdAt?: string;
}

export interface WebAppAuthResponse {
  success: boolean;
  accessToken: string;
  user: {
    id: string;
    telegramId: number;
    telegramUsername?: string;
    role: string;
  };
}

// ==========================================
// WEBSITE LOGIN (Mavjud)
// ==========================================

/**
 * Step 1: Website da Telegram login boshlash
 * Deep link va login ID qaytaradi
 */
export async function initiateTelegramLogin(): Promise<TelegramLoginResponse> {
  return apiRequest<TelegramLoginResponse>({
    method: 'POST',
    path: '/auth/telegram/initiate',
    timeoutMs: 10000,
  });
}

/**
 * Step 3: Login status tekshirish (polling)
 * WebSocket ishlamasa shu ishlatiladi
 */
export async function getTelegramStatus(loginId: string): Promise<TelegramStatusResponse> {
  return apiRequest<TelegramStatusResponse>({
    method: 'GET',
    path: `/auth/telegram/status/${loginId}`,
    timeoutMs: 5000,
  });
}

/**
 * Joriy user ma'lumotlarini olish
 * JWT token bilan chaqiriladi
 */
export async function getCurrentUser(token?: string): Promise<AuthUser> {
  return apiRequest<AuthUser>({
    method: 'GET',
    path: '/auth/me',
    token: token || undefined,
    timeoutMs: 5000,
  });
}

// ==========================================
// TELEGRAM WEBAPP AUTH (Yangi)
// ==========================================

/**
 * Telegram WebApp ichidan auth qilish
 * 
 * @param initData - window.Telegram.WebApp.initData
 * @returns JWT token va user ma'lumotlari
 * 
 * @example
 * if (isRunningInTelegramWebApp()) {
 *   const result = await authenticateWebApp(window.Telegram.WebApp.initData);
 *   localStorage.setItem('scorex_token', result.accessToken);
 * }
 */
export async function authenticateWebApp(initData: string): Promise<WebAppAuthResponse> {
  return apiRequest<WebAppAuthResponse>({
    method: 'POST',
    path: '/auth/telegram/webapp',
    body: { initData },
    timeoutMs: 10000,
  });
}

/**
 * Telegram WebApp ichida ekanligini tekshirish
 * 
 * @returns true agar Telegram Mini App ichida bo'lsak
 * 
 * @example
 * if (isRunningInTelegramWebApp()) {
 *   // WebApp logic
 * } else {
 *   // Website logic
 * }
 */
export function isRunningInTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  const telegram = window.Telegram;
  if (!telegram?.WebApp) return false;
  
  // initData bo'sh bo'lmasligi kerak
  const initData = telegram.WebApp.initData;
  return typeof initData === 'string' && initData.length > 0;
}

/**
 * Telegram WebApp dan user ma'lumotlarini olish (unsafe - faqat UI uchun)
 * Auth uchun backend validation kerak!
 * 
 * @returns User object yoki null
 */
export function getTelegramWebAppUser() {
  if (!isRunningInTelegramWebApp()) return null;
  return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
}

/**
 * Telegram WebApp instance olish
 * 
 * @returns WebApp object yoki null
 */
export function getTelegramWebApp() {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp || null;
}

/**
 * WebApp ni ready qilish
 * Telegram clientga app yuklandi deb xabar berish
 */
export function markWebAppReady(): void {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.ready();
  }
}

/**
 * WebApp ni expand qilish (full screen)
 */
export function expandWebApp(): void {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.expand();
  }
}

/**
 * WebApp ni yopish
 */
export function closeWebApp(): void {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.close();
  }
}

/**
 * WebApp theme olish (dark/light)
 */
export function getWebAppColorScheme(): 'light' | 'dark' | null {
  const webApp = getTelegramWebApp();
  return webApp?.colorScheme || null;
}

/**
 * WebApp theme colors olish
 */
export function getWebAppThemeParams() {
  const webApp = getTelegramWebApp();
  return webApp?.themeParams || null;
}

/**
 * Haptic feedback berish
 */
export function triggerHapticFeedback(type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy'): void {
  const webApp = getTelegramWebApp();
  if (!webApp?.HapticFeedback) return;

  switch (type) {
    case 'success':
    case 'error':
    case 'warning':
      webApp.HapticFeedback.notificationOccurred(type);
      break;
    case 'light':
    case 'medium':
    case 'heavy':
      webApp.HapticFeedback.impactOccurred(type);
      break;
  }
}

/**
 * Main button sozlash
 */
export function setupMainButton(
  text: string,
  onClick: () => void,
  options?: {
    color?: string;
    textColor?: string;
    isActive?: boolean;
  }
): void {
  const webApp = getTelegramWebApp();
  if (!webApp?.MainButton) return;

  webApp.MainButton.setText(text);
  webApp.MainButton.onClick(onClick);
  
  if (options?.color) {
    webApp.MainButton.color = options.color;
  }
  if (options?.textColor) {
    webApp.MainButton.textColor = options.textColor;
  }
  
  webApp.MainButton.show();
}

/**
 * Main button yashirish
 */
export function hideMainButton(): void {
  const webApp = getTelegramWebApp();
  if (webApp?.MainButton) {
    webApp.MainButton.hide();
  }
}

/**
 * Back button sozlash
 */
export function setupBackButton(onClick: () => void): void {
  const webApp = getTelegramWebApp();
  if (!webApp?.BackButton) return;

  webApp.BackButton.onClick(onClick);
  webApp.BackButton.show();
}

/**
 * Back button yashirish
 */
export function hideBackButton(): void {
  const webApp = getTelegramWebApp();
  if (webApp?.BackButton) {
    webApp.BackButton.hide();
  }
}

// ==========================================
// LEGACY (Disabled)
// ==========================================

export async function logout(): Promise<void> {
  // Local cleanup - server-side session yo'q
  if (typeof window !== 'undefined') {
    localStorage.removeItem('scorex_token');
  }
}
