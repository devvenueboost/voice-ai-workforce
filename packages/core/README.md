# @voice-ai-workforce/core

> Core voice AI engine for workforce management applications

[![npm](https://img.shields.io/npm/v/@voice-ai-workforce/core)](https://www.npmjs.com/package/@voice-ai-workforce/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## 📦 Installation

```bash
npm install @voice-ai-workforce/core @voice-ai-workforce/types
```

## 🚀 Quick Start

```typescript
import { VoiceAI } from '@voice-ai-workforce/core';

const voiceAI = new VoiceAI({
  speechToText: {
    provider: 'web-speech',
    language: 'en-US',
    continuous: false
  },
  textToSpeech: {
    provider: 'web-speech',
    speed: 1.0
  },
  aiProvider: {
    provider: 'openai',
    model: 'gpt-3.5-turbo'
  },
  responseMode: 'both'
});

// Start listening
await voiceAI.startListening();

// Process text input
const response = await voiceAI.processTextInput("clock me in");
console.log(response);

// Speak response
await voiceAI.speak("You are now clocked in");
```

## 🎯 Features

- **Web Speech API Integration** - Native browser voice recognition
- **Multi-Provider Support** - Web Speech, Azure, Google, OpenAI
- **Smart Command Processing** - Natural language understanding
- **Workforce Presets** - Pre-configured for different user roles
- **Flexible Configuration** - Customizable for any use case
- **TypeScript First** - Complete type safety

## 📖 API Reference

### VoiceAI Class

#### Constructor

```typescript
new VoiceAI(config: VoiceAIConfig, events?: Partial<VoiceAIEvents>)
```

#### Methods

```typescript
// Start/stop voice recognition
async startListening(): Promise<void>
async stopListening(): Promise<void>

// Process text input manually
async processTextInput(text: string): Promise<VoiceResponse>

// Text-to-speech
async speak(text: string): Promise<void>

// Configuration
updateConfig(newConfig: Partial<VoiceAIConfig>): void
updateContext(context: Record<string, any>): void

// State management
getState(): VoiceAIState
```

### Workforce Utilities

```typescript
import { 
  createWorkforceVoiceAI, 
  createQuickWorkforceVoice,
  WorkforcePresets 
} from '@voice-ai-workforce/core';

// Create workforce-specific instance
const fieldWorkerAI = createQuickWorkforceVoice(
  UserRole.FIELD_WORKER,
  'https://your-api.com',
  'your-api-key'
);

// Get preset configuration
const presets = WorkforcePresets[UserRole.MANAGER];
```

## 🎭 User Roles & Presets

### Field Worker
- **Wake Word**: "Hey Workforce"
- **Auto Listen**: True
- **Commands**: Clock in/out, task updates, issue reporting
- **Endpoints**: Timesheet, tasks, issues

### Manager  
- **Wake Word**: "Hey Manager"
- **Auto Listen**: False
- **Commands**: Task assignment, team status, project management
- **Endpoints**: Team management, project status, assignments

### Admin
- **Wake Word**: "Hey Assistant"
- **Auto Listen**: False  
- **Commands**: Analytics, reports, system management
- **Endpoints**: Analytics, reports, system status

### Client
- **Wake Word**: "Hey Support"
- **Auto Listen**: False
- **Commands**: Project status, support tickets
- **Endpoints**: Client portal, support system

## 🔧 Configuration

### Speech Providers

```typescript
// Web Speech API (Default)
speechToText: {
  provider: 'web-speech',
  language: 'en-US',
  continuous: false
}

// Azure Cognitive Services
speechToText: {
  provider: 'azure',
  apiKey: 'your-azure-key',
  region: 'eastus',
  language: 'en-US'
}

// Google Cloud Speech
speechToText: {
  provider: 'google',
  apiKey: 'your-google-key',
  language: 'en-US'
}
```

### AI Providers

```typescript
// OpenAI (Default)
aiProvider: {
  provider: 'openai',
  apiKey: 'your-openai-key',
  model: 'gpt-3.5-turbo'
}

// Anthropic Claude
aiProvider: {
  provider: 'anthropic',
  apiKey: 'your-anthropic-key',
  model: 'claude-3-sonnet'
}
```

## 🎯 Command Processing

The core engine processes voice input through these stages:

1. **Speech Recognition** - Convert speech to text
2. **Intent Parsing** - Extract command intent and entities
3. **Command Processing** - Execute business logic
4. **Response Generation** - Create appropriate response
5. **Action Execution** - Perform API calls or system actions
6. **Text-to-Speech** - Speak response to user

### Built-in Commands

- `clock_in` / `clock_out` - Time tracking
- `complete_task` - Task management  
- `get_status` - Status checking
- `help` - Show available commands
- `create_report` - Generate reports
- `assign_task` - Task delegation

### Custom Commands

```typescript
// Add custom command handler
voiceAI.addCommandHandler('custom_command', async (command) => {
  // Your custom logic here
  return {
    text: "Custom command executed",
    success: true,
    data: { /* custom data */ }
  };
});
```

## 🌐 Browser Support

- **Chrome**: Full support (recommended)
- **Firefox**: Full support  
- **Safari**: iOS 14.5+ required
- **Edge**: Full support (Chromium-based)

**Requirements:**
- HTTPS connection
- Microphone permissions
- Modern browser with ES2020+ support

## 📊 Performance

- **Bundle Size**: ~30KB gzipped
- **Initialization**: <200ms
- **Command Processing**: <500ms average
- **Memory Usage**: ~5MB typical
- **Battery Impact**: Minimal on mobile

## 🔒 Security

- **Client-side Processing** - No data leaves your environment by default
- **Configurable Privacy** - Choose what to send to external APIs
- **HTTPS Required** - Secure connection mandatory
- **Permission-based** - Explicit user consent for microphone access

## 🧪 Testing

```bash
# Run core package tests
npm test

# Test specific functionality
npm test -- --testNamePattern="VoiceAI"

# Test with coverage
npm test -- --coverage
```

## 📚 Examples

### Basic Usage

```typescript
import { VoiceAI } from '@voice-ai-workforce/core';

const ai = new VoiceAI(config);
ai.startListening();
```

### With Event Handlers

```typescript
const ai = new VoiceAI(config, {
  onCommand: (cmd) => console.log('Command:', cmd),
  onResponse: (res) => console.log('Response:', res),
  onError: (err) => console.error('Error:', err),
  onStateChange: (state) => console.log('State:', state)
});
```

### API Integration

```typescript
const ai = new VoiceAI({
  apiBaseUrl: 'https://your-api.com',
  apiKey: 'your-key',
  context: {
    endpoints: {
      clockIn: '/timesheet/clock-in',
      updateTask: '/tasks/:id/update'
    }
  }
});
```

## 🔗 Related Packages

- **[@voice-ai-workforce/react](../react)** - React components and hooks
- **[@voice-ai-workforce/types](../types)** - TypeScript type definitions

## 📄 License

MIT © [Griseld Gerveni, CTO of VenueBoost Inc.]