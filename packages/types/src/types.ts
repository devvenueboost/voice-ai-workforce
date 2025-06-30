// packages/types/src/types.ts

// Core configuration for voice AI
export interface VoiceAIConfig {
    // API Configuration (Option 1 + 2 approach)
    apiBaseUrl?: string;
    apiKey?: string;
    
    // Speech Services
    speechToText: {
      provider: SpeechProvider;
      language?: string;
      continuous?: boolean;
    };
    
    textToSpeech: {
      provider: SpeechProvider;
      voice?: string;
      speed?: number;
    };
    
    // AI Processing
    aiProvider: {
      provider: AIProvider;
      apiKey?: string;
      model?: string;
    };
    
    // Behavior
    wakeWord?: string;
    autoListen?: boolean;
    responseMode?: ResponseMode;
    
    // Context for business logic
    context?: Record<string, any>;
  }
  
  // Voice command that comes from user
  export interface VoiceCommand {
    intent: string;                    // What the user wants to do
    entities: Record<string, any>;     // Extracted data (names, numbers, etc.)
    confidence: number;                // How confident AI is (0-1)
    rawText: string;                   // Original spoken text
    timestamp: Date;                   // When command was given
  }
  
  // Response from voice AI
  export interface VoiceResponse {
    text: string;                      // What to say back to user
    success: boolean;                  // Did the command work?
    data?: any;                        // Additional data
    actions?: VoiceAction[];           // Actions to execute
  }
  
  // Actions that can be triggered
  export interface VoiceAction {
    type: ActionType;
    payload: any;
    endpoint?: string;                 // API endpoint to call
    method?: HTTPMethod;               // HTTP method
  }
  
  // State of the voice AI system
  export interface VoiceAIState {
    isListening: boolean;
    isProcessing: boolean;
    isAvailable: boolean;
    currentCommand?: VoiceCommand;
    lastResponse?: VoiceResponse;
    error?: string;
  }
  
  // Configuration for workforce-specific features
  export interface WorkforceConfig {
    userRole: UserRole;
    permissions: string[];
    endpoints: Record<string, string>;
  }
  
  // Enums
  export enum SpeechProvider {
    WEB_SPEECH = 'web-speech',
    AZURE = 'azure',
    GOOGLE = 'google',
    OPENAI = 'openai'
  }
  
  export enum AIProvider {
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic',
    AZURE = 'azure'
  }
  
  export enum ResponseMode {
    VOICE = 'voice',
    TEXT = 'text',
    BOTH = 'both'
  }
  
  export enum ActionType {
    API_CALL = 'api_call',
    NOTIFICATION = 'notification',
    NAVIGATION = 'navigation',
    DATA_UPDATE = 'data_update'
  }
  
  export enum HTTPMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
  }
  
  export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    FIELD_WORKER = 'field_worker',
    CLIENT = 'client'
  }
  
  // Error types
  export interface VoiceAIError {
    code: string;
    message: string;
    details?: any;
  }
  
  // Event types for listeners
  export interface VoiceAIEvents {
    onCommand: (command: VoiceCommand) => void;
    onResponse: (response: VoiceResponse) => void;
    onError: (error: VoiceAIError) => void;
    onStateChange: (state: VoiceAIState) => void;
  }