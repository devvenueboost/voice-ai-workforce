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
  const handleCommand = (command) => {
    console.log('Voice command received:', command.intent, command.rawText);
  };

  const handleResponse = (response) => {
    console.log('AI response:', response.text);
  };

  return (
    <div className="app">
      <h1>Voice AI Demo</h1>
      <VoiceButton
        config={config}
        size="lg"
        onCommand={handleCommand}
        onResponse={handleResponse}
      />
      <p>Click the button and say: "help", "clock me in", or "complete task"</p>
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
    document.getElementById('command-output').textContent = 
      `Command: ${command.intent} - "${command.rawText}"`;
  },
  onResponse: (response) => {
    document.getElementById('response-output').textContent = 
      `Response: ${response.text}`;
  },
  onStateChange: (state) => {
    const button = document.getElementById('voice-button');
    button.textContent = state.isListening ? 'Stop Listening' : 'Start Listening';
    button.disabled = !state.isAvailable;
  }
});

document.getElementById('voice-button').addEventListener('click', async () => {
  const state = voiceAI.getState();
  if (state.isListening) {
    await voiceAI.stopListening();
  } else {
    await voiceAI.startListening();
  }
});
```

## Real-World Examples

### Task Manager with Voice Commands

```tsx
import React, { useState } from 'react';
import { useVoiceAI } from '@voice-ai-workforce/react';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

function TaskManager() {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Update documentation', completed: false },
    { id: 2, name: 'Fix login bug', completed: false },
    { id: 3, name: 'Deploy to production', completed: false }
  ]);
  const [isClocked, setIsClocked] = useState(false);

  const config = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
  };

  const handleCommand = (command) => {
    switch (command.intent) {
      case 'clock_in':
        setIsClocked(true);
        break;
      
      case 'clock_out':
        setIsClocked(false);
        break;
      
      case 'complete_task':
        const taskName = command.entities.taskName;
        if (taskName) {
          setTasks(prev => prev.map(task => 
            task.name.toLowerCase().includes(taskName.toLowerCase())
              ? { ...task, completed: true }
              : task
          ));
        }
        break;
    }
  };

  const {
    isListening,
    isProcessing,
    startListening,
    stopListening
  } = useVoiceAI({
    config,
    onCommand: handleCommand
  });

  return (
    <div className="task-manager">
      <div className="status-bar">
        <span>Status: {isClocked ? 'Clocked In ✅' : 'Clocked Out ⏰'}</span>
        <button 
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          style={{
            backgroundColor: isListening ? '#ef4444' : '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isListening ? '🛑 Stop' : '🎤 Listen'}
        </button>
      </div>

      <div className="tasks">
        <h3>Tasks</h3>
        {tasks.map(task => (
          <div 
            key={task.id} 
            style={{
              padding: '10px',
              margin: '5px 0',
              backgroundColor: task.completed ? '#dcfce7' : '#f3f4f6',
              borderRadius: '5px',
              textDecoration: task.completed ? 'line-through' : 'none'
            }}
          >
            {task.name} {task.completed && '✅'}
          </div>
        ))}
      </div>

      <div className="voice-commands">
        <h4>Try saying:</h4>
        <ul>
          <li>"Clock me in"</li>
          <li>"Complete documentation task"</li>
          <li>"Complete login task"</li>
          <li>"Clock me out"</li>
        </ul>
      </div>
    </div>
  );
}
```

### Text Input Fallback

```tsx
import React, { useState } from 'react';
import { useVoiceAI } from '@voice-ai-workforce/react';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

function VoiceWithFallback() {
  const [textInput, setTextInput] = useState('');
  const [lastResponse, setLastResponse] = useState(null);

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
    processText
  } = useVoiceAI({
    config,
    onResponse: setLastResponse
  });

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      await processText(textInput);
      setTextInput('');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3>Voice Input</h3>
        {isAvailable ? (
          <button 
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            style={{
              backgroundColor: isListening ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {isListening ? '🛑 Stop Listening' : '🎤 Start Listening'}
          </button>
        ) : (
          <p style={{ color: '#6b7280' }}>Voice not available in this browser</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Text Input</h3>
        <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your command here..."
            disabled={isProcessing}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '5px'
            }}
          />
          <button 
            type="submit" 
            disabled={isProcessing || !textInput.trim()}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </form>
      </div>

      {lastResponse && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h4>Response:</h4>
          <p>{lastResponse.text}</p>
        </div>
      )}

      {isProcessing && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          Processing...
        </div>
      )}
    </div>
  );
}
```

### Custom Error Handling

```tsx
import React, { useState } from 'react';
import { VoiceButton } from '@voice-ai-workforce/react';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

