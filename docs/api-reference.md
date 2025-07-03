# API Reference

## Core Package (`@voice-ai-workforce/core`)

### VoiceAI Class

The main class for voice AI functionality.

#### Constructor

```typescript
new VoiceAI(config: VoiceAIConfig, events?: Partial<VoiceAIEvents>)
```

**Parameters:**
- `config` - Configuration object with optional mode settings (required)
- `events` - Optional event handlers

**Example:**
```typescript
import { VoiceAI } from '@voice-ai-workforce/core';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

const voiceAI = new VoiceAI({
  speechToText: {
    provider: SpeechProvider.WEB_SPEECH,
    language: 'en-US',
  },
  textToSpeech: {
    provider: SpeechProvider.WEB_SPEECH,
  },
  aiProvider: {
    provider: AIProvider.OPENAI,
  },
  responseMode: ResponseMode.BOTH,
  
  // NEW: Mode configuration
  interfaceMode: 'end-user', // 'developer' | 'project' | 'end-user'
  visibility: {
    showProviders: false,
    showDebugInfo: false,
    useGenericLabels: true
  }
}, {
  onCommand: (command) => console.log(command),
  onResponse: (response) => console.log(response),
});
```

#### Methods

##### `startListening(): Promise<void>`

Starts voice recognition using Web Speech API.

```typescript
await voiceAI.startListening();
```

##### `stopListening(): Promise<void>`

Stops voice recognition.

```typescript
await voiceAI.stopListening();
```

##### `processTextInput(text: string): Promise<VoiceResponse>`

Processes text input directly without voice recognition. Response filtering is applied based on current mode.

```typescript
const response = await voiceAI.processTextInput('clock me in');
console.log(response.text); // "I'll clock you in now."
// In end-user mode: debug metadata is filtered out
```

##### `speak(text: string): Promise<void>`

Converts text to speech using Web Speech API.

```typescript
await voiceAI.speak('Hello, how can I help you?');
```

##### `updateConfig(newConfig: Partial<VoiceAIConfig>): void`

Updates configuration at runtime including mode settings.

```typescript
voiceAI.updateConfig({
  responseMode: ResponseMode.TEXT,
  interfaceMode: 'developer', // Switch to developer mode
  visibility: {
    showDebugInfo: true,
    showProviders: true
  }
});
```

##### `updateContext(context: Record<string, any>): void`

Updates context information. Context is filtered based on current mode.

```typescript
voiceAI.updateContext({
  userRole: 'manager',
  department: 'engineering',
  // Debug context only visible in developer mode
  debug_sessionId: 'session123'
});
```

##### `getState(): VoiceAIState`

Returns current state filtered according to active mode.

```typescript
const state = voiceAI.getState();
console.log(state.isListening); // boolean
console.log(state.isProcessing); // boolean
console.log(state.isAvailable); // boolean
// In end-user mode: debug fields are filtered out
console.log(state.activeProvider); // undefined in end-user mode
```

##### `destroy(): void`

Cleans up resources and stops all voice operations.

```typescript
voiceAI.destroy();
```

## React Package (`@voice-ai-workforce/react`)

### VoiceButton Component

A React component that provides a circular voice interface button with visual feedback. Appearance and functionality adapt based on the configured mode.

#### Props

```typescript
interface VoiceButtonProps extends VoiceModeProps {
  config: VoiceAIConfig;                    // Required voice AI configuration
  size?: 'sm' | 'md' | 'lg' | 'xl';        // Button size (default: 'md')
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; // Color variant
  className?: string;                       // Additional CSS classes
  disabled?: boolean;                       // Disable the button
  onCommand?: (command: VoiceCommand) => void;     // Command event handler
  onResponse?: (response: VoiceResponse) => void;  // Response event handler
  onError?: (error: VoiceAIError) => void;        // Error event handler
  children?: React.ReactNode;               // Custom content (overrides icons)
  listenText?: string;                      // Accessibility text when idle
  stopText?: string;                        // Accessibility text when listening
  'aria-label'?: string;                    // Custom aria label
  
  // NEW: Mode system props
  mode?: VoiceInterfaceMode;                // Override global mode
  visibilityOverrides?: Partial<VisibilityConfig>; // Override visibility settings
  customLabels?: Partial<CustomLabels>;     // Override labels
  showMiniCenter?: boolean;                 // Show mini command center
}
```

#### Mode Examples

**Developer Mode:**
```tsx
<VoiceButton
  config={config}
  mode="developer"
  size="lg"
  onCommand={(cmd) => console.log('Full debug info:', cmd)}
  onResponse={(res) => console.log('Provider:', res.metadata?.provider)}
/>
// Shows: provider info, confidence scores, processing times, technical errors
```

