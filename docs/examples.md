# Examples

## Quick Start Examples

### Basic Voice Button by Mode

#### End-User Mode (Customers, Employees)
```tsx
import React from 'react';
import { VoiceButton } from '@voice-ai-workforce/react';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

const customerConfig = {
  speechToText: { provider: SpeechProvider.WEB_SPEECH },
  textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
  aiProvider: { provider: AIProvider.OPENAI },
  responseMode: ResponseMode.BOTH,
  interfaceMode: 'end-user' as const,
};

function CustomerApp() {
  return (
    <div>
      <h1>Welcome to Staffluent</h1>
      <VoiceButton
        config={customerConfig}
        customLabels={{
          voiceButton: {
            startText: 'Ask Question',
            stopText: 'Stop',
            processingText: 'Thinking...'
          }
        }}
        onCommand={(command) => {
          // Command is filtered - only contains: intent, rawText, timestamp
          console.log('Customer said:', command.rawText);
        }}
        onError={(error) => {
          // Error message is user-friendly
          console.log('Simple error:', error.message); // "Voice assistant unavailable"
        }}
      />
      {/* 
        User sees:
        - "Ask Question" button (not "Start Listening")
        - No provider information
        - No confidence scores
        - No debug information
        - Friendly error messages
      */}
    </div>
  );
}
```

#### Project Mode (Business Administrators)
```tsx
import React, { useState } from 'react';
import { VoiceButton, VoiceCommandCenter } from '@voice-ai-workforce/react';

const adminConfig = {
  speechToText: { provider: SpeechProvider.WEB_SPEECH },
  textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
  aiProvider: { provider: AIProvider.OPENAI },
  responseMode: ResponseMode.BOTH,
  interfaceMode: 'project' as const,
};

function AdminDashboard() {
  const [centerOpen, setCenterOpen] = useState(false);

  return (
    <div>
      <h1>Staffluent Admin Dashboard</h1>
      
      <VoiceButton
        config={adminConfig}
        showMiniCenter={true}
        onCommand={(command) => {
          // Command includes confidence scores and some debug info
          console.log('Admin command:', {
            intent: command.intent,
            confidence: command.confidence, // Available in project mode
            provider: command.provider // Available in project mode
          });
        }}
      />
      
      <button onClick={() => setCenterOpen(true)}>
        Open Voice Settings
      </button>
      
      <VoiceCommandCenter
        config={adminConfig}
        isOpen={centerOpen}
        onClose={() => setCenterOpen(false)}
        showCategories={true}
        showHistory={true}
      />
      
      {/* 
        Admin sees:
        - Provider information (OpenAI status)
        - Confidence scores
        - Command center with settings
        - Some analytics
        - Technical but not overwhelming
      */}
    </div>
  );
}
```

#### Developer Mode (Full Debug)
```tsx
import React, { useState } from 'react';
import { VoiceButton, VoiceCommandCenter } from '@voice-ai-workforce/react';

const devConfig = {
  speechToText: { provider: SpeechProvider.WEB_SPEECH },
  textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
  aiProvider: { provider: AIProvider.OPENAI },
  responseMode: ResponseMode.BOTH,
  interfaceMode: 'developer' as const,
  visibility: {
    showDebugInfo: true,
    showProcessingTimes: true,
    showTechnicalErrors: true,
  }
};

function DeveloperConsole() {
  const [centerOpen, setCenterOpen] = useState(true);

  return (
    <div>
      <h1>Voice AI Development Console</h1>
      
      <VoiceButton
        config={devConfig}
        showMiniCenter={true}
        onCommand={(command) => {
          // Full command object with all debug information
          console.log('Full debug command:', {
            intent: command.intent,
            entities: command.entities, // Full entity extraction
            confidence: command.confidence, // Exact confidence score
            provider: command.provider, // Which AI provider responded
            rawText: command.rawText,
            timestamp: command.timestamp,
            processingTime: '245ms' // Processing time visible
          });
        }}
        onResponse={(response) => {
          // Full response with metadata
          console.log('Full debug response:', {
            text: response.text,
            success: response.success,
            metadata: response.metadata // All technical details
          });
        }}
        onError={(error) => {
          // Full technical error with stack trace
          console.error('Technical error:', error.details);
        }}
      />
      
      <VoiceCommandCenter
        config={devConfig}
        isOpen={centerOpen}
        onClose={() => setCenterOpen(false)}
        width={400}
        showCategories={true}
        showHistory={true}
      />
      
      {/* 
        Developer sees:
        - Full provider status and switching
        - All confidence scores and processing times
        - Complete command history with metadata
        - Analytics and export options
        - Full error messages with stack traces
        - All debugging information
      */}
    </div>
  );
}
```

