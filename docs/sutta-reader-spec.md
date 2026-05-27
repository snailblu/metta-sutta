# Sutta Reader - Phase 1 Spec

## Overview
빨리어 경전 탐색·리더 기능 추가. bilara-data 오픈소스에서 빨리어 원문을 임포트하여 정적 JSON으로 제공.

## Data Pipeline

### Source
- `suttacentral/bilara-data` GitHub repo (이미 /tmp/bilara-data에 클론됨)
- 빨리어 원문만 (`root/pli/ms/sutta/`)
- 영어 번역 제외

### Source Directory Structure (actual)
```
root/pli/ms/sutta/
  dn/           # 34 files directly: dn1_root-pli-ms.json ... dn34_root-pli-ms.json
  mn/           # 152 files directly: mn1_root-pli-ms.json ... mn152_root-pli-ms.json
  sn/           # subfolders: sn1/, sn2/, ... sn56/ — files inside: sn/sn56/sn56.11_root-pli-ms.json
  an/           # subfolders: an1/, an2/, ... an11/ — files inside: an/an3/an3.35_root-pli-ms.json
  kn/           # 20 subfolders: dhp/, kp/, ud/, iti/, snp/, vv/, pv/, thag/, thig/, ja/, etc.
                # files like: kn/dhp/dhp1-20_root-pli-ms.json, kn/kp/kp1_root-pli-ms.json
```

Total: 5,764 files

### bilara JSON format
```json
{
  "dn1:0.1": "Dīgha Nikāya 1 ",
  "dn1:0.2": "Brahmajālasutta ",
  "dn1:1.0": "1. Paribbājakakathā ",
  "dn1:1.1.1": "Evaṁ me sutaṁ—",
  "dn1:1.1.2": "ekaṁ samayaṁ bhagavā..."
}
```
- `:0.x` = heading/title rows (NOT content)
- `:1.0` = section headings (also NOT content segments)
- `:1.x.x`, `:2.x.x`, etc. = actual content segments

### Import Script: `scripts/import-bilara.mjs`

Node.js ESM script. Run from project root: `node scripts/import-bilara.mjs`

**Logic:**
1. Glob all `*_root-pli-ms.json` files under `/tmp/bilara-data/root/pli/ms/sutta/`
2. For each file:
   a. Parse JSON
   b. Extract UID from filename: `sn56.11_root-pli-ms.json` → `sn56.11`
   c. Determine nikaya: `dn*`→dn, `mn*`→mn, `sn*`→sn, `an*`→an, everything else→kn
   d. Extract title: value of `:0.3` key if exists, else `:0.2`, else UID
   e. Filter segments: keep only entries where key matches pattern `{uid}:{digit}.{digit}` (exclude `:0.x` headings and `:1.0`-style section headings where last part is single digit like `:1.0`, `:2.0`)
   f. Build output object
3. Write outputs:
   - `public/suttas/{nikaya}/{uid}.json` per sutta
   - `public/suttas/{nikaya}/index.json` with list of {uid, title}
   - `public/suttas/nikayas.json` with all nikaya metadata

**Output format — individual sutta** (`public/suttas/sn/sn56.11.json`):
```json
{
  "uid": "sn56.11",
  "title": "Dhammacakkappavattanasutta",
  "nikaya": "sn",
  "segments": [
    { "id": "sn56.11:1.1", "pali": "Ekaṁ samayaṁ bhagavā bārāṇasiyaṁ viharati isipatane migadāye." },
    { "id": "sn56.11:1.2", "pali": "Tatra kho bhagavā pañcavaggiye bhikkhū āmantesi:" }
  ]
}
```
- Trim whitespace on pali
- Skip segments where pali is empty after trim

**Output format — nikaya index** (`public/suttas/sn/index.json`):
```json
[
  { "uid": "sn1.1", "title": "Oghataraṇasutta" },
  { "uid": "sn1.2", "title": "Sarasutta" }
]
```
- Sort by UID (natural sort: sn1.1 before sn1.10 before sn2.1)

**Output format — nikayas** (`public/suttas/nikayas.json`):
```json
[
  { "id": "dn", "name": "Dīgha Nikāya", "nameKo": "장아함", "count": 34 },
  { "id": "mn", "name": "Majjhima Nikāya", "nameKo": "중아함", "count": 152 },
  { "id": "sn", "name": "Saṁyutta Nikāya", "nameKo": "상응부", "count": 1819 },
  { "id": "an", "name": "Aṅguttara Nikāya", "nameKo": "증지부", "count": 1408 },
  { "id": "kn", "name": "Khuddaka Nikāya", "nameKo": "소부", "count": 2351 }
]
```
- count = actual number of files generated per nikaya

## Data Loader: `lib/sutta-data.ts`

```typescript
export interface Nikaya {
  id: string;
  name: string;
  nameKo: string;
  count: number;
}

export interface SuttaIndexItem {
  uid: string;
  title: string;
}

export interface Segment {
  id: string;
  pali: string;
}

export interface Sutta {
  uid: string;
  title: string;
  nikaya: string;
  segments: Segment[];
}

const BASE = "/suttas";

export async function getNikayas(): Promise<Nikaya[]> {
  const res = await fetch(`${BASE}/nikayas.json`);
  if (!res.ok) throw new Error(`Failed to load nikayas: ${res.status}`);
  return res.json();
}

export async function getSuttaList(nikaya: string): Promise<SuttaIndexItem[]> {
  const res = await fetch(`${BASE}/${nikaya}/index.json`);
  if (!res.ok) throw new Error(`Failed to load sutta list for ${nikaya}: ${res.status}`);
  return res.json();
}

export async function getSutta(nikaya: string, uid: string): Promise<Sutta> {
  const res = await fetch(`${BASE}/${nikaya}/${uid}.json`);
  if (!res.ok) throw new Error(`Failed to load sutta ${uid}: ${res.status}`);
  return res.json();
}
```

- All functions use fetch from `/suttas/...` (relative URL, works on client and server)
- No caching (let Next.js/browser handle it)
- Throw on non-OK response

## Tests

### `lib/sutta-data.test.ts` (vitest)
Use `happy-dom` environment. Mock global fetch.

1. `getNikayas` — returns parsed array when fetch succeeds
2. `getNikayas` — throws when fetch returns 500
3. `getSuttaList` — returns parsed array for valid nikaya
4. `getSuttaList` — throws on 404
5. `getSutta` — returns sutta with segments for valid uid
6. `getSutta` — throws on 404

### `scripts/import-bilara.mjs` — manual verification
After running the script:
- Check file count per nikaya matches expected
- Spot-check a known sutta (sn56.11) has correct title and segments
- Verify no `:0.x` headings in segments
- Verify pali strings are trimmed

## .gitignore
Add `public/suttas/` to `.gitignore` (large static data, regenerated from script)

## Files to create (NEW only)
- `scripts/import-bilara.mjs`
- `lib/sutta-data.ts`
- `lib/sutta-data.test.ts`
- `docs/sutta-reader-spec.md` (already exists)

## Files to modify
- `.gitignore` — add `public/suttas/`

## Do NOT modify
- Any existing page/component/route files
- `app/page.tsx`, `app/translator/`, `components/`, `convex/`, etc.
