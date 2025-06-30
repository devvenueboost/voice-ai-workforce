# Examples

## Quick Start Examples

### Basic Voice Button (React)

```tsx
import React from 'react';
import { VoiceButton } from '@voice-ai-workforce/react';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

const config = {
  speechToText: {
    provider: SpeechProvider.WEB_SPEECH,
    language: 'en-US',
  },
  textToSpeech: {
    provider: SpeechProvider.WEB_SPEECH,
    speed: 1.0,
  },
  aiProvider: {
    provider: AIProvider.OPENAI,
  },
  responseMode: ResponseMode.BOTH,
};

function App() {
  return (
    <div>
      <h1>Voice AI Demo</h1>
      <VoiceButton
        config={config}
        size="lg"
        onCommand={(command) => console.log('Command:', command)}
        onResponse={(response) => console.log('Response:', response)}
      />
      <p>Click and say: "help", "clock me in", "clock me out", or "complete task"</p>
    </div>
  );
}

export default App;
```

### Basic Voice AI (Vanilla JavaScript)

```javascript
import { VoiceAI } from '@voice-ai-workforce/core';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

const config = {
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
};

const voiceAI = new VoiceAI(config, {
  onCommand: (command) => {
    console.log('Command received:', command.intent, command.rawText);
  },
  onResponse: (response) => {
    console.log('Response:', response.text);
  },
  onStateChange: (state) => {
    console.log('State changed:', state);
  }
});

// Start listening
await voiceAI.startListening();

// Or process text directly
const response = await voiceAI.processTextInput('help');
console.log(response.text);
```

## Using the useVoiceAI Hook

```tsx
import React from 'react';
import { useVoiceAI } from '@voice-ai-workforce/react';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

function CustomVoiceComponent() {
  const config = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
  };

  const {
    isListening,
    isProcessing,
    isAvailable,
    startListening,
    stopListening,
    error
  } = useVoiceAI({
    config,
    onCommand: (command) => console.log('Command:', command),
    onResponse: (response) => console.log('Response:', response),
  });

  return (
    <div>
      <button 
        onClick={isListening ? stopListening : startListening}
        disabled={!isAvailable || isProcessing}
      >
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      
      {isProcessing && <p>Processing...</p>}
      {error && <p>Error: {error}</p>}
      {!isAvailable && <p>Voice not available</p>}
    </div>
  );
}
```

## Text Input Fallback

```tsx
import React, { useState } from 'react';
import { useVoiceAI } from '@voice-ai-workforce/react';

function VoiceWithTextFallback() {
  const [textInput, setTextInput] = useState('');
  const [lastResponse, setLastResponse] = useState(null);

  const {
    isListening,
    isAvailable,
    startListening,
    stopListening,
    processText
  } = useVoiceAI({
    config,
    onResponse: setLastResponse
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      await processText(textInput);
      setTextInput('');
    }
  };

  return (
    <div>
      {/* Voice Input */}
      {isAvailable && (
        <button onClick={isListening ? stopListening : startListening}>
          {isListening ? 'Stop' : 'Start'} Voice
        </button>
      )}

      {/* Text Input Fallback */}
      <form onSubmit={handleSubmit}>
        <input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type: help, clock me in, etc."
        />
        <button type="submit">Send</button>
      </form>

      {/* Response */}
      {lastResponse && <p>Response: {lastResponse.text}</p>}
    </div>
  );
}
```

## Testing Commands

```javascript
// Test all built-in commands
import { VoiceAI } from '@voice-ai-workforce/core';

const voiceAI = new VoiceAI(config);

async function testCommands() {
  const commands = [
    'help',
    'clock me in', 
    'start work',
    'clock me out',
    'end work', 
    'complete task',
    'complete documentation',
    'what is my status'
  ];

  for (const command of commands) {
    const response = await voiceAI.processTextInput(command);
    console.log(`"${command}" -> Intent: ${response.success ? 'recognized' : 'unknown'}`);
    console.log(`Response: ${response.text}\n`);
  }
}

testCommands();
```

## Browser Support Check

```javascript
function checkVoiceSupport() {
  const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  const hasSynthesis = 'speechSynthesis' in window;
  const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
  
  return {
    canListen: hasRecognition && isHTTPS,
    canSpeak: hasSynthesis,
    needsHTTPS: !isHTTPS
  };
}

const support = checkVoiceSupport();
console.log('Voice support:', support);

if (!support.canListen) {
  console.log('Use text input only');
}
```

## Error Handling

```tsx
import React, { useState } from 'react';
import { VoiceButton } from '@voice-ai-workforce/react';

function VoiceWithErrors() {
  const [error, setError] = useState(null);

  const handleError = (error) => {
    console.error('Voice error:', error);
    setError(error.message);
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div>
      <VoiceButton
        config={config}
        onError={handleError}
        onCommand={() => setError(null)} // Clear error on success
      />
      
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}
```

