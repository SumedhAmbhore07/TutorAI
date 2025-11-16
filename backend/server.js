const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for PDF uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Use Groq API key for AI responses
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Default route
app.get("/", (req, res) => {
  res.send("TutorAI backend is running!");
});

// PDF upload route
app.post("/api/upload-pdf", upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const pdfBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(pdfBuffer);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      text: data.text,
      pages: data.numpages,
      filename: req.file.originalname
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Error processing PDF file" });
  }
});

// AI route with PDF context support
app.post("/api/ask", async (req, res) => {
  const { question, pdfContext } = req.body;

  if (!question) {
    return res.status(400).json({ answer: "Question is required." });
  }

  try {
    let systemMessage = "You are a general AI assistant. Answer any question on any topic openly and helpfully. Do not restrict to educational subjects. Provide clear, engaging explanations with examples when helpful. Keep responses conversational and encouraging.";

    if (pdfContext) {
      systemMessage += `\n\nYou have access to the following PDF content. Use this information to answer questions about the PDF when relevant:\n\n${pdfContext}`;
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: question
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000,
      }
    );

    const answer =
      response.data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    res.json({ answer });
  } catch (error) {
    console.error("Error fetching AI response:", error);
    res.status(500).json({ answer: "Error connecting to AI service." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
