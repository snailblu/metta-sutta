# 자비경 (메타 숫타) 팔리어 연구 앱

팔리어 경전을 한국어로 직접 연구하고 수행의 의미를 깊이 탐구하는 도구입니다.

## 🌟 특징

- **팔리어 원문 + 한국어 번역**: 구절별 대응
- **단어 상세 분석**: 품사, 어근, 의미, 문맥 해석
- **76세 사용자 최적화 UI**: 큰 폰트, 간결한 디자인
- **PWA 지원**: 오프라인 사용 가능
- **AI 해설** (추후): Claude API로 문맥 기반 해석

## 📱 스크린샷

(추후 추가)

## 🚀 시작하기

### 로컬에서 실행

```bash
# 설치
npm install

# 개발 서버 실행
npm run dev
```

### 접속

```
http://localhost:3000
```

## 📁 프로젝트 구조

```
metta-sutta/
├── app/               # Next.js 앱
├── components/ui/     # shadcn/ui 컴포넌트
├── lib/              # 유틸리티 (DB, API)
├── data/             # 경전 데이터
├── types/            # TypeScript 타입
└── public/           # 정적 파일
```

## 🛠️ 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **스타일**: Tailwind CSS
- **상태 관리**: Zustand
- **로컬 저장**: IndexedDB (Dexie.js)
- **AI**: Claude API

## 📖 라이선스

MIT

## 👥 기여

이 프로젝트는 개인 프로젝트로 진행 중입니다.

## 📞 연락

스넬 (Junwoo Jang)
