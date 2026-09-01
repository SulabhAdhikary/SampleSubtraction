/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VoiceName = 'Ursa' | 'Kore' | 'Aoede' | 'Zephyr' | 'Puck';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentSourceNode: AudioBufferSourceNode | null = null;
  private currentAbortController: AbortController | null = null;

  public isSoundMuted: boolean = false;
  public isVoiceMuted: boolean = false;
  public selectedVoice: VoiceName = 'Ursa';
  public speechSpeed: number = 0.78; // Gentle, slightly slow pace for easy comprehension
  public isSpeaking: boolean = false;

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // --- Soothing Sound Effects ---

  playCorrectSound() {
    if (this.isSoundMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Gentle melodic 2-note chime (E5 -> A5)
    [
      { freq: 659.25, time: 0, dur: 0.14 },
      { freq: 880.0, time: 0.11, dur: 0.28 },
    ].forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.1, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });
  }

  playBorrowSound() {
    if (this.isSoundMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Calming harp-like regrouping arpeggio (C5 -> E5 -> G5 -> C6)
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const startTime = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  playErrorSound() {
    if (this.isSoundMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Soft warm bump instead of harsh buzz
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playVictorySound() {
    if (this.isSoundMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0, dur: 0.14 },    // C5
      { freq: 659.25, time: 0.12, dur: 0.14 },  // E5
      { freq: 783.99, time: 0.24, dur: 0.16 },  // G5
      { freq: 1046.5, time: 0.38, dur: 0.45 },  // C6
      { freq: 1318.51, time: 0.52, dur: 0.65 }, // E6
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.14, now + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });
  }

  // --- Voice Narration with Ursa Voice & Slower Pace ---

  setVoice(voice: VoiceName) {
    this.selectedVoice = voice;
  }

  setSpeed(speed: number) {
    this.speechSpeed = speed;
  }

  stopSpeech() {
    this.isSpeaking = false;

    // Abort pending fetch
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }

    // Stop active web audio node
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
        this.currentSourceNode.disconnect();
      } catch {
        // Already stopped
      }
      this.currentSourceNode = null;
    }

    // Cancel browser speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  async speakNarration(text: string, onEnded?: () => void) {
    if (this.isVoiceMuted) return;

    this.stopSpeech();
    this.isSpeaking = true;

    const controller = new AbortController();
    this.currentAbortController = controller;

    // Attempt Server Gemini 3.1 Flash TTS with Ursa Voice
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: this.selectedVoice,
          speed: this.speechSpeed,
        }),
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.audio && !data.fallback) {
          await this.playBase64Audio(data.audio, data.mimeType || 'audio/pcm;rate=24000', onEnded);
          return;
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      // Continue to Web Speech API fallback
    }

    // Fallback to browser Web Speech API with slow, gentle pace and matching voice
    this.speakWithSpeechSynthesis(text, onEnded);
  }

  private async playBase64Audio(base64Data: string, mimeType: string, onEnded?: () => void) {
    const ctx = this.getAudioContext();
    if (!ctx) {
      this.speakWithSpeechSynthesis(base64Data, onEnded);
      return;
    }

    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      let audioBuffer: AudioBuffer | null = null;

      // Check if it is raw PCM (standard Gemini TTS format) or encoded audio
      if (mimeType.includes('pcm') || mimeType.includes('raw') || !mimeType.includes('wav')) {
        const int16Array = new Int16Array(bytes.buffer);
        const sampleRate = 24000;
        audioBuffer = ctx.createBuffer(1, int16Array.length, sampleRate);
        const channelData = audioBuffer.getChannelData(0);

        for (let i = 0; i < int16Array.length; i++) {
          channelData[i] = int16Array[i] / 32768.0;
        }
      } else {
        // Encoded wav or mp3
        try {
          audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
        } catch {
          // Fallback to PCM interpretation
          const int16Array = new Int16Array(bytes.buffer);
          audioBuffer = ctx.createBuffer(1, int16Array.length, 24000);
          const channelData = audioBuffer.getChannelData(0);
          for (let i = 0; i < int16Array.length; i++) {
            channelData[i] = int16Array[i] / 32768.0;
          }
        }
      }

      if (!audioBuffer) {
        this.isSpeaking = false;
        return;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      // Adjust playback rate if needed (slow pace)
      source.playbackRate.value = Math.max(0.7, Math.min(1.2, this.speechSpeed / 0.8));

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.9, ctx.currentTime);

      source.connect(gain);
      gain.connect(ctx.destination);

      this.currentSourceNode = source;

      source.onended = () => {
        this.isSpeaking = false;
        this.currentSourceNode = null;
        if (onEnded) onEnded();
      };

      source.start();
    } catch {
      this.isSpeaking = false;
      if (onEnded) onEnded();
    }
  }

  private speakWithSpeechSynthesis(text: string, onEnded?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis || this.isVoiceMuted) {
      this.isSpeaking = false;
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      // Slower, clear, and calm for learners (0.78x)
      utterance.rate = this.speechSpeed;
      utterance.pitch = 1.0;

      // Pick the best natural English voice (preferring Ursa, Natural, Google, Samantha, Ava)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => v.name.toLowerCase().includes('ursa')) ||
        voices.find((v) => v.name.includes('Natural') && v.lang.startsWith('en')) ||
        voices.find((v) => (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Ava') || v.name.includes('Jenny')) && v.lang.startsWith('en')) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnded) onEnded();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEnded) onEnded();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
    }
  }
}

export const soundManager = new SoundEngine();
