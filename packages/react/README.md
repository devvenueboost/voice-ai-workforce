# @voice-ai-workforce/react

> React components with 3-tier interface modes for voice-controlled workforce applications

[![npm](https://img.shields.io/npm/v/@voice-ai-workforce/react)](https://www.npmjs.com/package/@voice-ai-workforce/react)
[![React](https://img.shields.io/badge/React-18+-green)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## ✨ New: Mode-Aware React Components

Components automatically adapt their interface based on mode configuration:

**🔧 Developer Mode** - Full debug interface with technical details
**🏢 Project Mode** - Balanced interface for business applications  
**👤 End-User Mode** - Clean, simple interface for customers/employees

## 📦 Installation

```bash
npm install @voice-ai-workforce/react @voice-ai-workforce/core @voice-ai-workforce/types
```

## 🚀 Quick Start by Mode

### End-User Mode (Customer-Facing)

```tsx
import React from 'react';
import { VoiceButton } from '@voice-ai-workforce/react';

function CustomerApp() {
  const config = {
    speechToText: { provider: 'web-speech' as any },
    textToSpeech: { provider: 'web-speech' as any },
    aiProvider: { provider: 'openai' as any },
    responseMode: 'both' as any,
    interfaceMode: 'end-user' as any
  };

  return (
    <div>
      <h1>Customer Support</h1>
      <VoiceButton
        config={config}
        customLabels={{
          voiceButton: {
            startText: 'Ask for Help',
            stopText: 'Stop',
            processingText: 'Listening...'
          }
        }}
        onCommand={(command) => {
          // Command is filtered - only essential info
          console.log('Customer said:', command.rawText);
        }}
        onError={(error) => {
          // Error is user-friendly
          console.log('Simple error:', error.message); // "Voice assistant unavailable"
        }}
      />
      {/* User sees: Simple "Ask for Help" button, no technical details */}
    </div>
  );
}
```

### Project Mode (Business Admin)

```tsx
import React from 'react';
import { VoiceButton, VoiceCommandCenter } from '@voice-ai-workforce/react';

function AdminDashboard() {
  const config = {
    speechToText: { provider: 'web-speech' as any },
    textToSpeech: { provider: 'web-speech' as any },
    aiProvider: { provider: 'openai' as any },
    responseMode: 'both' as any,
    interfaceMode: 'project' as any
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      <VoiceButton
        config={config}
        showMiniCenter={true}
        onCommand={(command) => {
          // Command includes business-relevant info
          console.log('Admin command:', {
            intent: command.intent,
            confidence: command.confidence, // Available in project mode
            provider: command.provider      // Available in project mode
          });
        }}
      />
      
      <VoiceCommandCenter
        config={config}
        isOpen={true}
        showCategories={true}
        showHistory={true}
      />
      
      {/* Admin sees: Provider info, confidence scores, settings panel */}
    </div>
  );
}
```

### Developer Mode (Full Debug)

```tsx
import React from 'react';
import { VoiceButton, VoiceCommandCenter } from '@voice-ai-workforce/react';

function DeveloperConsole() {
  const config = {
    speechToText: { provider: 'web-speech' as any },
    textToSpeech: { provider: 'web-speech' as any },
    aiProvider: { provider: 'openai' as any },
    responseMode: 'both' as any,
    interfaceMode: 'developer' as any,
    visibility: {
      showDebugInfo: true,
      showProcessingTimes: true,
      showTechnicalErrors: true
    }
  };

  return (
    <div>
      <h1>Voice AI Developer Console</h1>
      
      <VoiceButton
        config={config}
        showMiniCenter={true}
        onCommand={(command) => {
          // Full command object with debug information
          console.log('Full debug command:', {
            intent: command.intent,
            entities: command.entities,
            confidence: command.confidence,
            provider: command.provider,
            processingTime: '245ms'
          });
        }}
        onError={(error) => {
          // Full technical error details
          console.error('Technical error:', error.details);
        }}
      />
      
      <VoiceCommandCenter
        config={config}
        isOpen={true}
        width={400}
        showCategories={true}
        showHistory={true}
      />
      
      {/* Developer sees: All debug info, processing times, full errors, analytics */}
    </div>
  );
}
```

## 🧰 Updated Components

### VoiceButton with Mode Support

```tsx
interface VoiceButtonProps {
  config: VoiceAIConfig;
  
  // NEW: Mode override support
  mode?: 'developer' | 'project' | 'end-user';
  visibilityOverrides?: Partial<VisibilityConfig>;
  customLabels?: Partial<CustomLabels>;
  
  // Existing props...
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'ghost';
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
}
```

#### Mode-Specific Features

| Feature | Developer | Project | End-User |
|---------|-----------|---------|----------|
| **Provider Status** | ✅ "OpenAI Connected" | ✅ "OpenAI Connected" | ❌ "Voice Assistant" |
| **Confidence Scores** | ✅ 85.2% | ✅ 85% | ❌ Hidden |
| **Error Details** | ✅ Stack traces | ⚠️ User-friendly | ❌ "Voice error" |
| **Mini Center** | ✅ Full featured | ✅ Standard | ✅ Simplified |
| **Debug Info** | ✅ Processing times | ❌ Hidden | ❌ Hidden |

### VoiceCommandCenter with Mode Support

```tsx
<VoiceCommandCenter
  config={config}
  mode="project"              // Override global mode
  visibilityOverrides={{      // Fine-tune what's shown
    showAdvancedSettings: false,
    showExportOptions: false
  }}
  customLabels={{             // Custom terminology
    providers: {
      generic: 'Smart Assistant'
    }
  }}
  isOpen={true}
  showCategories={true}
  showHistory={true}
/>
```

## 🪝 Updated Hooks

### useVoiceAI with Mode Support

```tsx
import { useVoiceAI } from '@voice-ai-workforce/react';

function CustomVoiceInterface() {
  const {
    isListening,
    startListening,
    stopListening,
    
    // NEW: Mode-aware properties
    visibility,  // What features are visible
    labels      // Resolved text labels
  } = useVoiceAI({
    config,
    mode: 'end-user',           // Component-level mode override
    visibilityOverrides: {      // Fine-tune visibility
      showMiniCenter: false
    },
    onCommand: (command) => {
      // Command is filtered based on mode
      console.log(command.intent);    // Always available
      console.log(command.confidence); // May be undefined in end-user mode
    }
  });

  return (
    <div>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? labels.voiceButton.stopText : labels.voiceButton.startText}
      </button>
      
      {/* Conditionally show features based on mode */}
      {visibility.showDebugInfo && (
        <div>Debug: Provider status, processing times, etc.</div>
      )}
    </div>
  );
}
```

## 🎨 Mode-Aware Styling

Components automatically adjust their appearance based on mode:

```css
/* Developer mode - Technical styling */
.voice-button-developer {
  border: 2px solid #3b82f6;
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
}

/* Project mode - Professional styling */
.voice-button-project {
  border: 1px solid #6b7280;
  background: #f9fafb;
}

/* End-user mode - Friendly styling */
.voice-button-end-user {
  border-radius: 50%;
  background: linear-gradient(45deg, #10b981, #059669);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
```

## 📱 Mode Examples

### Multi-Mode Application

Different parts of the same app using different modes:

```tsx
function StaffluentApp() {
  const globalConfig = {
    speechToText: { provider: 'web-speech' as any },
    textToSpeech: { provider: 'web-speech' as any },
    aiProvider: { provider: 'openai' as any },
    responseMode: 'both' as any,
    interfaceMode: 'project' as any // Global default
  };

  return (
    <div>
      <header>
        <h1>Staffluent Dashboard</h1>
        
        {/* Admin section - developer mode */}
        <VoiceCommandCenter
          config={globalConfig}
          mode="developer"  // Component override
          isOpen={true}
          position="right"
        />
      </header>

      <main>
        {/* User help - end-user mode */}
        <div className="help-section">
          <h2>Need Help?</h2>
          <VoiceButton
            config={globalConfig}
            mode="end-user"  // Component override
            customLabels={{
              voiceButton: { startText: 'Ask Question' }
            }}
          />
        </div>

        {/* Manager section - uses global project mode */}
        <VoiceButton
          config={globalConfig}
          showMiniCenter={true}
        />
      </main>
    </div>
  );
}
```

### Dynamic Mode Switching

```tsx
function ModeTestInterface() {
  const [currentMode, setCurrentMode] = useState<'developer' | 'project' | 'end-user'>('project');
  
  return (
    <div>
      <select value={currentMode} onChange={(e) => setCurrentMode(e.target.value as any)}>
        <option value="developer">Developer Mode</option>
        <option value="project">Project Mode</option>
        <option value="end-user">End-User Mode</option>
      </select>
      
      <VoiceButton
        config={baseConfig}
        mode={currentMode}
        onCommand={(cmd) => {
          // Response varies by mode
          console.log(`Mode: ${currentMode}, Command:`, cmd);
        }}
      />
    </div>
  );
}
```

### Custom Visibility Configuration

```tsx
<VoiceButton
  config={config}
  mode="project"
  visibilityOverrides={{
    showConfidenceScores: true,  // Show confidence
    showProviders: false,        // But hide provider names
    showDebugInfo: false,        // No debug info
    showMiniCenter: true         // Keep mini center
  }}
  customLabels={{
    providers: {
      generic: 'AI Assistant'    // Custom provider label
    },
    errors: {
      generic: 'Assistant temporarily unavailable'
    }
  }}
/>
```

## ♿ Mode-Aware Accessibility

Accessibility features adapt to each mode:

```tsx
// End-user mode - simplified accessibility
<VoiceButton
  config={config}
  mode="end-user"
  aria-label="Voice assistant for customer support"
  // Simple, clear labeling
/>

// Developer mode - detailed accessibility
<VoiceButton
  config={config}
  mode="developer"
  aria-label="Voice AI development console with debug information"
  // Technical but comprehensive labeling
/>
```

## 🧪 Testing Mode Behavior

```tsx
import { render, fireEvent } from '@testing-library/react';
import { VoiceButton } from '@voice-ai-workforce/react';

describe('VoiceButton Mode Behavior', () => {
  test('end-user mode hides technical details', () => {
    const { container } = render(
      <VoiceButton
        config={mockConfig}
        mode="end-user"
        onCommand={jest.fn()}
      />
    );
    
    // Should not show provider information
    expect(container.querySelector('[data-testid="provider-status"]')).toBeNull();
  });
  
  test('developer mode shows all debug info', () => {
    const { container } = render(
      <VoiceButton
        config={mockConfig}
        mode="developer"
        onCommand={jest.fn()}
      />
    );
    
    // Should show debug information
    expect(container.querySelector('[data-testid="debug-info"]')).toBeInTheDocument();
  });
});
```

## 🔧 Migration Guide

### From v1.x Components

```tsx
// Before (v1.x)
<VoiceButton
  config={config}
  onCommand={handleCommand}
/>

// After (v2.x) - Add mode selection
<VoiceButton
  config={config}
  mode="end-user"              // Choose appropriate mode
  customLabels={{              // Customize labels if needed
    voiceButton: {
      startText: 'Start Voice'
    }
  }}
  onCommand={handleCommand}
/>
```

## 🌟 Key Benefits

### Simplified Development
- **One Component Set**: Same components work for all user types
- **Automatic Filtering**: Information automatically filtered by mode
- **Easy Customization**: Override mode and visibility at component level

### Better User Experience
- **Appropriate Complexity**: Each user sees the right level of detail
- **Consistent Interface**: Familiar patterns across different modes
- **Flexible Configuration**: Fine-tune what each user type sees

### Maintainable Code
- **Type-Safe**: Full TypeScript support for all mode features
- **Single Source**: One component codebase for all interfaces
- **Easy Testing**: Test behavior in different modes

## 🔗 Related Packages

- **[@voice-ai-workforce/core](../core)** - Core engine with mode system
- **[@voice-ai-workforce/types](../types)** - TypeScript definitions for modes

## 📄 License

MIT © [Griseld Gerveni, CTO of VenueBoost Inc.]