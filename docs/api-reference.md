# API Reference

## Core Package (`@voice-ai-workforce/core`)

### VoiceAI Class

The main class for voice AI functionality.

#### Constructor

```typescript
new VoiceAI(config: VoiceAIConfig, events?: Partial<VoiceAIEvents>)
```

**Parameters:**
- `config` - Configuration object (required)
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

Processes text input directly without voice recognition. Useful for testing or text-based input.

```typescript
const response = await voiceAI.processTextInput('clock me in');
console.log(response.text); // "I'll clock you in now."
```

##### `speak(text: string): Promise<void>`

Converts text to speech using Web Speech API.

```typescript
await voiceAI.speak('Hello, how can I help you?');
```

##### `updateConfig(newConfig: Partial<VoiceAIConfig>): void`

Updates configuration at runtime.

```typescript
voiceAI.updateConfig({
  responseMode: ResponseMode.TEXT,
});
```

##### `updateContext(context: Record<string, any>): void`

Updates context information for better command processing.

```typescript
voiceAI.updateContext({
  userRole: 'manager',
  department: 'engineering',
});
```

##### `getState(): VoiceAIState`

Returns current state of the voice AI system.

```typescript
const state = voiceAI.getState();
console.log(state.isListening); // boolean
console.log(state.isProcessing); // boolean
console.log(state.isAvailable); // boolean
```

##### `destroy(): void`

Cleans up resources and stops all voice operations.

```typescript
voiceAI.destroy();
```

## React Package (`@voice-ai-workforce/react`)

### VoiceButton Component

A React component that provides a circular voice interface button with visual feedback.

#### Props

```typescript
interface VoiceButtonProps {
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
}
```

**Example:**
```tsx
import { VoiceButton } from '@voice-ai-workforce/react';

<VoiceButton
  config={config}
  size="lg"
  variant="primary"
  onCommand={(cmd) => setLastCommand(cmd)}
  onResponse={(res) => setLastResponse(res)}
  onError={(err) => console.error(err)}
/>
```

#### Visual States

- **Idle**: Shows microphone icon
- **Listening**: Shows stop icon with pulse animation
- **Processing**: Shows loading spinner
- **Error**: Red border with error indicator

### useVoiceAI Hook

A React hook for integrating voice AI functionality into custom components.

#### Parameters

```typescript
interface UseVoiceAIOptions {
  config: VoiceAIConfig;
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
  autoStart?: boolean;                      // Auto-start listening on mount
}
```

#### Returns

```typescript
interface UseVoiceAIReturn {
  // State
  isListening: boolean;                     // Currently listening for voice
  isProcessing: boolean;                    // Processing a command
  isAvailable: boolean;                     // Voice features available
  currentCommand?: VoiceCommand;            // Last processed command
  lastResponse?: VoiceResponse;             // Last AI response
  error?: string;                           // Current error message
  
  // Actions
  startListening: () => Promise<void>;      // Start voice recognition
  stopListening: () => Promise<void>;       // Stop voice recognition
  processText: (text: string) => Promise<VoiceResponse | undefined>; // Process text
  speak: (text: string) => Promise<void>;   // Text-to-speech
  
  // Configuration
  updateConfig: (newConfig: Partial<VoiceAIConfig>) => void;
  updateContext: (context: Record<string, any>) => void;
  
  // Utils
  getState: () => VoiceAIState;             // Get current state
}
```

**Example:**
```tsx
import { useVoiceAI } from '@voice-ai-workforce/react';

function MyComponent() {
  const {
    isListening,
    isProcessing,
    startListening,
    stopListening,
  } = useVoiceAI({
    config,
    onCommand: (cmd) => console.log('Command:', cmd),
  });

  return (
    <button onClick={isListening ? stopListening : startListening}>
      {isListening ? 'Stop' : 'Start'} Listening
    </button>
  );
}
```

## Types Package (`@voice-ai-workforce/types`)

### Core Interfaces

#### VoiceAIConfig

```typescript
interface VoiceAIConfig {
  speechToText: {
    provider: SpeechProvider;               // Currently only WEB_SPEECH
    language?: string;                      // Language code (default: 'en-US')
    continuous?: boolean;                   // Continuous recognition
  };
  textToSpeech: {
    provider: SpeechProvider;               // Currently only WEB_SPEECH
    speed?: number;                         // Speech speed (0.1 - 10)
    voice?: string;                         // Voice name
  };
  aiProvider: {
    provider: AIProvider;                   // Currently only OPENAI
    model?: string;                         // AI model name
  };
  responseMode?: ResponseMode;              // How to respond (TEXT/SPEECH/BOTH)
  context?: Record<string, any>;           // Additional context
}
```

#### VoiceCommand

```typescript
interface VoiceCommand {
  intent: string;                          // Recognized intent
  entities: Record<string, any>;          // Extracted entities
  confidence: number;                     // Confidence score (0-1)
  rawText: string;                        // Original spoken text
  timestamp: Date;                        // When command was processed
}
```

#### VoiceResponse

```typescript
interface VoiceResponse {
  text: string;                           // Response text
  success: boolean;                       // Whether command succeeded
  data?: any;                            // Additional response data
  actions?: Action[];                    // Actions to execute
}
```

