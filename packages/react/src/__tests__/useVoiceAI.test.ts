// packages/react/src/__tests__/useVoiceAI.test.ts - FIXED

import { renderHook, act } from '@testing-library/react';
import { useVoiceAI } from '../hooks/useVoiceAI';
import { VoiceAIConfig, SpeechProvider, AIProvider, ResponseMode, VoiceInterfaceMode } from '../../../types/src/types';

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
   activeProvider: AIProvider.OPENAI,
   providerStatus: {
     [AIProvider.OPENAI]: 'available',
     [AIProvider.ANTHROPIC]: 'error',
     [AIProvider.GOOGLE]: 'error',
     [AIProvider.KEYWORDS]: 'available'
   },
   commandHistory: [],
   suggestedCommands: []
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
       activeProvider: AIProvider.OPENAI,
       providerStatus: {
         [AIProvider.OPENAI]: 'available',
         [AIProvider.ANTHROPIC]: 'error',
         [AIProvider.GOOGLE]: 'error',
         [AIProvider.KEYWORDS]: 'available'
       },
       commandHistory: [],
       suggestedCommands: []
     });
   }, 0);
   
   return mockVoiceAI;
 }),
}));

// Mock the useVoiceVisibility hook - FIXED to use correct import path
jest.mock('../hooks/useVoiceVisibility', () => ({
 useVoiceVisibility: jest.fn(() => ({
   visibility: {
     showProviders: true,
     showProviderStatus: true,
     showDebugInfo: true,
     showConfidenceScores: true,
     showTechnicalErrors: true,
     showAdvancedSettings: true,
     showCommandHistory: true,
     showMiniCenter: true,
     showStatusIndicator: true,
     useGenericLabels: false
   },
   labels: {
     voiceButton: {
       startText: 'Start Listening',
       stopText: 'Stop Listening',
       processingText: 'Processing voice...',
       errorText: 'Voice error'
     },
     status: {
       online: 'Online',
       offline: 'Offline',
       listening: 'Listening',
       processing: 'Processing',
       error: 'Error'
     },
     providers: {
       generic: 'AI Provider',
       fallback: 'Keywords'
     },
     errors: {
       generic: 'An error occurred',
       connection: 'Connection failed',
       permission: 'Permission denied'
     }
   }
 }))
}));

// Get the mocked constructor for assertions
const { VoiceAI: MockVoiceAIConstructor } = jest.requireMock('../../../core/src/VoiceAI');
const { useVoiceVisibility: mockUseVoiceVisibility } = jest.requireMock('../hooks/useVoiceVisibility');