## Real-World Use Cases

### Use Case 1: Staffluent Employee Mobile App

```tsx
// Employee clocking in/out with simple voice interface
import { VoiceButton } from '@voice-ai-workforce/react';

function EmployeeClockInApp() {
  const employeeConfig = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
    interfaceMode: 'end-user' as const,
  };

  return (
    <div className="mobile-app">
      <header>
        <h1>Staffluent</h1>
        <div className="user-info">John Doe - Site Supervisor</div>
      </header>
      
      <main>
        <div className="clock-section">
          <VoiceButton
            config={employeeConfig}
            size="xl"
            customLabels={{
              voiceButton: {
                startText: 'Tap to Speak',
                stopText: 'Listening...',
                processingText: 'Processing...'
              }
            }}
            onCommand={(command) => {
              // Handle work commands
              if (command.intent === 'clock_in') {
                // Process clock in
                showNotification('Clocked in successfully');
              }
            }}
          />
        </div>
        
        <div className="quick-actions">
          <p>Try saying:</p>
          <ul>
            <li>"Clock me in"</li>
            <li>"Start my break"</li>
            <li>"Report an issue"</li>
            <li>"Complete task"</li>
          </ul>
        </div>
      </main>
      
      {/* 
        Employee experience:
        - Large, easy-to-tap voice button
        - Simple, clear feedback
        - No technical jargon
        - Works reliably without overwhelming options
      */}
    </div>
  );
}
```

### Use Case 2: Business Admin Configuration Panel

```tsx
// Business admins configuring voice AI features
import { VoiceCommandCenter, VoiceButton } from '@voice-ai-workforce/react';

function AdminVoiceConfiguration() {
  const [settings, setSettings] = useState({
    enableVoice: true,
    voiceMode: 'project' as const,
    customCommands: []
  });

  const adminConfig = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
    interfaceMode: settings.voiceMode,
  };

  return (
    <div className="admin-panel">
      <h1>Voice AI Configuration</h1>
      
      <div className="config-section">
        <h2>Voice Interface Mode</h2>
        <select 
          value={settings.voiceMode}
          onChange={(e) => setSettings({
            ...settings, 
            voiceMode: e.target.value as any
          })}
        >
          <option value="end-user">End User (Simple)</option>
          <option value="project">Project (Balanced)</option>
          <option value="developer">Developer (Full Debug)</option>
        </select>
      </div>
      
      <div className="preview-section">
        <h2>Preview</h2>
        <VoiceButton
          config={adminConfig}
          showMiniCenter={true}
          onCommand={(command) => {
            console.log('Preview command:', command);
          }}
        />
      </div>
      
      <div className="analytics-section">
        <h2>Voice Usage Analytics</h2>
        <VoiceCommandCenter
          config={{
            ...adminConfig,
            interfaceMode: 'project' // Always show project mode for analytics
          }}
          isOpen={true}
          position="right"
          width={350}
        />
      </div>
      
      {/* 
        Admin experience:
        - Can switch between modes to see differences
        - Preview how employees will see the interface
        - Access to analytics and configuration
        - Balance between simplicity and control
      */}
    </div>
  );
}
```

### Use Case 3: Customer Support Portal

