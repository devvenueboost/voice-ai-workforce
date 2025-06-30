# @voice-ai-workforce/react

> React components and hooks for voice-controlled workforce applications

[![npm](https://img.shields.io/npm/v/@voice-ai-workforce/react)](https://www.npmjs.com/package/@voice-ai-workforce/react)
[![React](https://img.shields.io/badge/React-18+-green)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## 📦 Installation

```bash
npm install @voice-ai-workforce/react @voice-ai-workforce/core @voice-ai-workforce/types
```

## 🚀 Quick Start

```tsx
import React from 'react';
import { VoiceButton } from '@voice-ai-workforce/react';

function App() {
  const config = {
    speechToText: { provider: 'web-speech' as any, language: 'en-US' },
    textToSpeech: { provider: 'web-speech' as any, speed: 1.0 },
    aiProvider: { provider: 'openai' as any, model: 'gpt-3.5-turbo' },
    responseMode: 'both' as any
  };

  return (
    <VoiceButton
      config={config}
      size="lg"
      variant="primary"
      onCommand={(cmd) => console.log('Command:', cmd)}
      onResponse={(res) => console.log('Response:', res)}
    />
  );
}
```

## 🧰 Components

### VoiceButton

A beautiful, accessible voice control button with visual feedback.

```tsx
<VoiceButton
  config={voiceConfig}
  size="md"           // sm | md | lg | xl
  variant="primary"   // primary | secondary | ghost | danger
  disabled={false}
  onCommand={handleCommand}
  onResponse={handleResponse}
  onError={handleError}
  className="custom-class"
  aria-label="Voice commands"
/>
```

#### Props

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

#### Sizes

| Size | Dimensions | Use Case |
|------|------------|----------|
| `sm` | 32px × 32px | Compact interfaces |
| `md` | 48px × 48px | Standard buttons |
| `lg` | 64px × 64px | Primary actions |
| `xl` | 80px × 80px | Hero interfaces |

#### Variants

| Variant | Description | Use Case |
|---------|-------------|----------|
| `primary` | Blue theme | Main voice control |
| `secondary` | Gray theme | Secondary actions |
| `ghost` | Transparent | Subtle integration |
| `danger` | Red theme | Emergency/stop actions |

#### States

- **Idle** - Ready to listen (microphone icon)
- **Listening** - Actively recording (stop icon + pulse)
- **Processing** - Analyzing speech (loading spinner)
- **Error** - Something went wrong (error indicator)

## 🪝 Hooks

### useVoiceAI

The core hook for voice AI integration.

```tsx
import { useVoiceAI } from '@voice-ai-workforce/react';

function CustomVoiceComponent() {
  const {
    isListening,
    isProcessing,
    isAvailable,
    currentCommand,
    lastResponse,
    error,
    startListening,
    stopListening,
    processText,
    speak,
    updateConfig,
    updateContext,
    getState
  } = useVoiceAI({
    config: voiceConfig,
    onCommand: handleCommand,
    onResponse: handleResponse,
    onError: handleError,
    autoStart: false
  });

  return (
    <div>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? 'Stop' : 'Start'} Listening
      </button>
      
      {isProcessing && <div>Processing...</div>}
      {error && <div>Error: {error}</div>}
      {lastResponse && <div>Response: {lastResponse.text}</div>}
    </div>
  );
}
```

#### Options

```typescript
interface UseVoiceAIOptions {
  config: VoiceAIConfig;
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
  autoStart?: boolean;
}
```

#### Return Value

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

## 🎨 Styling

### Tailwind CSS (Recommended)

The components are built with Tailwind CSS. Include Tailwind in your project:

```bash
npm install tailwindcss
```

```css
/* styles.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Custom CSS

If not using Tailwind, you can override the styles:

```css
.voice-button {
  /* Your custom styles */
  background: #3b82f6;
  border-radius: 50%;
  border: 2px solid #3b82f6;
}

.voice-button:hover {
  background: #2563eb;
}

.voice-button.listening {
  animation: pulse 2s infinite;
}
```

### CSS Modules

```tsx
import styles from './VoiceButton.module.css';

<VoiceButton
  config={config}
  className={styles.customButton}
/>
```

## 📱 Responsive Design

All components are mobile-first and responsive:

```tsx
// Responsive sizing
<VoiceButton
  config={config}
  size="md"           // Desktop
  className="lg:w-20 lg:h-20 md:w-16 md:h-16 w-12 h-12"
/>

// Mobile-specific behavior
<VoiceButton
  config={{
    ...config,
    speechToText: {
      ...config.speechToText,
      continuous: false  // Better for mobile
    }
  }}
/>
```

## ♿ Accessibility

Components follow WAI-ARIA guidelines:

- **Keyboard Navigation** - Full keyboard support
- **Screen Readers** - Proper ARIA labels and roles
- **Focus Management** - Visible focus indicators
- **Color Contrast** - WCAG AA compliant
- **Voice Alternatives** - Text input fallbacks

```tsx
<VoiceButton
  config={config}
  aria-label="Voice commands for task management"
  role="button"
  tabIndex={0}
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Handle keyboard activation
    }
  }}
/>
```

## 🎯 Examples

### Field Worker Interface

```tsx
import { VoiceButton, UserRole } from '@voice-ai-workforce/react';

function FieldWorkerApp() {
  const config = {
    speechToText: { provider: 'web-speech' as any, language: 'en-US' },
    textToSpeech: { provider: 'web-speech' as any, speed: 1.0 },
    aiProvider: { provider: 'openai' as any, model: 'gpt-3.5-turbo' },
    context: {
      userRole: UserRole.FIELD_WORKER,
      endpoints: {
        clockIn: '/api/timesheet/clock-in',
        updateTask: '/api/tasks/update'
      }
    }
  };

  const handleCommand = (command) => {
    switch (command.intent) {
      case 'clock_in':
        // Handle clock in
        break;
      case 'complete_task':
        // Handle task completion
        break;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <h1 className="text-2xl font-bold">Field Operations</h1>
      
      <VoiceButton
        config={config}
        size="xl"
        variant="primary"
        onCommand={handleCommand}
        className="mb-4"
      />
      
      <p className="text-gray-600 text-center">
        Say: "clock in", "complete task", or "status"
      </p>
    </div>
  );
}
```

### Custom Voice Interface

```tsx
import { useVoiceAI } from '@voice-ai-workforce/react';

function CustomVoiceInterface() {
  const [commandHistory, setCommandHistory] = useState([]);
  
  const {
    isListening,
    isProcessing,
    startListening,
    stopListening,
    processText
  } = useVoiceAI({
    config,
    onCommand: (command) => {
      setCommandHistory(prev => [...prev, command]);
    }
  });

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isListening 
              ? 'bg-red-500 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-all`}
        >
          {isProcessing ? (
            <Spinner className="w-8 h-8" />
          ) : isListening ? (
            <Square className="w-8 h-8" />
          ) : (
            <Microphone className="w-8 h-8" />
          )}
        </button>
      </div>

      <input
        type="text"
        placeholder="Or type a command..."
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            processText(e.target.value);
            e.target.value = '';
          }
        }}
        className="w-full p-3 border rounded-lg"
      />

      <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
        {commandHistory.map((cmd, i) => (
          <div key={i} className="p-2 bg-gray-100 rounded">
            <strong>"{cmd.rawText}"</strong>
            <div className="text-sm text-gray-600">
              Intent: {cmd.intent} | Confidence: {(cmd.confidence * 100).toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Multiple Voice Buttons

```tsx
function MultipleVoiceButtons() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Emergency button */}
      <VoiceButton
        config={emergencyConfig}
        size="lg"
        variant="danger"
        aria-label="Emergency voice commands"
      />
      
      {/* Standard operations */}
      <VoiceButton
        config={standardConfig}
        size="lg"
        variant="primary"
        aria-label="Standard voice commands"
      />
      
      {/* Quick actions */}
      <VoiceButton
        config={quickConfig}
        size="md"
        variant="secondary"
        aria-label="Quick voice actions"
      />
      
      {/* Status check */}
      <VoiceButton
        config={statusConfig}
        size="md"
        variant="ghost"
        aria-label="Status voice commands"
      />
    </div>
  );
}
```

## 🧪 Testing

### Component Testing

```tsx
import { render, fireEvent, screen } from '@testing-library/react';
import { VoiceButton } from '@voice-ai-workforce/react';

test('VoiceButton renders and handles clicks', () => {
  const onCommand = jest.fn();
  
  render(
    <VoiceButton
      config={mockConfig}
      onCommand={onCommand}
      aria-label="Test voice button"
    />
  );
  
  const button = screen.getByLabelText('Test voice button');
  fireEvent.click(button);
  
  expect(button).toBeInTheDocument();
});
```

### Hook Testing

```tsx
import { renderHook, act } from '@testing-library/react';
import { useVoiceAI } from '@voice-ai-workforce/react';

test('useVoiceAI hook manages state correctly', () => {
  const { result } = renderHook(() => 
    useVoiceAI({ config: mockConfig })
  );
  
  expect(result.current.isListening).toBe(false);
  
  act(() => {
    result.current.startListening();
  });
  
  expect(result.current.isListening).toBe(true);
});
```

## 🔗 Integration with Other Libraries

### Next.js

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { VoiceAIProvider } from '@voice-ai-workforce/react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <VoiceAIProvider config={globalVoiceConfig}>
      <Component {...pageProps} />
    </VoiceAIProvider>
  );
}
```

### React Router

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VoiceButton } from '@voice-ai-workforce/react';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header>
          <VoiceButton config={config} />
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
```

### State Management (Redux)

```tsx
import { useDispatch } from 'react-redux';
import { VoiceButton } from '@voice-ai-workforce/react';
import { executeVoiceCommand } from './store/voiceSlice';

function VoiceControlledApp() {
  const dispatch = useDispatch();
  
  const handleCommand = (command) => {
    dispatch(executeVoiceCommand(command));
  };
  
  return (
    <VoiceButton
      config={config}
      onCommand={handleCommand}
    />
  );
}
```

## 📚 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```tsx
import type { 
  VoiceButtonProps,
  VoiceButtonSize,
  VoiceButtonVariant,
  UseVoiceAIOptions,
  UseVoiceAIReturn
} from '@voice-ai-workforce/react';

// Fully typed component
const TypedVoiceButton: React.FC<VoiceButtonProps> = (props) => {
  return <VoiceButton {...props} />;
};

// Typed hook usage
const voiceHook: UseVoiceAIReturn = useVoiceAI(options);
```

## 🔗 Related Packages

- **[@voice-ai-workforce/core](../core)** - Core voice AI engine
- **[@voice-ai-workforce/types](../types)** - TypeScript type definitions

## 📄 License

MIT © [Griseld Gerveni, CTO of VenueBoost Inc.]