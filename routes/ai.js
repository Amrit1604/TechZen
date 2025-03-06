const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Google Generative AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDI8eJG4HqF60a6snvSRYFoXns-6QPQN38";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Chatbot API
router.post('/chatbot', async (req, res) => {
    try {
        const userPrompt = req.body.prompt || req.body.message;
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(userPrompt);
        const response = result.response.text();
        
        res.status(200).json({ 
            message: response,
            success: true 
        });
    } catch (err) {
        console.error('Error in chatbot API:', err);
        res.status(500).json({ 
            error: 'Failed to process request',
            details: err.message 
        });
    }
});

module.exports = router;