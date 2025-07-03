// packages/types/src/types.ts

// =====================================
// AI PROVIDER TYPES
// =====================================

export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  KEYWORDS = 'keywords' // Fallback
}

export type VoiceInterfaceMode = 'developer' | 'project' | 'end-user';

export interface OpenAIConfig {
  provider: AIProvider.OPENAI;
  apiKey: string;
  model?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo' | string;
  temperature?: number;
  maxTokens?: number;
  organizationId?: string;
}

export interface AnthropicConfig {
  provider: AIProvider.ANTHROPIC;
  apiKey: string;
  model?: 'claude-3-haiku-20240307' | 'claude-3-sonnet-20240229' | 'claude-3-opus-20240229' | string;
  maxTokens?: number;
  temperature?: number;
}

export interface GoogleConfig {
  provider: AIProvider.GOOGLE;
  apiKey: string;
  model?: 'gemini-pro' | 'gemini-pro-vision' | string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface KeywordsConfig {
  provider: AIProvider.KEYWORDS;
  fallbackMode: boolean;
}

export type AIProviderConfig = OpenAIConfig | AnthropicConfig | GoogleConfig | KeywordsConfig;

// =====================================
// COMMAND SYSTEM TYPES
// =====================================

export interface VoiceCommand {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  rawText: string;
  timestamp: Date;
  provider?: AIProvider;
}

export interface CommandDefinition {
  id: string;
  name: string;
  triggers: string[];
  intent: string;
  description?: string;
  category?: string;
  examples?: string[];
  response?: {
    text: string;
    variables?: Record<string, string>;
  };
  action?: CommandAction;
  validation?: {
    requiredEntities?: string[];
    patterns?: RegExp[];
  };
  metadata?: Record<string, any>;
}

export interface CommandAction {
  type: 'api' | 'function' | 'navigation' | 'ui';
  payload: {
    // API Action
    endpoint?: string;
    method?: HTTPMethod;
    headers?: Record<string, string>;
    body?: Record<string, any>;
    bodyTemplate?: Record<string, any>;
    
    // Function Action
    function?: (...args: any[]) => void | Promise<void>;
    
    // Navigation Action
    route?: string;
    params?: Record<string, any>;
    
    // UI Action
    component?: string;
    props?: Record<string, any>;
  };
}

export interface CommandRegistry {
  commands: CommandDefinition[];
  categories: CommandCategory[];
  aliases: Record<string, string>;
}

export interface CommandCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  commands: string[]; // Command IDs
}

// =====================================
// SPEECH TYPES
// =====================================

export enum SpeechProvider {
  WEB_SPEECH = 'web-speech',
  AZURE = 'azure-speech'
}

export interface SpeechToTextConfig {
  provider: SpeechProvider;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  // Azure specific
  subscriptionKey?: string;
  region?: string;
}

export interface TextToSpeechConfig {
  provider: SpeechProvider;
  voice?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  // Azure specific
  subscriptionKey?: string;
  region?: string;
}

// =====================================
// MAIN CONFIGURATION
// =====================================

export interface VoiceAIConfig {
  // Core settings
  apiBaseUrl?: string;
  apiKey?: string; // Default API key
  
  aiProviders: {
    primary: AIProviderConfig;
    fallbacks?: AIProviderConfig[];
    retryAttempts?: number;
    timeoutMs?: number;
  };
  
  // Speech configuration
  speechToText: SpeechToTextConfig;
  textToSpeech: TextToSpeechConfig;
  
  // Command system
  commands?: {
    registry?: CommandRegistry;
    customCommands?: CommandDefinition[];
    enabledCategories?: string[];
    disabledCommands?: string[];
  };
  
  // Behavior settings
  wakeWord?: string;
  autoListen?: boolean;
  responseMode?: ResponseMode;
  confidenceThreshold?: number;
  
  // UI Configuration
  ui?: {
    theme?: 'light' | 'dark' | 'auto';
    position?: 'left' | 'right' | 'top' | 'bottom';
    showCommandHistory?: boolean;
    showSuggestions?: boolean;
    commandCenterWidth?: number;
    animations?: boolean;
    sounds?: boolean;
  };
  
  // Context and permissions
  context?: {
    userRole?: string;
    permissions?: string[];
    metadata?: Record<string, any>;
  };
  
  // Advanced settings
  advanced?: {
    enableAnalytics?: boolean;
    enableCaching?: boolean;
    maxHistoryItems?: number;
    enableOfflineMode?: boolean;
    debugMode?: boolean;
  };
   
