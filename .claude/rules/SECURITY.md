# SECURITY.md — 보안 규칙

이 프로젝트(Express v5 기반)에서 반드시 준수해야 할 보안 규칙을 정의합니다.

---

## 1. 민감 정보 관리

- API 키, 비밀번호, 토큰 등을 **코드에 하드코딩 금지**
- `.env` 파일로 관리하고 `.gitignore`에 반드시 추가
- `process.env`로만 접근

```js
// 금지
const SECRET = "my-secret-key-1234";

// 올바름
const SECRET = process.env.SECRET_KEY;
```

`.gitignore` 필수 항목:
```
.env
.env.local
.env.*.local
```

---

## 2. 입력값 검증 (Input Validation)

- 클라이언트에서 오는 모든 입력값은 **신뢰하지 않음**
- 타입, 길이, 형식을 서버에서 반드시 검증
- 예상 범위를 벗어난 입력은 즉시 400 응답

```js
// 올바름
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || typeof name !== "string" || name.length > 100) {
    return res.status(400).json({ error: "유효하지 않은 이름입니다." });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "유효하지 않은 이메일입니다." });
  }
  if (!message || message.length > 1000) {
    return res.status(400).json({ error: "유효하지 않은 메시지입니다." });
  }

  res.json({ success: true });
});
```

---

## 3. XSS (Cross-Site Scripting) 방지

- 사용자 입력을 HTML로 직접 렌더링 금지
- 서버 응답에 HTML을 포함할 경우 반드시 이스케이프 처리
- `Content-Type: application/json` 응답에는 HTML 포함 금지

```js
// 금지 — 사용자 입력을 그대로 HTML에 삽입
res.send(`<h1>${req.query.name}</h1>`);

// 올바름 — JSON으로 응답, 렌더링은 프론트엔드에서 처리
res.json({ name: req.query.name });
```

클라이언트(`public/`) 스크립트에서도:
```js
// 금지
element.innerHTML = userInput;

// 올바름
element.textContent = userInput;
```

---

## 4. HTTP 보안 헤더

`helmet` 패키지 사용을 권장합니다. 미사용 시 최소한 아래 헤더를 직접 설정합니다.

```js
// helmet 사용 (권장)
const helmet = require("helmet");
app.use(helmet());

// 직접 설정 시 최소 헤더
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
```

---

## 5. CORS 설정

- 모든 출처(`*`) 허용 금지 (운영 환경)
- 허용할 도메인을 명시적으로 지정

```js
// 금지 (운영 환경)
res.setHeader("Access-Control-Allow-Origin", "*");

// 올바름
const cors = require("cors");
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:3009",
  methods: ["GET", "POST"],
}));
```

---

## 6. 에러 응답에서 정보 노출 금지

- 스택 트레이스, 파일 경로, DB 오류 메시지를 클라이언트에 노출 금지
- 운영 환경에서는 일반적인 에러 메시지만 반환

```js
// 금지
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.stack }); // 스택 트레이스 노출
});

// 올바름
app.use((err, req, res, next) => {
  console.error(err.stack); // 서버 로그에만 기록
  res.status(500).json({ error: "서버 오류가 발생했습니다." });
});
```

---

## 7. 경로 순회(Path Traversal) 방지

- 사용자 입력으로 파일 경로를 구성하는 경우, `path.resolve` + 기준 경로 검증 필수
- `../` 같은 상위 디렉터리 접근 차단

```js
const path = require("path");

app.get("/file", (req, res) => {
  const BASE_DIR = path.join(__dirname, "public");
  const requestedPath = path.resolve(BASE_DIR, req.query.name);

  // 기준 디렉터리를 벗어나는 경로 차단
  if (!requestedPath.startsWith(BASE_DIR)) {
    return res.status(403).json({ error: "접근 금지" });
  }

  res.sendFile(requestedPath);
});
```

---

## 8. 요청 크기 제한

- `express.json()` 및 `express.urlencoded()`의 페이로드 크기를 제한

```js
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
```

---

## 9. Rate Limiting (요청 제한)

- API 엔드포인트에 요청 횟수 제한 적용 (무차별 대입 공격, DoS 방어)

```js
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100,                  // 최대 100회
  message: { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
});

app.use("/api/", limiter);
```

---

## 10. 의존성 보안

- 정기적으로 취약점 점검 실행
- 알려진 취약점이 있는 패키지는 즉시 업데이트

```bash
npm audit          # 취약점 확인
npm audit fix      # 자동 수정 가능한 취약점 수정
```

- `package-lock.json`은 반드시 커밋 (버전 고정)
- 불필요한 패키지는 즉시 제거

---

## 11. CSRF (Cross-Site Request Forgery) 방지

- 상태를 변경하는 API(POST, PUT, DELETE)에 CSRF 토큰 또는 검증 적용
- 브라우저가 자동으로 쿠키를 첨부하므로, 쿠키 인증을 사용할 경우 반드시 필요

