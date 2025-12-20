import type React from "react"
import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Footer } from "@/components/layout/footer"
import { WalletProvider } from "@/lib/wallet-context"
import { UserProvider } from "@/lib/user-context"
import { ToastProvider } from "@/lib/toast-context"
import { AdminProvider } from "@/lib/admin-context"
import { I18nProvider } from "@/lib/i18n-context"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AdminProvider>
        <WalletProvider>
          <UserProvider>
            <ToastProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pb-24 md:pb-0">{children}</main>
                <Footer />
                <BottomNav />
              </div>
            </ToastProvider>
          </UserProvider>
        </WalletProvider>
      </AdminProvider>
    </I18nProvider>
  )
}
