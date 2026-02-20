const path = require("path");
const express = require("express");
const app = express();
const PORT = 3009;

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 2000;

const memos = [];
let nextId = 1;

app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/hello", (req, res) => {
  res.send("Hello, 자기2!");
});

app.get("/api/memos", (req, res) => {
  res.status(200).json(memos);
});

app.post("/api/memos", (req, res) => {
  const { title, content } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({ error: "제목을 입력해주세요." });
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return res.status(400).json({ error: `제목은 ${MAX_TITLE_LENGTH}자 이내로 입력해주세요.` });
  }
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ error: "내용을 입력해주세요." });
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ error: `내용은 ${MAX_CONTENT_LENGTH}자 이내로 입력해주세요.` });
  }

  const memo = {
    id: nextId++,
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
  memos.push(memo);
  res.status(201).json(memo);
});

app.put("/api/memos/:id", (req, res) => {
  const memoId = Number(req.params.id);
  const memo = memos.find((m) => m.id === memoId);

  if (!memo) {
    return res.status(404).json({ error: "메모를 찾을 수 없습니다." });
  }

  const { title, content } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({ error: "제목을 입력해주세요." });
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return res.status(400).json({ error: `제목은 ${MAX_TITLE_LENGTH}자 이내로 입력해주세요.` });
  }
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ error: "내용을 입력해주세요." });
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ error: `내용은 ${MAX_CONTENT_LENGTH}자 이내로 입력해주세요.` });
  }

  memo.title = title.trim();
  memo.content = content.trim();
  memo.updatedAt = new Date().toISOString();
  res.status(200).json(memo);
});

app.delete("/api/memos/:id", (req, res) => {
  const memoId = Number(req.params.id);
  const index = memos.findIndex((m) => m.id === memoId);

  if (index === -1) {
    return res.status(404).json({ error: "메모를 찾을 수 없습니다." });
  }

  memos.splice(index, 1);
  res.status(200).json({ success: true });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "서버 오류가 발생했습니다." });
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
