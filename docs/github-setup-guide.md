# 📊 깃헙브 설정 가이드

메타 숫타 앱(PWA)의 깃헙브 설정을 위한 완전 가이드입니다.

---

## 🎯 깃헙브 옵션 비교

| 옵션         | GitHub Pages   | GitHub Codespaces | Vercel            | 추천 |
| ------------ | -------------- | ----------------- | ----------------- | ---- |
| **비용**     | 완전 무료      | 완전 무료 (300MB) | 완전 무료 (Hobby) | ⭐   |
| **저장소**   | 1GB            | 300MB             | 무제한 (Hobby)    | ⭐   |
| **CI/CD**    | GitHub Actions | GitHub Actions    | 자동              | ⭐   |
| **오프라인** | 지원하지 않음  | 자동 지원         | 자동 지원         | ⭐   |
| **배포**     | GitHub Actions | GitHub Actions    | Vercel CLI        | ⭐   |
| **프라이빗** | 공개           | 프라이빗/공개     | 프라이빗/무료     | ⭐   |
| **팀**       | 제한 있음      | 제한 있음         | 유료 계정 필요    | -    |

**🏆 추천: Vercel (프라이빗 + 무제한 저장소 + 오프라인 자동 지원)**

---

## 🚀 추천: Vercel 배포 (프라이빗)

### 장점

- ⭐ **무제한 저장소** - S3 벡엘 스토리지 사용
- ⭐ **자동 CI/CD** - git push만 하면 자동 배포
- ⭐ **오프라인 지원** - 자동으로 static assets 캐싱
- ⭐ **무료** - Hobby 계정으로 모든 기능 무료 사용
- ⭐ **HTTPS 자동** - 개별 인증서 발급
- ⭐ **빠른 배포** - 보통 1분 이내 배포 완료

### 설정 방법

1. **Vercel 계정 생성** - https://vercel.com/signup
2. **GitHub 연동** - Vercel에서 GitHub 계정 연동
3. **프로젝트 임포트** - 'Add New' → 'Git' → 저장소 선택
4. **배포** - 'Deploy' 버튼 클릭

---

## 🎯 옵션 A: GitHub Codespaces (프라이빗, 300MB)

### 설정 단계

1. **저장소 생성**

   ```bash
   cd /home/node/.openclaw/workspace/metta-sutta
   git init
   git add .
   git commit -m "Initial commit: 메타 숫타 앱"
   ```

2. **깃헙브에서 저장소 생성**
   - https://github.com/new 접속
   - Repository name: `metta-sutta-app`
   - Description: `팔리어 경전 연구 도구 - 메타 숫타`
   - Visibility: `Private` (비공개)
   - Add .gitignore 체크

3. **Codespaces 생성**
   - 저장소 페이지에서 'Code' 탭 → 'Open in Codespaces' 클릭
   - Repository: 방금 생성한 `metta-sutta-app` 선택
   - Branch: `main`
   - Dev container: `Blank Project` (프로젝트 유형은 비워둬)
   - Instance size: `2 cores` (4GB RAM)
   - Machine type: `Regular`

4. **작업 시작**
   - 생성이 완료되면 브라우저에서 VS Code 열림
   - 터미널에서 `npm install && npm run dev` 실행
   - 기본 포트: 3000

5. **코드 푸시**
   - 작업 완료 후 왼쪽 상단의 '...' → 'Commit & Push' 클릭
   - commit 메시지 입력 후 'Commit & Push' 클릭

### 배포 (GitHub Pages)

- 저장소 Settings → Pages → Branch: `main` → Save
- 배포가 완료되면 `https://YOUR_USERNAME.github.io/metta-sutta-app`에서 접속

---

## 🎯 옵션 B: GitHub Organization Repository (팀, 비공개)

### 설정 단계

1. **팀 생성** (또는 기존 팀 사용)
   - https://github.com/organizations/new
   - Organization name: `metta-sutta` (또는 원하는 이름)
   - Description: `메타 숫타 앱 개발`

2. **저장소 생성**
   - https://github.com/organizations/YOUR_ORG/new 접속
   - Repository name: `metta-sutta-app`
   - Description: `팔리어 경전 연구 도구 - 메타 숫타`
   - Visibility: `Private`
   - Repository template: 선택 안 함
   - Add .gitignore 체크

3. **로컬 git 설정**

   ```bash
   cd /home/node/.openclaw/workspace/metta-sutta
   git remote add origin https://github.com/YOUR_ORG/metta-sutta-app.git
   git branch -M main
   git push -u origin main
   ```

4. **CI/CD 설정** (GitHub Actions)
   - `.github/workflows/deploy.yml` 생성
   - 빌드와 배포 자동화

---

## 🎯 옵션 C: GitHub Organization Repository + Vercel 배포