## Minimal Working Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Voice AI Test</title>
</head>
<body>
    <button id="voice-btn">Start Listening</button>
    <div id="output"></div>

    <script type="module">
        import { VoiceAI } from '@voice-ai-workforce/core';
        import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

        const config = {
            speechToText: { provider: SpeechProvider.WEB_SPEECH },
            textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
            aiProvider: { provider: AIProvider.OPENAI },
            responseMode: ResponseMode.BOTH,
        };

        const voiceAI = new VoiceAI(config, {
            onCommand: (cmd) => {
                document.getElementById('output').innerHTML = `Command: ${cmd.intent}`;
            },
            onResponse: (res) => {
                document.getElementById('output').innerHTML += `<br>Response: ${res.text}`;
            },
            onStateChange: (state) => {
                document.getElementById('voice-btn').textContent = 
                    state.isListening ? 'Stop Listening' : 'Start Listening';
            }
        });

        document.getElementById('voice-btn').onclick = async () => {
            const state = voiceAI.getState();
            if (state.isListening) {
                await voiceAI.stopListening();
            } else {
                await voiceAI.startListening();
            }
        };
    </script>
</body>
</html>
```

## Running the Demo

```bash
# Clone your repo
git clone https://github.com/devvenueboost/voice-ai-workforce.git
cd voice-ai-workforce

# Install and build
npm install
npm run build:sequential

# Run demo
cd examples/basic-demo
npm run dev
```

That's it. These examples show exactly what your voice AI system can do - no more, no less. (isListening.value) {
    await voiceAI.stopListening();
  } else {
    await voiceAI.startListening();
  }
};
</script>

<style scoped>
.voice-component button.active {
  background-color: #ef4444;
  color: white;
}
</style>
```

### Angular Component

```typescript
// voice.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { VoiceAI } from '@voice-ai-workforce/core';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

@Component({
  selector: 'app-voice',
  template: `
    <div class="voice-component">
      <button 
        (click)="toggleListening()"
        [disabled]="!isAvailable || isProcessing"
        [class.active]="isListening"
      >
        {{ isListening ? 'Stop Listening' : 'Start Listening' }}
      </button>
      
      <div *ngIf="lastCommand" class="command">
        Last command: {{ lastCommand.intent }}
      </div>
      
      <div *ngIf="lastResponse" class="response">
        Response: {{ lastResponse.text }}
      </div>
    </div>
  `,
  styles: [`
    .voice-component button.active {
      background-color: #ef4444;
      color: white;
    }
  `]
})
export class VoiceComponent implements OnInit, OnDestroy {
  isListening = false;
  isProcessing = false;
  isAvailable = false;
  lastCommand: any = null;
  lastResponse: any = null;
  
  private voiceAI: VoiceAI | null = null;

  ngOnInit() {
    const config = {
      speechToText: { provider: SpeechProvider.WEB_SPEECH },
      textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
      aiProvider: { provider: AIProvider.OPENAI },
      responseMode: ResponseMode.BOTH,
    };

    this.voiceAI = new VoiceAI(config, {
      onCommand: (command) => {
        this.lastCommand = command;
      },
      onResponse: (response) => {
        this.lastResponse = response;
      },
      onStateChange: (state) => {
        this.isListening = state.isListening;
        this.isProcessing = state.isProcessing;
        this.isAvailable = state.isAvailable;
      }
    });
  }

  ngOnDestroy() {
    if (this.voiceAI) {
      this.voiceAI.destroy();
    }
  }

  async toggleListening() {
    if (this.isListening) {
      await this.voiceAI?.stopListening();
    } else {
      await this.voiceAI?.startListening();
    }
  }
}
```

## Testing Examples

### Unit Testing with Jest

```typescript
// VoiceButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceButton } from '@voice-ai-workforce/react';

// Mock the core module
jest.mock('@voice-ai-workforce/core');

const mockConfig = {
  speechToText: { provider: 'web_speech' },
  textToSpeech: { provider: 'web_speech' },
  aiProvider: { provider: 'openai' },
  responseMode: 'both',
};

test('renders voice button', () => {
  render(<VoiceButton config={mockConfig} />);
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
});

test('calls onCommand when command received', () => {
  const onCommand = jest.fn();
  render(
    <VoiceButton 
      config={mockConfig} 
      onCommand={onCommand} 
    />
  );
  
  // Simulate command received
  // (implementation depends on your mocking strategy)
});
```

### E2E Testing with Cypress

```javascript
// cypress/e2e/voice.cy.js
describe('Voice AI Integration', () => {
  beforeEach(() => {
    cy.visit('/voice');
    // Grant microphone permissions
    cy.window().then((win) => {
      cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves({
        getTracks: () => [{ stop: cy.stub() }]
      });
    });
  });

  it('should start and stop listening', () => {
    cy.get('[data-testid="voice-button"]').click();
    cy.get('[data-testid="voice-button"]').should('contain', 'Stop');
    
    cy.get('[data-testid="voice-button"]').click();
    cy.get('[data-testid="voice-button"]').should('contain', 'Start');
  });

  it('should process text input', () => {
    cy.get('[data-testid="text-input"]').type('help');
    cy.get('[data-testid="submit-button"]').click();
    
    cy.get('[data-testid="response"]').should('be.visible');
    cy.get('[data-testid="response"]').should('contain', 'help');
  });
});
```

