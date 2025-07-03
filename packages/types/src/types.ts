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
// BUSINESS CONTEXT TYPES
// =====================================

export interface BusinessContext {
  name: string; // "Staffluent", "TaskMaster", "ProjectPro", etc.
  domain: string; // "construction", "retail", "healthcare"
  capabilities: string[]; // ["time tracking", "task management", "projects"]
  website?: string;
  supportEmail?: string;
  brandColor?: string;
  customVariables?: Record<string, string>; // Custom {{variable}} replacements
}

export interface BusinessCommandConfig {
  intent: string;
  triggers: string[];
  response: string; // Template with variables
  requiresApi: boolean;
  apiEndpoint?: string;
  method?: HTTPMethod;
  category: string;
  priority?: number;
  entityRequirements?: string[]; // Required entities like 'taskIdentifier'
  examples?: string[];
}

// =====================================
// ENTITY EXTRACTION TYPES
// =====================================

export interface ExtractedEntity {
  type: EntityType;
  value: string;
  confidence: number;
  sourceText: string;
  position?: {
    start: number;
    end: number;
  };
}

export enum EntityType {
  TASK_IDENTIFIER = 'taskIdentifier',
  TASK_NUMBER = 'taskNumber',
  PROJECT_NAME = 'projectName',
  RECIPIENT = 'recipient',
  MESSAGE_CONTENT = 'messageContent',
  ISSUE_TYPE = 'issueType',
  PRIORITY_LEVEL = 'priorityLevel',
  DATE_TIME = 'dateTime',
  USER_NAME = 'userName',
  TEAM_NAME = 'teamName',
  LOCATION = 'location',
  AMOUNT = 'amount',
  PERCENTAGE = 'percentage'
}

export interface EntityExtractionResult {
  entities: Record<string, ExtractedEntity>;
  confidence: number;
  missingRequired?: string[];
  extractedText: string;
}

// =====================================
// COMMAND SYSTEM TYPES
// =====================================

export interface VoiceCommand {
  intent: string;
  entities: Record<string, ExtractedEntity>;
  confidence: number;
  rawText: string;
  timestamp: Date;
  provider?: AIProvider;
  complexity?: CommandComplexity;
  requiresBusinessData?: boolean;
  businessContext?: BusinessContext;
}

export enum CommandComplexity {
  SIMPLE = 'simple',         // Voice package can handle alone
  BUSINESS = 'business',     // Needs business API integration
  HYBRID = 'hybrid'          // Partial handling + business API
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
  
  // 🆕 NEW: Command Classification
  complexity: CommandComplexity;
  requiresBusinessData: boolean;
  entityRequirements?: EntityType[];
  businessKeywords?: string[]; // Keywords that indicate business context
  fallbackReason?: string; // Why this command needs fallback
  confidenceThreshold?: number; // Minimum confidence to handle
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
    queryParams?: Record<string, any>; // 🔧 FIXED: Added queryParams
    
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
  businessCommands?: BusinessCommandConfig[]; // 🆕 NEW
}

export interface CommandCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  commands: string[]; // Command IDs
  businessRelevant?: boolean; // 🆕 NEW: Requires business context
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
  
  // 🆕 NEW: Business Context Configuration
  businessContext?: BusinessContext;
  
  // Command system
  commands?: {
    registry?: CommandRegistry;
    customCommands?: CommandDefinition[];
    businessCommands?: BusinessCommandConfig[]; // 🆕 NEW
    enabledCategories?: string[];
    disabledCommands?: string[];
  };
  
  // 🆕 NEW: Entity Extraction Configuration
  entityExtraction?: {
    enabled: boolean;
    confidenceThreshold: number;
    customPatterns?: Record<EntityType, RegExp>;
    enableContextualExtraction?: boolean;
  };
  
  // 🆕 NEW: Fallback Configuration
  fallback?: {
    enableSmartFallback: boolean;
    confidenceThreshold: number;
    businessApiBaseUrl?: string;
    businessApiKey?: string;
    fallbackTimeout?: number;
    retryAttempts?: number;
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
   
  // Interface mode configuration
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
  
  // 🆕 NEW: Fallback Information
  canHandle: boolean; // Can voice package handle this completely?
  shouldFallback: boolean; // Should fallback to business API?
  fallbackReason?: string; // Why fallback is needed
  intent?: string; // Detected intent for business API
  entities?: Record<string, ExtractedEntity>; // Extracted entities
  commandType?: CommandComplexity; // Command complexity classification
  businessContext?: BusinessContext; // Business context used
  requiresApproval?: boolean; // Needs user confirmation before execution
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
  
  // 🆕 NEW: Business Context State
  businessContext?: BusinessContext;
  entityExtractionEnabled?: boolean;
  fallbackMode?: boolean;
  
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
  
  // 🆕 NEW: Business Context Events
  onBusinessContextChanged?: (context: BusinessContext) => void;
  onEntityExtracted?: (entities: Record<string, ExtractedEntity>) => void;
  onFallbackTriggered?: (reason: string, intent: string) => void;
  onFallbackCompleted?: (success: boolean, result: any) => void;
}

