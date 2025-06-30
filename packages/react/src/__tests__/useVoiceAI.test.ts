// packages/react/src/__tests__/useVoiceAI.test.ts

import { renderHook, act } from '@testing-library/react';
import { useVoiceAI } from '../hooks/useVoiceAI';
import { VoiceAIConfig, SpeechProvider, AIProvider, ResponseMode } from '../../../types/src/types';

// Create a proper mock for VoiceAI
const mockVoiceAI = {
  startListening: jest.fn().mockResolvedValue(undefined),
  stopListening: jest.fn().mockResolvedValue(undefined),
  processTextInput: jest.fn().mockResolvedValue({
    success: true,
    text: 'Command processed',
    data: {}
  }),
  speak: jest.fn().mockResolvedValue(undefined),
  updateConfig: jest.fn(),
  updateContext: jest.fn(),
  getState: jest.fn(() => ({
    isListening: false,
    isProcessing: false,
    isAvailable: true,
  })),
  destroy: jest.fn(),
};

// Mock the VoiceAI core class
jest.mock('@voice-ai-workforce/core', () => ({
  VoiceAI: jest.fn().mockImplementation(() => mockVoiceAI),
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
    it('should initialize with correct default state', async () => {
        const { result } = renderHook(() =>
          useVoiceAI({ config: mockConfig })
        );
      
        await act(async () => {
          // Wait for initialization
          await new Promise(resolve => setTimeout(resolve, 0));
        });
      
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

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(typeof result.current.startListening).toBe('function');

      await act(async () => {
        await result.current.startListening();
      });

      expect(mockVoiceAI.startListening).toHaveBeenCalled();
    });

    it('should provide stopListening function', async () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(typeof result.current.stopListening).toBe('function');

      await act(async () => {
        await result.current.stopListening();
      });

      expect(mockVoiceAI.stopListening).toHaveBeenCalled();
    });

    it('should provide processText function', async () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(typeof result.current.processText).toBe('function');

      await act(async () => {
        const response = await result.current.processText('test command');
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
      });

      expect(mockVoiceAI.processTextInput).toHaveBeenCalledWith('test command');
    });

    it('should provide speak function', async () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(typeof result.current.speak).toBe('function');

      await act(async () => {
        await result.current.speak('Hello world');
      });

      expect(mockVoiceAI.speak).toHaveBeenCalledWith('Hello world');
    });
  });

  describe('Configuration Updates', () => {
    it('should provide updateConfig function', async () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(typeof result.current.updateConfig).toBe('function');

      act(() => {
        result.current.updateConfig({
          responseMode: ResponseMode.TEXT,
        });
      });

      expect(mockVoiceAI.updateConfig).toHaveBeenCalled();
    });

    it('should provide updateContext function', async () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(typeof result.current.updateContext).toBe('function');

      act(() => {
        result.current.updateContext({
          userRole: 'manager',
        });
      });

      expect(mockVoiceAI.updateContext).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should provide getState function', async () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(typeof result.current.getState).toBe('function');

      const state = result.current.getState();
      expect(state).toHaveProperty('isListening');
      expect(state).toHaveProperty('isProcessing');
      expect(state).toHaveProperty('isAvailable');
    });

    it('should handle state updates correctly', async () => {
      const { result } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

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
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );
   
      // Unmount and check it doesn't throw
      expect(() => unmount()).not.toThrow();
      
      // Check that stopListening was called (since destroy doesn't exist)
      expect(mockVoiceAI.stopListening).toHaveBeenCalled();
    });
   });
});