function VoiceWithErrorHandling() {
  const [error, setError] = useState(null);

  const config = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
  };

  const handleError = (error) => {
    console.error('Voice AI Error:', error);
    
    const errorMessages = {
      'SPEECH_RECOGNITION_ERROR': 'Could not understand speech. Please try again.',
      'INITIALIZATION_FAILED': 'Voice features are not available in this browser.',
      'START_LISTENING_FAILED': 'Could not access microphone. Please check permissions.',
    };
    
    setError(errorMessages[error.code] || 'An unexpected error occurred.');
    
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const clearError = () => setError(null);

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <VoiceButton
        config={config}
        size="lg"
        onError={handleError}
        onCommand={clearError} // Clear errors on successful command
      />

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fef2f2',
          border: '1px solid #ef4444',
          borderRadius: '5px',
          color: '#dc2626'
        }}>
          <p>{error}</p>
          <button 
            onClick={clearError}
            style={{
              marginTop: '10px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
```

## Integration Examples

### Using with Existing UI

```tsx
import React, { useState } from 'react';
import { useVoiceAI } from '@voice-ai-workforce/react';

function ExistingDashboard() {
  const [data, setData] = useState({ clockedIn: false, tasks: [] });
  
  const {
    isListening,
    startListening,
    stopListening
  } = useVoiceAI({
    config,
    onCommand: (command) => {
      // Integrate with existing state management
      switch (command.intent) {
        case 'clock_in':
          setData(prev => ({ ...prev, clockedIn: true }));
          break;
        case 'clock_out':
          setData(prev => ({ ...prev, clockedIn: false }));
          break;
      }
    }
  });

  return (
    <div className="dashboard">
      <header>
        <h1>Employee Dashboard</h1>
        <div className="voice-control">
          <small>Voice Control:</small>
          <button onClick={isListening ? stopListening : startListening}>
            {isListening ? 'Stop' : 'Start'}
          </button>
        </div>
      </header>
      
      <main>
        <div className="status">
          Status: {data.clockedIn ? 'Working' : 'Not Working'}
        </div>
        {/* Rest of your existing dashboard */}
      </main>
    </div>
  );
}
```

### Testing Voice Commands

```javascript
// For testing without actually speaking
import { VoiceAI } from '@voice-ai-workforce/core';

const voiceAI = new VoiceAI(config);

// Test different commands
const testCommands = [
  'help',
  'clock me in',
  'complete documentation task',
  'what is my status',
  'clock me out'
];

async function testAllCommands() {
  for (const command of testCommands) {
    console.log(`\nTesting: "${command}"`);
    const response = await voiceAI.processTextInput(command);
    console.log(`Response: ${response.text}`);
    console.log(`Success: ${response.success}`);
  }
}

testAllCommands();
```

## Browser Compatibility Examples

### Feature Detection

```javascript
function checkVoiceSupport() {
  const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  const hasSynthesis = 'speechSynthesis' in window;
  
  return {
    recognition: hasRecognition,
    synthesis: hasSynthesis,
    fullSupport: hasRecognition && hasSynthesis
  };
}

const support = checkVoiceSupport();

if (!support.fullSupport) {
  console.log('Limited voice support detected');
  // Show text input fallback
}
```

### Graceful Degradation

```tsx
function ResponsiveVoiceUI() {
  const [support] = useState(() => checkVoiceSupport());
  
  if (!support.recognition) {
    // Show text-only interface
    return <TextOnlyInterface />;
  }
  
  // Show full voice interface
  return <VoiceInterface />;
}
```

These examples show realistic usage patterns for the voice AI system as it currently exists, without any fictional features or complex deployment scenarios. (isListening.value) {
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