#### VoiceAIState

```typescript
interface VoiceAIState {
  isListening: boolean;                   // Currently listening
  isProcessing: boolean;                  // Processing command
  isAvailable: boolean;                   // Voice features available
  currentCommand?: VoiceCommand;          // Current command
  lastResponse?: VoiceResponse;           // Last response
  error?: string;                         // Current error
}
```

### Enums

#### SpeechProvider

```typescript
enum SpeechProvider {
  WEB_SPEECH = 'web_speech'               // Browser Web Speech API
}
```

#### AIProvider

```typescript
enum AIProvider {
  OPENAI = 'openai'                       // OpenAI integration (basic)
}
```

#### ResponseMode

```typescript
enum ResponseMode {
  TEXT = 'text',                          // Text responses only
  SPEECH = 'speech',                      // Speech responses only
  BOTH = 'both'                          // Both text and speech
}
```

## Built-in Commands

The system recognizes these commands out of the box:

| Command Pattern | Intent | Response | Example Usage |
|----------------|---------|----------|---------------|
| "help" | `help` | Lists available commands | "help", "what can you do" |
| "clock in", "start work" | `clock_in` | Confirms clock in | "clock me in", "start work" |
| "clock out", "end work" | `clock_out` | Confirms clock out | "clock me out", "end work" |
| "complete [task]" | `complete_task` | Marks task complete | "complete database migration" |
| "status", "progress" | `get_status` | Shows current status | "what's my status" |

### Command Processing

Commands are processed using simple keyword matching. The system:

1. Converts speech to text using Web Speech API
2. Analyzes text for known patterns
3. Extracts intent and entities
4. Generates appropriate response
5. Executes any associated actions

## Error Handling

### Error Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| `INITIALIZATION_FAILED` | Voice services failed to start | Browser compatibility |
| `SPEECH_RECOGNITION_ERROR` | Speech recognition failed | No microphone, network issues |
| `START_LISTENING_FAILED` | Couldn't start listening | Permissions denied |
| `STOP_LISTENING_FAILED` | Couldn't stop listening | Internal error |
| `SPEECH_SYNTHESIS_FAILED` | Text-to-speech failed | Browser issues |
| `PROCESSING_FAILED` | Command processing failed | Invalid input |

### Error Handling Example

```typescript
const voiceAI = new VoiceAI(config, {
  onError: (error) => {
    switch (error.code) {
      case 'SPEECH_RECOGNITION_ERROR':
        console.log('Please check your microphone');
        break;
      case 'INITIALIZATION_FAILED':
        console.log('Voice features not available');
        break;
      default:
        console.log('Voice error:', error.message);
    }
  }
});
```

## Browser Support

### Requirements

- **Chrome/Edge**: Full support for all features
- **Safari**: Full support for all features  
- **Firefox**: Speech synthesis only (no recognition)
- **HTTPS**: Required for microphone access (except localhost)

### Feature Detection

```javascript
// Check if speech recognition is available
const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

// Check if speech synthesis is available
const hasSynthesis = 'speechSynthesis' in window;

if (!hasRecognition) {
  console.log('Speech recognition not supported');
}
```',       // Speech responses only
  BOTH = 'both',          // Both text and speech
}
```

#### ActionType

```typescript
enum ActionType {
  API_CALL = 'api_call',
  // Future action types can be added here
}
```

## Built-in Commands

The following commands are supported out of the box:

| Command | Intent | Description | Example |
|---------|--------|-------------|---------|
| Help | `help` | Shows available commands | "help", "what can you do" |
| Clock In | `clock_in` | Records start time | "clock me in", "start work" |
| Clock Out | `clock_out` | Records end time | "clock me out", "end work" |
| Complete Task | `complete_task` | Marks task as done | "complete database migration", "mark task done" |
| Get Status | `get_status` | Shows current status | "what's my status", "show progress" |

## Error Codes

| Code | Description |
|------|-------------|
| `INITIALIZATION_FAILED` | Failed to initialize voice services |
| `SPEECH_RECOGNITION_ERROR` | Speech recognition error |
| `START_LISTENING_FAILED` | Failed to start listening |
| `STOP_LISTENING_FAILED` | Failed to stop listening |
| `SPEECH_SYNTHESIS_FAILED` | Text-to-speech error |
| `PROCESSING_FAILED` | Failed to process voice input |
| `VOICE_OPERATION_FAILED` | General voice operation error |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VOICE_AI_API_KEY` | API key for external services | - |
| `VOICE_AI_API_URL` | Base URL for API calls | - |

## Best Practices

### Performance

1. **Cleanup**: Always call `destroy()` when done
2. **State Management**: Use the provided state rather than managing your own
3. **Error Handling**: Always handle errors gracefully

### Security

1. **API Keys**: Never expose API keys in client-side code
2. **Validation**: Validate voice commands before executing actions
3. **Permissions**: Handle microphone permissions gracefully

### User Experience

1. **Feedback**: Provide visual feedback during processing
2. **Fallbacks**: Offer text input alternatives
3. **Accessibility**: Use proper ARIA labels and keyboard navigation