export interface VoiceAIConfig {
    apiBaseUrl?: string;
    apiKey?: string;
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
    aiProvider: {
        provider: AIProvider;
        apiKey?: string;
        model?: string;
    };
    wakeWord?: string;
    autoListen?: boolean;
    responseMode?: ResponseMode;
    context?: Record<string, any>;
}
export interface VoiceCommand {
    intent: string;
    entities: Record<string, any>;
    confidence: number;
    rawText: string;
    timestamp: Date;
}
export interface VoiceResponse {
    text: string;
    success: boolean;
    data?: any;
    actions?: VoiceAction[];
}
export interface VoiceAction {
    type: ActionType;
    payload: any;
    endpoint?: string;
    method?: HTTPMethod;
}
export interface VoiceAIState {
    isListening: boolean;
    isProcessing: boolean;
    isAvailable: boolean;
    currentCommand?: VoiceCommand;
    lastResponse?: VoiceResponse;
    error?: string;
}
export interface WorkforceConfig {
    userRole: UserRole;
    permissions: string[];
    endpoints: Record<string, string>;
}
export declare enum SpeechProvider {
    WEB_SPEECH = "web-speech",
    AZURE = "azure",
    GOOGLE = "google",
    OPENAI = "openai"
}
export declare enum AIProvider {
    OPENAI = "openai",
    ANTHROPIC = "anthropic",
    AZURE = "azure"
}
export declare enum ResponseMode {
    VOICE = "voice",
    TEXT = "text",
    BOTH = "both"
}
export declare enum ActionType {
    API_CALL = "api_call",
    NOTIFICATION = "notification",
    NAVIGATION = "navigation",
    DATA_UPDATE = "data_update"
}
export declare enum HTTPMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}
export declare enum UserRole {
    ADMIN = "admin",
    MANAGER = "manager",
    FIELD_WORKER = "field_worker",
    CLIENT = "client"
}
export interface VoiceAIError {
    code: string;
    message: string;
    details?: any;
}
export interface VoiceAIEvents {
    onCommand: (command: VoiceCommand) => void;
    onResponse: (response: VoiceResponse) => void;
    onError: (error: VoiceAIError) => void;
    onStateChange: (state: VoiceAIState) => void;
}
