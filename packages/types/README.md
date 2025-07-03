# @voice-ai-workforce/types

> TypeScript definitions with 3-tier mode system for Voice AI Workforce

[![npm](https://img.shields.io/npm/v/@voice-ai-workforce/types)](https://www.npmjs.com/package/@voice-ai-workforce/types)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## ✨ New: Mode System Type Definitions

Complete TypeScript support for the 3-tier interface mode system:

**🔧 Developer Mode** - Full technical interface types
**🏢 Project Mode** - Business application types  
**👤 End-User Mode** - Simplified interface types

## 📦 Installation

```bash
npm install @voice-ai-workforce/types
```

## 🎯 Mode System Types

### VoiceInterfaceMode

Core mode selection type:

```typescript
type VoiceInterfaceMode = 'developer' | 'project' | 'end-user';
```

### VisibilityConfig

Controls which features and information are visible:

```typescript
interface VisibilityConfig {
  // Provider-related visibility
  showProviders?: boolean;                  // Show AI provider names (OpenAI, etc.)
  showProviderStatus?: boolean;             // Show provider online/offline status
  showProviderErrors?: boolean;             // Show provider-specific errors
  
  // Debug and technical information
  showDebugInfo?: boolean;                  // Show processing times, internal data
  showConfidenceScores?: boolean;           // Show command confidence percentages
  showProcessingTimes?: boolean;            // Show operation duration
  showTechnicalErrors?: boolean;            // Show stack traces and technical errors
  
  // Advanced features
  showAdvancedSettings?: boolean;           // Show advanced configuration options
  showCommandHistory?: boolean;             // Show command history panel
  showAnalytics?: boolean;                  // Show analytics and metrics
  showExportOptions?: boolean;              // Show data export features
  
  // User interface complexity
  showMiniCenter?: boolean;                 // Show mini command center
  showSettingsPanel?: boolean;              // Show settings panel
  showHistoryPanel?: boolean;               // Show history panel
  showStatusIndicator?: boolean;            // Show status indicator
  
  // Labeling and terminology
  useGenericLabels?: boolean;               // Use generic labels instead of technical ones
  customLabels?: CustomLabels;              // Custom label overrides
}
```

### CustomLabels

Defines custom labeling for different interface elements:

```typescript
interface CustomLabels {
  voiceButton?: {
    startText?: string;                     // "Start Voice" vs "Start Listening"
    stopText?: string;                      // "Stop Voice" vs "Stop Listening" 
    processingText?: string;                // "Processing..." vs "Processing voice..."
    errorText?: string;                     // "Voice error" vs technical details
  };
  status?: {
    online?: string;                        // "Voice Ready" vs "Online"
    offline?: string;                       // "Voice Unavailable" vs "Offline"
    listening?: string;                     // "Listening..." vs "Listening for commands"
    processing?: string;                    // "Processing..." vs "Processing voice input"
    error?: string;                         // "Voice Error" vs "System Error"
  };
  providers?: {
    generic?: string;                       // "Voice Assistant" vs "OpenAI"
    fallback?: string;                      // "Voice Assistant" vs "Keywords"
  };
  errors?: {
    generic?: string;                       // "Voice temporarily unavailable"
    connection?: string;                    // "Check your connection"
    permission?: string;                    // "Microphone permission required"
  };
}
```

### Default Mode Presets

Pre-configured visibility settings for each mode:

```typescript
const DEFAULT_MODE_PRESETS: ModePresets = {
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
    // Balanced view for project integration
    showProviders: true,
    showProviderStatus: true,
    showProviderErrors: false,      // Hide detailed errors
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
    showCommandHistory: true,       // Keep history as it's useful
    showAnalytics: false,
    showExportOptions: false,
    showMiniCenter: true,           // Keep but simplified
    showSettingsPanel: false,
    showHistoryPanel: false,
    showStatusIndicator: true,      // Keep status but simplified
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
```

## 🔧 Updated Core Types

### VoiceAIConfig with Mode Support

```typescript
interface VoiceAIConfig {
  // Core settings
  apiBaseUrl?: string;
  apiKey?: string;
  
  // Speech configuration
  speechToText: SpeechToTextConfig;
  textToSpeech: TextToSpeechConfig;
  
  // AI provider configuration
  aiProviders: {
    primary: AIProviderConfig;
    fallbacks?: AIProviderConfig[];
  };
  
  // Response mode
  responseMode?: ResponseMode;
  
  // NEW: Interface mode configuration
  interfaceMode?: VoiceInterfaceMode;      // Global mode setting
  visibility?: VisibilityConfig;           // Global visibility overrides
  
  // Existing configuration...
  commands?: CommandConfiguration;
  ui?: UIConfiguration;
  context?: ContextConfiguration;
}
```

### Mode-Filtered Response Types

Commands and responses are automatically filtered based on the current mode:

```typescript
// VoiceCommand - filtered based on visibility settings
interface VoiceCommand {
  intent: string;                          // Always included
  entities: Record<string, any>;          // Filtered in end-user mode
  confidence: number;                     // Hidden if showConfidenceScores: false
  rawText: string;                        // Always included
  timestamp: Date;                        // Always included
  provider?: AIProvider;                  // Hidden if showProviders: false
}

// VoiceResponse - metadata filtered based on mode
interface VoiceResponse {
  text: string;                           // Always included
  success: boolean;                       // Always included
  data?: any;                            // Always included
  actions?: CommandAction[];             // Always included
  suggestions?: string[];                // Always included
  metadata?: {                           // Filtered based on mode
    provider?: AIProvider;               // Hidden if showProviders: false
    confidence?: number;                 // Hidden if showConfidenceScores: false
    processingTime?: number;             // Hidden if showProcessingTimes: false
    cached?: boolean;                    // Hidden if showDebugInfo: false
  };
}
```

## ⚛️ React Component Types with Mode Support

### Enhanced Component Props

```typescript
// Base interface for mode-aware components
interface VoiceModeProps {
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

// VoiceButton with mode support
interface VoiceButtonProps extends VoiceModeProps {
  config: VoiceAIConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  disabled?: boolean;
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
  children?: React.ReactNode;
  listenText?: string;
  stopText?: string;
  'aria-label'?: string;
  
  // NEW: Mode system props inherited from VoiceModeProps
  // mode?: VoiceInterfaceMode;
  // visibilityOverrides?: Partial<VisibilityConfig>;
  // customLabels?: Partial<CustomLabels>;
}

// VoiceCommandCenter with mode support
interface VoiceCommandCenterProps extends VoiceModeProps {
  config: VoiceAIConfig;
  isOpen: boolean;
  onClose?: () => void;
  position?: 'left' | 'right';
  width?: number;
  showCategories?: boolean;
  showHistory?: boolean;
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
  
  // Mode system props inherited from VoiceModeProps
}
```

### Updated Hook Types

```typescript
interface UseVoiceAIOptions extends VoiceModeProps {
  config: VoiceAIConfig;
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
  autoStart?: boolean;
  
  // Mode system parameters inherited from VoiceModeProps
}

interface UseVoiceAIReturn {
  // State (filtered based on mode)
  isListening: boolean;
  isProcessing: boolean;
  isAvailable: boolean;
  currentCommand?: VoiceCommand;            // Filtered based on mode
  lastResponse?: VoiceResponse;             // Filtered metadata
  error?: string;                           // Mode-appropriate error messages
  
  // Actions
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  processText: (text: string) => Promise<VoiceResponse | undefined>;
  speak: (text: string) => Promise<void>;
  
  // Configuration
  updateConfig: (newConfig: Partial<VoiceAIConfig>) => void;
  updateContext: (context: Record<string, any>) => void;
  
  // Utils
  getState: () => VoiceAIState;             // Returns mode-filtered state
  
  // NEW: Mode-aware properties
  visibility: VisibilityConfig;             // Resolved visibility settings
  labels: CustomLabels;                     // Resolved labels
}
```

## 🔧 Utility Functions

### useVoiceVisibility Hook

Resolves the effective visibility configuration:

```typescript
function useVoiceVisibility(
  config: VoiceAIConfig,
  componentMode?: VoiceInterfaceMode,
  componentOverrides?: Partial<VisibilityConfig>
): { visibility: VisibilityConfig; labels: CustomLabels }
```

### resolveVisibilityConfig Function

Manually resolve visibility configuration:

```typescript
function resolveVisibilityConfig(
  globalMode?: VoiceInterfaceMode,
  componentMode?: VoiceInterfaceMode,
  globalVisibility?: VisibilityConfig,
  componentOverrides?: Partial<VisibilityConfig>
): VisibilityConfig
```

### getEffectiveLabels Function

Get the final labels based on configuration:

```typescript
function getEffectiveLabels(
  visibility: VisibilityConfig,
  customLabels?: Partial<CustomLabels>
): CustomLabels
```

## 📋 Usage Examples

### Basic Mode Configuration

```typescript
import type { 
  VoiceAIConfig, 
  VoiceInterfaceMode, 
  VisibilityConfig 
} from '@voice-ai-workforce/types';

// End-user configuration
const endUserConfig: VoiceAIConfig = {
  speechToText: { provider: 'web-speech', language: 'en-US' },
  textToSpeech: { provider: 'web-speech', speed: 1.0 },
  aiProvider: { provider: 'openai', model: 'gpt-3.5-turbo' },
  responseMode: 'both',
  
  // Mode configuration
  interfaceMode: 'end-user',
  visibility: {
    useGenericLabels: true,
    showProviders: false,
    showDebugInfo: false,
    customLabels: {
      voiceButton: {
        startText: 'Ask Question',
        stopText: 'Stop'
      }
    }
  }
};

// Developer configuration
const developerConfig: VoiceAIConfig = {
  speechToText: { provider: 'web-speech', language: 'en-US' },
  textToSpeech: { provider: 'web-speech', speed: 1.0 },
  aiProvider: { provider: 'openai', model: 'gpt-3.5-turbo' },
  responseMode: 'both',
  
  // Full debug mode
  interfaceMode: 'developer',
  visibility: {
    showDebugInfo: true,
    showProviders: true,
    showConfidenceScores: true,
    showProcessingTimes: true,
    showTechnicalErrors: true
  }
};
```

### Component-Level Mode Overrides

```typescript
import type { VoiceButtonProps } from '@voice-ai-workforce/types';

// Component props with mode override
const buttonProps: VoiceButtonProps = {
  config: globalConfig,           // Global: project mode
  mode: 'end-user',              // Component: end-user mode override
  visibilityOverrides: {         // Fine-tune visibility
    showMiniCenter: false,
    showStatusIndicator: true
  },
  customLabels: {                // Custom labels for this component
    voiceButton: {
      startText: 'Get Help',
      processingText: 'Thinking...'
    }
  },
  size: 'lg',
  variant: 'primary',
  onCommand: handleCommand
};
```

### Type Guards for Mode-Filtered Data

```typescript
// Type guard for checking if command has debug info
function hasDebugInfo(command: VoiceCommand): command is VoiceCommand & {
  provider: AIProvider;
  entities: Record<string, any>;
} {
  return 'provider' in command && 'entities' in command;
}

// Type guard for checking if response has metadata
function hasResponseMetadata(response: VoiceResponse): response is VoiceResponse & {
  metadata: {
    provider: AIProvider;
    confidence: number;
    processingTime: number;
  };
} {
  return response.metadata != null &&
    'provider' in response.metadata &&
    'confidence' in response.metadata &&
    'processingTime' in response.metadata;
}

// Usage with type safety
if (hasDebugInfo(command)) {
  console.log('Provider:', command.provider);     // TypeScript knows this exists
  console.log('Entities:', command.entities);    // TypeScript knows this exists
}

if (hasResponseMetadata(response)) {
  console.log('Processing time:', response.metadata.processingTime);
}
```

### Mode-Aware Error Handling

```typescript
// Error type that varies by mode
type ModeAwareError = VoiceAIError & {
  userFriendlyMessage?: string;  // Only in end-user mode
  technicalDetails?: any;        // Only in developer mode
};

// Function to create mode-appropriate errors
function createModeError(
  baseError: Error,
  mode: VoiceInterfaceMode
): ModeAwareError {
  const baseVoiceError: VoiceAIError = {
    code: 'VOICE_ERROR',
    message: baseError.message
  };

  switch (mode) {
    case 'developer':
      return {
        ...baseVoiceError,
        message: `Technical Error: ${baseError.message}`,
        technicalDetails: {
          stack: baseError.stack,
          timestamp: new Date(),
          context: 'voice processing'
        }
      };
      
    case 'project':
      return {
        ...baseVoiceError,
        message: `Voice Service Error: ${baseError.message}`,
        suggestions: ['Check service status', 'Try again']
      };
      
    case 'end-user':
      return {
        ...baseVoiceError,
        message: 'Voice assistant is temporarily unavailable',
        userFriendlyMessage: 'Please try again in a moment'
      };
      
    default:
      return baseVoiceError;
  }
}
```

### Advanced Type Definitions

```typescript
// Type for mode-specific component variants
type ModeVariant<T extends VoiceInterfaceMode> = 
  T extends 'developer' ? 'technical' :
  T extends 'project' ? 'business' :
  T extends 'end-user' ? 'simple' :
  never;

// Conditional types based on mode
type ModeAwareProps<T extends VoiceInterfaceMode> = {
  mode: T;
  variant: ModeVariant<T>;
} & (T extends 'developer' ? {
  showDebugInfo: true;
  onDebugEvent?: (event: DebugEvent) => void;
} : {}) & (T extends 'end-user' ? {
  simpleLabels: true;
  hideComplexFeatures: true;
} : {});

// Usage with type safety
const developerProps: ModeAwareProps<'developer'> = {
  mode: 'developer',
  variant: 'technical',      // TypeScript enforces 'technical' for developer mode
  showDebugInfo: true,       // Required for developer mode
  onDebugEvent: (event) => console.log(event)
};

const endUserProps: ModeAwareProps<'end-user'> = {
  mode: 'end-user',
  variant: 'simple',         // TypeScript enforces 'simple' for end-user mode
  simpleLabels: true,        // Required for end-user mode
  hideComplexFeatures: true  // Required for end-user mode
};
```

## 🔄 Migration Types

### Upgrading from v1.x

```typescript
// Before (v1.x) - Single interface type
interface OldVoiceAIConfig {
  speechToText: SpeechToTextConfig;
  aiProvider: AIProviderConfig;
  // Fixed interface for everyone
}

// After (v2.x) - Mode-aware interface
interface NewVoiceAIConfig extends OldVoiceAIConfig {
  // NEW: Mode system types
  interfaceMode?: VoiceInterfaceMode;
  visibility?: VisibilityConfig;
}

// Migration utility type
type MigrateConfig<T extends OldVoiceAIConfig> = T & {
  interfaceMode: VoiceInterfaceMode;
  visibility?: VisibilityConfig;
};

// Helper function for migration
function migrateConfig(
  oldConfig: OldVoiceAIConfig,
  targetMode: VoiceInterfaceMode
): NewVoiceAIConfig {
  return {
    ...oldConfig,
    interfaceMode: targetMode,
    visibility: DEFAULT_MODE_PRESETS[targetMode]
  };
}
```

## 📊 Performance Types

```typescript
// Performance metrics that vary by mode
interface ModeAwareMetrics {
  // Always available
  responseTime: number;
  success: boolean;
  
  // Mode-dependent metrics
  technicalMetrics?: {        // Only in developer mode
    processingTime: number;
    apiLatency: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
  
  businessMetrics?: {         // Only in project mode
    userSatisfaction: number;
    taskCompletion: number;
    errorRate: number;
  };
  
  userMetrics?: {            // Only in end-user mode
    taskSuccess: boolean;
    helpful: boolean;
  };
}
```

## 🔗 Export Structure

```typescript
// Main mode system exports
export type {
  VoiceInterfaceMode,
  VisibilityConfig,
  CustomLabels,
  ModePresets,
  VoiceModeProps
};

// Updated core types with mode support
export type {
  VoiceAIConfig,
  VoiceCommand,
  VoiceResponse,
  VoiceAIState
};

// React component types with mode support  
export type {
  VoiceButtonProps,
  VoiceCommandCenterProps,
  UseVoiceAIOptions,
  UseVoiceAIReturn
};

// Utility functions
export {
  DEFAULT_MODE_PRESETS,
  resolveVisibilityConfig,
  getEffectiveLabels,
  useVoiceVisibility
};

// Legacy exports (for backward compatibility)
export type {
  SpeechProvider,
  AIProvider,
  ResponseMode,
  UserRole,
  HTTPMethod
};
```

## 🎯 Benefits of Typed Mode System

### Type Safety
- **Compile-time validation** of mode configurations
- **IntelliSense support** for mode-specific properties
- **Prevents runtime errors** from incorrect mode usage

### Developer Experience
- **Auto-completion** for mode-specific options
- **Type narrowing** based on mode selection
- **Clear documentation** through types

### Maintainability
- **Single source of truth** for mode definitions
- **Consistent interfaces** across all packages
- **Easy refactoring** with TypeScript compiler support

## 🔗 Related Packages

- **[@voice-ai-workforce/core](../core)** - Core engine with mode system implementation
- **[@voice-ai-workforce/react](../react)** - React components using these types

## 📄 License

MIT © [Griseld Gerveni, CTO of VenueBoost Inc.]