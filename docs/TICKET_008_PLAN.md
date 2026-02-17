# Ticket_008: AI Pali Translator Implementation Plan

## 1. Overview
Implement an AI-powered Pali translator feature geared towards a 76-year-old user. The feature will analyze Pali text (or English) and provide:
- Word-by-word analysis (Grammar, meaning).
- Translations (Literal, liberal).
- Contextual/Dharma explanation.

## 2. Technical Stack
- **Framework**: Next.js 16 (App Router).
- **UI**: Tailwind CSS 4, Shadcn/UI (Radix), Lucide React.
- **AI**: Vercel AI SDK + Google Generative AI (Gemini).
- **State**: React `useState` (for local input/result), `zustand` (for global settings if needed).

## 3. UI/UX Design
- **Location**: New route `/translator`.
- **Entry Point**: Add "번역기" button to the main header in `app/sutta/[verseId]/page.tsx`.
- **Layout**:
  - **Header**: Simple "Home" / "Back" navigation.
  - **Input Area**: Large text area (font-size: `text-lg` or `text-xl`) with placeholder "여기에 빨리어 문장을 입력하세요".
  - **Action Button**: Large "분석하기" (Analyze) button (primary color).
  - **Result Area**:
    - **Cards**: Distinct sections for "Word Analysis", "Translation", "Commentary".
    - **Typography**: High contrast, large fonts (`text-lg` base).
    - **Loading State**: Clear "Analyzing..." indicator with a spinner or progress bar.

## 4. Implementation Steps

### Step 1: Dependencies
- Install Vercel AI SDK and Google provider.
```bash
npm install ai @ai-sdk/google
```

### Step 2: Environment Setup
- Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env.local`.

### Step 3: Backend API (`src/app/api/analyze/route.ts`)
- **Route**: `POST /api/analyze`
- **Input**: `{ text: string }`
- **Logic**:
  - Validate input.
  - Call Gemini with a structured prompt (Baekbong style).
  - Return JSON stream or structured response.
- **Prompt Engineering**:
  - Role: Pāli scholar/monk (Baekbong style).
  - Output format: JSON with `words[]`, `translation`, `explanation`.

### Step 4: Frontend Components (`src/components/features/translator/`)
- `TranslatorPage.tsx`: Main container.
- `TranslationInput.tsx`: Textarea component.
- `AnalysisResult.tsx`: Display component for the AI response.

### Step 5: Integration
- Add link/button to `/translator` in `SuttaPage` header.
- Test with sample Pali sentences (e.g., "Sabbe sattā bhavantu sukhitattā").

## 5. File Structure Changes
```text
metta-sutta/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts       # [NEW] AI Analysis API
│   └── translator/
│       └── page.tsx           # [NEW] Translator Page
└── components/
    └── features/
        └── translator/        # [NEW] Feature-specific components
            ├── TranslatorInput.tsx
            └── AnalysisResult.tsx
```

## 6. Action Items
1. Install dependencies.
2. Create API route.
3. Create UI components.
4. Update navigation.
