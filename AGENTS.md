# Repository Guidelines

## 프로젝트 구조 및 모듈 구성
- `index.js`: Express 서버 진입점(CommonJS). API 라우트와 정적 파일 제공을 담당합니다.
- `public/`: Express가 제공하는 프런트엔드 정적 자산 폴더입니다.
  - `public/index.html`: 랜딩 페이지
  - `public/dashboard.html`: 대시보드 페이지
  - `public/style.css`: 공통 스타일
- `package.json` / `package-lock.json`: 의존성 및 스크립트 정의 파일입니다.
- `node_modules/`: 설치된 패키지 디렉터리(수동 수정 금지).

## 빌드, 테스트, 개발 명령어
- `npm install`: 프로젝트 의존성을 설치합니다.
- `node index.js`: 로컬 서버를 `http://localhost:3009`에서 실행합니다.
- `npm test`: 현재는 테스트 미구성 상태라 의도적으로 실패하는 플레이스홀더입니다.

로컬 실행 예시:
```bash
npm install
node index.js
```

## 코딩 스타일 및 네이밍 규칙
- JavaScript: 현재 코드와 동일하게 CommonJS(`require`, `module.exports`)를 사용합니다.
- 들여쓰기: JS, HTML, CSS 모두 공백 2칸을 사용합니다.
- 문자열: `index.js`와 일관되게 JavaScript에서는 큰따옴표를 우선 사용합니다.
- 네이밍 규칙:
  - 변수/함수: `camelCase`
  - 상수: `UPPER_SNAKE_CASE` (예: `PORT`)
  - CSS 클래스: `kebab-case` (예: `.topbar-inner`)
- 인라인 `<script>`가 커지면 `public/` 하위 별도 JS 파일로 분리합니다.

## 테스트 가이드라인
- 현재 테스트 프레임워크는 설정되어 있지 않습니다.
- 테스트 도입 시 `jest` 또는 `vitest`를 권장하며 `npm test`와 연결합니다.
- 테스트 파일명 규칙: `*.test.js` (예: `index.test.js`).
- 새 기능에는 최소 1개의 정상 흐름 테스트와 1개의 실패/경계 케이스 테스트를 포함합니다.

## 커밋 및 PR 가이드라인
- 이 워크스페이스에서는 Git 히스토리를 확인할 수 없으므로 Conventional Commits를 사용합니다.
  - `feat: add /hello response validation`
  - `fix: correct static file path handling`
- 커밋은 작고 명확하게, 한 커밋당 하나의 논리적 변경만 담습니다.
- PR에는 다음을 포함합니다.
  - 변경된 동작 요약
  - 로컬 검증 절차(명령어 + 기대 결과)
  - `public/` UI 변경 시 스크린샷/GIF
  - 관련 이슈/작업 ID(해당 시)
