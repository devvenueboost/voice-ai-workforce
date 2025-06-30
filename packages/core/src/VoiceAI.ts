// packages/core/src/VoiceAI.ts

import { 
    VoiceAIConfig, 
    VoiceCommand, 
    VoiceResponse, 
    VoiceAIState, 
    VoiceAIEvents,
    VoiceAIError,
    SpeechProvider,
    AIProvider,
    ResponseMode,
    ActionType 
  } from '../../types/src/types';
  
  export class VoiceAI {
    private config: VoiceAIConfig;
    private state: VoiceAIState;
    private speechRecognition: any;
    private speechSynthesis!: SpeechSynthesis;
    private eventListeners: Partial<VoiceAIEvents> = {};
  
    constructor(config: VoiceAIConfig, events?: Partial<VoiceAIEvents>) {
      this.config = this.mergeWithDefaults(config);
      this.eventListeners = events || {};
      this.state = {
        isListening: false,
        isProcessing: false,
        isAvailable: false
      };
  
      this.initialize();
    }
  
    // Merge user config with sensible defaults
private mergeWithDefaults(config: VoiceAIConfig): VoiceAIConfig {
    const envApiKey = typeof process !== 'undefined' ? process.env?.VOICE_AI_API_KEY : undefined;
    const envBaseUrl = typeof process !== 'undefined' ? process.env?.VOICE_AI_API_URL : undefined;
  
    return {
      // Use environment variables as fallback (Option 1 + 2 approach)
      apiBaseUrl: config.apiBaseUrl || envBaseUrl,
      apiKey: config.apiKey || envApiKey,
      
      speechToText: {
        ...{
          provider: SpeechProvider.WEB_SPEECH,
          language: 'en-US',
          continuous: false
        },
        ...config.speechToText
      },
      
      textToSpeech: {
        ...{
          provider: SpeechProvider.WEB_SPEECH,
          speed: 1.0
        },
        ...config.textToSpeech
      },
      
      aiProvider: {
        ...{
          provider: AIProvider.OPENAI,
          model: 'gpt-3.5-turbo'
        },
        ...config.aiProvider
      },
      
      wakeWord: config.wakeWord,
      autoListen: config.autoListen || false,
      responseMode: config.responseMode || ResponseMode.BOTH,
      context: config.context || {}
    };
  }
    // Initialize speech services
    private async initialize(): Promise<void> {
      try {
        await this.initializeSpeechRecognition();
        await this.initializeSpeechSynthesis();
        
        this.updateState({ isAvailable: true });
        
        if (this.config.autoListen) {
          await this.startListening();
        }
      } catch (error) {
        this.handleError({
          code: 'INITIALIZATION_FAILED',
          message: 'Failed to initialize voice services',
          details: error
        });
      }
    }
  
    // Setup speech recognition
    private async initializeSpeechRecognition(): Promise<void> {
      if (this.config.speechToText.provider === SpeechProvider.WEB_SPEECH) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          throw new Error('Speech recognition not supported in this browser');
        }
  
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        this.speechRecognition = new SpeechRecognition();
        
        this.speechRecognition.continuous = this.config.speechToText.continuous;
        this.speechRecognition.lang = this.config.speechToText.language;
        this.speechRecognition.interimResults = false;
        
        // Setup event handlers
        this.speechRecognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          this.handleSpeechResult(transcript);
        };
        
        this.speechRecognition.onerror = (event: any) => {
          this.handleError({
            code: 'SPEECH_RECOGNITION_ERROR',
            message: 'Speech recognition error',
            details: event.error
          });
        };
        
        this.speechRecognition.onend = () => {
          this.updateState({ isListening: false });
        };
      }
    }
  
    // Setup speech synthesis
    private async initializeSpeechSynthesis(): Promise<void> {
      if (this.config.textToSpeech.provider === SpeechProvider.WEB_SPEECH) {
        if (!('speechSynthesis' in window)) {
          throw new Error('Speech synthesis not supported in this browser');
        }
        
        this.speechSynthesis = window.speechSynthesis;
      }
    }
  
    // Public API Methods
    
    async startListening(): Promise<void> {
      if (!this.state.isAvailable || this.state.isListening) {
        return;
      }
  
      try {
        this.updateState({ isListening: true });
        
        if (this.speechRecognition) {
          this.speechRecognition.start();
        }
      } catch (error) {
        this.updateState({ isListening: false });
        this.handleError({
          code: 'START_LISTENING_FAILED',
          message: 'Failed to start listening',
          details: error
        });
      }
    }
  
    async stopListening(): Promise<void> {
      if (!this.state.isListening) {
        return;
      }
  
      try {
        if (this.speechRecognition) {
          this.speechRecognition.stop();
        }
        this.updateState({ isListening: false });
      } catch (error) {
        this.handleError({
          code: 'STOP_LISTENING_FAILED',
          message: 'Failed to stop listening',
          details: error
        });
      }
    }
  
    async processTextInput(text: string): Promise<VoiceResponse> {
      return this.handleSpeechResult(text);
    }
  
    async speak(text: string): Promise<void> {
      if (this.config.responseMode === ResponseMode.TEXT) {
        return; // Skip speaking in text-only mode
      }
  
      try {
        if (this.config.textToSpeech.provider === SpeechProvider.WEB_SPEECH) {
          await this.speakWithWebSpeech(text);
        }
        // Add other TTS providers here later
      } catch (error) {
        this.handleError({
          code: 'SPEECH_SYNTHESIS_FAILED',
          message: 'Failed to speak text',
          details: error
        });
      }
    }
  
    // Process speech input
    private async handleSpeechResult(transcript: string): Promise<VoiceResponse> {
      try {
        this.updateState({ isProcessing: true });
  
        // Parse the command using AI
        const command = await this.parseCommand(transcript);
        
        // Notify listeners
        this.eventListeners.onCommand?.(command);
        
        // Generate response
        const response = await this.generateResponse(command);
        
        // Execute any actions
        if (response.actions) {
          await this.executeActions(response.actions);
        }
        
        // Speak response if needed
        if (this.config.responseMode !== ResponseMode.TEXT) {
          await this.speak(response.text);
        }
        
        // Notify listeners
        this.eventListeners.onResponse?.(response);
        
        this.updateState({ 
          isProcessing: false,
          currentCommand: command,
          lastResponse: response
        });
        
        return response;
      } catch (error) {
        this.updateState({ isProcessing: false });
        
        const errorResponse: VoiceResponse = {
          text: "I'm sorry, I didn't understand that. Could you try again?",
          success: false,
          data: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
        
        this.handleError({
          code: 'PROCESSING_FAILED',
          message: 'Failed to process voice input',
          details: error
        });
        
        return errorResponse;
      }
    }
  
    // Parse user input into structured command
    private async parseCommand(transcript: string): Promise<VoiceCommand> {
      // Simple keyword-based parsing for now
      // Later this can be enhanced with proper AI
      
      const entities: Record<string, any> = {};
      let intent = 'unknown';
      
      // Basic intent detection
      const lowerText = transcript.toLowerCase();
      
      if (lowerText.includes('clock in') || lowerText.includes('start work')) {
        intent = 'clock_in';
      } else if (lowerText.includes('clock out') || lowerText.includes('end work')) {
        intent = 'clock_out';
      } else if (lowerText.includes('complete') || lowerText.includes('done')) {
        intent = 'complete_task';
        // Extract task name
        const taskMatch = lowerText.match(/complete (.+)|mark (.+) (as )?complete|(.+) is done/);
        if (taskMatch) {
          entities.taskName = taskMatch[1] || taskMatch[2] || taskMatch[4];
        }
      } else if (lowerText.includes('status') || lowerText.includes('progress')) {
        intent = 'get_status';
      } else if (lowerText.includes('help')) {
        intent = 'help';
      }
  
      return {
        intent,
        entities,
        confidence: intent === 'unknown' ? 0.3 : 0.8,
        rawText: transcript,
        timestamp: new Date()
      };
    }
  
    // Generate response for command
    private async generateResponse(command: VoiceCommand): Promise<VoiceResponse> {
      // Handle built-in commands
      switch (command.intent) {
        case 'help':
          return {
            text: "I can help you with: clock in, clock out, complete tasks, check status, and more. Just speak naturally!",
            success: true
          };
          
        case 'clock_in':
          return {
            text: "I'll clock you in now.",
            success: true,
            actions: [
              {
                type: ActionType.API_CALL,
                payload: {
                  endpoint: '/api/timesheet/clock-in',
                  method: 'POST',
                  data: { timestamp: new Date() }
                }
              }
            ]
          };
          
        case 'clock_out':
          return {
            text: "I'll clock you out now. Great work today!",
            success: true,
            actions: [
              {
                type: ActionType.API_CALL,
                payload: {
                  endpoint: '/api/timesheet/clock-out',
                  method: 'POST',
                  data: { timestamp: new Date() }
                }
              }
            ]
          };
          
          case 'complete_task': {
            const taskName = command.entities.taskName || 'current task';
            return {
              text: `I'll mark "${taskName}" as complete.`,
              success: true,
              actions: [
                {
                  type: ActionType.API_CALL,
                  payload: {
                    endpoint: '/api/tasks/complete',
                    method: 'PUT',
                    data: { taskName }
                  }
                }
              ]
            };
          }
          
        case 'get_status':
          return {
            text: "Let me check your current status.",
            success: true,
            actions: [
              {
                type: ActionType.API_CALL,
                payload: {
                  endpoint: '/api/status',
                  method: 'GET'
                }
              }
            ]
          };
          
        default:
          return {
            text: "I'm not sure how to help with that. Try saying 'help' to see what I can do.",
            success: false
          };
      }
    }
  
    // Execute actions from response
    private async executeActions(actions: any[]): Promise<void> {
      for (const action of actions) {
        try {
          if (action.type === ActionType.API_CALL && this.config.apiBaseUrl) {
            await this.makeApiCall(action.payload);
          }
        } catch (error) {
          console.error('Action execution failed:', action, error);
        }
      }
    }
  
    // Make API call
    private async makeApiCall(payload: any): Promise<any> {
      if (!this.config.apiBaseUrl) {
        throw new Error('API base URL not configured');
      }
  
      const url = `${this.config.apiBaseUrl}${payload.endpoint}`;
      const options: RequestInit = {
        method: payload.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      };
  
      if (payload.data && payload.method !== 'GET') {
        options.body = JSON.stringify(payload.data);
      }
  
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }
  
      return response.json();
    }
  
    // Web Speech synthesis
    private async speakWithWebSpeech(text: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.rate = this.config.textToSpeech.speed || 1.0;
        if (this.config.textToSpeech.voice) {
          const voices = this.speechSynthesis.getVoices();
          const voice = voices.find(v => v.name === this.config.textToSpeech.voice);
          if (voice) utterance.voice = voice;
        }
        
        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(event.error);
        
        this.speechSynthesis.speak(utterance);
      });
    }
  
    // Update state and notify listeners
    private updateState(newState: Partial<VoiceAIState>): void {
      this.state = { ...this.state, ...newState };
      this.eventListeners.onStateChange?.(this.state);
    }
  
    // Handle errors
    private handleError(error: VoiceAIError): void {
      this.updateState({ error: error.message });
      this.eventListeners.onError?.(error);
    }
  
    // Public getters
    getState(): VoiceAIState {
      return { ...this.state };
    }
  
    updateConfig(newConfig: Partial<VoiceAIConfig>): void {
      this.config = { ...this.config, ...newConfig };
    }
  
    updateContext(context: Record<string, any>): void {
      this.config.context = { ...this.config.context, ...context };
    }
  }