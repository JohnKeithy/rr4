# BEST_PRACTICES.md — 좋은 프로그램을 만들기 위한 지침

Claude Code가 이 프로젝트에서 코드를 작성하거나 수정할 때 반드시 따라야 할 원칙입니다.

---

## 1. 코드 작성 전 — 먼저 이해하라

- 기존 코드를 **반드시 읽은 후** 수정한다
- 파일 구조와 의존 관계를 파악한 뒤 변경한다
- 요청된 내용만 변경하고, 관련 없는 코드는 건드리지 않는다

> 요청하지 않은 리팩터링, 주석 추가, 스타일 변경을 하지 않는다.

---

## 2. 단순하게 만들어라 (KISS)

- 가장 단순한 방법으로 문제를 해결한다
- 추상화, 유틸 함수, 헬퍼는 **3곳 이상에서 반복될 때만** 만든다
- 지금 필요하지 않은 기능은 추가하지 않는다

```js
// 나쁨 — 과도한 추상화 (한 곳에서만 쓰임)
function buildJsonResponse(status, payload) {
  return { status, payload, timestamp: Date.now() };
}

// 좋음 — 직접 응답
res.status(200).json({ message: "안녕하세요" });
```

---

## 3. 명확한 이름을 사용하라

- 변수·함수 이름만 봐도 역할을 알 수 있어야 한다
- 축약어, 단일 문자 변수(`x`, `tmp`, `data`)는 루프 외에는 사용하지 않는다
- 함수 이름은 **동사**로 시작한다 (`getUser`, `validateEmail`, `sendResponse`)

```js
// 나쁨
const d = await db.find(u);

// 좋음
const userRecord = await database.findUserById(userId);
```

---

## 4. 함수는 하나의 일만 해라 (SRP)

- 하나의 함수는 하나의 역할만 수행한다
- 함수가 20줄을 넘으면 분리를 고려한다
- 함수 이름으로 설명할 수 없다면 너무 많은 일을 하고 있는 것이다

```js
// 나쁨 — 검증 + 저장 + 응답을 한 함수에서
app.post("/api/contact", async (req, res) => {
  if (!req.body.email) return res.status(400).json({ error: "이메일 필요" });
  const record = await db.save(req.body);
  await sendEmail(record);
  res.json({ success: true });
});

// 좋음 — 역할 분리
function validateContactInput(body) { /* ... */ }
async function saveContact(data) { /* ... */ }

app.post("/api/contact", async (req, res) => {
  const error = validateContactInput(req.body);
  if (error) return res.status(400).json({ error });
  await saveContact(req.body);
  res.json({ success: true });
});
```

---

## 5. 에러를 명시적으로 처리하라

- `try/catch` 없이 비동기 코드를 방치하지 않는다 (Express v5는 자동 전파)
- 에러 메시지는 **사용자에게 유용한 정보**를 담는다
- 에러 로그는 서버에만 기록하고, 클라이언트에는 일반 메시지만 반환한다

```js
// 나쁨
app.get("/user", async (req, res) => {
  const user = await db.getUser(req.query.id); // 실패 시 처리 없음
  res.json(user);
});

// 좋음
app.get("/user", async (req, res) => {
  const user = await db.getUser(req.query.id); // Express v5가 에러 전파
  if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  res.json(user);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "서버 오류가 발생했습니다." });
});
```

---

## 6. 상수는 이름을 붙여라

- 의미를 알 수 없는 숫자·문자열(매직 넘버)을 코드에 직접 쓰지 않는다

```js
// 나쁨
if (message.length > 1000) { ... }
setTimeout(fn, 86400000);

// 좋음
const MAX_MESSAGE_LENGTH = 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

if (message.length > MAX_MESSAGE_LENGTH) { ... }
setTimeout(fn, ONE_DAY_MS);
```

---

## 7. 코드보다 동작을 먼저 확인하라

- 변경 후 서버를 실행해 실제 동작을 확인한다
- 엔드포인트를 추가·수정한 경우 curl 또는 브라우저로 직접 테스트한다

```bash
node index.js
curl http://localhost:3009/hello
```

---

## 8. 파일을 함부로 만들지 마라

- 기존 파일을 수정하는 것이 새 파일을 만드는 것보다 낫다
- 새 파일은 명확한 이유가 있을 때만 생성한다
- `public/` 외부에 클라이언트 리소스를 두지 않는다

---

## 9. 주석은 "왜"를 설명하라

- 코드가 **무엇을 하는지**는 코드 자체가 설명해야 한다
- 주석은 **왜 이렇게 했는지**, 비직관적인 이유를 설명할 때만 쓴다
- 요청하지 않은 주석·docstring을 임의로 추가하지 않는다

```js
// 나쁨 — 코드를 그대로 설명
// 포트 번호를 3009로 설정
const PORT = 3009;

// 좋음 — 이유를 설명
// 3000~3008은 다른 프로젝트에서 사용 중이라 3009로 고정
const PORT = 3009;
```

---

## 10. 체크리스트 — 코드 제출 전 확인

- [ ] 요청된 내용만 변경했는가?
- [ ] 기존 동작을 깨뜨리지 않았는가?
- [ ] 민감 정보가 코드에 없는가?
- [ ] 사용자 입력을 검증하는가?
- [ ] 에러 처리가 되어 있는가?
- [ ] 매직 넘버가 없는가?
- [ ] 서버를 실행해 동작을 확인했는가?
