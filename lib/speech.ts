export interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
}

export interface VoiceInfo {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

/**
 * Speech synthesis utility class
 */
export class SpeechSynthesizer {
  private synthesis: SpeechSynthesis | null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;

  constructor() {
    this.synthesis = this.getSpeechSynthesis();
    this.loadVoices();
  }

  private getSpeechSynthesis(): SpeechSynthesis | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const synthesis =
      window.speechSynthesis ||
      (window as any).webkitSpeechSynthesis ||
      null;

    return synthesis;
  }

  private loadVoices(): void {
    if (!this.synthesis) {
      return;
    }

    this.updateVoiceList();

    if (this.voices.length === 0) {
      const onVoicesChanged = () => {
        this.updateVoiceList();
      };

      this.synthesis.addEventListener('voiceschanged', onVoicesChanged);
    }
  }

  private updateVoiceList(): void {
    if (!this.synthesis) {
      return;
    }

    try {
      this.voices = this.synthesis.getVoices() || [];
      this.voicesLoaded = true;
    } catch (error) {
      console.error('Failed to get voices:', error);
      this.voices = [];
    }
  }

  isSupported(): boolean {
    return this.synthesis !== null;
  }

  getVoices(): VoiceInfo[] {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default
    }));
  }

  getEnglishVoices(): VoiceInfo[] {
    return this.voices
      .filter(voice => voice.lang.startsWith('en'))
      .map(voice => ({
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService,
        default: voice.default
      }));
  }

  getBestEnglishVoice(): SpeechSynthesisVoice | null {
    const enGB = this.voices.find(v => v.lang === 'en-GB');
    if (enGB) {
      return enGB;
    }

    const enAny = this.voices.find(v => v.lang.startsWith('en'));
    if (enAny) {
      return enAny;
    }

    const defaultVoice = this.voices.find(v => v.default);
    if (defaultVoice) {
      return defaultVoice;
    }

    if (this.voices.length > 0) {
      return this.voices[0];
    }

    return null;
  }

  speak(text: string, options: SpeechOptions = {}): void {
    if (!this.synthesis) {
      const error = new Error('Speech synthesis not supported in this browser');
      options.onError?.(error);
      console.error(error.message);
      return;
    }

    if (!text || text.trim().length === 0) {
      const error = new Error('Text cannot be empty');
      options.onError?.(error);
      return;
    }

    this.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(text);

      const voice = this.getBestEnglishVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = options.lang || 'en-GB';

      utterance.rate = options.rate !== undefined ? options.rate : 0.9;
      utterance.pitch = options.pitch !== undefined ? options.pitch : 1.0;
      utterance.volume = options.volume !== undefined ? options.volume : 1.0;

      utterance.onend = () => {
        options.onEnd?.();
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        const error = new Error(
          `Speech synthesis error: ${event.error}`
        );
        options.onError?.(error);
      };

      utterance.onstart = () => {
        options.onStart?.();
      };

      this.synthesis.speak(utterance);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      options.onError?.(err);
      console.error('Speech synthesis error:', err);
    }
  }

  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  pause(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }

  isPaused(): boolean {
    return this.synthesis?.paused || false;
  }
}

export const speech = new SpeechSynthesizer();

export function speak(text: string, options?: SpeechOptions): void {
  speech.speak(text, options);
}

export function isSpeechSupported(): boolean {
  return speech.isSupported();
}

export function getAvailableVoices(): VoiceInfo[] {
  return speech.getVoices();
}

export function getEnglishVoices(): VoiceInfo[] {
  return speech.getEnglishVoices();
}