**Project Mode:**
```tsx
<VoiceButton
  config={config}
  mode="project"
  visibilityOverrides={{
    showMiniCenter: true,
    showConfidenceScores: true
  }}
/>
// Shows: some technical info, mini center, confidence scores
```

**End-User Mode:**
```tsx
<VoiceButton
  config={config}
  mode="end-user"
  customLabels={{
    voiceButton: {
      startText: 'Start Voice',
      stopText: 'Stop Voice',
      processingText: 'Processing...'
    }
  }}
/>
// Shows: simple interface, generic labels, no technical details
```

#### Visual States by Mode

| Feature | Developer | Project | End-User |
|---------|-----------|---------|----------|
| Provider Status | ✅ OpenAI, Azure | ✅ OpenAI, Azure | ❌ "Voice Assistant" |
| Confidence Scores | ✅ 85% confidence | ✅ 85% confidence | ❌ Hidden |
| Error Details | ✅ Full stack trace | ⚠️ Basic message | ❌ "Voice error" |
| Mini Center | ✅ Full featured | ✅ Standard | ✅ Simplified |
| Debug Info | ✅ Processing time | ❌ Hidden | ❌ Hidden |

### VoiceCommandCenter Component

A comprehensive command center panel that adapts its interface complexity based on the configured mode.

#### Props

```typescript
interface VoiceCommandCenterPropsWithMode extends VoiceModeProps {
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
  
  // Mode system props (inherited from VoiceModeProps)
  mode?: VoiceInterfaceMode;
  visibilityOverrides?: Partial<VisibilityConfig>;
  customLabels?: Partial<CustomLabels>;
}
```

#### Mode-Specific Features

**Developer Mode Features:**
- Full provider information and status
- Command history with confidence scores
- Advanced settings panel
- Export and analytics options
- Technical error messages
- Processing time displays

**Project Mode Features:**
- Provider information (configurable)
- Command history
- Basic settings
- Some analytics
- User-friendly error messages

**End-User Mode Features:**
- Generic "Voice Assistant" labeling
- Simplified command history
- No technical settings
- Basic status indicators
- Friendly error messages

#### Example Usage

```tsx
<VoiceCommandCenter
  config={config}
  isOpen={true}
  mode="project"
  visibilityOverrides={{
    showAdvancedSettings: false,
    showExportOptions: false
  }}
  customLabels={{
    providers: {
      generic: 'Smart Assistant'
    }
  }}
/>
```

### useVoiceAI Hook

A React hook for integrating voice AI functionality with mode-aware configuration.

#### Parameters

```typescript
interface UseVoiceAIOptions extends VoiceModeProps {
  config: VoiceAIConfig;
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
  autoStart?: boolean;
  
  // Mode system parameters
  mode?: VoiceInterfaceMode;
  visibilityOverrides?: Partial<VisibilityConfig>;
  customLabels?: Partial<CustomLabels>;
}
```

#### Returns

```typescript
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

#### Mode-Aware Usage

```tsx
function MyComponent() {
  const {
    isListening,
    startListening,
    stopListening,
    visibility,
    labels
  } = useVoiceAI({
    config,
    mode: 'end-user',
    onCommand: (cmd) => {
      // Command object is filtered for end-user mode
      console.log('Simple command:', cmd.intent);
      // cmd.confidence, cmd.provider, etc. are filtered out
    },
    onError: (err) => {
      // Error message is user-friendly in end-user mode
      console.log('User-friendly error:', err.message);
    }
  });

  return (
    <div>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening 
          ? labels.voiceButton.stopText 
          : labels.voiceButton.startText
        }
      </button>
      
      {/* Conditionally show debug info based on mode */}
      {visibility.showDebugInfo && (
        <div>Debug: Provider status, processing times, etc.</div>
      )}
    </div>
  );
}
```

## Types Package (`@voice-ai-workforce/types`)

### Mode System Types

#### VoiceInterfaceMode

```typescript
type VoiceInterfaceMode = 'developer' | 'project' | 'end-user';
```

**Mode Descriptions:**
- **`developer`**: Full technical interface with all debug information
- **`project`**: Balanced interface for app developers integrating the package  
- **`end-user`**: Simplified interface with generic labeling for end users

#### VisibilityConfig

Controls which features and information are visible in the interface.

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

#### CustomLabels

Defines custom labeling for different interface elements.

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

#### Mode Presets

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
    useGenericLabels: true,
    customLabels: {
      voiceButton: {
        startText: 'Start Voice',
        stopText: 'Stop Voice',
        processingText: 'Processing...',
        errorText: 'Voice Unavailable'
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

### Utility Functions

#### useVoiceVisibility Hook

Resolves the effective visibility configuration based on global and component-level settings.

```typescript
function useVoiceVisibility(
  config: VoiceAIConfig,
  componentMode?: VoiceInterfaceMode,
  componentOverrides?: Partial<VisibilityConfig>
): { visibility: VisibilityConfig; labels: CustomLabels }
```

**Usage:**
```typescript
const { visibility, labels } = useVoiceVisibility(
  config,           // Global config with interfaceMode: 'project'
  'end-user',       // Component-level override
  {                 // Component-level visibility overrides
    showMiniCenter: false,
    showStatusIndicator: true
  }
);

