require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const { createRealtimeSession, createChatCompletion } = require('./openaiService');
const { createGeminiCompletion } = require('./geminiService');
const { getAudio } = require('ms-tts-api');
const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '50kb' }));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[JARVIS Backend] ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`);
    });
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: Date.now(),
        providers: {
            openai: false,
            gemini: !!process.env.GEMINI_API_KEY,
            gemma: false
        }
    });
});

// Endpoint de síntesis de voz con la auténtica voz británica de J.A.R.V.I.S. (Paul Bettany)
app.post('/api/tts', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'El texto es obligatorio' });
        }

        getAudio(text, {
            voiceName: "en-GB-RyanNeural", // Voz británica formal de alta fidelidad estilo JARVIS
            outputFormat: "audio-16khz-32kbitrate-mono-mp3"
        }, (err, audioBuffer) => {
            if (err) {
                console.error("[JARVIS Backend] Error en ms-tts-api:", err);
                return res.status(500).json({ error: err.message });
            }

            const base64Audio = audioBuffer.toString('base64');
            res.json({ audioBase64: base64Audio });
        });

    } catch (error) {
        console.error("[JARVIS Backend] Excepción en /api/tts:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, HOST, () => {
    console.log(`[JARVIS Backend] Servidor corriendo en http://${HOST}:${PORT}`);
});