```tsx
// Customers getting help with minimal friction
import { VoiceButton } from '@voice-ai-workforce/react';

function CustomerSupportPortal() {
  const supportConfig = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
    interfaceMode: 'end-user' as const,
    visibility: {
      useGenericLabels: true,
      showProviders: false,
      showDebugInfo: false,
    }
  };

  const [conversation, setConversation] = useState([]);

  return (
    <div className="support-portal">
      <header>
        <h1>Need Help?</h1>
        <p>Ask questions about your service or report issues</p>
      </header>
      
      <div className="conversation">
        {conversation.map((message, i) => (
          <div key={i} className={`message ${message.type}`}>
            {message.text}
          </div>
        ))}
      </div>
      
      <div className="voice-input">
        <VoiceButton
          config={supportConfig}
          size="lg"
          customLabels={{
            voiceButton: {
              startText: 'Ask for Help',
              stopText: 'Listening...',
              processingText: 'Understanding...'
            },
            errors: {
              generic: 'Having trouble hearing you. Please try again.',
              permission: 'Please allow microphone access to use voice.',
              connection: 'Check your internet connection.'
            }
          }}
          onCommand={(command) => {
            // Add user message to conversation
            setConversation(prev => [...prev, {
              type: 'user',
              text: command.rawText // Only rawText available in end-user mode
            }]);
          }}
          onResponse={(response) => {
            // Add AI response to conversation
            setConversation(prev => [...prev, {
              type: 'assistant',
              text: response.text
            }]);
          }}
          onError={(error) => {
            // User-friendly error handling
            setConversation(prev => [...prev, {
              type: 'error',
              text: error.message // Friendly message, no technical details
            }]);
          }}
        />
        
        <p className="help-text">
          Tap the button and say things like:
          <br />
          "I need help with my account"
          <br />
          "How do I change my schedule?"
          <br />
          "Report a problem with the app"
        </p>
      </div>
      
      {/* 
        Customer experience:
        - Clear, helpful interface
        - No technical distractions
        - Friendly error messages
        - Focus on getting help quickly
      */}
    </div>
  );
}
```

## Mode Comparison Examples

### Visual Interface Differences