// Result: end-user mode with mini center disabled
```

#### resolveVisibilityConfig Function

Manually resolve visibility configuration for custom implementations.

```typescript
function resolveVisibilityConfig(
  globalMode?: VoiceInterfaceMode,
  componentMode?: VoiceInterfaceMode,
  globalVisibility?: VisibilityConfig,
  componentOverrides?: Partial<VisibilityConfig>
): VisibilityConfig
```

#### getEffectiveLabels Function

Get the final labels based on configuration.

```typescript
function getEffectiveLabels(
  visibility: VisibilityConfig,
  customLabels?: Partial<CustomLabels>
): CustomLabels
```

### Core Interfaces (Updated)

#### VoiceAIConfig

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
  
  // Command system
  commands?: {
    registry?: CommandRegistry;
    customCommands?: CommandDefinition[];
  };
  
  // UI Configuration
  ui?: {
    theme?: 'light' | 'dark' | 'auto';
    animations?: boolean;
    sounds?: boolean;
  };
  
  // Context and permissions
  context?: {
    userRole?: string;
    permissions?: string[];
    metadata?: Record<string, any>;
  };
}
```

#### VoiceCommand (Mode-Filtered)

Commands are filtered based on the current mode:

```typescript
interface VoiceCommand {
  intent: string;                          // Always included
  entities: Record<string, any>;          // Filtered in end-user mode
  confidence: number;                     // Hidden in end-user mode if showConfidenceScores: false
  rawText: string;                        // Always included
  timestamp: Date;                        // Always included
  provider?: AIProvider;                  // Hidden in end-user mode if showProviders: false
}
```

#### VoiceResponse (Mode-Filtered)

Responses are filtered to match the current mode:

```typescript
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

## Built-in Commands

The following commands work in all modes, but their response detail varies:

| Command Pattern | Intent | Developer Response | End-User Response |
|----------------|---------|-------------------|-------------------|
| "help" | `help` | Lists commands + provider info | Lists available voice commands |
| "clock in" | `clock_in` | Confirms + processing time | Confirms clock in |
| "clock out" | `clock_out` | Confirms + metadata | Confirms clock out |
| "complete [task]" | `complete_task` | Task details + confidence | Confirms task completion |
| "status" | `get_status` | Full system status | Current status |

## Error Handling by Mode

| Error Type | Developer Mode | Project Mode | End-User Mode |
|------------|----------------|--------------|---------------|
| Network Error | Full stack trace + provider details | "Connection failed" + retry options | "Please check your connection" |
| Permission Denied | Browser API details + troubleshooting | "Microphone permission needed" | "Microphone permission required" |
| Provider Failure | Provider name + error code + logs | "Voice service error" | "Voice assistant unavailable" |
| Invalid Command | Confidence score + alternatives | "Command not recognized" | "I didn't understand that" |

## Environment Variables

Mode-related environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `VOICE_AI_DEFAULT_MODE` | Default interface mode | `'project'` |
| `VOICE_AI_ALLOW_MODE_OVERRIDE` | Allow component mode overrides | `true` |
| `VOICE_AI_DEBUG_MODE` | Force developer mode features | `false` |

## Best Practices

### Mode Selection

1. **Developer Mode**: Use during development and debugging
2. **Project Mode**: Use for business admin interfaces
3. **End-User Mode**: Use for customer-facing applications

### Performance Considerations

1. **Mode Filtering**: Enable appropriate filtering to reduce payload size
2. **Error Handling**: Use mode-appropriate error messages
3. **Debug Info**: Only show debug information when needed

### Security Considerations

1. **API Keys**: Never expose API keys in end-user mode
2. **Debug Info**: Filter sensitive debug information
3. **Error Messages**: Avoid exposing system details to end users

### Accessibility

1. **Labels**: Use appropriate labels for each mode
2. **ARIA**: Ensure ARIA labels match the current mode
3. **Keyboard Navigation**: Test navigation in all modes