"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPDF = exports.askAI = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const cors = __importStar(require("cors"));
admin.initializeApp();
const corsHandler = cors({ origin: true });
// Groq AI API configuration
const GROQ_API_KEY = ((_a = functions.config().groq) === null || _a === void 0 ? void 0 : _a.apikey) || process.env.GROQ_API_KEY;
exports.askAI = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        var _a, _b, _c;
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        try {
            const { question, pdfContext } = req.body;
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
            const response = await axios_1.default.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: question }
                ],
                max_tokens: 1000,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            if (response.status === 200) {
                const answer = ((_c = (_b = (_a = response.data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || "Sorry, I couldn't generate a response.";
                res.json({ answer });
            }
            else {
                res.status(502).json({ answer: `Error from AI provider: ${response.statusText}` });
            }
        }
        catch (error) {
            console.error('AI Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ answer: `Error connecting to AI service: ${errorMessage}` });
        }
    });
});
exports.uploadPDF = functions.https.onRequest((req, res) => {
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
                text: pdf.substring(0, 4000),
                summary: "PDF uploaded successfully. Full parsing requires additional setup with Cloud Storage.",
                pages: pages || 1,
                filename: filename || 'document.pdf'
            });
        }
        catch (error) {
            console.error('PDF Upload Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: `Error processing PDF: ${errorMessage}` });
        }
    });
});
//# sourceMappingURL=index.js.map