```js
// 방법 1: Origin / Referer 헤더 검증
app.use((req, res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    const origin = req.headers.origin || req.headers.referer || "";
    const allowed = process.env.ALLOWED_ORIGIN || "http://localhost:3009";
    if (!origin.startsWith(allowed)) {
      return res.status(403).json({ error: "잘못된 요청 출처입니다." });
    }
  }
  next();
});

// 방법 2: csurf 패키지 사용 (쿠키 기반 인증 시 권장)
// npm install csurf
const csrf = require("csurf");
app.use(csrf({ cookie: true }));
```

- JSON API + Authorization 헤더 방식은 CSRF에 기본적으로 안전 (브라우저가 자동 전송 안 함)

---

## 12. SQL / NoSQL 인젝션 방지

- 사용자 입력을 쿼리 문자열에 **직접 삽입 금지**
- 반드시 파라미터 바인딩(Prepared Statement) 또는 ODM/ORM 사용

```js
// 금지 — SQL 인젝션 위험
const query = `SELECT * FROM users WHERE name = '${req.body.name}'`;
db.query(query);

// 올바름 — 파라미터 바인딩
db.query("SELECT * FROM users WHERE name = ?", [req.body.name]);

// MongoDB 예시 — 금지 (객체 삽입 공격)
User.find({ name: req.body.name });          // req.body.name이 { $gt: "" }이면 전체 조회

// MongoDB 올바름 — 문자열 강제 변환
User.find({ name: String(req.body.name) });
```

---

## 13. 쿠키 보안

- 세션·인증 쿠키는 반드시 보안 옵션 적용

```js
res.cookie("session", token, {
  httpOnly: true,   // JS에서 접근 불가 (XSS 방어)
  secure: true,     // HTTPS에서만 전송
  sameSite: "strict", // CSRF 방어
  maxAge: 60 * 60 * 1000, // 1시간
});
```

| 옵션 | 역할 |
|------|------|
| `httpOnly: true` | `document.cookie`로 접근 차단 → XSS 피해 최소화 |
| `secure: true` | HTTPS 연결에서만 전송 |
| `sameSite: "strict"` | 외부 사이트 요청에 쿠키 미포함 → CSRF 방어 |

---

## 14. HTTPS 강제

- 운영 환경에서는 HTTP 요청을 HTTPS로 리다이렉트
- 민감 데이터는 절대 HTTP로 전송하지 않는다

```js
// 운영 환경에서 HTTP → HTTPS 리다이렉트
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(301, "https://" + req.headers.host + req.url);
  }
  next();
});
```

HSTS 헤더 설정 (helmet 사용 시 자동 포함):
```js
res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
```

---

## 15. 로깅 보안

- 로그에 비밀번호, 토큰, 개인정보를 **절대 기록하지 않음**
- 요청 바디 전체를 로그에 남기지 않는다

```js
// 금지
console.log("요청 바디:", req.body); // 비밀번호가 포함될 수 있음

// 올바름 — 필요한 필드만 선택적으로 기록
console.log("로그인 시도:", { email: req.body.email, ip: req.ip });
```

- 운영 환경 로그는 파일이나 외부 서비스로 수집 (`winston`, `pino` 권장)
- 로그 파일에 접근 권한 설정 (외부 노출 금지)

---

## 16. 정규식 ReDoS 방지

- 복잡한 정규식에 신뢰할 수 없는 입력을 넣으면 서버가 멈출 수 있음 (Catastrophic Backtracking)
- 입력 길이를 먼저 제한한 뒤 정규식 검증 수행

```js
// 위험 — 긴 문자열 입력 시 서버 블로킹 가능
const isValid = /^(a+)+$/.test(req.body.input);

// 올바름 — 길이 제한 먼저
if (req.body.input.length > 200) {
  return res.status(400).json({ error: "입력이 너무 깁니다." });
}
const isValid = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(req.body.input);
```

---

## 보안 위반 금지 목록

| 금지 항목 | 위험 |
|-----------|------|
| 민감 정보 하드코딩 | 비밀 정보 유출 |
| 입력값 미검증 | SQL 인젝션, XSS |
| `innerHTML`에 사용자 입력 삽입 | XSS |
| 스택 트레이스 응답 노출 | 내부 구조 노출 |
| CORS `*` 허용 (운영) | CSRF, 정보 탈취 |
| 요청 크기 무제한 | DoS 공격 |
| `npm audit` 무시 | 알려진 취약점 방치 |
| 쿼리에 입력값 직접 삽입 | SQL/NoSQL 인젝션 |
| `httpOnly` 없는 쿠키 | XSS로 세션 탈취 |
| HTTP로 민감 데이터 전송 | 중간자 공격(MITM) |
| 로그에 비밀번호·토큰 기록 | 로그 유출 시 피해 확대 |
| 길이 제한 없는 정규식 검증 | ReDoS 서버 마비 |