```tsx
// Component showing all three modes side by side
function ModeComparison() {
  const baseConfig = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
  };

  return (
    <div className="mode-comparison">
      <div className="mode-column">
        <h3>End-User Mode</h3>
        <div className="mode-demo">
          <VoiceButton
            config={{ ...baseConfig, interfaceMode: 'end-user' }}
            customLabels={{
              voiceButton: { startText: 'Ask Question' }
            }}
          />
          <div className="mode-info">
            <p>✅ Simple "Ask Question" button</p>
            <p>❌ No provider information</p>
            <p>❌ No confidence scores</p>
            <p>❌ No debug information</p>
            <p>✅ Friendly error messages</p>
          </div>
        </div>
      </div>

      <div className="mode-column">
        <h3>Project Mode</h3>
        <div className="mode-demo">
          <VoiceButton
            config={{ ...baseConfig, interfaceMode: 'project' }}
            showMiniCenter={true}
          />
          <div className="mode-info">
            <p>✅ "Start Listening" button</p>
            <p>✅ Provider status (OpenAI)</p>
            <p>✅ Confidence scores</p>
            <p>⚠️ Limited debug information</p>
            <p>✅ Technical but user-friendly errors</p>
          </div>
        </div>
      </div>

      <div className="mode-column">
        <h3>Developer Mode</h3>
        <div className="mode-demo">
          <VoiceButton
            config={{ ...baseConfig, interfaceMode: 'developer' }}
            showMiniCenter={true}
          />
          <div className="mode-info">
            <p>✅ Full debug interface</p>
            <p>✅ All provider information</p>
            <p>✅ Processing times</p>
            <p>✅ Full technical details</p>
            <p>✅ Complete error messages</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Error Handling by Mode

```tsx
function ErrorHandlingExample() {
  const [currentMode, setCurrentMode] = useState<'end-user' | 'project' | 'developer'>('end-user');
  const [lastError, setLastError] = useState<string>('');

  const config = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
    interfaceMode: currentMode,
  };

  const simulateError = () => {
    // Simulate a network error
    const networkError = new Error('Failed to connect to OpenAI API');
    networkError.stack = 'NetworkError: Failed to connect\n  at ApiClient.request';
    
    // Show how error is handled differently by mode
    const voiceError = {
      code: 'NETWORK_ERROR',
      message: getErrorMessage(networkError, currentMode),
      details: currentMode === 'developer' ? networkError.stack : undefined
    };
    
    setLastError(voiceError.message);
  };

  const getErrorMessage = (error: Error, mode: string) => {
    switch (mode) {
      case 'end-user':
        return 'Voice assistant is temporarily unavailable. Please try again.';
      case 'project':
        return 'Connection failed. Check your internet connection.';
      case 'developer':
        return `Network Error: ${error.message}`;
      default:
        return error.message;
    }
  };

  return (
    <div>
      <h3>Error Handling by Mode</h3>
      
      <div>
        <label>Select Mode: </label>
        <select value={currentMode} onChange={(e) => setCurrentMode(e.target.value as any)}>
          <option value="end-user">End User</option>
          <option value="project">Project</option>
          <option value="developer">Developer</option>
        </select>
      </div>

      <VoiceButton
        config={config}
        onError={(error) => setLastError(error.message)}
      />

      <button onClick={simulateError}>Simulate Network Error</button>

      {lastError && (
        <div className={`error-display mode-${currentMode}`}>
          <h4>Error in {currentMode} mode:</h4>
          <p>{lastError}</p>
        </div>
      )}

      <div className="error-examples">
        <h4>Error Message Examples:</h4>
        <table>
          <thead>
            <tr>
              <th>Error Type</th>
              <th>End-User Mode</th>
              <th>Project Mode</th>
              <th>Developer Mode</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Network Error</td>
              <td>"Voice assistant unavailable"</td>
              <td>"Connection failed"</td>
              <td>"NetworkError: Failed to connect to OpenAI API"</td>
            </tr>
            <tr>
              <td>Permission Denied</td>
              <td>"Microphone permission required"</td>
              <td>"Microphone access denied"</td>
              <td>"NotAllowedError: Permission denied by user"</td>
            </tr>
            <tr>
              <td>Invalid Command</td>
              <td>"I didn't understand that"</td>
              <td>"Command not recognized"</td>
              <td>"No matching intent found (confidence: 0.23)"</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Advanced Examples

### Dynamic Mode Switching

```tsx
// Switch modes based on user context or environment
function DynamicModeExample() {
  const [user] = useUser(); // Your user hook
  const [isDevelopment] = useState(process.env.NODE_ENV === 'development');
  
  // Determine mode based on context
  const getVoiceMode = (): VoiceInterfaceMode => {
    // Force developer mode in development
    if (isDevelopment && user.permissions.includes('debug')) {
      return 'developer';
    }
    
    // Admin users get project mode
    if (user.role === 'admin' || user.role === 'manager') {
      return 'project';
    }
    
    // Default to end-user mode
    return 'end-user';
  };

  const config = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
    interfaceMode: getVoiceMode(),
  };

  return (
    <div>
      <div className="user-context">
        <p>User: {user.name} ({user.role})</p>
        <p>Environment: {isDevelopment ? 'Development' : 'Production'}</p>
        <p>Voice Mode: {getVoiceMode()}</p>
      </div>
      
      <VoiceButton
        config={config}
        // Mode-specific customizations
        customLabels={
          getVoiceMode() === 'end-user' 
            ? { voiceButton: { startText: 'Ask for Help' } }
            : undefined
        }
        showMiniCenter={getVoiceMode() !== 'end-user'}
      />
    </div>
  );
}
```

### Component-Level Mode Overrides

```tsx
// Different components in the same app using different modes
function MultiModeApp() {
  const globalConfig = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
    interfaceMode: 'project' as const, // Global default
  };

  return (
    <div className="app">
      <header>
        <h1>Staffluent Dashboard</h1>
        
        {/* Admin section - override to developer mode */}
        <div className="admin-controls">
          <VoiceCommandCenter
            config={globalConfig}
            mode="developer" // Component override
            isOpen={true}
            width={300}
            position="right"
          />
        </div>
      </header>

      <main>
        {/* User help section - override to end-user mode */}
        <div className="help-section">
          <h2>Need Help?</h2>
          <VoiceButton
            config={globalConfig}
            mode="end-user" // Component override
            customLabels={{
              voiceButton: { startText: 'Ask Question' }
            }}
          />
        </div>

        {/* Manager section - use global project mode */}
        <div className="manager-section">
          <h2>Team Management</h2>
          <VoiceButton
            config={globalConfig}
            // Uses global 'project' mode
            showMiniCenter={true}
          />
        </div>
      </main>
    </div>
  );
}
```

### Custom Visibility Configuration

```tsx
// Fine-tuned visibility control
function CustomVisibilityExample() {
  const config = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
    interfaceMode: 'project' as const,
  };

  return (
    <div>
      <h2>Custom Visibility Examples</h2>
      
      {/* Show confidence but hide providers */}
      <div className="example">
        <h3>Analytics Mode</h3>
        <VoiceButton
          config={config}
          visibilityOverrides={{
            showConfidenceScores: true,
            showProviders: false,
            showDebugInfo: false,
            showMiniCenter: true,
          }}
        />
      </div>

      {/* Minimal debugging mode */}
      <div className="example">
        <h3>Light Debug Mode</h3>
        <VoiceButton
          config={config}
          visibilityOverrides={{
            showProcessingTimes: true,
            showProviders: true,
            showTechnicalErrors: false,
            showAdvancedSettings: false,
          }}
        />
      </div>

      {/* Customer service mode */}
      <div className="example">
        <h3>Customer Service Mode</h3>
        <VoiceButton
          config={config}
          mode="end-user"
          visibilityOverrides={{
            showCommandHistory: true, // Keep history for customer service
            showStatusIndicator: true,
          }}
          customLabels={{
            voiceButton: {
              startText: 'Report Issue',
              stopText: 'Listening...',
            },
            errors: {
              generic: 'Sorry, I could not process your request. Please try again or contact support.',
            }
          }}
        />
      </div>
    </div>
  );
}
```

## Integration Examples

### Using with useVoiceAI Hook

```tsx
function CustomVoiceInterface() {
  const [selectedMode, setSelectedMode] = useState<VoiceInterfaceMode>('project');
  
  const {
    isListening,
    isProcessing,
    startListening,
    stopListening,
    currentCommand,
    lastResponse,
    error,
    visibility,
    labels
  } = useVoiceAI({
    config: {
      speechToText: { provider: SpeechProvider.WEB_SPEECH },
      textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
      aiProvider: { provider: AIProvider.OPENAI },
      responseMode: ResponseMode.BOTH,
      interfaceMode: selectedMode,
    },
    onCommand: (command) => {
      console.log('Command received:', command);
      // Command content varies by mode
    },
    onResponse: (response) => {
      console.log('Response:', response);
      // Response metadata varies by mode
    },
    onError: (error) => {
      console.error('Error:', error);
      // Error detail varies by mode
    }
  });

  return (
    <div>
      <div className="mode-selector">
        <label>Voice Mode: </label>
        <select value={selectedMode} onChange={(e) => setSelectedMode(e.target.value as any)}>
          <option value="end-user">End User</option>
          <option value="project">Project</option>
          <option value="developer">Developer</option>
        </select>
      </div>

      <div className="voice-interface">
        <button 
          onClick={isListening ? stopListening : startListening}
          disabled={!isAvailable}
          className={`voice-button ${isListening ? 'listening' : ''}`}
        >
          {isListening ? labels.voiceButton.stopText : labels.voiceButton.startText}
        </button>

        {isProcessing && <div>{labels.voiceButton.processingText}</div>}
        
        {error && <div className="error">{error}</div>}
      </div>

      {/* Conditionally show debug information based on visibility */}
      {visibility.showDebugInfo && currentCommand && (
        <div className="debug-info">
          <h4>Debug Information</h4>
          <pre>{JSON.stringify(currentCommand, null, 2)}</pre>
        </div>
      )}

      {/* Show confidence scores if visible */}
      {visibility.showConfidenceScores && currentCommand && (
        <div className="confidence">
          Confidence: {Math.round(currentCommand.confidence * 100)}%
        </div>
      )}

      {/* Show provider information if visible */}
      {visibility.showProviders && (
        <div className="provider-info">
          Provider: {labels.providers.generic}
        </div>
      )}
    </div>
  );
}
```

### Testing Mode Behavior

```tsx
// Test component to verify mode behavior
function ModeTestSuite() {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  
  const runModeTest = async (mode: VoiceInterfaceMode) => {
    const config = {
      speechToText: { provider: SpeechProvider.WEB_SPEECH },
      textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
      aiProvider: { provider: AIProvider.OPENAI },
      responseMode: ResponseMode.BOTH,
      interfaceMode: mode,
    };

    const results = {
      mode,
      configResolved: !!config.interfaceMode,
      visibilityResolved: false,
      labelsResolved: false,
      errorHandling: 'not tested'
    };

    // Test visibility resolution
    try {
      const { visibility, labels } = useVoiceVisibility(config);
      results.visibilityResolved = !!visibility;
      results.labelsResolved = !!labels;
      
      // Test mode-specific features
      results.features = {
        showProviders: visibility.showProviders,
        showDebugInfo: visibility.showDebugInfo,
        showConfidenceScores: visibility.showConfidenceScores,
        useGenericLabels: visibility.useGenericLabels,
      };
      
    } catch (error) {
      results.errorHandling = error.message;
    }

    setTestResults(prev => ({ ...prev, [mode]: results }));
  };

  return (
    <div className="mode-test-suite">
      <h2>Mode Test Suite</h2>
      
      <div className="test-controls">
        <button onClick={() => runModeTest('end-user')}>Test End-User Mode</button>
        <button onClick={() => runModeTest('project')}>Test Project Mode</button>
        <button onClick={() => runModeTest('developer')}>Test Developer Mode</button>
      </div>

      <div className="test-results">
        {Object.entries(testResults).map(([mode, results]) => (
          <div key={mode} className="test-result">
            <h3>{mode} Mode Results</h3>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Production Examples

These examples show real-world implementations suitable for production use:

### Enterprise Admin Dashboard

```tsx
// Full-featured admin interface with mode switching
function EnterpriseAdminDashboard() {
  const [userRole] = useUserRole();
  const [voiceMode, setVoiceMode] = useState<VoiceInterfaceMode>(
    userRole === 'super_admin' ? 'developer' : 'project'
  );

  const config = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
    interfaceMode: voiceMode,
  };

  return (
    <div className="enterprise-dashboard">
      <header className="dashboard-header">
        <h1>Enterprise Voice AI Management</h1>
        
        {userRole === 'super_admin' && (
          <div className="mode-switcher">
            <label>Interface Mode:</label>
            <select value={voiceMode} onChange={(e) => setVoiceMode(e.target.value as any)}>
              <option value="developer">Developer (Full Debug)</option>
              <option value="project">Project (Standard)</option>
              <option value="end-user">End User (Preview)</option>
            </select>
          </div>
        )}
      </header>

      <div className="dashboard-content">
        <aside className="voice-panel">
          <VoiceCommandCenter
            config={config}
            isOpen={true}
            position="left"
            width={320}
            showCategories={true}
            showHistory={true}
          />
        </aside>

        <main className="main-content">
          <div className="voice-quick-actions">
            <VoiceButton
              config={config}
              size="lg"
              showMiniCenter={false}
            />
          </div>
          
          {/* Dashboard content */}
        </main>
      </div>
    </div>
  );
}
```

These examples demonstrate the flexibility and power of the 3-tier mode system, showing how the same voice AI components can serve different user types with appropriately tailored interfaces and functionality.