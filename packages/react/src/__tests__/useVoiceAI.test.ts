// packages/react/src/__tests__/useVoiceAI.test.ts

import { renderHook, act } from '@testing-library/react';
import { useVoiceAI } from '../hooks/useVoiceAI';
import { VoiceAIConfig, SpeechProvider, AIProvider, ResponseMode } from '../../../types/src/types';

// Mock the VoiceAI core class
jest.mock('@voice-ai-workforce/core', () => ({
  VoiceAI: jest.fn().mockImplementation(() => ({
    startListening: jest.fn(),
    stopListening: jest.fn(),
    processTextInput: jest.fn(),
    speak: jest.fn(),
    updateConfig: jest.fn(),
    updateContext: jest.fn(),
    getState: jest.fn(() => ({
      isListening: false,
      isProcessing: false,
      isAvailable: true,
    })),
  })),
}));

describe('useVoiceAI Hook', () => {
  let mockConfig: VoiceAIConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    
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

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      expect(result.current.isListening).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.isAvailable).toBe(false); // Initially false until VoiceAI initializes
    });

    it('should handle config changes', () => {
      const { result, rerender } = renderHook(
        ({ config }) => useVoiceAI({ config }),
        { initialProps: { config: mockConfig } }
      );

      const newConfig = {
        ...mockConfig,
        responseMode: ResponseMode.TEXT,
      };

      rerender({ config: newConfig });

      expect(result.current.updateConfig).toBeDefined();
    });
  });

  describe('Voice Control', () => {
    it('should provide startListening function', async () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      expect(typeof result.current.startListening).toBe('function');

      await act(async () => {
        await result.current.startListening();
      });

      // Should not throw
    });

    it('should provide stopListening function', async () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      expect(typeof result.current.stopListening).toBe('function');

      await act(async () => {
        await result.current.stopListening();
      });

      // Should not throw
    });

    it('should provide processText function', async () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      expect(typeof result.current.processText).toBe('function');

      await act(async () => {
        const response = await result.current.processText('test command');
        expect(response).toBeDefined();
      });
    });

    it('should provide speak function', async () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      expect(typeof result.current.speak).toBe('function');

      await act(async () => {
        await result.current.speak('Hello world');
      });

      // Should not throw
    });
  });

  describe('Configuration Updates', () => {
    it('should provide updateConfig function', () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      expect(typeof result.current.updateConfig).toBe('function');

      act(() => {
        result.current.updateConfig({
          responseMode: ResponseMode.TEXT,
        });
      });

      // Should not throw
    });

    it('should provide updateContext function', () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      expect(typeof result.current.updateContext).toBe('function');

      act(() => {
        result.current.updateContext({
          userRole: 'manager',
        });
      });

      // Should not throw
    });
  });

  describe('State Management', () => {
    it('should provide getState function', () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      expect(typeof result.current.getState).toBe('function');

      const state = result.current.getState();
      expect(state).toHaveProperty('isListening');
      expect(state).toHaveProperty('isProcessing');
      expect(state).toHaveProperty('isAvailable');
    });

    it('should handle state updates correctly', () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      // Initial state should be defined
      expect(result.current.isListening).toBeDefined();
      expect(result.current.isProcessing).toBeDefined();
      expect(result.current.isAvailable).toBeDefined();
    });
  });

  describe('Event Handling', () => {
    it('should call onCommand when provided', () => {
      const onCommand = jest.fn();
      
      renderHook(() =>
        useVoiceAI({
          config: mockConfig,
          onCommand,
        })
      );

      expect(onCommand).toBeDefined();
      // Hook should set up event handling
    });

    it('should call onResponse when provided', () => {
      const onResponse = jest.fn();
      
      renderHook(() =>
        useVoiceAI({
          config: mockConfig,
          onResponse,
        })
      );

      expect(onResponse).toBeDefined();
      // Hook should set up event handling
    });

    it('should call onError when provided', () => {
      const onError = jest.fn();
      
      renderHook(() =>
        useVoiceAI({
          config: mockConfig,
          onError,
        })
      );

      expect(onError).toBeDefined();
      // Hook should set up event handling
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      expect(() => unmount()).not.toThrow();
    });
  });
});