  // NEW: Interface mode configuration
  interfaceMode?: VoiceInterfaceMode;
  visibility?: VisibilityConfig;
}

// =====================================
// RESPONSE & STATE TYPES
// =====================================

export interface VoiceResponse {
  text: string;
  success: boolean;
  data?: any;
  actions?: CommandAction[];
  suggestions?: string[];
  metadata?: {
    provider?: AIProvider;
    confidence?: number;
    processingTime?: number;
    cached?: boolean;
  };
}

export interface VoiceAIState {
  isListening: boolean;
  isProcessing: boolean;
  isAvailable: boolean;
  currentCommand?: VoiceCommand;
  lastResponse?: VoiceResponse;
  error?: string;
  
  // Provider state
  activeProvider?: AIProvider;
  providerStatus?: Record<AIProvider, 'available' | 'error' | 'timeout'>;
  
  // Command state
  commandHistory?: VoiceCommand[];
  suggestedCommands?: CommandDefinition[];
  
  // UI state
  isCommandCenterOpen?: boolean;
  selectedCategory?: string;
}

// =====================================
// EVENT TYPES
// =====================================

export interface VoiceAIEvents {
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
  onStateChange?: (state: VoiceAIState) => void;
  onProviderSwitch?: (provider: AIProvider) => void;
  onCommandExecuted?: (command: CommandDefinition, result: any) => void;
}

export interface VoiceAIError {
  code: string;
  message: string;
  details?: any;
  provider?: AIProvider;
  recoverable?: boolean;
  suggestions?: string[];
}

// =====================================
// UTILITY TYPES
// =====================================

export enum ResponseMode {
  VOICE = 'voice',
  TEXT = 'text',
  BOTH = 'both'
}

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

export enum ActionType {
  API_CALL = 'api_call',
  FUNCTION_CALL = 'function_call',
  NAVIGATION = 'navigation',
  UI_ACTION = 'ui_action'
}

// =====================================
// REACT COMPONENT TYPES
// =====================================

export interface VoiceButtonProps {
  config: VoiceAIConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  showMiniCenter?: boolean;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
}

export interface VoiceCommandCenterProps {
  config: VoiceAIConfig;
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  width?: number;
  showCategories?: boolean;
  showHistory?: boolean;
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
}

export interface VoiceProviderProps {
  config: VoiceAIConfig;
  children: React.ReactNode;
}

// =====================================
// PRESET CONFIGURATIONS
// =====================================

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  FIELD_WORKER = 'field_worker',
  CLIENT = 'client'
}

export interface WorkforceConfig {
  userRole: UserRole;
  permissions: string[];
  endpoints: Record<string, string>;
  commands?: CommandDefinition[];
}

// =====================================
// MODE SYSTEM TYPES
// =====================================

// New visibility configuration interface
export interface VisibilityConfig {
  // Provider-related visibility
  showProviders?: boolean;
  showProviderStatus?: boolean;
  showProviderErrors?: boolean;
  
  // Debug and technical information
  showDebugInfo?: boolean;
  showConfidenceScores?: boolean;
  showProcessingTimes?: boolean;
  showTechnicalErrors?: boolean;
  
  // Advanced features
  showAdvancedSettings?: boolean;
  showCommandHistory?: boolean;
  showAnalytics?: boolean;
  showExportOptions?: boolean;
  
  // User interface complexity
  showMiniCenter?: boolean;
  showSettingsPanel?: boolean;
  showHistoryPanel?: boolean;
  showStatusIndicator?: boolean;
  
  // Labeling and terminology
  useGenericLabels?: boolean;
  customLabels?: CustomLabels;
}

// Custom labeling system
export interface CustomLabels {
  voiceButton?: {
    startText?: string;
    stopText?: string;
    processingText?: string;
    errorText?: string;
  };
  status?: {
    online?: string;
    offline?: string;
    listening?: string;
    processing?: string;
    error?: string;
  };
  providers?: {
    generic?: string; // e.g., "Voice AI" instead of "OpenAI"
    fallback?: string; // e.g., "Backup System" instead of "Keywords"
  };
  errors?: {
    generic?: string;
    connection?: string;
    permission?: string;
  };
}

// Mode presets for quick configuration
export interface ModePresets {
  developer: VisibilityConfig;
  project: VisibilityConfig;
  'end-user': VisibilityConfig;
}

