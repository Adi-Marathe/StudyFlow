// routes/chat.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid or missing messages array' });
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'deepseek-r1-distill-llama-70b', 
        messages
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      reply: response.data.choices[0].message.content,
      full: response.data
    });
  } catch (error) {
    console.error("Grok API error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "AI API request failed",
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
