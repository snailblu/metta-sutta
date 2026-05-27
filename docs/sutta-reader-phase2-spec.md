# Sutta Reader - Phase 2 Spec: Sutta Exploration UI

## Overview
경전 탐색 UI 구현. 홈 화면을 Nikaya 카드 → 경전 목록 → 구절 리더 구조로 변경.

## Pages to Create/Modify

### 1. Home Page — MODIFY `app/page.tsx`
Replace current content with Nikaya exploration cards.

**UI:**
```
┌──────────────────────────────────┐
│  도반 (Dhammamitta)              │
│  빨리어 경전을 읽고 깨달음의    │
│  의미를 만나보세요              │
├──────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐       │
│ │ 장아함   │ │ 중아함   │       │
│ │ DN · 34  │ │ MN · 152 │       │
│ │ 긴 설법  │ │ 중간 설법│       │
│ └──────────┘ └──────────┘       │
│ ┌──────────┐ ┌──────────┐       │
│ │ 상응부   │ │ 증지부   │       │
│ │ SN · 1819│ │ AN · 1408│       │
│ │ 주제별   │ │ 숫자별   │       │
│ └──────────┘ └──────────┘       │
│ ┌──────────┐                    │
│ │ 소부     │                    │
│ │ KN · 2351│                    │
│ │ 단편 모음│                    │
│ └──────────┘                    │
├──────────────────────────────────┤
│ [직접 입력하기 →] (/translator) │
└──────────────────────────────────┘
```

- Server component (NO "use client" — fetch data on server side)
- Use `Card` from `@/components/ui/card`
- Each card links to `/suttas/{nikaya}`
- Bottom link to `/translator` for direct input
- Responsive: 2 columns on mobile, 3-5 on desktop
- Dark mode support (already via Tailwind classes)

**Nikaya descriptions:**
- dn: "긴 설법 모음 · 34편" 
- mn: "중간 길이 설법 · 152편"
- sn: "주제별로 묶은 설법"
- an: "숫자별로 묶은 설법"
- kn: "단편 경전 모음"

**Implementation:** Use `fetch` directly in the server component to load `/suttas/nikayas.json`. Since this is a server component in Next.js, use `process.cwd()` + `fs.readFile` or fetch from `http://localhost:3000/suttas/nikayas.json`. Actually simpler: since files are in `public/`, use `fetch(new URL('/suttas/nikayas.json', 'http://localhost:3000'))` or read file directly with `fs`. Use fs for reliability:

```typescript
import { readFile } from "fs/promises";
import { join } from "path";

async function getNikayas() {
  const data = await readFile(join(process.cwd(), "public/suttas/nikayas.json"), "utf-8");
  return JSON.parse(data);
}
```

### 2. Sutta List — CREATE `app/suttas/[nikaya]/page.tsx`

**UI:**
```
┌──────────────────────────────────┐
│ ← 상응부 (Saṁyutta Nikāya)      │
│ 1,819편의 경전                   │
│                                  │
│ [🔍 검색...]                     │
├──────────────────────────────────┤
│ sn1.1  Oghataraṇasutta          │
│ sn1.2  Sarasutta                 │
│ sn1.3  Uddhamsutasutta           │
│ ...                              │
│ (infinite scroll or pagination)  │
└──────────────────────────────────┘
```

- Server component with search params
- Back button links to `/`
- Search: client-side filter (load full index.json, filter by uid/title)
- Use virtualized list or simple pagination (50 per page) for large lists
- Each item links to `/suttas/{nikaya}/{uid}`
- Read index from `public/suttas/{nikaya}/index.json`

**For large lists (sn: 1819, an: 1408, kn: 2351):**
- Initial render: first 50 items
- "더 보기" button loads next 50
- Search filters from full list (load all at once since each index is small)

### 3. Sutta Reader — CREATE `app/suttas/[nikaya]/[uid]/page.tsx`

**UI:**
```
┌──────────────────────────────────┐
│ ← 상응부                         │
│ Dhammacakkappavattanasutta       │
│ SN 56.11                         │
├──────────────────────────────────┤
│                                  │
│ Ekaṁ samayaṁ bhagavā            │ ← segment card
│ bārāṇasiyaṁ viharati             │   (tap to analyze)
│ isipatane migadāye.              │
│                                  │
│ ─────────────────────────────── │
│                                  │
│ Tatra kho bhagavā                │ ← segment card
│ pañcavaggiye bhikkhū             │
│ āmantesi:                        │
│                                  │
│ ─────────────────────────────── │
│ ...                              │
└──────────────────────────────────┘
```

- Server component for initial data load
- Read from `public/suttas/{nikaya}/{uid}.json`
- Display segments as cards
- Each segment card: pali text, tap/click opens analysis (Phase 3 — for now just display)
- Segment grouping: group consecutive segments with same prefix (e.g., sn56.11:1.x = paragraph 1)
- Add subtle visual separator between groups
- Top nav: back to sutta list, sutta title, UID

**Segment display:**
- Each segment as a `<p>` with padding
- Group segments by their first number: `:1.x` = group 1, `:2.x` = group 2
- Between groups: thin divider line
- Group number shown as small label: "1", "2", etc.

## Files to Create
- `app/suttas/[nikaya]/page.tsx` — sutta list per nikaya
- `app/suttas/[nikaya]/[uid]/page.tsx` — sutta reader

## Files to Modify
- `app/page.tsx` — replace with Nikaya cards (keep translator link)

## Do NOT Modify
- `app/translator/` — stays as is
- `app/settings/`, `app/offline/` — stay as is
- `components/features/MettaTranslator.tsx` — not touched
- `lib/sutta-data.ts` — not touched
- `convex/` — not touched

## Technical Notes
- Use Next.js App Router (server components by default)
- Use "use client" only where needed (search input, "load more" button)
- Use existing Card component from `@/components/ui/card`
- Use existing Button from `@/components/ui/button`
- Use lucide-react icons (already installed)
- Tailwind classes for styling
- Read JSON files from `public/suttas/` using `fs.readFile` in server components
- For client components that need data, pass as props from server component parent

## Commits
- `git commit --no-verify -m "feat: sutta reader phase 2 - exploration UI"`
