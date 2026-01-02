# feat: Save Value Forest responses to database for authenticated users

## Overview

Persist Value Forest state to the database for authenticated users, enabling cross-device sync and preventing data loss when localStorage is cleared. This follows the same pattern as regular question responses.

## Problem Statement

Currently, Value Forest data is stored **only in localStorage** - even for authenticated users. This creates several issues:

1. **Data Loss Risk**: Clearing browser data loses all Value Forest progress
2. **No Cross-Device Sync**: Users can't continue on a different device
3. **Inconsistency**: Regular responses are saved to DB, but Value Forest isn't

## Proposed Solution

Add a `value_forest JSONB` column to `annual_reviews` table and sync state for authenticated users.

### Implementation (Already Completed)

| Component | Status | File:Line |
|-----------|--------|-----------|
| Database migration | Done | `supabase/migrations/20260102194449_add_value_forest_column.sql` |
| Load function | Done | `src/lib/guest-storage.ts:618-643` |
| Save function (debounced) | Done | `src/lib/guest-storage.ts:588-616` |
| Flush integration | Done | `src/lib/guest-storage.ts:537-550` |
| Component integration | Done | `src/components/review/value-trees/value-forest-section.tsx:58-95` |

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Value Forest Section                      │
├─────────────────────────────────────────────────────────────┤
│  On Mount:                                                   │
│  ┌───────────────┐    ┌───────────────┐    ┌──────────────┐ │
│  │ loadFromDB()  │───▶│ Zod Validate  │───▶│ setState()   │ │
│  └───────────────┘    └───────────────┘    └──────────────┘ │
│         │                    │                               │
│         ▼                    ▼                               │
│  ┌───────────────┐    ┌───────────────┐                     │
│  │ If null/error │───▶│ getFromLocal  │                     │
│  └───────────────┘    └───────────────┘                     │
├─────────────────────────────────────────────────────────────┤
│  On State Change:                                            │
│  ┌───────────────┐    ┌───────────────┐                     │
│  │ Always save   │───▶│ localStorage  │                     │
│  └───────────────┘    └───────────────┘                     │
│         │                                                    │
│         ▼ (if authenticated)                                │
│  ┌───────────────┐    ┌───────────────┐    ┌──────────────┐ │
│  │ debounce 2s   │───▶│ saveToDb()    │───▶│ Supabase     │ │
│  └───────────────┘    └───────────────┘    └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Load Priority**: Database → localStorage → default state
2. **Save Strategy**: Always localStorage + DB for authenticated (debounced)
3. **Sync Direction**: DB → localStorage on load (DB is source of truth)

### Key Files Modified

```
src/lib/guest-storage.ts
├── +ValueForestStateSchema             # Full Zod schema (not .partial())
├── +loadAuthenticatedValueForest()     # Load from DB with Zod validation
├── +saveAuthenticatedValueForest()     # Debounced save to DB
├── +_saveAuthenticatedValueForestNow() # Internal immediate save
└── ~flushAuthenticatedStorage()        # Added value forest flush

src/components/review/value-trees/value-forest-section.tsx
├── +hasLoadedFromDb state              # Prevent double-load
├── +skipNextSaveRef                    # Prevent race condition on load
├── +year useMemo                       # Memoized year for perf
├── +useEffect (load from DB)           # Load on mount for auth users
├── +useEffect (unmount flush)          # Flush pending writes on unmount
└── ~useEffect (auto-save)              # Save to DB for auth users (with skip check)
```

## Acceptance Criteria

### Functional Requirements

- [x] Authenticated users' Value Forest data persists to database
- [x] Data loads from database on component mount
- [x] Falls back to localStorage if database is empty/fails
- [x] Saves use same 2000ms debounce as other authenticated writes
- [x] Flush works before navigation (integrated with existing flush)
- [x] Zod validation on load prevents bad data from crashing app

### Non-Functional Requirements

- [x] Uses existing patterns from `responses` field
- [x] No breaking changes to guest users (localStorage only)
- [x] Type-safe with existing `ValueForestState` type

## Edge Cases & Known Limitations

### Addressed

| Scenario | Behavior |
|----------|----------|
| DB load fails | Falls back to localStorage |
| Zod validation fails | Falls back to localStorage, logs warning |
| Network error on save | Logged via `dispatchAuthStorageError` |
| Tab close with pending | `flushAuthenticatedStorage()` called |
| Race condition on load | `skipNextSaveRef` prevents re-saving loaded data |
| Component unmount | Flush pending writes via cleanup effect |

### Not Addressed (Acceptable for MVP)

| Scenario | Current Behavior | Future Enhancement |
|----------|-----------------|-------------------|
| Multi-tab editing | Last write wins | Add real-time sync |
| Offline editing | Save fails silently | Add offline queue |
| Guest → Auth migration | Guest data ignored | Add migration prompt |
| Session expiry | Save fails | Add re-auth flow |

## Testing Plan

### Manual Testing

- [ ] Load Value Forest as authenticated user with no prior data
- [ ] Make edits, verify DB write (check Supabase dashboard)
- [ ] Refresh page, verify data persists
- [ ] Clear localStorage, refresh, verify data still loads from DB
- [ ] Test as guest user, verify localStorage-only behavior unchanged

### Database Verification

```sql
-- Check your data was written
SELECT
  id,
  template_slug,
  value_forest->'phase' as phase,
  jsonb_array_length(value_forest->'selectedTreeIds') as tree_count
FROM annual_reviews
WHERE user_id = '275ff923-6e24-4949-b38b-bb1a072e1fe8';
```

## References

### Internal

- Existing pattern: `saveAuthenticatedReview()` at `src/lib/guest-storage.ts:372-401`
- ValueForestState type: `src/lib/value-trees/types.ts:26-35`
- Zod schema: `src/lib/guest-storage.ts:18-42`

### External

- [Supabase JSONB Documentation](https://supabase.com/docs/guides/database/json)
- [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) (future enhancement)

## Future Enhancements

1. **Add GIN index** for JSONB querying performance
2. **Real-time sync** for multi-tab support
3. **Save state indicators** (saving..., saved, failed)
4. **Guest migration** when user authenticates
5. **Offline queue** with retry logic

---

*Generated: 2026-01-02*
