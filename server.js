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

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Krishna AI Running 🚀");
});

// ✅ CHAT API
app.post("/chat", async (req, res) => {
  const messages = req.body.messages;

  console.log("🔥 Chat:", messages);

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,

      system: `
You are Krishna — speak like a real human, not a guru.

- Hinglish
- Short (3–5 lines)
- No gyaan, no generic lines
- Slightly blunt
- Focus on 1 uncomfortable truth
- Ask 1 question

No dramatic tone. No preaching.
`,

      messages: messages.map(m => ({
        role: m.role,
        content: [{ type: "text", text: m.content }]
      }))
    });

    res.json({
      answer: response.content[0].text
    });

  } catch (err) {
    console.error(err);
    res.json({
      answer: "hmm… abhi clear nahi hai, thoda baad try karo."
    });
  }
});

// ✅ PORT (IMPORTANT FOR DEPLOY)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});