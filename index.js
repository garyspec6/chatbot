// index.js (New Web Server Code)

import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Load environment variables (including GEMINI_API_KEY)
dotenv.config();

// --- 1. SET UP GEMINI AND CHAT HISTORY ---
const ai = new GoogleGenAI({});

// Initialize a Map to store conversation history for different sessions/users
const chatSessions = new Map();

// --- 2. SET UP EXPRESS SERVER ---
const app = express();
const port = 3000;

// Middleware for security and handling JSON data
app.use(cors()); // Allows frontend requests from different domains
app.use(express.json()); // Allows the server to read JSON data sent in requests

// --- 3. CHAT API ENDPOINT ---
app.post('/chat', async (req, res) => {
    // A simple way to manage a session, you'd use a user ID in a real app
    const sessionId = 'default-user-session'; 

    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get or create a chat session for this user
        let chat = chatSessions.get(sessionId);
        if (!chat) {
            chat = ai.chats.create({ model: "gemini-2.5-flash" });
            chatSessions.set(sessionId, chat);
        }

        // Send the user message to the Gemini chat session
        const response = await chat.sendMessage({ message });
        
        // Send the model's text response back to the frontend
        res.json({ text: response.text });

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to communicate with the AI model.' });
    }
});

// --- 4. START THE SERVER ---
app.listen(port, () => {
    console.log(`🚀 Chatbot Backend running securely at http://localhost:${port}`);
    console.log('Use this endpoint: POST http://localhost:3000/chat');
});

// Simple welcome route (optional)
app.get('/', (req, res) => {
    res.send('Gemini Chatbot API is running.');
});