### 설정 단계

1-2. 옵션 B와 동일 (Organization Repository 생성)

3. **Vercel 연결**
   - https://vercel.com 접속
   - 'Add New' → 'Git' → `metta-sutta-app` 저장소 선택
   - Project settings → Framework Preset: `Next.js`
   - Project Name: `metta-sutta-app`

4. **Vercel 토큰 설정** (자동 배포)
   - 저장소 Settings → Secrets and variables → Actions
   - New repository secret → Name: `VERCEL_TOKEN`
   - Value: Vercel에서 발급받은 토큰 입력

5. **GitHub Actions Workflow 설정**
   - 저장소 Actions → New workflow → `deploy.yml` 생성
   - 아래 YAML 복사

   ```yaml
   name: Deploy to Vercel
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Deploy to Vercel
           uses: amondnet/vercel-action@v25
           with:
             vercel-token: ${{ secrets.VERCEL_TOKEN }}
             vercel-org-id: YOUR_VERCEL_ORG_ID
             vercel-project-id: YOUR_PROJECT_ID
   ```

6. **배포 트리거**
   - main 브랜치에 push
   - GitHub Actions가 자동으로 Vercel 배포 실행
   - 배포 완료 후 `https://metta-sutta-app.vercel.app`에서 접속

---

## 📝 프로젝트 템플릿

```
metta-sutta-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (홈)
│   ├── onboarding/page.tsx (온보딩)
│   ├── sutta/[verseId]/page.tsx (경전)
│   ├── word/[wordId]/page.tsx (단어 상세)
│   ├── settings/page.tsx (설정)
│   └── offline/page.tsx (오프라인)
├── components/
│   ├── ui/ (shadcn/ui)
│   ├── sutta/ (경전 관련)
│   ├── ai/ (AI 해설)
│   └── notes/ (메모)
├── lib/
│   ├── db/ (IndexedDB)
│   └── hooks/ (useMemo, useProgress)
├── data/
│   └── metta-sutta/ (phrases.json, words.json)
├── store/
│   └── settings.ts (Zustand)
├── public/
│   ├── manifest.json (PWA)
│   ├── sw.js (Service Worker)
│   └── icons/
└── .github/workflows/ (CI/CD)
```

---

## 🔧 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **UI 라이브러리**: shadcn/ui (Radix UI)
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand
- **데이터베이스**: IndexedDB (Dexie.js)
- **타입스크립트**: TypeScript
- **폰트**: Geist Sans + Geist Mono

---

## 🚀 배포 체크리스트

### GitHub Pages 배포 전

- [ ] `.gitignore` 설정 (node_modules, .next)
- [ ] `output: 'export'` (next.config.js)
- [ ] GitHub Pages 설정에서 Build & Deployment

### Vercel 배포 전

- [ ] `.env` 파일 생성 및 .gitignore에 추가
- [ ] `vercel.json` 설정 (프레임워크, 빌드 명령)
- [ ] 로컬 빌드 테스트: `npm run build`

### Vercel 배포 후

- [ ] 배포된 URL 접속 테스트
- [ ] PWA manifest 로드 확인
- [ ] Service Worker 등록 확인
- [ ] 모바일에서 테스트

---

## 📚 참고 문서

- [Next.js 배포](https://nextjs.org/docs/deployment)
- [Vercel 배포](https://vercel.com/docs/deployments/overview)
- [GitHub Pages 문서](https://docs.github.com/en/pages/getting-started-with-github-pages)
- [PWA 개발 가이드](https://web.dev/progressive-web-apps/)
- [shadcn/ui 문서](https://ui.shadcn.com/)

---

## 💡 팁

1. **CI/CD 처음 설정하면 로컬 테스트 먼저**
   - `npm run build` 로 빌드 에러 확인
   - `npm start` 로 프로덕션 빌드 테스트

2. **깃헙브 Branch 전략**
   - `main`: 프로덕션 (배포용)
   - `dev`: 개발 브랜치
   - PR 사용하여 코드 리뷰 관리

3. **환경 변수 관리**
   - 로컬 개발: `.env.local` (gitignore 포함)
   - 배포 환경: Vercel Dashboard에서 설정
   - 절대 `.env` 파일을 깃헙브에 커밋하지 말 것

4. **모바일 PWA 테스트**
   - Chrome DevTools → Application → Manifest 확인
   - Service Worker 캐싱 상태 확인
   - 오프라인 상태에서 네비게이션 테스트

---

## 🆘 도움이 필요하면

- [Next.js 배포 문서](https://nextjs.org/docs/deployment)
- [Vercel 지원](https://vercel.com/support)
- [GitHub 지원](https://support.github.com/)

---

**마지막으로: Vercel 배포가 가장 간단하고 무료로 오프라인까지 지원합니다! 🚀**
