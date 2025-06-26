// File: netlify/functions/api.js

// Import necessary modules
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors'); // For Cross-Origin Resource Sharing

// Initialize the Express application
const app = express();

// --- Middleware ---

/**
 * 1. CORS Support:
 * Enables Cross-Origin Resource Sharing. This is crucial for allowing
 * your frontend application (which might be served from a different domain
 * during local development, or if you ever host it separately from Netlify)
 * to make requests to this Netlify Function without being blocked by browser
 * security policies.
 * When deployed on Netlify with the frontend and function on the same domain
 * (e.g., your-site.netlify.app), CORS might not be strictly necessary, but
 * it's a robust practice for broader compatibility and local development.
 */
app.use(cors());

/**
 * 2. JSON Body Parser:
 * This middleware parses incoming request bodies with JSON payloads.
 * It makes the JSON data available on `req.body`.
 * This is essential for handling the `{"message": "..."}` input from the frontend.
 */
app.use(express.json());

// --- API Endpoints ---

/**
 * POST /chat
 * This is the primary API endpoint for the EchoBot.
 * It listens for incoming chat messages from the frontend, processes them,
 * and generates a simple, predefined response.
 *
 * Endpoint Path:
 * In the Express app, this route is `/chat`.
 * When deployed as a Netlify Function named `api.js` and with the `netlify.toml`
 * redirect rule `from = "/api/*" to = "/.netlify/functions/:splat"`,
 * this endpoint will be accessible to the frontend via `/api/chat`.
 *
 * Request Body Specification (JSON):
 * {
 *   "message": "string" // The user's message input
 * }
 *
 * Success Response Specification (200 OK - JSON):
 * {
 *   "reply": "string" // The bot's generated response
 * }
 *
 * Error Response Specification (400 Bad Request / 500 Internal Server Error - JSON):
 * {
 *   "error": "string" // A descriptive error message
 * }
 */
app.post('/chat', (req, res) => {
    try {
        // --- Request Validation ---
        // Ensure the incoming request body has a 'message' property,
        // that it is a string, and that it is not empty after trimming whitespace.
        const userMessage = req.body.message;

        if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
            // If validation fails, send a 400 Bad Request response with a clear error message.
            console.error('Validation Error: Missing, empty, or invalid "message" in request body.');
            return res.status(400).json({ error: 'A non-empty string "message" is required in the request body.' });
        }

        // --- Generate Bot Reply ---
        // As per the technical plan, the bot generates a simple, hardcoded response.
        // This example echoes the user's message and adds a fixed greeting.
        const botReply = `You said: "${userMessage}". Hello! I'm EchoBot. How can I help?`;

        // Log the interaction for debugging purposes (these logs will appear in Netlify Function logs).
        console.log(`Received message from frontend: "${userMessage}"`);
        console.log(`Generated bot reply: "${botReply}"`);

        // --- Send Success Response ---
        // Return the bot's reply as a JSON object with a 200 OK status.
        res.status(200).json({ reply: botReply });

    } catch (error) {
        // --- Error Handling ---
        // Catch any unexpected errors that might occur during processing (e.g., issues
        // with `req.body` if `express.json()` fails for some reason, though unlikely
        // for valid JSON).
        // Log the error for server-side debugging.
        console.error('Internal Server Error during chat processing:', error);

        // Send a 500 Internal Server Error response to the client.
        res.status(500).json({ error: 'An unexpected error occurred while processing your request. Please try again.' });
    }
});

// --- Netlify Function Export ---

/**
 * This is the standard way to export an Express application as a Netlify Function.
 * The `serverless-http` package wraps the Express `app` instance, making it
 * compatible with Netlify's serverless function signature (which expects a
 * handler function that takes `event`, `context`, and an optional `callback`).
 *
 * The `module.exports.handler` property is the entry point that Netlify
 * (and AWS Lambda, which Netlify Functions are built upon) looks for.
 */
module.exports.handler = serverless(app);

// Note for Local Development:
// When using `netlify dev`, this function will be accessible at
// `http://localhost:8888/.netlify/functions/api` or via the proxy
// `http://localhost:8888/api/chat`.
// You typically do not need to add an `app.listen()` block here for Netlify Functions,
// as `netlify dev` handles the server bootstrapping for you.