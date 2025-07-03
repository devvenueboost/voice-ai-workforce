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

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock globals
Object.defineProperty(window, 'webkitSpeechRecognition', {
 writable: true,
 value: jest.fn(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'speechSynthesis', {
 writable: true,
 value: mockSpeechSynthesis,
});

describe('VoiceAI Core', () => {
 let voiceAI: VoiceAI;
 let mockConfig: VoiceAIConfig;

 beforeEach(() => {
   jest.clearAllMocks();
   (global.fetch as jest.Mock).mockClear();
   
   mockConfig = {
     aiProviders: {
       primary: {
         provider: AIProvider.OPENAI,
         apiKey: 'test-key',
         model: 'gpt-3.5-turbo',
       },
       fallbacks: [{
         provider: AIProvider.KEYWORDS,
         fallbackMode: true
       }],
       retryAttempts: 2,
       timeoutMs: 5000
     },
     speechToText: {
       provider: SpeechProvider.WEB_SPEECH,
       language: 'en-US',
       continuous: false,
     },
     textToSpeech: {
       provider: SpeechProvider.WEB_SPEECH,
       speed: 1.0,
     },
     responseMode: ResponseMode.BOTH,
     apiBaseUrl: 'https://api.test.com',
     apiKey: 'test-api-key',
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
       aiProviders: {
         primary: {
           provider: AIProvider.KEYWORDS,
           fallbackMode: true
         }
       },
       speechToText: {
         provider: SpeechProvider.WEB_SPEECH,
       },
       textToSpeech: {
         provider: SpeechProvider.WEB_SPEECH,
       },
     } as VoiceAIConfig;

     voiceAI = new VoiceAI(minimalConfig);
     const state = voiceAI.getState();
     
     expect(state.isListening).toBe(false);
     expect(state.isProcessing).toBe(false);
     expect(state.providerStatus).toBeDefined();
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

   it('should validate AI provider configs', () => {
     const invalidConfig = {
       ...mockConfig,
       aiProviders: {
         primary: {
           provider: AIProvider.OPENAI,
           // Missing apiKey
         }
       }
     } as VoiceAIConfig;

     // Should warn but not throw
     const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
     voiceAI = new VoiceAI(invalidConfig);
     
     expect(consoleSpy).toHaveBeenCalledWith(
       expect.stringContaining('OpenAI provider configured but no API key provided')
     );
     
     consoleSpy.mockRestore();
   });

   it('should initialize provider status correctly', () => {
     voiceAI = new VoiceAI(mockConfig);
     const state = voiceAI.getState();
     
     expect(state.providerStatus).toEqual({
       [AIProvider.OPENAI]: 'error',
       [AIProvider.ANTHROPIC]: 'error',
       [AIProvider.GOOGLE]: 'error',
       [AIProvider.KEYWORDS]: 'available'
     });
   });
 });

 describe('Voice Recognition', () => {
   beforeEach(() => {
     voiceAI = new VoiceAI(mockConfig);
   });

   it('should start listening when available', async () => {
     // Set state to available first
     voiceAI['updateState']({ isAvailable: true });
     
     await voiceAI.startListening();
     expect(mockSpeechRecognition.start).toHaveBeenCalled();
   });

   it('should stop listening when active', async () => {
     voiceAI['updateState']({ isAvailable: true, isListening: true });
     
     await voiceAI.stopListening();
     expect(mockSpeechRecognition.stop).toHaveBeenCalled();
   });

   it('should not start listening if already listening', async () => {
     voiceAI['updateState']({ isAvailable: true, isListening: true });
     
     await voiceAI.startListening();
     expect(mockSpeechRecognition.start).not.toHaveBeenCalled();
   });

   it('should handle speech recognition errors', () => {
     const onError = jest.fn();
     voiceAI = new VoiceAI(mockConfig, { onError });
     
     // Simulate error
     const error = { error: 'network' };
     if (mockSpeechRecognition.onerror) {
      // @ts-ignore
       mockSpeechRecognition.onerror(error);
     }
     
     expect(onError).toHaveBeenCalledWith(
       expect.objectContaining({
         code: 'SPEECH_RECOGNITION_ERROR'
       })
     );
   });
 });

 describe('Speech Synthesis', () => {
   beforeEach(() => {
     voiceAI = new VoiceAI(mockConfig);
   });

   it('should speak text when synthesis available', async () => {
     await voiceAI.speak('Hello world');
     expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
   });

   it('should not speak in text-only mode', async () => {
     voiceAI.updateConfig({ responseMode: ResponseMode.TEXT });
     await voiceAI.speak('Hello world');
     expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
   });

   it('should handle speech synthesis errors gracefully', async () => {
     mockSpeechSynthesis.speak.mockImplementation(() => {
       throw new Error('Speech synthesis failed');
     });

     await expect(voiceAI.speak('test')).resolves.not.toThrow();
   });
 });

 describe('Command Processing', () => {
   beforeEach(() => {
     voiceAI = new VoiceAI(mockConfig);
   });

   it('should process text input and return response', async () => {
     // Mock successful API response
     (global.fetch as jest.Mock).mockResolvedValueOnce({
       ok: true,
       json: async () => ({
         choices: [{
           message: {
             content: JSON.stringify({
               intent: 'help',
               entities: {},
               confidence: 0.9
             })
           }
         }]
       })
     });

     const response = await voiceAI.processTextInput('help');
     
     expect(response).toBeDefined();
     expect(response.success).toBe(true);
     expect(response.text).toBeDefined();
   });

   it('should fall back to keywords when AI providers fail', async () => {
     // Mock API failure
     (global.fetch as jest.Mock).mockRejectedValue(new Error('API failed'));

     const response = await voiceAI.processTextInput('help');
     
     expect(response).toBeDefined();
     expect(response.success).toBe(true);
   });

   it('should handle unknown commands gracefully', async () => {
     const response = await voiceAI.processTextInput('unknown command xyz');
     
     expect(response).toBeDefined();
     expect(response.success).toBe(false);
     expect(response.suggestions).toBeDefined();
   });

   it('should add commands to history', async () => {
     await voiceAI.processTextInput('test command');
     
     const state = voiceAI.getState();
     expect(state.commandHistory).toHaveLength(1);
     expect(state.commandHistory![0].rawText).toBe('test command');
   });

   it('should respect max history items', async () => {
     voiceAI.updateConfig({ 
       advanced: { maxHistoryItems: 2 } 
     });

     await voiceAI.processTextInput('command 1');
     await voiceAI.processTextInput('command 2');
     await voiceAI.processTextInput('command 3');
     
     const state = voiceAI.getState();
     expect(state.commandHistory).toHaveLength(2);
     expect(state.commandHistory![0].rawText).toBe('command 3');
   });
 });

 describe('AI Provider Handling', () => {
   beforeEach(() => {
     voiceAI = new VoiceAI(mockConfig);
   });

   it('should parse commands with OpenAI', async () => {
     (global.fetch as jest.Mock).mockResolvedValueOnce({
       ok: true,
       json: async () => ({
         choices: [{
           message: {
             content: JSON.stringify({
               intent: 'clock_in',
               entities: {},
               confidence: 0.9
             })
           }
         }]
       })
     });

     const response = await voiceAI.processTextInput('clock me in');
     
     expect(global.fetch).toHaveBeenCalledWith(
       'https://api.openai.com/v1/chat/completions',
       expect.objectContaining({
         method: 'POST',
         headers: expect.objectContaining({
           'Authorization': 'Bearer test-key'
         })
       })
     );
     
     expect(response.success).toBe(true);
   });

   it('should handle API timeouts', async () => {
     // Mock a delayed response
     (global.fetch as jest.Mock).mockImplementation(() => 
       new Promise(resolve => setTimeout(resolve, 6000))
     );

     const response = await voiceAI.processTextInput('test');
     
     // Should fall back to keywords
     expect(response).toBeDefined();
   });

   it('should update provider status on failures', async () => {
     (global.fetch as jest.Mock).mockRejectedValue(new Error('API failed'));

     await voiceAI.processTextInput('test');
     
     const state = voiceAI.getState();
     expect(state.providerStatus![AIProvider.OPENAI]).toBe('error');
   });

   it('should switch providers programmatically', async () => {
     const onProviderSwitch = jest.fn();
     voiceAI = new VoiceAI(mockConfig, { onProviderSwitch });
     
     await voiceAI.switchAIProvider(AIProvider.KEYWORDS);
     
     const state = voiceAI.getState();
     expect(state.activeProvider).toBe(AIProvider.KEYWORDS);
     expect(onProviderSwitch).toHaveBeenCalledWith(AIProvider.KEYWORDS);
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

   it('should reinitialize command registry when commands change', () => {
     const newCommands = [{
       id: 'test-cmd',
       name: 'Test Command',
       triggers: ['test'],
       intent: 'test'
     }];

     voiceAI.updateConfig({ 
       commands: { customCommands: newCommands } 
     });

     const registry = voiceAI.getCommandRegistry();
     expect(registry.commands.some(cmd => cmd.id === 'test-cmd')).toBe(true);
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
     expect(state).toHaveProperty('providerStatus');
     expect(typeof state.isListening).toBe('boolean');
     expect(typeof state.isProcessing).toBe('boolean');
     expect(typeof state.isAvailable).toBe('boolean');
   });

   it('should track listening state changes', async () => {
     const initialState = voiceAI.getState();
     expect(initialState.isListening).toBe(false);

     voiceAI['updateState']({ isAvailable: true });
     await voiceAI.startListening();
     
     const listeningState = voiceAI.getState();
     expect(listeningState.isListening).toBe(true);
   });

   it('should call onStateChange when state updates', () => {
     const onStateChange = jest.fn();
     voiceAI = new VoiceAI(mockConfig, { onStateChange });

     voiceAI['updateState']({ isListening: true });

     expect(onStateChange).toHaveBeenCalledWith(
       expect.objectContaining({ isListening: true })
     );
   });
 });

 describe('Error Handling', () => {
   beforeEach(() => {
     voiceAI = new VoiceAI(mockConfig);
   });

   it('should handle speech recognition errors', () => {
     const errorHandler = jest.fn();
     voiceAI = new VoiceAI(mockConfig, { onError: errorHandler });

     // Simulate speech recognition error
     if (mockSpeechRecognition.onerror) {
       // @ts-ignore
       mockSpeechRecognition.onerror({ error: 'network' });
     }

     expect(errorHandler).toHaveBeenCalledWith(
       expect.objectContaining({
         code: 'SPEECH_RECOGNITION_ERROR',
         message: 'Speech recognition error'
       })
     );
   });

   it('should handle invalid input gracefully', async () => {
     const response = await voiceAI.processTextInput('');
     expect(response).toBeDefined();
     expect(typeof response.success).toBe('boolean');
   });

   it('should handle API errors gracefully', async () => {
     (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

     const response = await voiceAI.processTextInput('test command');
     
     // Should fall back to keywords and still return a response
     expect(response).toBeDefined();
     expect(response.text).toBeDefined();
   });
 });

 describe('Keyword Parsing', () => {
   beforeEach(() => {
     voiceAI = new VoiceAI(mockConfig);
   });

   it('should parse basic commands with keywords', () => {
     const command = voiceAI['parseCommandWithKeywords']('clock in');
     
     expect(command.intent).toBe('clock_in');
     expect(command.confidence).toBeGreaterThan(0.5);
     expect(command.provider).toBe(AIProvider.KEYWORDS);
   });

   it('should handle unknown keywords', () => {
     const command = voiceAI['parseCommandWithKeywords']('unknown xyz command');
     
     expect(command.intent).toBe('unknown');
     expect(command.confidence).toBeLessThan(0.5);
   });

 });
});

// Test utility functions
describe('VoiceAI Utility Functions', () => {
 it('should export main VoiceAI class', () => {
   expect(VoiceAI).toBeDefined();
   expect(typeof VoiceAI).toBe('function');
 });

 it('should create instances with minimal config', () => {
   const minimalConfig: VoiceAIConfig = {
     aiProviders: {
       primary: {
         provider: AIProvider.KEYWORDS,
         fallbackMode: true
       }
     },
     speechToText: {
       provider: SpeechProvider.WEB_SPEECH
     },
     textToSpeech: {
       provider: SpeechProvider.WEB_SPEECH
     }
   };

   expect(() => new VoiceAI(minimalConfig)).not.toThrow();
 });
});