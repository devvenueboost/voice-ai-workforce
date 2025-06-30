// packages/types/src/types.ts

// API Call Configuration for flexible endpoints
export interface ApiCallConfig {
    endpoint: string;
    method: HTTPMethod;
    bodyTemplate?: Record<string, any>;
    headers?: Record<string, string>;
  }
  
  // Core configuration for voice AI
  export interface VoiceAIConfig {
    // API Configuration - REQUIRED for production
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
    
    // AI Processing - OPTIONAL, falls back to keyword matching
    aiProvider?: {
      provider: AIProvider;
      apiKey?: string;  // USER must provide this
      model?: string;
    };
    
    // Behavior
    wakeWord?: string;
    autoListen?: boolean;
    responseMode?: ResponseMode;
    
    // Flexible API endpoint configuration
    apiCalls?: {
      clock_in?: ApiCallConfig;
      clock_out?: ApiCallConfig;
      complete_task?: ApiCallConfig;
      get_status?: ApiCallConfig;
      break_start?: ApiCallConfig;
      break_end?: ApiCallConfig;
      report_issue?: ApiCallConfig;
      [key: string]: ApiCallConfig | undefined; // Allow custom commands
    };
    
    // Context for business logic
    context?: Record<string, any>;
  }
  
  // Voice command that comes from user
  export interface VoiceCommand {
    intent: string;                    
    entities: Record<string, any>;     
    confidence: number;                
    rawText: string;                   
    timestamp: Date;                   
  }
  
  // Response from voice AI
  export interface VoiceResponse {
    text: string;                      
    success: boolean;                  
    data?: any;                        
    actions?: VoiceAction[];           
  }
  
  // Actions that can be triggered
  export interface VoiceAction {
    type: ActionType;
    payload: any;
    endpoint?: string;                 
    method?: HTTPMethod;               
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
    DELETE = 'DELETE',
    PATCH = 'PATCH'
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