# RULES.md — 개발 규칙 및 컨벤션

이 프로젝트(Express v5 기반 Node.js 서버)에서 준수해야 할 코딩 규칙을 정의합니다.

---

## 1. 모듈 시스템

- **CommonJS** 사용 (`require` / `module.exports`)
- `import` / `export` (ESM) 사용 금지
- `package.json`의 `"type": "commonjs"` 유지

```js
// 올바름
const express = require('express');

// 금지
import express from 'express';
```

---

## 2. Express v5 주의사항

- **비동기 라우트 핸들러**는 `try/catch` 없이 `async/await` 사용 가능 (v5는 자동으로 에러를 전달)
- v4 방식의 `next(err)` 수동 호출 불필요 (단, 명시적으로 필요한 경우는 허용)
- 미들웨어 순서: `express.json()` → 정적 파일 서빙 → 라우트 → 에러 핸들러

```js
// Express v5 비동기 라우트 예시
app.get('/data', async (req, res) => {
  const result = await someAsyncOperation();
  res.json(result);
});
```

---

## 3. 파일 및 폴더 구조

```
rr4/
├── index.js          # 앱 진입점 (라우트 최소화, 설정만)
├── public/           # 정적 파일 (HTML, CSS, 클라이언트 JS)
│   ├── index.html
│   └── style.css
├── CLAUDE.md         # Claude Code 참조 문서
├── RULES.md          # 이 파일
└── package.json
```

- 서버 로직은 `index.js`에 작성
- 클라이언트 리소스는 `public/` 아래에만 위치
- 라우트가 많아지면 `routes/` 폴더로 분리

---

## 4. 코드 스타일

- 들여쓰기: **공백 2칸**
- 문자열: **큰따옴표(`"`)** 사용
- 세미콜론: **필수**
- 변수 선언: `const` 우선, 재할당 필요 시 `let`, `var` 금지

```js
// 올바름
const PORT = 3009;
const app = express();

// 금지
var PORT = 3009;
```

---

## 5. 라우트 설계

- URL은 **소문자 + 하이픈** 사용 (`/api/user-info`)
- RESTful 원칙 준수
- 응답 형식: JSON API는 `res.json()`, HTML 페이지는 정적 파일로 제공
- 상태 코드를 명시적으로 지정

```js
// 올바름
app.get('/hello', (req, res) => {
  res.status(200).json({ message: '안녕하세요' });
});
```

---

## 6. 환경 변수 및 포트

- 포트 번호: 기본값 **3009** (`process.env.PORT || 3009`)
- 민감 정보(API 키, DB 비밀번호)는 `.env` 파일 사용, 절대 코드에 하드코딩 금지
- `.env` 파일은 `.gitignore`에 반드시 추가

---

## 7. 정적 파일 서빙

- `express.static`으로 `public/` 폴더를 루트 경로에 서빙
- `index.html`은 자동으로 제공됨 (`/` 요청 시)

```js
app.use(express.static(path.join(__dirname, 'public')));
```

---

## 8. 에러 처리

- 전역 에러 핸들러를 `index.js` 마지막에 추가 권장

```js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});
```

---

## 9. 금지 사항

| 항목 | 이유 |
|------|------|
| `var` 사용 | 스코프 문제 |
| ESM(`import`) 사용 | CommonJS 프로젝트 |
| 민감 정보 하드코딩 | 보안 취약점 |
| 동기 파일 I/O (`fs.readFileSync`) | 서버 블로킹 |
| `console.log` 운영 배포 | 성능 저하 |
