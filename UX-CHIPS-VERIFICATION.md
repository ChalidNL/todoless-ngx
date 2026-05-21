# UX-CHIPS: Labels/Shops As Chips — Verification

## Acceptance Criteria Checklist

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Labels als rounded chips — LabelBadge uses `.chip` class | ✅ | `src/components/shared/LabelBadge.tsx:13` uses `className={`chip ${...}`}` |
| 2 | `.chip` class includes `rounded-full` | ✅ | `src/styles/globals.css:253-255`: `.chip { @apply ... rounded-full ... }` |
| 3 | Shops als rounded chips — AttributeChip uses `rounded-full` | ✅ | `src/components/shared/AttributeChip.tsx:34`: `rounded-full` in className |
| 4 | Consistente spacing (gap 4px) | ✅ | All chip rows use `gap-1` (= 4px): CompactTaskCard.tsx:238, UnifiedCard.tsx:170, CompactItemCard.tsx:115, Settings.tsx editor panels |
| 5 | Mobile friendly wrapping | ✅ | All chip rows use `flex-wrap`: CompactTaskCard.tsx:238, UnifiedCard.tsx:170, CompactItemCard.tsx:115 |
| 6 | Geen overflow/horizontale scroll | ✅ | No overflow/scroll classes on chip containers; all use `flex-wrap` |
| 7 | CompactTaskCard line 239-251 uses AttributeChip for labels | ✅ | `src/components/shared/CompactTaskCard.tsx:242-248` |
| 8 | UnifiedCard line 171-173 uses LabelBadge for labels | ✅ | `src/components/shared/UnifiedCard.tsx:173` |
| 9 | UnifiedCard line 188-196 uses AttributeChip for shops | ✅ | `src/components/shared/UnifiedCard.tsx:189-195` |
| 10 | CompactItemCard uses AttributeChip for shop | ✅ | `src/components/shared/CompactItemCard.tsx:123` |
| 11 | CompactItemCard editor uses LabelBadge for shops | ✅ | `src/components/shared/CompactItemCard.tsx:230` |
| 12 | Settings uses LabelBadge for both labels and shops | ✅ | `src/components/Settings.tsx:767,828` |
| 13 | FilterPanel uses LabelBadge for labels | ✅ | `src/components/shared/FilterPanel.tsx:144` |
| 14 | NewGlobalHeader uses LabelBadge for labels and shops | ✅ | `src/components/shared/NewGlobalHeader.tsx:294,439` |
| 15 | Editor panels use inline chip styling with `rounded-full` | ✅ | CompactTaskCard.tsx:476, UnifiedCard.tsx:408 — same `inline-flex items-center gap-1.5 px-2 h-7 rounded-full text-xs font-normal leading-none border` |

## Verdict

All acceptance criteria are fully met. No code changes required — this is a verification-only commit.

Verified by: Hermes Agent
Date: 2026-05-21
