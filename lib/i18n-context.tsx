"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export type Language = "uz" | "ru" | "en"

// Translation keys organized by section
const translations: Record<Language, Record<string, string>> = {
  uz: {
    // Navigation
    "nav.home": "Bosh sahifa",
    "nav.signals": "Signallar",
    "nav.results": "Natijalar",
    "nav.rating": "Reyting",
    "nav.training": "O'quv markazlari",
    "nav.news": "Yangiliklar",
    "nav.wallet": "Hamyon",
    "nav.profile": "Profil",
    "nav.settings": "Sozlamalar",
    "nav.admin": "Admin",
    "nav.addSignal": "Signal qo'shish",
    "nav.logout": "Chiqish",

    // Auth
    "auth.login": "Kirish",
    "auth.register": "Ro'yxatdan o'tish",
    "auth.email": "Email",
    "auth.password": "Parol",
    "auth.confirmPassword": "Parolni tasdiqlash",
    "auth.username": "Foydalanuvchi nomi",
    "auth.forgotPassword": "Parolni unutdingizmi?",
    "auth.noAccount": "Hisobingiz yo'qmi?",
    "auth.haveAccount": "Hisobingiz bormi?",
    "auth.loginRequired": "Kirish talab qilinadi",
    "auth.loginRequiredDesc": "Ushbu amalni bajarish uchun hisobingizga kiring",

    // Signals
    "signals.title": "Signallar",
    "signals.subtitle": "Tasdiqlangan treyderlardan trading signallarini ko'ring",
    "signals.live": "Jonli",
    "signals.results": "Natijalar",
    "signals.filters": "Filtrlar",
    "signals.clearFilters": "Barcha filtrlarni tozalash",
    "signals.noSignals": "Signal topilmadi",
    "signals.noSignalsDesc": "Hozirgi filtrlaringizga mos signal yo'q. Mezonlarni o'zgartirib ko'ring.",
    "signals.buyToUnlock": "Ochish uchun sotib oling",
    "signals.viewDetails": "Batafsil ko'rish",
    "signals.free": "BEPUL",
    "signals.locked": "Qulflangan",
    "signals.profit": "Foyda",
    "signals.loss": "Zarar",
    "signals.risk": "Risk",
    "signals.current": "Joriy",
    "signals.etaLabel": "Natija taxmini",
    "signals.etaDays": "kun",

    // Actions
    "action.subscribe": "Obuna bo'lish",
    "action.subscribed": "Obuna bo'lgan",
    "action.unsubscribe": "Obunani bekor qilish",
    "action.favorite": "Saralanganlarga qo'shish",
    "action.unfavorite": "Saralanganlardan olib tashlash",
    "action.like": "Yoqtirish",
    "action.dislike": "Yoqtirmaslik",
    "action.share": "Ulashish",
    "action.cancel": "Bekor qilish",
    "action.confirm": "Tasdiqlash",
    "action.save": "Saqlash",
    "action.edit": "Tahrirlash",
    "action.delete": "O'chirish",
    "action.back": "Orqaga",
    "action.next": "Keyingi",
    "action.submit": "Yuborish",
    "action.search": "Qidirish",
    "action.filter": "Filtrlash",
    "action.sort": "Saralash",
    "action.close": "Yopish",

    // Wallet
    "wallet.title": "Hamyon",
    "wallet.balance": "Balans",
    "wallet.topUp": "To'ldirish",
    "wallet.transactions": "Tranzaksiyalar",
    "wallet.noTransactions": "Tranzaksiyalar yo'q",
    "wallet.noTransactionsDesc": "Hali hech qanday tranzaksiya amalga oshirmadingiz",

    // Profile
    "profile.title": "Profil",
    "profile.mySignals": "Mening signallarim",
    "profile.favorites": "Saralanganlar",
    "profile.certificates": "Sertifikatlar",
    "profile.subscription": "Obuna",
    "profile.noFavorites": "Saralanganlar yo'q",
    "profile.noFavoritesDesc": "Signallarni saralanganlarga qo'shish uchun yurak belgisini bosing",
    "profile.noSignals": "Signallar yo'q",
    "profile.noSignalsDesc": "Siz hali signal yaratmagansiz",

    // Rating
    "rating.title": "Reyting",
    "rating.subtitle": "Eng yaxshi treyderlar va ularning natijalari",
    "rating.leaderboard": "Liderlar jadvali",

    // Training
    "training.title": "O'quv markazlari",
    "training.subtitle": "Professional trading kurslarini toping",
    "training.comingSoon": "Tez kunda",
    "training.comingSoonDesc": "Hamkorlik qiluvchi o'quv markazlari ro'yxati tez orada qo'shiladi",
    "training.iStudiedHere": "Men bu yerda o'qiganman",
    "training.register": "O'quv markazini ro'yxatdan o'tkazish",

    // News
    "news.title": "Yangiliklar",
    "news.subtitle": "Bozor yangiliklari va tahlillari",
    "news.noNews": "Yangiliklar yo'q",
    "news.noNewsDesc": "Hozircha yangiliklar mavjud emas",

    // Footer
    "footer.about": "Biz haqimizda",
    "footer.contact": "Bog'lanish",
    "footer.privacy": "Maxfiylik siyosati",
    "footer.terms": "Foydalanish shartlari",
    "footer.help": "Yordam",
    "footer.refund": "Qaytarish siyosati",
    "footer.rights": "Barcha huquqlar himoyalangan",

    // Empty states
    "empty.notifications": "Bildirishnomalar yo'q",
    "empty.notificationsDesc": "Yangi bildirishnomalar bu yerda paydo bo'ladi",

    // Misc
    "misc.loading": "Yuklanmoqda...",
    "misc.error": "Xatolik yuz berdi",
    "misc.tryAgain": "Qayta urinish",
    "misc.language": "Til",
    "misc.theme": "Mavzu",
    "misc.darkMode": "Qorong'u rejim",
    "misc.lightMode": "Yorug' rejim",
  },
  ru: {
    // Navigation
    "nav.home": "Главная",
    "nav.signals": "Сигналы",
    "nav.results": "Результаты",
    "nav.rating": "Рейтинг",
    "nav.training": "Учебные центры",
    "nav.news": "Новости",
    "nav.wallet": "Кошелёк",
    "nav.profile": "Профиль",
    "nav.settings": "Настройки",
    "nav.admin": "Админ",
    "nav.addSignal": "Добавить сигнал",
    "nav.logout": "Выйти",

    // Auth
    "auth.login": "Войти",
    "auth.register": "Регистрация",
    "auth.email": "Email",
    "auth.password": "Пароль",
    "auth.confirmPassword": "Подтвердите пароль",
    "auth.username": "Имя пользователя",
    "auth.forgotPassword": "Забыли пароль?",
    "auth.noAccount": "Нет аккаунта?",
    "auth.haveAccount": "Уже есть аккаунт?",
    "auth.loginRequired": "Требуется вход",
    "auth.loginRequiredDesc": "Войдите в аккаунт, чтобы выполнить это действие",

    // Signals
    "signals.title": "Сигналы",
    "signals.subtitle": "Просматривайте торговые сигналы от проверенных трейдеров",
    "signals.live": "Активные",
    "signals.results": "Результаты",
    "signals.filters": "Фильтры",
    "signals.clearFilters": "Очистить все фильтры",
    "signals.noSignals": "Сигналы не найдены",
    "signals.noSignalsDesc": "Нет сигналов, соответствующих вашим фильтрам. Попробуйте изменить критерии.",
    "signals.buyToUnlock": "Купить для разблокировки",
    "signals.viewDetails": "Подробнее",
    "signals.free": "БЕСПЛАТНО",
    "signals.locked": "Заблокировано",
    "signals.profit": "Прибыль",
    "signals.loss": "Убыток",
    "signals.risk": "Риск",
    "signals.current": "Текущая",
    "signals.etaLabel": "Оценка результата",
    "signals.etaDays": "дн.",

    // Actions
    "action.subscribe": "Подписаться",
    "action.subscribed": "Подписан",
    "action.unsubscribe": "Отписаться",
    "action.favorite": "В избранное",
    "action.unfavorite": "Из избранного",
    "action.like": "Нравится",
    "action.dislike": "Не нравится",
    "action.share": "Поделиться",
    "action.cancel": "Отмена",
    "action.confirm": "Подтвердить",
    "action.save": "Сохранить",
    "action.edit": "Редактировать",
    "action.delete": "Удалить",
    "action.back": "Назад",
    "action.next": "Далее",
    "action.submit": "Отправить",
    "action.search": "Поиск",
    "action.filter": "Фильтр",
    "action.sort": "Сортировка",
    "action.close": "Закрыть",

    // Wallet
    "wallet.title": "Кошелёк",
    "wallet.balance": "Баланс",
    "wallet.topUp": "Пополнить",
    "wallet.transactions": "Транзакции",
    "wallet.noTransactions": "Нет транзакций",
    "wallet.noTransactionsDesc": "Вы ещё не совершали транзакций",

    // Profile
    "profile.title": "Профиль",
    "profile.mySignals": "Мои сигналы",
    "profile.favorites": "Избранное",
    "profile.certificates": "Сертификаты",
    "profile.subscription": "Подписка",
    "profile.noFavorites": "Нет избранного",
    "profile.noFavoritesDesc": "Нажмите на сердечко, чтобы добавить сигнал в избранное",
    "profile.noSignals": "Нет сигналов",
    "profile.noSignalsDesc": "Вы ещё не создали ни одного сигнала",

    // Rating
    "rating.title": "Рейтинг",
    "rating.subtitle": "Лучшие трейдеры и их результаты",
    "rating.leaderboard": "Таблица лидеров",

    // Training
    "training.title": "Учебные центры",
    "training.subtitle": "Найдите профессиональные курсы трейдинга",
    "training.comingSoon": "Скоро",
    "training.comingSoonDesc": "Список партнёрских учебных центров скоро будет добавлен",
    "training.iStudiedHere": "Я здесь учился",
    "training.register": "Зарегистрировать учебный центр",

    // News
    "news.title": "Новости",
    "news.subtitle": "Новости рынка и аналитика",
    "news.noNews": "Нет новостей",
    "news.noNewsDesc": "Пока нет доступных новостей",

    // Footer
    "footer.about": "О нас",
    "footer.contact": "Контакты",
    "footer.privacy": "Политика конфиденциальности",
    "footer.terms": "Условия использования",
    "footer.help": "Помощь",
    "footer.refund": "Политика возврата",
    "footer.rights": "Все права защищены",

    // Empty states
    "empty.notifications": "Нет уведомлений",
    "empty.notificationsDesc": "Новые уведомления появятся здесь",

    // Misc
    "misc.loading": "Загрузка...",
    "misc.error": "Произошла ошибка",
    "misc.tryAgain": "Попробовать снова",
    "misc.language": "Язык",
    "misc.theme": "Тема",
    "misc.darkMode": "Тёмный режим",
    "misc.lightMode": "Светлый режим",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.signals": "Signals",
    "nav.results": "Results",
    "nav.rating": "Rating",
    "nav.training": "Training Centers",
    "nav.news": "News",
    "nav.wallet": "Wallet",
    "nav.profile": "Profile",
    "nav.settings": "Settings",
    "nav.admin": "Admin",
    "nav.addSignal": "Add Signal",
    "nav.logout": "Logout",

    // Auth
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.username": "Username",
    "auth.forgotPassword": "Forgot password?",
    "auth.noAccount": "Don't have an account?",
    "auth.haveAccount": "Already have an account?",
    "auth.loginRequired": "Login Required",
    "auth.loginRequiredDesc": "Please log in to your account to perform this action",

    // Signals
    "signals.title": "Signals",
    "signals.subtitle": "Browse trading signals from verified traders",
    "signals.live": "Live",
    "signals.results": "Results",
    "signals.filters": "Filters",
    "signals.clearFilters": "Clear all filters",
    "signals.noSignals": "No signals found",
    "signals.noSignalsDesc": "No signals match your current filters. Try adjusting your criteria.",
    "signals.buyToUnlock": "Buy to Unlock",
    "signals.viewDetails": "View Details",
    "signals.free": "FREE",
    "signals.locked": "Locked",
    "signals.profit": "Profit",
    "signals.loss": "Loss",
    "signals.risk": "Risk",
    "signals.current": "Current",
    "signals.etaLabel": "Est. result",
    "signals.etaDays": "days",

    // Actions
    "action.subscribe": "Subscribe",
    "action.subscribed": "Subscribed",
    "action.unsubscribe": "Unsubscribe",
    "action.favorite": "Add to favorites",
    "action.unfavorite": "Remove from favorites",
    "action.like": "Like",
    "action.dislike": "Dislike",
    "action.share": "Share",
    "action.cancel": "Cancel",
    "action.confirm": "Confirm",
    "action.save": "Save",
    "action.edit": "Edit",
    "action.delete": "Delete",
    "action.back": "Back",
    "action.next": "Next",
    "action.submit": "Submit",
    "action.search": "Search",
    "action.filter": "Filter",
    "action.sort": "Sort",
    "action.close": "Close",

    // Wallet
    "wallet.title": "Wallet",
    "wallet.balance": "Balance",
    "wallet.topUp": "Top Up",
    "wallet.transactions": "Transactions",
    "wallet.noTransactions": "No transactions",
    "wallet.noTransactionsDesc": "You haven't made any transactions yet",

    // Profile
    "profile.title": "Profile",
    "profile.mySignals": "My Signals",
    "profile.favorites": "Favorites",
    "profile.certificates": "Certificates",
    "profile.subscription": "Subscription",
    "profile.noFavorites": "No favorites",
    "profile.noFavoritesDesc": "Tap the heart icon to add signals to your favorites",
    "profile.noSignals": "No signals",
    "profile.noSignalsDesc": "You haven't created any signals yet",

    // Rating
    "rating.title": "Rating",
    "rating.subtitle": "Top traders and their results",
    "rating.leaderboard": "Leaderboard",

    // Training
    "training.title": "Training Centers",
    "training.subtitle": "Find professional trading courses",
    "training.comingSoon": "Coming Soon",
    "training.comingSoonDesc": "Partner training centers list will be added soon",
    "training.iStudiedHere": "I studied here",
    "training.register": "Register Training Center",

    // News
    "news.title": "News",
    "news.subtitle": "Market news and analysis",
    "news.noNews": "No news",
    "news.noNewsDesc": "No news available at the moment",

    // Footer
    "footer.about": "About",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.help": "Help / FAQ",
    "footer.refund": "Refund Policy",
    "footer.rights": "All rights reserved",

    // Empty states
    "empty.notifications": "No notifications",
    "empty.notificationsDesc": "New notifications will appear here",

    // Misc
    "misc.loading": "Loading...",
    "misc.error": "An error occurred",
    "misc.tryAgain": "Try again",
    "misc.language": "Language",
    "misc.theme": "Theme",
    "misc.darkMode": "Dark mode",
    "misc.lightMode": "Light mode",
  },
}

const languageNames: Record<Language, string> = {
  uz: "O'zbek",
  ru: "Русский",
  en: "English",
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  languages: typeof languageNames
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("uz")
  const [isHydrated, setIsHydrated] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("scorex-language") as Language | null
      if (saved && translations[saved]) {
        setLanguageState(saved)
      }
      setIsHydrated(true)
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("scorex-language", lang)
    }
  }, [])

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || translations.en[key] || key
    },
    [language],
  )

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, languages: languageNames }}>
      {children}
    </I18nContext.Provider>
  )
}

// Fallback used when context is not yet available (e.g. during Suspense hydration)
const fallbackI18n: I18nContextType = {
  language: "uz",
  setLanguage: () => {},
  t: (key: string) => {
    return translations.en[key] || key
  },
  languages: languageNames,
}

export function useI18n() {
  const context = useContext(I18nContext)
  return context ?? fallbackI18n
}
