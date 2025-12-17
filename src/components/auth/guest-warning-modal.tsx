'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface GuestWarningModalProps {
  open: boolean
  onConfirm: () => void
  onCreateAccount: () => void
}

export function GuestWarningModal({
  open,
  onConfirm,
  onCreateAccount,
}: GuestWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onConfirm()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Just so you know...</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-2 space-y-3">
            <span className="block">This review will likely take you multiple days to complete.</span>
            <span className="block">Guest mode saves to this browser only. If you clear browser data or switch devices, your progress will be lost.</span>
            <span className="block">Sign up (free) to save answers across devices and get access to premium features.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onCreateAccount} className="w-full">
            Sign up instead
          </Button>
          <Button variant="outline" onClick={onConfirm} className="w-full">
            Got it, continue as guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
