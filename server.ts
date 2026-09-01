import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Text-To-Speech endpoint with Gemini 3.1 Flash TTS (Ursa Voice & Slow Pace)
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, voice = 'Ursa', speed = 0.8 } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text parameter is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          fallback: true,
          message: 'No GEMINI_API_KEY configured. Falling back to client-side speech synthesis.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const speedDescriptor =
        speed <= 0.85
          ? 'slowly, clearly, and warmly with gentle spacing between numbers'
          : 'clearly and naturally';

      const prompt = `Speak ${speedDescriptor} like a friendly, patient elementary math tutor: "${text}"`;

      // Supported voices include Ursa, Kore, Puck, Aoede, Zephyr, Fenrir
      const targetVoice = voice || 'Ursa';

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: targetVoice },
            },
          },
        },
      });

      const candidate = response.candidates?.[0];
      const inlineDataPart = candidate?.content?.parts?.find((p) => p.inlineData?.data);
      const base64Audio = inlineDataPart?.inlineData?.data;
      const mimeType = inlineDataPart?.inlineData?.mimeType || 'audio/pcm;rate=24000';

      if (!base64Audio) {
        return res.status(200).json({
          fallback: true,
          message: 'No audio returned by TTS model. Using browser speech synthesis.',
        });
      }

      return res.json({
        audio: base64Audio,
        mimeType,
        voice: targetVoice,
      });
    } catch (err: any) {
      console.warn('TTS API warning (client will fallback to SpeechSynthesis):', err?.message || err);
      return res.status(200).json({
        fallback: true,
        error: err?.message || 'Failed to generate speech with Gemini TTS',
      });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Step-by-Step Regrouping Math Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
