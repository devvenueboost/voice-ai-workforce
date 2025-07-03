# @voice-ai-workforce/core

> Core voice AI engine with 3-tier interface modes for workforce management applications

[![npm](https://img.shields.io/npm/v/@voice-ai-workforce/core)](https://www.npmjs.com/package/@voice-ai-workforce/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## ✨ New: 3-Tier Interface Mode System

**🔧 Developer Mode** - Full technical interface with debug information
**🏢 Project Mode** - Balanced interface for business applications  
**👤 End-User Mode** - Clean, simple interface for employees/customers

## 📦 Installation

```bash
npm install @voice-ai-workforce/core @voice-ai-workforce/types
```

## 🚀 Quick Start by Mode

### Developer Mode (Full Debug)

```typescript
import { VoiceAI } from '@voice-ai-workforce/core';

const voiceAI = new VoiceAI({
  speechToText: { provider: 'web-speech', language: 'en-US' },
  textToSpeech: { provider: 'web-speech', speed: 1.0 },
  aiProvider: { provider: 'openai', model: 'gpt-3.5-turbo' },
  responseMode: 'both',
  
  // NEW: Developer mode configuration
  interfaceMode: 'developer',
  visibility: {
    showDebugInfo: true,
    showProviders: true,
    showConfidenceScores: true,
    showProcessingTimes: true,
    showTechnicalErrors: true
  }
});

// Get full debug information
const response = await voiceAI.processTextInput("clock me in");
console.log('Full response with debug data:', response);
// Response includes: provider info, confidence scores, processing times, etc.
```

### Project Mode (Business Admin)

```typescript
const voiceAI = new VoiceAI({
  speechToText: { provider: 'web-speech', language: 'en-US' },
  textToSpeech: { provider: 'web-speech', speed: 1.0 },
  aiProvider: { provider: 'openai', model: 'gpt-3.5-turbo' },
  responseMode: 'both',
  
  // NEW: Project mode configuration
  interfaceMode: 'project',
  visibility: {
    showProviders: true,        // Show provider names
    showConfidenceScores: true, // Show confidence for quality
    showDebugInfo: false,       // Hide technical details
    showTechnicalErrors: false  // User-friendly errors
  }
});

// Get business-appropriate information
const response = await voiceAI.processTextInput("assign task to John");
console.log('Business response:', response);
// Response includes: provider status, confidence, but no debug data
```

### End-User Mode (Simple Interface)

```typescript
const voiceAI = new VoiceAI({
  speechToText: { provider: 'web-speech', language: 'en-US' },
  textToSpeech: { provider: 'web-speech', speed: 1.0 },
  aiProvider: { provider: 'openai', model: 'gpt-3.5-turbo' },
  responseMode: 'both',
  
  // NEW: End-user mode configuration
  interfaceMode: 'end-user',
  visibility: {
    useGenericLabels: true,     // "Voice Assistant" not "OpenAI"
    showProviders: false,       // Hide all provider info
    showDebugInfo: false,       // No technical details
    showConfidenceScores: false, // No confusing numbers
    showTechnicalErrors: false,  // Friendly error messages
    customLabels: {
      errors: {
        generic: 'Voice assistant is temporarily unavailable',
        connection: 'Please check your connection',
        permission: 'Microphone permission required'
      }
    }
  }
});

// Get simple, user-friendly response
const response = await voiceAI.processTextInput("help me");
console.log('Simple response:', response);
// Response includes: just the text and basic success flag
```

## 🎯 Mode Selection Guide

| Use Case | Recommended Mode | Why |
|----------|------------------|-----|
| **Package Development** | Developer | Need all debug info and technical details |
| **Business Admin Panel** | Project | Configuration + analytics without overwhelming detail |
| **Employee Mobile App** | End-User | Clean interface focused on core functionality |
| **Customer Support** | End-User | Simple "ask for help" without technical jargon |

## 📖 Updated API Reference

### VoiceAI Constructor

```typescript
new VoiceAI(config: VoiceAIConfig, events?: Partial<VoiceAIEvents>)
```

#### New Mode-Aware Configuration

```typescript
interface VoiceAIConfig {
  // Existing configuration...
  speechToText: SpeechToTextConfig;
  textToSpeech: TextToSpeechConfig;
  aiProvider: AIProviderConfig;
  
  // NEW: Mode system
  interfaceMode?: 'developer' | 'project' | 'end-user';
  visibility?: VisibilityConfig;
}
```

#### Mode-Filtered Responses

Responses are automatically filtered based on the current mode:

```typescript
// Developer mode - full information
{
  text: "You are now clocked in",
  success: true,
  metadata: {
    provider: "openai",
    confidence: 0.95,
    processingTime: 245,
    cached: false
  }
}

// Project mode - business-relevant info
{
  text: "You are now clocked in", 
  success: true,
  metadata: {
    provider: "openai",
    confidence: 0.95
    // processingTime filtered out
  }
}

// End-user mode - minimal info
{
  text: "You are now clocked in",
  success: true
  // metadata filtered out completely
}
```

## 🏗️ Workforce Mode Presets

Updated workforce utilities with mode awareness:

```typescript
import { createWorkforceVoiceAI, WorkforcePresets } from '@voice-ai-workforce/core';

// Create role-specific instance with appropriate mode
const fieldWorkerAI = createWorkforceVoiceAI({
  userRole: 'field_worker',
  permissions: ['clock:in', 'clock:out'],
  endpoints: { clockIn: '/api/clock-in' }
}, {
  // Field workers get end-user mode for simplicity
  interfaceMode: 'end-user'
});

const managerAI = createWorkforceVoiceAI({
  userRole: 'manager', 
  permissions: ['assign:tasks', 'view:analytics'],
  endpoints: { assignTask: '/api/tasks/assign' }
}, {
  // Managers get project mode for configuration
  interfaceMode: 'project'
});
```

## 🔧 Mode-Aware Error Handling

Errors are filtered based on the current mode:

```typescript
// Developer mode - full technical details
{
  code: 'OPENAI_API_ERROR',
  message: 'OpenAI API request failed: 429 Rate limit exceeded',
  details: {
    statusCode: 429,
    headers: {...},
    stack: '...'
  },
  suggestions: ['Check API key', 'Implement rate limiting']
}

// Project mode - business-friendly technical info
{
  code: 'API_ERROR',
  message: 'Voice service temporarily unavailable due to rate limits',
  suggestions: ['Try again in a moment', 'Check service status']
}

// End-user mode - simple, friendly message
{
  code: 'VOICE_ERROR',
  message: 'Voice assistant is temporarily unavailable',
  suggestions: ['Please try again']
}
```

## 🎯 Migration from v1.x

### Before (v1.x)
```typescript
const voiceAI = new VoiceAI({
  speechToText: { provider: 'web-speech' },
  aiProvider: { provider: 'openai' }
  // Fixed interface for everyone
});
```

### After (v2.x) - Choose Your Mode
```typescript
const voiceAI = new VoiceAI({
  speechToText: { provider: 'web-speech' },
  aiProvider: { provider: 'openai' },
  
  // NEW: Interface mode selection
  interfaceMode: 'end-user', // or 'project' or 'developer'
  visibility: {
    showProviders: false,      // Hide "OpenAI" from end users
    useGenericLabels: true,    // Show "Voice Assistant"
    showDebugInfo: false       // No technical details
  }
});
```

## ✨ Key Benefits of Mode System

### For Developers
- **Full Debugging**: See provider details, confidence scores, processing times
- **Complete Error Info**: Stack traces and technical details
- **Advanced Analytics**: All metrics and performance data

### For Project Managers  
- **Business Configuration**: Provider status and settings without overwhelming detail
- **Quality Metrics**: Confidence scores for monitoring
- **Professional Interface**: Technical but user-friendly

### For End Users
- **Clean Interface**: "Voice Assistant" instead of "OpenAI API"
- **Friendly Errors**: "Voice unavailable" instead of "HTTP 429 error"
- **Focus on Tasks**: No technical distractions

## 🌐 Browser Support

Mode system works across all supported browsers with no additional requirements.

## 📚 Examples

See updated examples in the [API Reference](./docs/api-reference.md) and [Examples](./docs/examples.md) documentation.

## 🔗 Related Packages

- **[@voice-ai-workforce/react](../react)** - React components with mode support
- **[@voice-ai-workforce/types](../types)** - TypeScript definitions for mode system

## 📄 License

MIT © [Griseld Gerveni, CTO of VenueBoost Inc.]