## Performance Examples

### Lazy Loading

```tsx
import React, { lazy, Suspense } from 'react';

// Lazy load the voice component
const VoiceButton = lazy(() => 
  import('@voice-ai-workforce/react').then(module => ({
    default: module.VoiceButton
  }))
);

function App() {
  return (
    <div>
      <h1>My App</h1>
      <Suspense fallback={<div>Loading voice features...</div>}>
        <VoiceButton config={config} />
      </Suspense>
    </div>
  );
}
```

### Memoization

```tsx
import React, { useMemo, useCallback } from 'react';
import { useVoiceAI } from '@voice-ai-workforce/react';

function OptimizedVoiceComponent() {
  const config = useMemo(() => ({
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
  }), []); // Empty dependency array since config is static

  const handleCommand = useCallback((command) => {
    console.log('Command received:', command);
  }, []);

  const handleResponse = useCallback((response) => {
    console.log('Response received:', response);
  }, []);

  const { isListening, startListening, stopListening } = useVoiceAI({
    config,
    onCommand: handleCommand,
    onResponse: handleResponse,
  });

  return (
    <button onClick={isListening ? stopListening : startListening}>
      {isListening ? 'Stop' : 'Start'} Listening
    </button>
  );
}
```

## Accessibility Examples

### Keyboard Navigation

```tsx
import React, { useRef } from 'react';
import { VoiceButton } from '@voice-ai-workforce/react';

function AccessibleVoiceDemo() {
  const buttonRef = useRef(null);

  const handleKeyDown = (event) => {
    // Space or Enter to activate
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      buttonRef.current?.click();
    }
  };

  return (
    <div>
      <label htmlFor="voice-button">Voice Command Button</label>
      <VoiceButton
        ref={buttonRef}
        config={config}
        aria-label="Activate voice commands"
        aria-describedby="voice-help"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      />
      <div id="voice-help" className="sr-only">
        Press space or enter to start voice recognition. 
        Say commands like "help", "clock in", or "complete task".
      </div>
    </div>
  );
}
```

### Screen Reader Support

```tsx
import React, { useState } from 'react';
import { useVoiceAI } from '@voice-ai-workforce/react';

function ScreenReaderFriendlyVoice() {
  const [announcement, setAnnouncement] = useState('');

  const {
    isListening,
    isProcessing,
    startListening,
    stopListening
  } = useVoiceAI({
    config,
    onCommand: (command) => {
      setAnnouncement(`Command recognized: ${command.intent}`);
    },
    onResponse: (response) => {
      setAnnouncement(`Response: ${response.text}`);
    },
    onError: (error) => {
      setAnnouncement(`Error: ${error.message}`);
    }
  });

  return (
    <div>
      <button 
        onClick={isListening ? stopListening : startListening}
        aria-pressed={isListening}
        aria-describedby="status announcement"
      >
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      
      <div id="status" aria-live="polite" className="sr-only">
        {isProcessing ? 'Processing voice input...' : 
         isListening ? 'Listening for voice commands' : 
         'Voice recognition stopped'}
      </div>
      
      <div id="announcement" aria-live="assertive" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
```

## Production Examples

### Environment Configuration

```typescript
// config/voice.config.ts
import { VoiceAIConfig } from '@voice-ai-workforce/types';

export const getVoiceConfig = (): VoiceAIConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    speechToText: {
      provider: SpeechProvider.WEB_SPEECH,
      language: process.env.NEXT_PUBLIC_VOICE_LANGUAGE || 'en-US',
      continuous: false,
    },
    textToSpeech: {
      provider: SpeechProvider.WEB_SPEECH,
      speed: isDevelopment ? 1.5 : 1.0, // Faster in development
    },
    aiProvider: {
      provider: AIProvider.OPENAI,
      model: process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-3.5-turbo',
    },
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    apiKey: process.env.VOICE_AI_API_KEY, // Server-side only
    responseMode: ResponseMode.BOTH,
    context: {
      environment: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION,
    }
  };
};
```

### Error Boundary

```tsx
// components/VoiceErrorBoundary.tsx
import React from 'react';

class VoiceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Voice AI Error:', error, errorInfo);
    
    // Report to error tracking service
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { component: 'VoiceAI' },
        extra: errorInfo
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="voice-error-fallback">
          <h3>Voice features temporarily unavailable</h3>
          <p>Please try refreshing the page or use text input instead.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <VoiceErrorBoundary>
      <VoiceButton config={config} />
    </VoiceErrorBoundary>
  );
}
```

These examples should give you a comprehensive guide for implementing voice AI functionality in various scenarios and frameworks!