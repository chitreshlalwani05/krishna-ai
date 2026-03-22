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
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20
});
app.use(limiter);

// ✅ Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// 🔥 MEMORY STORE (per user)
const userMemory = {};

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Krishna AI Running 🚀");
});

// ✅ CHAT API (WITH MEMORY)
app.post("/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;

    console.log("🔥 User:", userId, "Message:", message);

    if (!message) {
      return res.json({ answer: "kuch toh bol..." });
    }

    // 🔥 INIT MEMORY
    if (!userMemory[userId]) {
      userMemory[userId] = [];
    }

    // 🔥 ADD USER MESSAGE
    userMemory[userId].push({
      role: "user",
      content: [{ type: "text", text: message }]
    });

    // 🔥 LIMIT MEMORY (last 12 messages)
    const history = userMemory[userId].slice(-12);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,

      system: `
You are Krishna — speak like a real human, not a guru.

- Hinglish
- Short (3–5 lines)
- No gyaan
- Slightly blunt
- Focus on 1 uncomfortable truth
- Ask 1 question

IMPORTANT:
- Remember past messages
- Refer subtly (not creepy)
`,

      messages: history
    });

    const answer = response.content[0].text;

    // 🔥 STORE AI RESPONSE
    userMemory[userId].push({
      role: "assistant",
      content: [{ type: "text", text: answer }]
    });

    res.json({ answer });

  } catch (err) {
    console.error(err);

    res.json({
      answer: "hmm… abhi clear nahi hai, thoda baad try karo."
    });
  }
});

// ✅ PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});