describe('useVoiceAI Hook', () => {
 let mockConfig: VoiceAIConfig;

 beforeEach(() => {
   jest.clearAllMocks();
   
   mockConfig = {
     aiProviders: {
       primary: {
         provider: AIProvider.OPENAI,
         apiKey: 'test-key',
         model: 'gpt-3.5-turbo'
       },
       fallbacks: [{
         provider: AIProvider.KEYWORDS,
         fallbackMode: true
       }]
     },
     speechToText: {
       provider: SpeechProvider.WEB_SPEECH,
       language: 'en-US',
     },
     textToSpeech: {
       provider: SpeechProvider.WEB_SPEECH,
       speed: 1.0,
     },
     responseMode: ResponseMode.BOTH,
     interfaceMode: 'developer' as VoiceInterfaceMode
   };

   // Reset the mock to return default values
   mockUseVoiceVisibility.mockReturnValue({
     visibility: {
       showProviders: true,
       showProviderStatus: true,
       showDebugInfo: true,
       showConfidenceScores: true,
       showTechnicalErrors: true,
       showAdvancedSettings: true,
       showCommandHistory: true,
       showMiniCenter: true,
       showStatusIndicator: true,
       useGenericLabels: false
     },
     labels: {
       voiceButton: {
         startText: 'Start Listening',
         stopText: 'Stop Listening',
         processingText: 'Processing voice...',
         errorText: 'Voice error'
       },
       status: {
         online: 'Online',
         offline: 'Offline',
         listening: 'Listening',
         processing: 'Processing',
         error: 'Error'
       },
       providers: {
         generic: 'AI Provider',
         fallback: 'Keywords'
       },
       errors: {
         generic: 'An error occurred',
         connection: 'Connection failed',
         permission: 'Permission denied'
       }
     }
   });
 });

 describe('Initialization', () => {
   it('should initialize and create VoiceAI instance', async () => {
     const { result } = renderHook(() =>
       useVoiceAI({ config: mockConfig })
     );

     // Should call useVoiceVisibility hook
     expect(mockUseVoiceVisibility).toHaveBeenCalledWith(
       mockConfig,
       undefined, // no component mode
       undefined  // no overrides
     );

     // Should create VoiceAI instance with mode-aware config
     expect(MockVoiceAIConstructor).toHaveBeenCalledWith(
       expect.objectContaining({
         ...mockConfig,
         interfaceMode: 'developer',
         visibility: expect.objectContaining({
           showProviders: true,
           showDebugInfo: true,
           customLabels: expect.any(Object)
         })
       }),
       expect.objectContaining({
         onCommand: expect.any(Function),
         onResponse: expect.any(Function),
         onError: expect.any(Function),
         onStateChange: expect.any(Function),
       })
     );

     // Wait for state update
     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
     });

     expect(result.current.isAvailable).toBe(true);
     expect(result.current.visibility).toBeDefined();
     expect(result.current.labels).toBeDefined();
   });

   it('should provide all required functions and properties', async () => {
     const { result } = renderHook(() =>
       useVoiceAI({ config: mockConfig })
     );

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
     });

     // Check all functions are defined
     expect(typeof result.current.startListening).toBe('function');
     expect(typeof result.current.stopListening).toBe('function');
     expect(typeof result.current.processText).toBe('function');
     expect(typeof result.current.speak).toBe('function');
     expect(typeof result.current.updateConfig).toBe('function');
     expect(typeof result.current.updateContext).toBe('function');
     expect(typeof result.current.getState).toBe('function');
     
     // Check mode-aware properties
     expect(result.current.visibility).toBeDefined();
     expect(result.current.labels).toBeDefined();
   });

   it('should handle component mode override', async () => {
     const { result } = renderHook(() =>
       useVoiceAI({ 
         config: mockConfig,
         mode: 'end-user' 
       })
     );

     // Should call useVoiceVisibility with component mode
     expect(mockUseVoiceVisibility).toHaveBeenCalledWith(
       mockConfig,
       'end-user', // component mode override
       undefined   // no overrides
     );

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
     });

     expect(result.current.visibility).toBeDefined();
     expect(result.current.labels).toBeDefined();
   });

   it('should handle visibility overrides', async () => {
     const visibilityOverrides = { showDebugInfo: false };
     
     const { result } = renderHook(() =>
       useVoiceAI({ 
         config: mockConfig,
         visibilityOverrides 
       })
     );

     // Should call useVoiceVisibility with overrides
     expect(mockUseVoiceVisibility).toHaveBeenCalledWith(
       mockConfig,
       undefined,           // no component mode
       visibilityOverrides  // visibility overrides
     );

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
     });

     expect(result.current.visibility).toBeDefined();
   });
 });

 describe('Mode-Aware Error Handling', () => {
   it('should filter errors based on visibility settings', async () => {
     // Mock visibility to hide technical errors
     mockUseVoiceVisibility.mockReturnValue({
       visibility: {
         showTechnicalErrors: false,
         showProviders: false,
         showDebugInfo: false,
         showConfidenceScores: false,
         showAdvancedSettings: false,
         showCommandHistory: true,
         showMiniCenter: true,
         showStatusIndicator: true,
         useGenericLabels: true
       },
       labels: {
         voiceButton: {
           startText: 'Start Voice',
           stopText: 'Stop Voice',
           processingText: 'Processing...',
           errorText: 'Voice Unavailable'
         },
         status: {
           online: 'Voice Ready',
           offline: 'Voice Unavailable',
           listening: 'Listening...',
           processing: 'Processing...',
           error: 'Voice Error'
         },
         providers: {
           generic: 'Voice Assistant',
           fallback: 'Voice Assistant'
         },
         errors: {
           generic: 'Voice assistant is temporarily unavailable',
           connection: 'Please check your connection',
           permission: 'Microphone permission required'
         }
       }
     });

     const onError = jest.fn();
     
     const { result } = renderHook(() =>
       useVoiceAI({ 
         config: mockConfig,
         mode: 'end-user',
         onError 
       })
     );

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
     });

     // Get the event handlers that were passed to VoiceAI
     const voiceAICall = MockVoiceAIConstructor.mock.calls[0];
     const eventHandlers = voiceAICall[1];

     // Simulate an error from VoiceAI
     const mockError = {
       code: 'TECHNICAL_ERROR',
       message: 'Complex technical error with stack trace',
       details: { stack: 'Error stack trace...' }
     };

     act(() => {
       eventHandlers.onError(mockError);
     });

     // Should call onError with filtered error (generic message)
     expect(onError).toHaveBeenCalledWith({
       code: 'TECHNICAL_ERROR',
       message: 'Voice assistant is temporarily unavailable',
       details: undefined // Technical details should be filtered out
     });
   });

   it('should preserve technical errors when visibility allows', async () => {
     // Mock visibility to show technical errors
     mockUseVoiceVisibility.mockReturnValue({
       visibility: {
         showTechnicalErrors: true,
         showProviders: true,
         showDebugInfo: true,
         showConfidenceScores: true,
         showAdvancedSettings: true,
         showCommandHistory: true,
         showMiniCenter: true,
         showStatusIndicator: true,
         useGenericLabels: false
       },
       labels: {
         voiceButton: {
           startText: 'Start Listening',
           stopText: 'Stop Listening',
           processingText: 'Processing voice...',
           errorText: 'Voice error'
         },
         status: {
           online: 'Online',
           offline: 'Offline',
           listening: 'Listening',
           processing: 'Processing',
           error: 'Error'
         },
         providers: {
           generic: 'AI Provider',
           fallback: 'Keywords'
         },
         errors: {
           generic: 'An error occurred',
           connection: 'Connection failed',
           permission: 'Permission denied'
         }
       }
     });

     const onError = jest.fn();
     
     const { result } = renderHook(() =>
       useVoiceAI({ 
         config: mockConfig,
         mode: 'developer',
         onError 
       })
     );

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
     });

     // Get the event handlers
     const voiceAICall = MockVoiceAIConstructor.mock.calls[0];
     const eventHandlers = voiceAICall[1];

     // Simulate an error from VoiceAI
     const mockError = {
       code: 'TECHNICAL_ERROR',
       message: 'Complex technical error with stack trace',
       details: { stack: 'Error stack trace...' }
     };

     act(() => {
       eventHandlers.onError(mockError);
     });

     // Should call onError with full error details
     expect(onError).toHaveBeenCalledWith(mockError);
   });
 });

 describe('Voice Control Functions', () => {
   it('should call startListening on VoiceAI instance', async () => {
     const { result } = renderHook(() =>
       useVoiceAI({ config: mockConfig })
     );

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
       await result.current.startListening();
     });

     expect(mockVoiceAI.startListening).toHaveBeenCalled();
   });

   it('should call stopListening on VoiceAI instance', async () => {
     const { result } = renderHook(() =>
       useVoiceAI({ config: mockConfig })
     );

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
       await result.current.stopListening();
     });

     expect(mockVoiceAI.stopListening).toHaveBeenCalled();
   });

   it('should call processText and return filtered response', async () => {
     const { result } = renderHook(() =>
       useVoiceAI({ config: mockConfig })
     );

     let response: any;
     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
       response = await result.current.processText('test command');
     });

     expect(mockVoiceAI.processTextInput).toHaveBeenCalledWith('test command');
     expect(response).toEqual({
       success: true,
       text: 'Command processed',
       data: {}
     });
   });

   it('should call speak on VoiceAI instance', async () => {
     const { result } = renderHook(() =>
       useVoiceAI({ config: mockConfig })
     );

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
       await result.current.speak('Hello world');
     });

     expect(mockVoiceAI.speak).toHaveBeenCalledWith('Hello world');
   });
 });

 describe('Configuration Functions', () => {
   it('should call updateConfig with mode-aware config on VoiceAI instance', async () => {
     const { result } = renderHook(() =>
       useVoiceAI({ config: mockConfig, mode: 'project' })
     );

     const newConfig = { responseMode: ResponseMode.TEXT };

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
       result.current.updateConfig(newConfig);
     });

     expect(mockVoiceAI.updateConfig).toHaveBeenCalledWith(
       expect.objectContaining({
         ...newConfig,
         interfaceMode: 'project',
         visibility: expect.any(Object)
       })
     );
   });

   it('should call updateContext on VoiceAI instance', async () => {
     const { result } = renderHook(() =>
       useVoiceAI({ config: mockConfig })
     );

     const context = { userRole: 'manager' };

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
       result.current.updateContext(context);
     });

     expect(mockVoiceAI.updateContext).toHaveBeenCalledWith(context);
   });

   it('should filter context in end-user mode', async () => {
     // Mock end-user mode visibility
     mockUseVoiceVisibility.mockReturnValue({
       visibility: {
         showDebugInfo: false,
         showProviders: false,
         showTechnicalErrors: false,
         showAdvancedSettings: false,
         showCommandHistory: true,
         showMiniCenter: true,
         useGenericLabels: true
       },
       labels: {
         voiceButton: { startText: 'Start Voice' },
         status: { online: 'Voice Ready' },
         providers: { generic: 'Voice Assistant' },
         errors: { generic: 'Voice unavailable' }
       }
     });

     const { result } = renderHook(() =>
       useVoiceAI({ config: mockConfig, mode: 'end-user' })
     );

     const context = { 
       userRole: 'manager',
       debug_info: 'should be filtered',
       internal_data: 'should be filtered',
       public_data: 'should remain'
     };

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
       result.current.updateContext(context);
     });

     // Should filter out debug_ and internal_ prefixed properties
     expect(mockVoiceAI.updateContext).toHaveBeenCalledWith({
       userRole: 'manager',
       public_data: 'should remain'
     });
   });
 });

 describe('State Management', () => {
   it('should return filtered state from getState', async () => {
     const { result } = renderHook(() =>
       useVoiceAI({ config: mockConfig })
     );

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
     });

     const state = result.current.getState();
     expect(state).toHaveProperty('isListening');
     expect(state).toHaveProperty('isProcessing');
     expect(state).toHaveProperty('isAvailable');
     expect(state).toHaveProperty('activeProvider'); // Should be visible in developer mode
   });

   it('should filter state in end-user mode', async () => {
     // Mock end-user mode visibility
     mockUseVoiceVisibility.mockReturnValue({
       visibility: {
         showProviders: false,
         showProviderStatus: false,
         showDebugInfo: false,
         showAdvancedSettings: false,
         showCommandHistory: true
       },
       labels: {
         voiceButton: { startText: 'Start Voice' },
         status: { online: 'Voice Ready' },
         providers: { generic: 'Voice Assistant' },
         errors: { generic: 'Voice unavailable' }
       }
     });

     const { result } = renderHook(() =>
       useVoiceAI({ config: mockConfig, mode: 'end-user' })
     );

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
     });

     const state = result.current.getState();
     expect(state.activeProvider).toBeUndefined(); // Should be filtered out
     expect(state.providerStatus).toBeUndefined(); // Should be filtered out
     expect(state.commandHistory).toBeDefined(); // Should remain (allowed in end-user)
   });
 });

 describe('Event Handlers', () => {
   it('should call event handlers when provided', () => {
     const onCommand = jest.fn();
     const onResponse = jest.fn();
     const onError = jest.fn();

     renderHook(() =>
       useVoiceAI({
         config: mockConfig,
         onCommand,
         onResponse,
         onError,
       })
     );

     // Verify VoiceAI was created with event handlers
     expect(MockVoiceAIConstructor).toHaveBeenCalledWith(
       expect.any(Object),
       expect.objectContaining({
         onCommand: expect.any(Function),
         onResponse: expect.any(Function),
         onError: expect.any(Function),
         onStateChange: expect.any(Function),
       })
     );
   });
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

   it('should not auto start when mini center is disabled', async () => {
     // Mock visibility with mini center disabled
     mockUseVoiceVisibility.mockReturnValue({
       visibility: {
         showMiniCenter: false,
         showProviders: false,
         showDebugInfo: false
       },
       labels: {
         voiceButton: { startText: 'Start Voice' },
         status: { online: 'Voice Ready' },
         providers: { generic: 'Voice Assistant' },
         errors: { generic: 'Voice unavailable' }
       }
     });

     renderHook(() =>
       useVoiceAI({ 
         config: mockConfig, 
         autoStart: true,
         mode: 'end-user'
       })
     );

     await act(async () => {
       await new Promise(resolve => setTimeout(resolve, 10));
     });

     // Should not auto-start when mini center is disabled
     expect(mockVoiceAI.startListening).not.toHaveBeenCalled();
   });
 });
});