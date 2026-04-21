import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import * as cors from 'cors';

admin.initializeApp();

const corsHandler = cors({ origin: true });

// Groq AI API configuration
const GROQ_API_KEY = functions.config().groq?.apikey || process.env.GROQ_API_KEY;

interface AskRequest {
  question: string;
  pdfContext?: string;
}

interface AskResponse {
  answer: string;
}

export const askAI = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { question, pdfContext }: AskRequest = req.body;

      if (!question) {
        res.status(400).json({ answer: 'Question is required.' });
        return;
      }

      if (!GROQ_API_KEY) {
        res.status(500).json({ answer: 'Server configuration error: API Key missing.' });
        return;
      }

      let systemMessage = "You are a general AI assistant. Answer any question on any topic openly and helpfully. Do not restrict to educational subjects. Provide clear, engaging explanations with examples when helpful. Keep responses conversational and encouraging.";

      if (pdfContext) {
        systemMessage += `\n\nYou have access to the following PDF content. Use this information to answer questions about the PDF when relevant:\n\n${pdfContext}`;
      }

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: question }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.status === 200) {
        const answer = response.data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
        res.json({ answer });
      } else {
        res.status(502).json({ answer: `Error from AI provider: ${response.statusText}` });
      }
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ answer: `Error connecting to AI service: ${errorMessage}` });
    }
  });
});

export const uploadPDF = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      // Note: For PDF parsing in Firebase Functions, we'd need a different approach
      // Since pdf-parse has issues in Firebase Functions, we'll return a simplified response
      // In production, you might want to use Cloud Storage triggers or a different parsing method
      
      const { pdf, filename, pages } = req.body;

      if (!pdf) {
        res.status(400).json({ error: 'No PDF file uploaded' });
        return;
      }

      // For now, return a placeholder response
      // In a full implementation, you'd parse the PDF and generate a summary
      res.json({
        text: pdf.substring(0, 4000), // Truncated text
        summary: "PDF uploaded successfully. Full parsing requires additional setup with Cloud Storage.",
        pages: pages || 1,
        filename: filename || 'document.pdf'
      });
    } catch (error) {
      console.error('PDF Upload Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: `Error processing PDF: ${errorMessage}` });
    }
  });
});
