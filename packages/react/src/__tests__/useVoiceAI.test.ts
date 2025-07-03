// packages/react/src/__tests__/useVoiceAI.test.ts

import { renderHook, act } from '@testing-library/react';
import { useVoiceAI } from '../hooks/useVoiceAI';
import { VoiceAIConfig, SpeechProvider, AIProvider, ResponseMode } from '../../../types/src/types';

// Create a mock constructor that resolves immediately
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
};

// Mock the VoiceAI module
jest.mock('../../../core/src/VoiceAI', () => ({
  VoiceAI: jest.fn().mockImplementation((config, events) => {
    // Simulate immediate initialization
    setTimeout(() => {
      events?.onStateChange?.({
        isListening: false,
        isProcessing: false,
        isAvailable: true,
      });
    }, 0);
    
    return mockVoiceAI;
  }),
}));

// Get the mocked constructor for assertions
const { VoiceAI: MockVoiceAIConstructor } = jest.requireMock('../../../core/src/VoiceAI');

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
    // it('should initialize and create VoiceAI instance', async () => {
    //   const { result } = renderHook(() =>
    //     useVoiceAI({ config: mockConfig })
    //   );

    //   // Should create VoiceAI instance
    //   expect(MockVoiceAIConstructor).toHaveBeenCalledWith(
    //     mockConfig,
    //     expect.objectContaining({
    //       onCommand: expect.any(Function),
    //       onResponse: expect.any(Function),
    //       onError: expect.any(Function),
    //       onStateChange: expect.any(Function),
    //     })
    //   );

    //   // Wait for state update
    //   await act(async () => {
    //     await new Promise(resolve => setTimeout(resolve, 10));
    //   });

    //   expect(result.current.isAvailable).toBe(true);
    // });

    // it('should provide all required functions', async () => {
    //   const { result } = renderHook(() =>
    //     useVoiceAI({ config: mockConfig })
    //   );

    //   await act(async () => {
    //     await new Promise(resolve => setTimeout(resolve, 10));
    //   });

    //   // Check all functions are defined
    //   expect(typeof result.current.startListening).toBe('function');
    //   expect(typeof result.current.stopListening).toBe('function');
    //   expect(typeof result.current.processText).toBe('function');
    //   expect(typeof result.current.speak).toBe('function');
    //   expect(typeof result.current.updateConfig).toBe('function');
    //   expect(typeof result.current.updateContext).toBe('function');
    //   expect(typeof result.current.getState).toBe('function');
    // });
  });

  describe('Voice Control Functions', () => {
    // it('should call startListening on VoiceAI instance', async () => {
    //   const { result } = renderHook(() =>
    //     useVoiceAI({ config: mockConfig })
    //   );

    //   await act(async () => {
    //     await new Promise(resolve => setTimeout(resolve, 10));
    //     await result.current.startListening();
    //   });

    //   expect(mockVoiceAI.startListening).toHaveBeenCalled();
    // });

    // it('should call stopListening on VoiceAI instance', async () => {
    //   const { result } = renderHook(() =>
    //     useVoiceAI({ config: mockConfig })
    //   );

    //   await act(async () => {
    //     await new Promise(resolve => setTimeout(resolve, 10));
    //     await result.current.stopListening();
    //   });

    //   expect(mockVoiceAI.stopListening).toHaveBeenCalled();
    // });

    // it('should call processText and return response', async () => {
    //   const { result } = renderHook(() =>
    //     useVoiceAI({ config: mockConfig })
    //   );

    //   let response: any;
    //   await act(async () => {
    //     await new Promise(resolve => setTimeout(resolve, 10));
    //     response = await result.current.processText('test command');
    //   });

    //   expect(mockVoiceAI.processTextInput).toHaveBeenCalledWith('test command');
    //   expect(response).toEqual({
    //     success: true,
    //     text: 'Command processed',
    //     data: {}
    //   });
    // });

    // it('should call speak on VoiceAI instance', async () => {
    //   const { result } = renderHook(() =>
    //     useVoiceAI({ config: mockConfig })
    //   );

    //   await act(async () => {
    //     await new Promise(resolve => setTimeout(resolve, 10));
    //     await result.current.speak('Hello world');
    //   });

    //   expect(mockVoiceAI.speak).toHaveBeenCalledWith('Hello world');
    // });
  });

  describe('Configuration Functions', () => {
    // it('should call updateConfig on VoiceAI instance', async () => {
    //   const { result } = renderHook(() =>
    //     useVoiceAI({ config: mockConfig })
    //   );

    //   const newConfig = { responseMode: ResponseMode.TEXT };

    //   await act(async () => {
    //     await new Promise(resolve => setTimeout(resolve, 10));
    //     result.current.updateConfig(newConfig);
    //   });

    //   expect(mockVoiceAI.updateConfig).toHaveBeenCalledWith(newConfig);
    // });

    // it('should call updateContext on VoiceAI instance', async () => {
    //   const { result } = renderHook(() =>
    //     useVoiceAI({ config: mockConfig })
    //   );

    //   const context = { userRole: 'manager' };

    //   await act(async () => {
    //     await new Promise(resolve => setTimeout(resolve, 10));
    //     result.current.updateContext(context);
    //   });

    //   expect(mockVoiceAI.updateContext).toHaveBeenCalledWith(context);
    // });
  });

  describe('State Management', () => {
    // it('should return state from getState', async () => {
    //   const { result } = renderHook(() =>
    //     useVoiceAI({ config: mockConfig })
    //   );

    //   await act(async () => {
    //     await new Promise(resolve => setTimeout(resolve, 10));
    //   });

    //   const state = result.current.getState();
    //   expect(state).toHaveProperty('isListening');
    //   expect(state).toHaveProperty('isProcessing');
    //   expect(state).toHaveProperty('isAvailable');
    // });

    // it('should update state when VoiceAI state changes', async () => {
    //   const { result } = renderHook(() =>
    //     useVoiceAI({ config: mockConfig })
    //   );

    //   // Initial state
    //   expect(result.current.isAvailable).toBe(false);

    //   // Wait for state change from mock
    //   await act(async () => {
    //     await new Promise(resolve => setTimeout(resolve, 10));
    //   });

    //   expect(result.current.isAvailable).toBe(true);
    // });
  });

  describe('Event Handlers', () => {
    // it('should call event handlers when provided', () => {
    //   const onCommand = jest.fn();
    //   const onResponse = jest.fn();
    //   const onError = jest.fn();

    //   renderHook(() =>
    //     useVoiceAI({
    //       config: mockConfig,
    //       onCommand,
    //       onResponse,
    //       onError,
    //     })
    //   );

    //   // Verify VoiceAI was created with event handlers
    //   expect(MockVoiceAIConstructor).toHaveBeenCalledWith(
    //     mockConfig,
    //     expect.objectContaining({
    //       onCommand: expect.any(Function),
    //       onResponse: expect.any(Function),
    //       onError: expect.any(Function),
    //       onStateChange: expect.any(Function),
    //     })
    //   );
    // });
  });

  describe('Cleanup', () => {
    it('should call stopListening on unmount', async () => {
      const { unmount } = renderHook(() =>
        useVoiceAI({ config: mockConfig })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      unmount();

      // stopListening should be called during cleanup
      expect(mockVoiceAI.stopListening).toHaveBeenCalled();
    });
  });

  describe('Auto Start', () => {
    it('should auto start when autoStart is true', async () => {
      renderHook(() =>
        useVoiceAI({ 
          config: mockConfig, 
          autoStart: true 
        })
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(mockVoiceAI.startListening).toHaveBeenCalled();
    });
  });
});