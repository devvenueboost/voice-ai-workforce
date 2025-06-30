# @voice-ai-workforce/types

> TypeScript type definitions for Voice AI Workforce

[![npm](https://img.shields.io/npm/v/@voice-ai-workforce/types)](https://www.npmjs.com/package/@voice-ai-workforce/types)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## 📦 Installation

```bash
npm install @voice-ai-workforce/types
```

## 🎯 Overview

This package provides comprehensive TypeScript type definitions for the Voice AI Workforce ecosystem. Use these types to ensure type safety across your voice-controlled applications.

## 📚 Core Types

### VoiceAIConfig

Main configuration interface for voice AI functionality.

```typescript
interface VoiceAIConfig {
  // API Configuration
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
```

### VoiceCommand

Represents a processed voice command with extracted intent and entities.

```typescript
interface VoiceCommand {
  intent: string;                    // What the user wants to do
  entities: Record<string, any>;     // Extracted data (names, numbers, etc.)
  confidence: number;                // How confident AI is (0-1)
  rawText: string;                   // Original spoken text
  timestamp: Date;                   // When command was given
}
```

### VoiceResponse

Response from the voice AI system back to the user.

```typescript
interface VoiceResponse {
  text: string;                      // What to say back to user
  success: boolean;                  // Did the command work?
  data?: any;                        // Additional data
  actions?: VoiceAction[];           // Actions to execute
}
```

### VoiceAction

Actions that can be triggered by voice commands.

```typescript
interface VoiceAction {
  type: ActionType;
  payload: any;
  endpoint?: string;                 // API endpoint to call
  method?: HTTPMethod;               // HTTP method
}
```

### VoiceAIState

Current state of the voice AI system.

```typescript
interface VoiceAIState {
  isListening: boolean;
  isProcessing: boolean;
  isAvailable: boolean;
  currentCommand?: VoiceCommand;
  lastResponse?: VoiceResponse;
  error?: string;
}
```

### WorkforceConfig

Configuration specific to workforce management features.

```typescript
interface WorkforceConfig {
  userRole: UserRole;
  permissions: string[];
  endpoints: Record<string, string>;
}
```

## 🎭 Enums

### SpeechProvider

Available speech service providers.

```typescript
enum SpeechProvider {
  WEB_SPEECH = 'web-speech',
  AZURE = 'azure',
  GOOGLE = 'google',
  OPENAI = 'openai'
}
```

### AIProvider

Available AI service providers.

```typescript
enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  AZURE = 'azure'
}
```

### ResponseMode

How the AI should respond to users.

```typescript
enum ResponseMode {
  VOICE = 'voice',    // Audio response only
  TEXT = 'text',      // Text response only
  BOTH = 'both'       // Both audio and text
}
```

### ActionType

Types of actions that can be executed.

```typescript
enum ActionType {
  API_CALL = 'api_call',
  NOTIFICATION = 'notification',
  NAVIGATION = 'navigation',
  DATA_UPDATE = 'data_update'
}
```

### UserRole

Predefined user roles for workforce management.

```typescript
enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  FIELD_WORKER = 'field_worker',
  CLIENT = 'client'
}
```

### HTTPMethod

HTTP methods for API calls.

```typescript
enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}
```

## 🔧 React-Specific Types

### VoiceButtonProps

Props for the VoiceButton component.

```typescript
interface VoiceButtonProps {
  config: VoiceAIConfig;
  size?: VoiceButtonSize;
  variant?: VoiceButtonVariant;
  disabled?: boolean;
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
  listenText?: string;
  stopText?: string;
  'aria-label'?: string;
}
```

### VoiceButtonSize

Available button sizes.

```typescript
type VoiceButtonSize = 'sm' | 'md' | 'lg' | 'xl';
```

### VoiceButtonVariant

Available button visual styles.

```typescript
type VoiceButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
```

### UseVoiceAIOptions

Options for the useVoiceAI hook.

```typescript
interface UseVoiceAIOptions {
  config: VoiceAIConfig;
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
  autoStart?: boolean;
}
```

### UseVoiceAIReturn

Return value from the useVoiceAI hook.

```typescript
interface UseVoiceAIReturn {
  // State
  isListening: boolean;
  isProcessing: boolean;
  isAvailable: boolean;
  currentCommand?: VoiceCommand;
  lastResponse?: VoiceResponse;
  error?: string;
  
  // Actions
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  processText: (text: string) => Promise<VoiceResponse | undefined>;
  speak: (text: string) => Promise<void>;
  
  // Configuration
  updateConfig: (newConfig: Partial<VoiceAIConfig>) => void;
  updateContext: (context: Record<string, any>) => void;
  
  // Utils
  getState: () => VoiceAIState;
}
```

## ❌ Error Types

### VoiceAIError

Standardized error interface for voice AI operations.

```typescript
interface VoiceAIError {
  code: string;
  message: string;
  details?: any;
}
```

## 🎪 Event Types

### VoiceAIEvents

Event handlers for voice AI lifecycle events.

```typescript
interface VoiceAIEvents {
  onCommand: (command: VoiceCommand) => void;
  onResponse: (response: VoiceResponse) => void;
  onError: (error: VoiceAIError) => void;
  onStateChange: (state: VoiceAIState) => void;
}
```

## 🏭 Workforce Types

### WorkforcePresets

Type for workforce role presets configuration.

```typescript
type WorkforcePresets = Record<UserRole, {
  wakeWord: string;
  autoListen: boolean;
  endpoints: Record<string, string>;
}>;
```

## 🎯 Usage Examples

### Basic Type Usage

```typescript
import type { 
  VoiceAIConfig, 
  VoiceCommand, 
  VoiceResponse,
  UserRole 
} from '@voice-ai-workforce/types';

// Typed configuration
const config: VoiceAIConfig = {
  speechToText: {
    provider: 'web-speech',
    language: 'en-US'
  },
  textToSpeech: {
    provider: 'web-speech',
    speed: 1.0
  },
  aiProvider: {
    provider: 'openai',
    model: 'gpt-3.5-turbo'
  },
  responseMode: 'both',
  context: {
    userRole: UserRole.FIELD_WORKER
  }
};

// Typed command handler
const handleCommand = (command: VoiceCommand): void => {
  console.log(`Intent: ${command.intent}`);
  console.log(`Confidence: ${command.confidence}`);
  console.log(`Entities:`, command.entities);
};

// Typed response handler
const handleResponse = (response: VoiceResponse): void => {
  if (response.success) {
    console.log(`Success: ${response.text}`);
  } else {
    console.error(`Error: ${response.text}`);
  }
};
```

### React Component Typing

```typescript
import React from 'react';
import type { VoiceButtonProps } from '@voice-ai-workforce/types';

// Fully typed React component
const CustomVoiceButton: React.FC<VoiceButtonProps> = ({
  config,
  size = 'md',
  variant = 'primary',
  onCommand,
  onResponse,
  onError,
  ...props
}) => {
  // Component implementation
  return <div>Custom Voice Button</div>;
};
```

### API Integration Typing

```typescript
import type { VoiceAction, ActionType, HTTPMethod } from '@voice-ai-workforce/types';

// Typed API action
const createApiAction = (endpoint: string, data: any): VoiceAction => ({
  type: ActionType.API_CALL,
  payload: {
    endpoint,
    method: HTTPMethod.POST,
    data
  }
});

// Typed workforce configuration
const workforceConfig: WorkforceConfig = {
  userRole: UserRole.MANAGER,
  permissions: ['read:tasks', 'write:assignments'],
  endpoints: {
    assignTask: '/api/tasks/assign',
    getTeamStatus: '/api/teams/status'
  }
};
```

### Custom Type Extensions

```typescript
// Extend base types for your application
interface CustomVoiceCommand extends VoiceCommand {
  userId?: string;
  department?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface CustomVoiceResponse extends VoiceResponse {
  metadata?: {
    processingTime: number;
    source: string;
  };
}

// Custom configuration
interface CustomVoiceAIConfig extends VoiceAIConfig {
  customSettings?: {
    enableAnalytics: boolean;
    debugMode: boolean;
  };
}
```

## 🔍 Type Guards

Utility type guards for runtime type checking:

```typescript
// Type guard for VoiceCommand
export function isVoiceCommand(obj: any): obj is VoiceCommand {
  return obj && 
    typeof obj.intent === 'string' &&
    typeof obj.confidence === 'number' &&
    typeof obj.rawText === 'string' &&
    obj.timestamp instanceof Date;
}

// Type guard for VoiceResponse
export function isVoiceResponse(obj: any): obj is VoiceResponse {
  return obj &&
    typeof obj.text === 'string' &&
    typeof obj.success === 'boolean';
}

// Usage
if (isVoiceCommand(data)) {
  // TypeScript knows this is a VoiceCommand
  console.log(data.intent);
}
```

## 📋 Utility Types

```typescript
// Partial configuration for updates
type PartialVoiceAIConfig = Partial<VoiceAIConfig>;

// Optional event handlers
type OptionalVoiceAIEvents = Partial<VoiceAIEvents>;

// Command intent union type
type CommandIntent = 
  | 'clock_in' 
  | 'clock_out' 
  | 'complete_task' 
  | 'get_status' 
  | 'help'
  | string;

// Response status type
type ResponseStatus = 'success' | 'error' | 'pending';
```

## 🔗 Module Declaration

For JavaScript users who want optional typing:

```typescript
declare module '@voice-ai-workforce/core' {
  export class VoiceAI {
    constructor(config: VoiceAIConfig, events?: Partial<VoiceAIEvents>);
    startListening(): Promise<void>;
    stopListening(): Promise<void>;
    processTextInput(text: string): Promise<VoiceResponse>;
    speak(text: string): Promise<void>;
    getState(): VoiceAIState;
  }
}

declare module '@voice-ai-workforce/react' {
  export const VoiceButton: React.FC<VoiceButtonProps>;
  export function useVoiceAI(options: UseVoiceAIOptions): UseVoiceAIReturn;
}
```

## 📦 Export Structure

```typescript
// Main exports
export * from './types';

// Named exports for convenience
export type {
  VoiceAIConfig,
  VoiceCommand,
  VoiceResponse,
  VoiceAIState,
  WorkforceConfig,
  VoiceButtonProps,
  UseVoiceAIOptions,
  UseVoiceAIReturn
};

export {
  SpeechProvider,
  AIProvider,
  ResponseMode,
  ActionType,
  UserRole,
  HTTPMethod
};
```

## 🔗 Related Packages

- **[@voice-ai-workforce/core](../core)** - Core voice AI engine
- **[@voice-ai-workforce/react](../react)** - React components and hooks

## 📄 License

MIT © [Griseld Gerveni, CTO of VenueBoost Inc.]