import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Rate limit
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 30
}));

// ✅ Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// 🔥 MEMORY (chat sessions)
const userChats = {};

// HEALTH
app.get("/", (req, res) => {
  res.send("Krishna AI Running 🚀");
});

// 🔥 CREATE NEW CHAT
app.post("/new-chat", (req, res) => {
  const { userId } = req.body;

  if (!userChats[userId]) userChats[userId] = {};

  const chatId = Date.now().toString();

  userChats[userId][chatId] = [];

  res.json({ chatId });
});

// 🔥 SEND MESSAGE
app.post("/chat", async (req, res) => {
  try {
    const { userId, chatId, message } = req.body;

    if (!userChats[userId]) userChats[userId] = {};
    if (!userChats[userId][chatId]) userChats[userId][chatId] = [];

    const history = userChats[userId][chatId];

    // add user message
    history.push({
      role: "user",
      content: [{ type: "text", text: message }]
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,

      system: `
You are Krishna — speak like a real human.

- Hinglish
- Short
- Slightly blunt
- Focus on 1 uncomfortable truth
- Ask 1 question

Remember past chats naturally.
`,

      messages: history.slice(-12)
    });

    const answer = response.content[0].text;

    // store assistant
    history.push({
      role: "assistant",
      content: [{ type: "text", text: answer }]
    });

    res.json({ answer });

  } catch (err) {
    console.error(err);
    res.json({
      answer: "hmm… thoda baad try karo."
    });
  }
});

// 🔥 GET CHAT LIST
app.post("/chats", (req, res) => {
  const { userId } = req.body;

  const chats = userChats[userId] || {};

  const list = Object.keys(chats).map(id => ({
    chatId: id,
    date: new Date(parseInt(id)).toDateString()
  }));

  res.json({ chats: list });
});

// 🔥 GET FULL CHAT
app.post("/chat-history", (req, res) => {
  const { userId, chatId } = req.body;

  const history = userChats[userId]?.[chatId] || [];

  res.json({ history });
});

// PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});