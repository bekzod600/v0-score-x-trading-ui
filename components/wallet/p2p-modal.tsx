"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { X, Copy, Check, Upload, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { FormField } from "@/components/ui/form-field"
import { cn } from "@/lib/utils"
import { useWallet } from "@/lib/wallet-context"
import { useToast } from "@/lib/toast-context"

type CardType = "visa" | "mastercard" | "uzcard" | "humo"

interface P2PModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
}

const cardInfo: Record<CardType, { number: string; holder: string; color: string }> = {
  visa: { number: "4169 7425 1823 4567", holder: "SCOREX PAYMENTS LLC", color: "from-blue-600 to-blue-800" },
  mastercard: { number: "5425 2334 3010 9903", holder: "SCOREX PAYMENTS LLC", color: "from-orange-500 to-red-600" },
  uzcard: { number: "8600 1234 5678 9012", holder: "SCOREX TO'LOVLAR", color: "from-green-600 to-green-800" },
  humo: { number: "9860 1234 5678 9012", holder: "SCOREX TO'LOVLAR", color: "from-cyan-600 to-cyan-800" },
}

export function P2PModal({ open, onOpenChange, amount }: P2PModalProps) {
  const { topUpP2P } = useWallet()
  const { showToast } = useToast()
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [screenshotError, setScreenshotError] = useState("")
  const [copiedNumber, setCopiedNumber] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    },
    [onOpenChange],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, handleKeyDown])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setScreenshotError("")

    if (file) {
      if (!file.type.startsWith("image/")) {
        setScreenshotError("Please upload an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setScreenshotError("File size must be less than 5MB")
        return
      }

      setScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveScreenshot = () => {
    setScreenshot(null)
    setScreenshotPreview(null)
    setScreenshotError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCopyNumber = async () => {
    if (selectedCard) {
      await navigator.clipboard.writeText(cardInfo[selectedCard].number.replace(/\s/g, ""))
      setCopiedNumber(true)
      setTimeout(() => setCopiedNumber(false), 2000)
    }
  }

  const handleConfirm = () => {
    if (!selectedCard) {
      showToast("error", "Card Required", "Please select a card type")
      return
    }
    if (!screenshot) {
      setScreenshotError("Screenshot is required for P2P payments")
      showToast("error", "Screenshot Required", "Please upload a payment screenshot")
      return
    }

    topUpP2P(amount, selectedCard.charAt(0).toUpperCase() + selectedCard.slice(1))
    showToast("success", "Request Submitted", "Your P2P payment is pending admin approval")

    // Reset state
    setSelectedCard(null)
    setScreenshot(null)
    setScreenshotPreview(null)
    setScreenshotError("")
    onOpenChange(false)
  }

  const handleClose = () => {
    setSelectedCard(null)
    setScreenshot(null)
    setScreenshotPreview(null)
    setScreenshotError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>P2P Top-up</DialogTitle>
          <DialogDescription>Transfer ${amount.toFixed(2)} to receive your funds with 0% fee.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Card Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Card Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["visa", "mastercard", "uzcard", "humo"] as CardType[]).map((card) => (
                <button
                  key={card}
                  type="button"
                  onClick={() => setSelectedCard(card)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border p-3 transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    selectedCard === card ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border",
                  )}
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium capitalize">{card}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card Preview */}
          {selectedCard && (
            <div className={cn("rounded-xl bg-gradient-to-br p-5 text-white shadow-lg", cardInfo[selectedCard].color)}>
              <div className="mb-1 text-xs opacity-80">Transfer to:</div>
              <div className="mb-4 flex items-center gap-2">
                <span className="font-mono text-lg tracking-widest">{cardInfo[selectedCard].number}</span>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="rounded p-1 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Copy card number"
                >
                  {copiedNumber ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-90">{cardInfo[selectedCard].holder}</span>
                <span className="uppercase font-semibold">{selectedCard}</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          {selectedCard && (
            <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
              <p className="text-muted-foreground">
                1. Transfer exactly <strong>${amount.toFixed(2)}</strong> to the card above.
              </p>
              <p className="text-muted-foreground">2. Upload a screenshot as proof of payment.</p>
              <p className="text-muted-foreground">3. Your balance will update after admin approval.</p>
            </div>
          )}

          {/* Screenshot Upload */}
          {selectedCard && (
            <FormField
              label="Payment Screenshot"
              htmlFor="screenshot"
              error={screenshotError}
              hint="Max 5MB, image files only"
              required
            >
              <div className="flex items-center gap-3">
                <Input
                  ref={fileInputRef}
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1"
                  aria-invalid={!!screenshotError}
                />
                {screenshot && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveScreenshot}
                    aria-label="Remove screenshot"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {screenshotPreview && (
                <div className="mt-2 relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={screenshotPreview || "/placeholder.svg"}
                    alt="Payment screenshot preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
            </FormField>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedCard || !screenshot}>
            <Upload className="mr-2 h-4 w-4" />
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
