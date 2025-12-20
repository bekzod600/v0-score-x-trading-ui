"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useWallet } from "@/lib/wallet-context"
import { CreditCard, ArrowRight } from "lucide-react"

interface ClickConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
}

export function ClickConfirmation({ open, onOpenChange, amount }: ClickConfirmationProps) {
  const { topUpClick } = useWallet()

  const fee = amount * 0.03
  const credited = amount - fee

  const handlePay = () => {
    topUpClick(amount)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirm Payment</DialogTitle>
          <DialogDescription>Review your top-up details before proceeding.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold font-mono">${amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-destructive">
              <span>Fee (3%)</span>
              <span className="font-mono">-${fee.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="font-medium">You receive</span>
              <span className="text-lg font-bold text-success font-mono">${credited.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Powered by Click.uz</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePay}>
            Pay with Click
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