export interface VoiceAIError {
  code: string;
  message: string;
  details?: any;
  provider?: AIProvider;
  recoverable?: boolean;
  suggestions?: string[];
  businessContext?: boolean; // 🆕 NEW: Business context related error
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
  
  // 🆕 NEW: Fallback Integration
  onFallbackNeeded?: (intent: string, entities: Record<string, ExtractedEntity>) => Promise<any>;
  enableFallbackMode?: boolean;
  businessApiIntegration?: boolean;
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
  
  // 🆕 NEW: Business Integration
  businessContext?: BusinessContext;
  showBusinessCommands?: boolean;
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
  
  // 🆕 NEW: Business Features
  showBusinessCommands?: boolean;
  showEntityExtraction?: boolean;
  showFallbackOptions?: boolean;
  showBusinessContext?: boolean;
  
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
    fallbackText?: string; // 🆕 NEW
  };
  status?: {
    online?: string;
    offline?: string;
    listening?: string;
    processing?: string;
    error?: string;
    fallback?: string; // 🆕 NEW
  };
  providers?: {
    generic?: string; // e.g., "Voice AI" instead of "OpenAI"
    fallback?: string; // e.g., "Backup System" instead of "Keywords"
  };
  errors?: {
    generic?: string;
    connection?: string;
    permission?: string;
    businessContext?: string; // 🆕 NEW
    entityExtraction?: string; // 🆕 NEW
  };
  
  // 🆕 NEW: Business Labels
  business?: {
    commands?: string; // "Business Commands"
    context?: string; // "Business Context"
    fallback?: string; // "Fallback to Business System"
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
    showBusinessCommands: true,
    showEntityExtraction: true,
    showFallbackOptions: true,
    showBusinessContext: true,
    useGenericLabels: false,
  },
  
  project: {
    // Balanced view for projects to configure
    showProviders: true,
    showProviderStatus: true,
    showProviderErrors: false,
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
    showBusinessCommands: true,
    showEntityExtraction: false,
    showFallbackOptions: true,
    showBusinessContext: false,
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
    showCommandHistory: true,
    showAnalytics: false,
    showExportOptions: false,
    showMiniCenter: true,
    showSettingsPanel: false,
    showHistoryPanel: false,
    showStatusIndicator: true,
    showBusinessCommands: false, // Hide for simplicity
    showEntityExtraction: false,
    showFallbackOptions: false,
    showBusinessContext: false,
    useGenericLabels: true,
    customLabels: {
      voiceButton: {
        startText: 'Start Voice',
        stopText: 'Stop Voice',
        processingText: 'Processing...',
        errorText: 'Voice Unavailable',
        fallbackText: 'Connecting...'
      },
      status: {
        online: 'Voice Ready',
        offline: 'Voice Unavailable',
        listening: 'Listening...',
        processing: 'Processing...',
        error: 'Voice Error',
        fallback: 'Processing Request...'
      },
      providers: {
        generic: 'Voice Assistant',
        fallback: 'Voice Assistant'
      },
      errors: {
        generic: 'Voice assistant is temporarily unavailable',
        connection: 'Please check your connection',
        permission: 'Microphone permission required',
        businessContext: 'Business context unavailable',
        entityExtraction: 'Could not understand the request'
      },
      business: {
        commands: 'Available Commands',
        context: 'Assistant Info',
        fallback: 'Processing...'
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
  
  /**
   * Business context override
   */
  businessContext?: BusinessContext;
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
          errorText: 'Voice error',
          fallbackText: 'Connecting to system...'
        },
        status: {
          online: 'Online',
          offline: 'Offline',
          listening: 'Listening',
          processing: 'Processing',
          error: 'Error',
          fallback: 'Fallback Mode'
        },
        providers: {
          generic: 'AI Provider',
          fallback: 'Keywords'
        },
        errors: {
          generic: 'An error occurred',
          connection: 'Connection failed',
          permission: 'Permission denied',
          businessContext: 'Business context error',
          entityExtraction: 'Entity extraction failed'
        },
        business: {
          commands: 'Business Commands',
          context: 'Business Context',
          fallback: 'Business System'
        }
      };

  // Merge with custom labels
  return {
    voiceButton: { ...baseLabels.voiceButton, ...customLabels?.voiceButton },
    status: { ...baseLabels.status, ...customLabels?.status },
    providers: { ...baseLabels.providers, ...customLabels?.providers },
    errors: { ...baseLabels.errors, ...customLabels?.errors },
    business: { ...baseLabels.business, ...customLabels?.business }
  };
}