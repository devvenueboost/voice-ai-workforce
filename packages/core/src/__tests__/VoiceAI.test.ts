// packages/core/src/__tests__/VoiceAI.test.ts

import { VoiceAI } from '../VoiceAI';
import { VoiceAIConfig, SpeechProvider, AIProvider, ResponseMode } from '../../../types/src/types';

// Mock Web Speech API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onresult: null,
  onerror: null,
  onend: null,
  continuous: false,
  lang: 'en-US',
  interimResults: false,
};

const mockSpeechSynthesis = {
    speak: jest.fn((utterance) => {
      // Immediately trigger onend to simulate completion
      if (utterance && utterance.onend) {
        setTimeout(() => utterance.onend(), 0);
      }
    }),
    cancel: jest.fn(),
    getVoices: jest.fn(() => []),
  };

// Mock globals
Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: jest.fn(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis,
});

// Mock the AI provider responses
const mockAIResponse = {
  success: true,
  text: 'Command processed successfully',
  data: { intent: 'help', entities: {} }
};

describe('VoiceAI', () => {
  let voiceAI: VoiceAI;
  let mockConfig: VoiceAIConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockConfig = {
      speechToText: {
        provider: SpeechProvider.WEB_SPEECH,
        language: 'en-US',
        continuous: false,
      },
      textToSpeech: {
        provider: SpeechProvider.WEB_SPEECH,
        speed: 1.0,
      },
      aiProvider: {
        provider: AIProvider.OPENAI,
        model: 'gpt-3.5-turbo',
      },
      responseMode: ResponseMode.BOTH,
      context: {},
    };
  });

  describe('Initialization', () => {
    it('should create VoiceAI instance with valid config', () => {
      voiceAI = new VoiceAI(mockConfig);
      expect(voiceAI).toBeInstanceOf(VoiceAI);
    });

    it('should merge config with defaults', () => {
      const minimalConfig = {
        speechToText: {
          provider: SpeechProvider.WEB_SPEECH,
        },
        textToSpeech: {
          provider: SpeechProvider.WEB_SPEECH,
        },
        aiProvider: {
          provider: AIProvider.OPENAI,
        },
      };

      voiceAI = new VoiceAI(minimalConfig as VoiceAIConfig);
      const state = voiceAI.getState();
      
      expect(state.isListening).toBe(false);
      expect(state.isProcessing).toBe(false);
    });

    it('should handle missing browser support gracefully', () => {
      // Temporarily remove speech recognition
      const originalSpeechRecognition = (window as any).webkitSpeechRecognition;
      delete (window as any).webkitSpeechRecognition;
      delete (window as any).SpeechRecognition;

      expect(() => {
        voiceAI = new VoiceAI(mockConfig);
      }).not.toThrow();

      // Restore
      (window as any).webkitSpeechRecognition = originalSpeechRecognition;
    });
  });

  describe('Voice Recognition', () => {
    beforeEach(() => {
      voiceAI = new VoiceAI(mockConfig);
    });

    it('should start listening when available', async () => {
      await voiceAI.startListening();
      expect(mockSpeechRecognition.start).toHaveBeenCalled();
    });

    it('should stop listening when active', async () => {
      await voiceAI.startListening();
      await voiceAI.stopListening();
      expect(mockSpeechRecognition.stop).toHaveBeenCalled();
    });

    it('should not start listening if already listening', async () => {
      await voiceAI.startListening();
      jest.clearAllMocks();
      
      await voiceAI.startListening();
      expect(mockSpeechRecognition.start).not.toHaveBeenCalled();
    });
  });

  describe('Speech Synthesis', () => {
    beforeEach(() => {
      voiceAI = new VoiceAI(mockConfig);
    });

    it('should speak text when synthesis available', async () => {
      await voiceAI.speak('Hello world');
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    }, 10000);

    it('should handle speech synthesis errors gracefully', async () => {
      mockSpeechSynthesis.speak.mockImplementation(() => {
        throw new Error('Speech synthesis failed');
      });

      await expect(voiceAI.speak('test')).resolves.not.toThrow();
    });
  });

  describe('Configuration Updates', () => {
    beforeEach(() => {
      voiceAI = new VoiceAI(mockConfig);
    });

    it('should update configuration', () => {
      const newConfig = {
        responseMode: ResponseMode.TEXT,
      };

      voiceAI.updateConfig(newConfig);
      expect(() => voiceAI.updateConfig(newConfig)).not.toThrow();
    });

    it('should update context', () => {
      const newContext = {
        userRole: 'manager',
        department: 'engineering',
      };

      voiceAI.updateContext(newContext);
      expect(() => voiceAI.updateContext(newContext)).not.toThrow();
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      voiceAI = new VoiceAI(mockConfig);
    });

    it('should return current state', () => {
      const state = voiceAI.getState();
      
      expect(state).toHaveProperty('isListening');
      expect(state).toHaveProperty('isProcessing');
      expect(state).toHaveProperty('isAvailable');
      expect(typeof state.isListening).toBe('boolean');
      expect(typeof state.isProcessing).toBe('boolean');
      expect(typeof state.isAvailable).toBe('boolean');
    });

    it('should track listening state changes', async () => {
      const initialState = voiceAI.getState();
      expect(initialState.isListening).toBe(false);

      await voiceAI.startListening();
      const listeningState = voiceAI.getState();
      expect(listeningState.isListening).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      voiceAI = new VoiceAI(mockConfig);
    });

    it('should handle speech recognition errors', () => {
      const errorHandler = jest.fn();
      voiceAI = new VoiceAI(mockConfig, { onError: errorHandler });

      // Should not throw
      expect(() => mockSpeechRecognition.onerror?.({ error: 'network' })).not.toThrow();
    });

    it('should handle invalid input gracefully', async () => {
      const response = await voiceAI.processTextInput('');
      expect(response).toBeDefined();
      expect(typeof response.success).toBe('boolean');
    });
  });
});

// Test utility functions
describe('Utility Functions', () => {
  it('should export main VoiceAI class', () => {
    expect(VoiceAI).toBeDefined();
    expect(typeof VoiceAI).toBe('function');
  });
});

// Integration tests
describe('Integration Tests', () => {
  let mockConfig: VoiceAIConfig;

  beforeEach(() => {
    mockConfig = {
      speechToText: {
        provider: SpeechProvider.WEB_SPEECH,
        language: 'en-US',
      },
      textToSpeech: {
        provider: SpeechProvider.WEB_SPEECH,
        speed: 1.0,
      },
      aiProvider: {
        provider: AIProvider.OPENAI,
        model: 'gpt-3.5-turbo',
      },
      responseMode: ResponseMode.BOTH,
    };
  });

  it('should work end-to-end for basic workflow', async () => {
    const onCommand = jest.fn();
    const onResponse = jest.fn();
    
    const voiceAI = new VoiceAI(mockConfig, {
      onCommand,
      onResponse,
    });

    // Process a command
    const response = await voiceAI.processTextInput('help');
    
    expect(response.success).toBe(true);
    expect(onCommand).toHaveBeenCalled();
    
    // Check command structure
    const commandCall = onCommand.mock.calls[0][0];
    expect(commandCall).toHaveProperty('intent');
    expect(commandCall).toHaveProperty('rawText');
    expect(commandCall).toHaveProperty('timestamp');
  }, 10000);
});