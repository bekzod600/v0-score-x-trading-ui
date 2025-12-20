"use client"

import Link from "next/link"
import { LogIn, UserPlus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"

interface LoginRequiredModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginRequiredModal({ open, onOpenChange }: LoginRequiredModalProps) {
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("auth.loginRequired")}</DialogTitle>
          <DialogDescription>{t("auth.loginRequiredDesc")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Link href="/login" onClick={() => onOpenChange(false)}>
            <Button className="w-full gap-2">
              <LogIn className="h-4 w-4" />
              {t("auth.login")}
            </Button>
          </Link>
          <Link href="/register" onClick={() => onOpenChange(false)}>
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <UserPlus className="h-4 w-4" />
              {t("auth.register")}
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
