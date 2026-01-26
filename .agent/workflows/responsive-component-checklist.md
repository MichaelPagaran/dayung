---
description: Checklist for creating responsive components
---

# Responsive Component Checklist

Use this checklist when creating new components to ensure they follow our responsive policies.

## Before Starting

- [ ] Check if shadcn/ui has an existing component for this use case
- [ ] Identify which breakpoints are needed (mobile, tablet, desktop)

## Layout Requirements

- [ ] Uses flexbox for layout (not inline-block or floats)
- [ ] Mobile layout defined first (base styles)
- [ ] Responsive breakpoints added progressively (`sm:` → `md:` → `lg:`)
- [ ] Uses fluid widths (`flex-1`, `w-full`) instead of fixed pixels

## Theming Compliance

- [ ] No hardcoded color values - uses CSS variables or Tailwind semantic colors
- [ ] Uses correct font from hierarchy (Geist Sans vs Inter Variable)
- [ ] Font weights match the typography policy

## Testing Checklist

// turbo

1. Run dev server: `npm run dev`

2. Test at these viewport widths:
   - [ ] 375px (mobile)
   - [ ] 768px (tablet)
   - [ ] 1280px (desktop)

3. Verify:
   - [ ] Content is readable at all sizes
   - [ ] No horizontal overflow
   - [ ] Interactive elements are touch-friendly (min 44px tap targets)
   - [ ] Text doesn't become too small
