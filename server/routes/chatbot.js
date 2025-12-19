const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    // Create completion
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",  // or any Groq model
      messages,
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false, // Frontend not streaming
      reasoning_effort: "medium",
    });

    const reply = completion.choices?.[0]?.message?.content || "No response.";

    res.json({
      success: true,
      reply,
      full: completion,
    });

  } catch (error) {
    console.error("Groq API error:", error);

    res.status(500).json({
      success: false,
      message: "Groq API request failed",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
