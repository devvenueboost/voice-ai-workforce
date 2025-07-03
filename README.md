# 🎤 Voice AI for Workforce Management

> Transform your workforce operations with AI-powered voice commands across three interface modes

*Built with ❤️ by [Griseld Gerveni](https://github.com/devvenueboost), CTO of VenueBoost Inc.*

[![npm](https://img.shields.io/npm/v/@voice-ai-workforce/core)](https://www.npmjs.com/package/@voice-ai-workforce/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-green)](https://reactjs.org/)

## ✨ Three Interface Modes for Every User Type

**🔧 Developer Mode** - For package developers and debugging
- Full technical interface with all debug information
- Complete provider details and processing metrics
- Advanced settings and analytics

**🏢 Project Mode** - For business applications integrating the package
- Balanced interface with configurable features
- Some technical info with user-friendly presentation
- Business admin controls and analytics

**👤 End-User Mode** - For employees, customers, and end users
- Clean, simple interface with generic labeling
- No technical jargon or provider information
- Focus on core functionality

## 🚀 What This Solves by User Type

### For Developers (Developer Mode)
**Before**: "I need to debug why voice recognition isn't working, but I can't see the provider details, confidence scores, or processing times..."

**After**: Full technical dashboard with OpenAI status, 85% confidence scores, 245ms processing times, and complete error stack traces.

### For Business Admins (Project Mode)
**Before**: "I want to configure voice features for my team, but I don't need all the technical details cluttering the interface..."

**After**: Clean admin interface showing "OpenAI Connected" with confidence scores and settings, but no overwhelming debug data.

### For End Users (End-User Mode)
**Before**: "I just want to say 'clock me in' but this interface is showing OpenAI APIs, confidence scores, and technical errors..."

**After**: Simple "Start Voice" button that just works, with friendly "Voice Assistant" labeling and user-friendly error messages.

## 🚀 Quick Start by Mode

### Developer Mode (Full Debug Interface)

```tsx
import React from 'react';
import { VoiceButton } from '@voice-ai-workforce/react';

function DeveloperApp() {
  const config = {
    speechToText: { provider: 'web-speech' as any, language: 'en-US' },
    textToSpeech: { provider: 'web-speech' as any, speed: 1.0 },
    aiProvider: { provider: 'openai' as any, model: 'gpt-3.5-turbo' },
    responseMode: 'both' as any,
    
    // Developer mode - show everything
    interfaceMode: 'developer' as any,
    visibility: {
      showDebugInfo: true,
      showProviders: true,
      showConfidenceScores: true,
      showProcessingTimes: true,
      showTechnicalErrors: true,
      showAdvancedSettings: true,
      showAnalytics: true
    }
  };

  return (
    <VoiceButton
      config={config}
      onCommand={(cmd) => {
        // Full command object with all debug data
        console.log('Full debug:', {
          intent: cmd.intent,
          confidence: cmd.confidence, // 0.85
          provider: cmd.provider, // "openai"
          processingTime: cmd.metadata?.processingTime // "245ms"
        });
      }}
      onError={(err) => {
        // Technical error with stack trace
        console.error('Technical error:', err.details);
      }}
    />
  );
}
```

**Developer sees**: OpenAI status, confidence scores, processing times, full error messages, analytics dashboard.

### Project Mode (Business Admin Interface)

```tsx
import React from 'react';
import { VoiceButton, VoiceCommandCenter } from '@voice-ai-workforce/react';

function BusinessAdminApp() {
  const config = {
    speechToText: { provider: 'web-speech' as any },
    textToSpeech: { provider: 'web-speech' as any },
    aiProvider: { provider: 'openai' as any },
    responseMode: 'both' as any,
    
    // Project mode - balanced interface
    interfaceMode: 'project' as any,
    visibility: {
      showProviders: true,        // Show "OpenAI Connected"
      showConfidenceScores: true, // Show confidence for quality
      showDebugInfo: false,       // Hide technical details
      showAdvancedSettings: true, // Allow configuration
      showAnalytics: true         // Business insights
    }
  };

  return (
    <div>
      <h1>Staffluent Admin Dashboard</h1>
      
      <VoiceButton
        config={config}
        showMiniCenter={true}
        onCommand={(cmd) => {
          // Command with business-relevant info
          console.log('Business command:', {
            intent: cmd.intent,
            confidence: cmd.confidence, // For quality monitoring
            success: true
          });
        }}
      />
      
      <VoiceCommandCenter
        config={config}
        isOpen={true}
        showCategories={true}
        showHistory={true}
      />
    </div>
  );
}
```

**Business admin sees**: Provider status, confidence scores, settings panel, some analytics, user-friendly errors.

### End-User Mode (Simple Customer Interface)

```tsx
import React from 'react';
import { VoiceButton } from '@voice-ai-workforce/react';

function CustomerApp() {
  const config = {
    speechToText: { provider: 'web-speech' as any },
    textToSpeech: { provider: 'web-speech' as any },
    aiProvider: { provider: 'openai' as any },
    responseMode: 'both' as any,
    
    // End-user mode - clean and simple
    interfaceMode: 'end-user' as any,
    visibility: {
      useGenericLabels: true,     // "Voice Assistant" not "OpenAI"
      showProviders: false,       // Hide all provider info
      showDebugInfo: false,       // No technical details
      showConfidenceScores: false, // No confusing numbers
      showAdvancedSettings: false, // Keep it simple
      customLabels: {
        voiceButton: {
          startText: 'Ask for Help',
          stopText: 'Stop',
          processingText: 'Listening...',
          errorText: 'Voice Unavailable'
        },
        providers: {
          generic: 'Voice Assistant'
        },
        errors: {
          generic: 'Voice assistant is temporarily unavailable',
          connection: 'Please check your connection',
          permission: 'Microphone permission required'
        }
      }
    }
  };

  return (
    <div>
      <h1>Need Help?</h1>
      <p>Ask questions or report issues using voice</p>
      
      <VoiceButton
        config={config}
        size="lg"
        onCommand={(cmd) => {
          // Simple command - no technical details
          console.log('User said:', cmd.rawText);
        }}
        onError={(err) => {
          // User-friendly error message
          console.log('Simple error:', err.message); // "Voice assistant unavailable"
        }}
      />
      
      <p>Try saying: "I need help with my timesheet"</p>
    </div>
  );
}
```

**End user sees**: "Ask for Help" button, "Voice Assistant" labeling, friendly error messages, no technical details.

## 📦 Packages

| Package | Description | Size |
|---------|-------------|------|
| **@voice-ai-workforce/core** | Core voice AI engine with 3-tier mode system | ![core](https://img.shields.io/bundlephobia/minzip/@voice-ai-workforce/core) |
| **@voice-ai-workforce/react** | React components with mode-aware interfaces | ![react](https://img.shields.io/bundlephobia/minzip/@voice-ai-workforce/react) |
| **@voice-ai-workforce/types** | TypeScript definitions for mode system | ![types](https://img.shields.io/bundlephobia/minzip/@voice-ai-workforce/types) |

## 🎯 Mode Selection Guide

### When to Use Each Mode

| Scenario | Recommended Mode | Why |
|----------|------------------|-----|
| **Package Development** | Developer | Need all debug info and technical details |
| **Business Admin Panel** | Project | Need configuration but not overwhelming detail |
| **Employee Mobile App** | End-User | Clean interface focused on core tasks |
| **Customer Support Portal** | End-User | Simple "ask for help" functionality |
| **Manager Dashboard** | Project | Analytics and settings with professional look |
| **Field Worker App** | End-User | Voice commands without technical distractions |

### Mode Comparison

| Feature | Developer | Project | End-User |
|---------|-----------|---------|----------|
| **Provider Names** | ✅ "OpenAI", "Anthropic" | ✅ "OpenAI", "Anthropic" | ❌ "Voice Assistant" |
| **Confidence Scores** | ✅ 85.2% confidence | ✅ 85% confidence | ❌ Hidden |
| **Error Details** | ✅ Full stack trace | ⚠️ User-friendly technical | ❌ "Voice unavailable" |
| **Processing Times** | ✅ 245ms, 1.2s | ❌ Hidden | ❌ Hidden |
| **Advanced Settings** | ✅ Full configuration | ✅ Business settings | ❌ None |
| **Debug Information** | ✅ All debug data | ❌ Hidden | ❌ Hidden |
| **Analytics** | ✅ Detailed metrics | ✅ Business metrics | ❌ None |

## 🛠️ API Reference

### Mode-Aware Configuration

```typescript
interface VoiceAIConfig {
  // Core settings
  speechToText: SpeechToTextConfig;
  textToSpeech: TextToSpeechConfig;
  aiProvider: AIProviderConfig;
  responseMode?: ResponseMode;
  
  // NEW: Mode system
  interfaceMode?: VoiceInterfaceMode; // 'developer' | 'project' | 'end-user'
  visibility?: VisibilityConfig;       // Override what's visible
  
  // Existing settings...
  apiBaseUrl?: string;
  context?: Record<string, any>;
}

// Mode types
type VoiceInterfaceMode = 'developer' | 'project' | 'end-user';

interface VisibilityConfig {
  // Provider information
  showProviders?: boolean;           // Show AI provider names
  showProviderStatus?: boolean;      // Show online/offline status
  
  // Debug and technical info
  showDebugInfo?: boolean;           // Show processing times, internal data
  showConfidenceScores?: boolean;    // Show confidence percentages
  showTechnicalErrors?: boolean;     // Show stack traces
  
  // User interface features
  showAdvancedSettings?: boolean;    // Show configuration panel
  showAnalytics?: boolean;           // Show metrics and insights
  showMiniCenter?: boolean;          // Show mini command center
  
  // Labeling
  useGenericLabels?: boolean;        // Use "Voice Assistant" vs "OpenAI"
  customLabels?: CustomLabels;       // Custom text overrides
}
```

### VoiceButton with Mode Support

```typescript
interface VoiceButtonProps {
  config: VoiceAIConfig;
  
  // Mode overrides (optional)
  mode?: VoiceInterfaceMode;                    // Override global mode
  visibilityOverrides?: Partial<VisibilityConfig>; // Override visibility
  customLabels?: Partial<CustomLabels>;        // Override labels
  
  // Existing props...
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'ghost';
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
}

// Example: Component-level mode override
<VoiceButton
  config={globalConfig}      // Global: project mode
  mode="end-user"            // This component: end-user mode
  customLabels={{
    voiceButton: { startText: 'Ask Question' }
  }}
/>
```

### Mode-Filtered Response Types

```typescript
// Commands are filtered based on current mode
interface VoiceCommand {
  intent: string;                    // Always included
  rawText: string;                   // Always included
  timestamp: Date;                   // Always included
  
  // Mode-dependent fields
  entities?: Record<string, any>;    // Hidden in end-user mode
  confidence?: number;               // Hidden if showConfidenceScores: false
  provider?: AIProvider;             // Hidden if showProviders: false
}

// Responses are filtered to match mode
interface VoiceResponse {
  text: string;                      // Always included
  success: boolean;                  // Always included
  data?: any;                        // Always included
  
  // Mode-dependent metadata
  metadata?: {
    provider?: AIProvider;           // Hidden if showProviders: false
    confidence?: number;             // Hidden if showConfidenceScores: false
    processingTime?: number;         // Hidden if showProcessingTimes: false
  };
}
```

### useVoiceAI Hook with Mode Support

```typescript
const {
  isListening,
  startListening,
  stopListening,
  
  // NEW: Mode-aware properties
  visibility,  // Resolved visibility settings
  labels      // Resolved label configuration
} = useVoiceAI({
  config,
  mode: 'end-user',                 // Component mode override
  visibilityOverrides: {            // Fine-tune visibility
    showMiniCenter: false
  },
  onCommand: (command) => {
    // Command object filtered based on mode
    console.log(command.intent);    // Always available
    console.log(command.confidence); // May be undefined in end-user mode
  }
});
```

## 🎬 Complete Examples

### Environment-Based Mode Configuration

```typescript
// config/voice.ts - Environment-based setup
const getVoiceMode = (): VoiceInterfaceMode => {
  if (process.env.NODE_ENV === 'development') return 'developer';
  if (process.env.REACT_APP_USER_TYPE === 'admin') return 'project';
  return 'end-user';
};

export const voiceConfig = {
  speechToText: { provider: 'web-speech' as any },
  textToSpeech: { provider: 'web-speech' as any },
  aiProvider: { provider: 'openai' as any },
  responseMode: 'both' as any,
  interfaceMode: getVoiceMode(),
};
```

### Multi-Tenant Application

```typescript
// Different modes for different user types in same app
function StaffluentApp() {
  const user = useUser();
  
  // Determine mode based on user role
  const getVoiceMode = () => {
    if (user.role === 'admin') return 'project';
    if (user.role === 'customer') return 'end-user';
    return 'end-user'; // Default for employees
  };

  return (
    <div>
      {/* Admin section - project mode */}
      {user.role === 'admin' && (
        <VoiceCommandCenter
          config={baseConfig}
          mode="project"
          isOpen={true}
        />
      )}
      
      {/* User help - end-user mode */}
      <VoiceButton
        config={baseConfig}
        mode={getVoiceMode()}
        customLabels={{
          voiceButton: {
            startText: user.role === 'customer' ? 'Ask for Help' : 'Voice Command'
          }
        }}
      />
    </div>
  );
}
```

### Dynamic Mode Switching

```typescript
function DevelopmentConsole() {
  const [currentMode, setCurrentMode] = useState<VoiceInterfaceMode>('project');
  
  return (
    <div>
      {/* Mode selector for testing */}
      <select value={currentMode} onChange={(e) => setCurrentMode(e.target.value as any)}>
        <option value="developer">Developer Mode</option>
        <option value="project">Project Mode</option>
        <option value="end-user">End-User Mode</option>
      </select>
      
      {/* Voice interface that adapts to selected mode */}
      <VoiceButton
        config={baseConfig}
        mode={currentMode}
        onCommand={(cmd) => {
          // Command details vary by mode
          console.log('Mode:', currentMode);
          console.log('Command:', cmd);
        }}
      />
    </div>
  );
}
```

## 🌐 Browser Support & Mode Considerations

| Browser | Speech Recognition | Speech Synthesis | Mode Recommendations |
|---------|-------------------|------------------|----------------------|
| **Chrome** | ✅ Full Support | ✅ Full Support | All modes work perfectly |
| **Firefox** | ✅ Full Support | ✅ Full Support | Excellent for all modes |
| **Safari** | ✅ iOS 14.5+ | ✅ Full Support | End-user mode ideal for mobile |
| **Edge** | ✅ Full Support | ✅ Full Support | All modes supported |

**Mode-Specific Considerations:**
- **Developer mode**: Best in desktop Chrome/Firefox for debugging
- **Project mode**: Works well in all modern browsers
- **End-user mode**: Optimized for mobile Safari/Chrome

## 🔒 Security & Privacy by Mode

### Developer Mode
- **Full access** to all debug information
- **API keys visible** in debug panels
- **Complete error details** including stack traces
- **Use only in development** environments

### Project Mode
- **Filtered debug info** - no API keys exposed
- **Business-safe errors** without stack traces
- **Provider info visible** but user-friendly
- **Safe for business admin** interfaces

### End-User Mode
- **No sensitive data** exposed to end users
- **Generic labeling** - no provider names
- **User-friendly errors** only
- **Production-safe** for customer-facing apps

## 🚀 Performance by Mode

### Bundle Optimization
```javascript
// webpack.config.js - Mode-specific optimization
const modeOptimization = {
  'end-user': {
    // Smallest bundle - strip debug features
    exclude: /debug|analytics|advanced/,
    minimizer: ['terser-webpack-plugin']
  },
  'project': {
    // Balanced bundle - keep business features
    include: /analytics/,
    exclude: /debug/
  },
  'developer': {
    // Full bundle - keep everything
    minimize: false,
    devtool: 'source-map'
  }
};
```

### Runtime Performance
- **End-user mode**: Fastest - minimal features, no debug overhead
- **Project mode**: Balanced - some analytics, filtered debug info
- **Developer mode**: Full features - complete debug information

## 📚 Migration Guide

### Upgrading from v1.x to v2.x (Mode System)

```typescript
// Before (v1.x)
const voiceAI = new VoiceAI({
  speechToText: { provider: 'web-speech' },
  aiProvider: { provider: 'openai' },
  // Fixed interface for everyone
});

// After (v2.x) - Choose your mode
const voiceAI = new VoiceAI({
  speechToText: { provider: 'web-speech' },
  aiProvider: { provider: 'openai' },
  
  // NEW: Choose interface mode
  interfaceMode: 'end-user', // or 'project' or 'developer'
  
  // NEW: Customize what's visible
  visibility: {
    showProviders: false,      // Hide "OpenAI" from end users
    useGenericLabels: true,    // Show "Voice Assistant"
    showDebugInfo: false       // No technical details
  }
});
```

## 🤝 Contributing

We welcome contributions! The mode system makes it easier to contribute:

- **Bug fixes**: Test in all 3 modes
- **New features**: Consider mode-appropriate visibility
- **Documentation**: Include mode-specific examples

### Development Setup
```bash
# Clone and install
git clone https://github.com/your-org/voice-ai-workforce.git
npm install

# Run in developer mode for full debugging
npm run dev:developer

# Test all modes
npm run test:modes
```

## 📊 Real-World Usage by Mode

### Developer Mode Usage
> "Perfect for debugging voice recognition issues. I can see exactly which provider failed and why."
> *- React Developer*

### Project Mode Usage  
> "Great for our admin dashboard. Shows business-relevant info without overwhelming technical details."
> *- Product Manager*

### End-User Mode Usage
> "Employees love how simple it is. Just says 'Start Voice' and works immediately."
> *- HR Director*

## 🗺️ Roadmap

- [x] **v2.0** - 3-tier mode system (developer/project/end-user)
- [ ] **v2.1** - Dynamic mode switching within applications
- [ ] **v2.2** - Role-based automatic mode selection
- [ ] **v2.3** - Advanced analytics per mode
- [ ] **v3.0** - Multi-language mode support

## 📄 License

MIT © [Griseld Gerveni, CTO of VenueBoost Inc.]

---

## 🔗 Links

- **[Installation Guide](./docs/installation.md)** - Mode-specific setup
- **[API Reference](./docs/api-reference.md)** - Complete mode documentation
- **[Examples](./docs/examples.md)** - Mode-specific examples
- **[Troubleshooting](./docs/troubleshooting.md)** - Mode-related issues
- **[GitHub](https://github.com/devvenueboost/voice-ai-workforce)** - Source code
- **[npm Package](https://www.npmjs.com/package/@voice-ai-workforce/core)** - Install

**Made with ❤️ for developers, businesses, and end users**