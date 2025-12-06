'use client'

import { useEffect, useState } from 'react'
import { migrateGuestReviews } from '@/lib/migrate-guest-data'
import { getAllGuestReviews } from '@/lib/guest-storage'

export function MigrateGuestData({ userId }: { userId: string }) {
  const [migrating, setMigrating] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const reviews = getAllGuestReviews()
    if (Object.keys(reviews).length === 0) {
      setDone(true)
      return
    }

    setMigrating(true)
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
        setMigrating(false)
        setDone(true)
      })
  }, [userId])

  if (done || !migrating) return null

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="text-center">
        <p className="text-lg">Migrating your guest reviews...</p>
      </div>
    </div>
  )
}