// Default mode presets
export const DEFAULT_MODE_PRESETS: ModePresets = {
  developer: {
    // Show everything for developers
    showProviders: true,
    showProviderStatus: true,
    showProviderErrors: true,
    showDebugInfo: true,
    showConfidenceScores: true,
    showProcessingTimes: true,
    showTechnicalErrors: true,
    showAdvancedSettings: true,
    showCommandHistory: true,
    showAnalytics: true,
    showExportOptions: true,
    showMiniCenter: true,
    showSettingsPanel: true,
    showHistoryPanel: true,
    showStatusIndicator: true,
    useGenericLabels: false,
  },
  
  project: {
    // Balanced view for projects to configure
    showProviders: true,
    showProviderStatus: true,
    showProviderErrors: false, // Hide detailed errors
    showDebugInfo: false,
    showConfidenceScores: true,
    showProcessingTimes: false,
    showTechnicalErrors: false,
    showAdvancedSettings: true,
    showCommandHistory: true,
    showAnalytics: true,
    showExportOptions: true,
    showMiniCenter: true,
    showSettingsPanel: true,
    showHistoryPanel: true,
    showStatusIndicator: true,
    useGenericLabels: false,
  },
  
  'end-user': {
    // Minimal, clean interface for end users
    showProviders: false,
    showProviderStatus: false,
    showProviderErrors: false,
    showDebugInfo: false,
    showConfidenceScores: false,
    showProcessingTimes: false,
    showTechnicalErrors: false,
    showAdvancedSettings: false,
    showCommandHistory: true, // Keep command history as it's useful
    showAnalytics: false,
    showExportOptions: false,
    showMiniCenter: true, // Keep but simplified
    showSettingsPanel: false,
    showHistoryPanel: false,
    showStatusIndicator: true, // Keep status but simplified
    useGenericLabels: true,
    customLabels: {
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
  }
};

// Enhanced component props that support mode override
export interface VoiceModeProps {
  /**
   * Interface mode - overrides global config mode
   */
  mode?: VoiceInterfaceMode;
  
  /**
   * Visibility overrides - individual flags can override mode presets
   */
  visibilityOverrides?: Partial<VisibilityConfig>;
  
  /**
   * Custom labels override
   */
  customLabels?: Partial<CustomLabels>;
}

// Utility function to resolve final visibility config
export function resolveVisibilityConfig(
  globalMode?: VoiceInterfaceMode,
  componentMode?: VoiceInterfaceMode,
  globalVisibility?: VisibilityConfig,
  componentOverrides?: Partial<VisibilityConfig>
): VisibilityConfig {
  // Determine effective mode (component overrides global)
  const effectiveMode = componentMode || globalMode || 'project';
  
  // Start with mode preset
  const modePreset = DEFAULT_MODE_PRESETS[effectiveMode];
  
  // Apply global visibility config
  const withGlobalConfig = { ...modePreset, ...globalVisibility };
  
  // Apply component-level overrides
  const finalConfig = { ...withGlobalConfig, ...componentOverrides };
  
  return finalConfig;
}

// Utility function to get labels based on config
export function getEffectiveLabels(
  visibility: VisibilityConfig,
  customLabels?: Partial<CustomLabels>
): CustomLabels {
  const baseLabels = visibility.useGenericLabels 
    ? DEFAULT_MODE_PRESETS['end-user'].customLabels!
    : {
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
      };

  // Merge with custom labels
  return {
    voiceButton: { ...baseLabels.voiceButton, ...customLabels?.voiceButton },
    status: { ...baseLabels.status, ...customLabels?.status },
    providers: { ...baseLabels.providers, ...customLabels?.providers },
    errors: { ...baseLabels.errors, ...customLabels?.errors }
  };
}

// Hook for components to get their effective configuration
export function useVoiceVisibility(
  config: VoiceAIConfig,
  componentMode?: VoiceInterfaceMode,
  componentOverrides?: Partial<VisibilityConfig>
) {
  const visibility = resolveVisibilityConfig(
    config.interfaceMode,
    componentMode,
    config.visibility,
    componentOverrides
  );
  
  const labels = getEffectiveLabels(visibility, config.visibility?.customLabels);
  
  return { visibility, labels };
}

// =====================================
// EXPORTS
// =====================================
// @ts-ignore
export * from './commands'; // We'll create this file for default commands
// @ts-ignore
export * from './presets';  // We'll create this file for role presets