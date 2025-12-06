'use client'

import { useEffect, useState } from 'react'
import { migrateGuestReviews } from '@/lib/migrate-guest-data'
import { getAllGuestReviews } from '@/lib/guest-storage'

export function MigrateGuestData({ userId }: { userId: string }) {
  const [isMigrating, setIsMigrating] = useState(false)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    const reviews = getAllGuestReviews()
    if (Object.keys(reviews).length === 0) {
      setIsDone(true)
      return
    }

    setIsMigrating(true)
    migrateGuestReviews(userId)
      .then(({ migrated, errors }) => {
        if (migrated > 0) {
          console.log(`Migrated ${migrated} guest reviews`)
        }
        if (errors.length > 0) {
          console.error('Migration errors:', errors)
        }
      })
      .finally(() => {
        setIsMigrating(false)
        setIsDone(true)
      })
  }, [userId])

  if (isDone || !isMigrating) return null

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="text-center">
        <p className="text-lg">Migrating your guest reviews...</p>
      </div>
    </div>
  )
}
