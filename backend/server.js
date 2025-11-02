const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("TutorAI backend is running!");
});

// AI route
app.post("/api/ask", async (req, res) => {
  const { question } = req.body;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
      {
        contents: [{ parts: [{ text: question }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    const answer =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn’t generate a response.";

    res.json({ answer });
  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).json({ answer: "Error connecting to AI service." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
