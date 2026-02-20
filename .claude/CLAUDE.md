# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 안내 문서입니다.

## 프로젝트 개요

Express v5 기반의 최소한의 웹 서버로, 한국어 정적 랜딩 페이지를 제공합니다. CommonJS 모듈 시스템을 사용합니다.

## 서버 실행

```bash
node index.js    # http://localhost:3009 에서 서버 시작
```

별도의 빌드 과정 없음. 테스트 프레임워크 미구성.

## 구조

- **`index.js`** — Express 앱 진입점. `public/` 폴더의 정적 파일을 서빙하고 `GET /hello` 테스트 엔드포인트를 제공합니다.
- **`public/index.html`** — 한국어 UI의 단일 정적 페이지. 헤더 네비게이션, 히어로 섹션, 기능 카드 그리드, 문의 폼으로 구성됩니다.
- **`public/style.css`** — 컴포넌트 단위 스타일. 주요 색상 `#003f88`, 한국어 폰트(맑은 고딕, 나눔 고딕), 최대 컨테이너 너비 1100px. 문의 폼 제출은 HTML 파일 내 JavaScript로 클라이언트 측에서 처리됩니다.

## 주요 사항

- Express v5 사용 (v4 아님) — 비동기 에러 처리 방식이 v4와 다릅니다
- 정적 파일은 루트 경로로 서빙되며 `index.html`은 자동으로 제공됩니다
- 문의 폼은 서버에 POST 요청을 보내지 않고 브라우저 JavaScript에서만 처리됩니다
