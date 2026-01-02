# feat: Add year field to ReviewTemplate

## Problem

User's Value Forest data is stored with `year=2025` in the database, but the code queries for `year=2026` because it uses `new Date().getFullYear()`. Saved progress doesn't load.

## Solution

Add `year: 2025` to all templates and use `template.year` instead of `new Date().getFullYear()`.

## Changes

### 1. Add year to all template files

Add `year: 2025` to: `henry.ts`, `gustin.ts`, `nesslabs.ts`, `sahil-bloom.ts`, `tiago.ts`, `tk-kader.ts`

### 2. Update ReviewFlow to use template.year

Replace all `new Date().getFullYear()` calls in `src/components/review/review-flow.tsx` with `template.year`.

### 3. Update ValueForestSection

- Add `year: number` prop to `ValueForestSectionProps`
- Pass `year={template.year}` from ReviewFlow
- Remove `const year = useMemo(() => new Date().getFullYear(), [])` and use prop instead

### 4. Update completion page

Replace `new Date().getFullYear()` with `template.year` in `src/app/(public)/review/[templateSlug]/complete/client.tsx`.

## Acceptance Criteria

- [ ] All template files have `year: 2025`
- [ ] ReviewFlow uses `template.year` for DB operations
- [ ] ValueForestSection receives year as prop
- [ ] Completion page shows correct review year
- [ ] User can resume 2025 Value Forest progress
- [ ] TypeScript compiles

## Notes

- Dashboard keeps using `new Date().getFullYear()` - it shows "current year" reviews intentionally
- Templates are updated manually each year (acceptable for now)
