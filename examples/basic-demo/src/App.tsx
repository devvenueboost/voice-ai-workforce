// examples/basic-demo/src/App.tsx
import React, { useState, useRef, useEffect } from 'react';
import { VoiceButton } from '../../../packages/react/src/components/VoiceButton';
import { VoiceCommand, VoiceResponse, VoiceAIConfig, UserRole } from '../../../packages/types/src/types';

// Command history interface
interface CommandHistoryItem {
  id: string;
  timestamp: Date;
  command: VoiceCommand;
  response?: VoiceResponse;
  source: 'voice' | 'text';
}

function App() {
  // State for command history and interactions
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
  const [textInput, setTextInput] = useState('');
  const [currentStatus, setCurrentStatus] = useState('Ready');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('');
  
  // Refs for auto-scrolling
  const historyRef = useRef<HTMLDivElement>(null);

  // Voice AI configuration
  const voiceConfig: VoiceAIConfig = {
    speechToText: {
      provider: 'web-speech' as any,
      language: 'en-US',
      continuous: false
    },
    textToSpeech: {
      provider: 'web-speech' as any,
      speed: 1.0
    },
    aiProvider: {
      provider: 'openai' as any,
      model: 'gpt-3.5-turbo'
    },
    responseMode: 'both' as any,
    context: {
      userRole: UserRole.FIELD_WORKER,
      endpoints: {
        clockIn: '/api/timesheet/clock-in',
        clockOut: '/api/timesheet/clock-out',
        updateTask: '/api/tasks/update'
      }
    }
  };

  // Scroll to bottom of history when new items added
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [commandHistory]);

  // Process voice command and generate response
  // @ts-ignore
  const processCommand = (command: VoiceCommand, source: 'voice' | 'text' = 'voice'): VoiceResponse => {
    let response: VoiceResponse;

    switch (command.intent) {
      case 'help':
        response = {
          text: "I can help you with: clock in, clock out, complete tasks, and check status. Just speak naturally!",
          success: true,
          data: {
            availableCommands: ['clock in', 'clock out', 'complete task', 'status', 'help']
          }
        };
        break;

      case 'clock_in':
        if (isLoggedIn) {
          response = {
            text: "You're already clocked in! Your shift started earlier.",
            success: false,
            data: { reason: 'already_logged_in' }
          };
        } else {
          setIsLoggedIn(true);
          setCurrentStatus('Clocked In');
          response = {
            text: "Successfully clocked in! Have a productive day.",
            success: true,
            data: { 
              clockInTime: new Date().toLocaleTimeString(),
              status: 'active'
            }
          };
        }
        break;

      case 'clock_out':
        if (!isLoggedIn) {
          response = {
            text: "You're not currently clocked in. Please clock in first.",
            success: false,
            data: { reason: 'not_logged_in' }
          };
        } else {
          setIsLoggedIn(false);
          setCurrentStatus('Clocked Out');
          response = {
            text: "Successfully clocked out! Thanks for your hard work today.",
            success: true,
            data: { 
              clockOutTime: new Date().toLocaleTimeString(),
              status: 'inactive'
            }
          };
        }
        break;

      case 'complete_task':
        const taskName = command.entities.taskName || 'current task';
        response = {
          text: `Great job! I've marked "${taskName}" as complete.`,
          success: true,
          data: {
            taskName,
            completedAt: new Date().toLocaleTimeString(),
            status: 'completed'
          }
        };
        break;

      case 'get_status':
        response = {
          text: `Current status: ${currentStatus}. ${isLoggedIn ? 'You are clocked in and ready to work.' : 'You are currently clocked out.'}`,
          success: true,
          data: {
            status: currentStatus,
            isLoggedIn,
            timestamp: new Date().toLocaleTimeString()
          }
        };
        break;

      default:
        response = {
          text: "I didn't understand that command. Try saying 'help' to see what I can do!",
          success: false,
          data: { 
            unknownIntent: command.intent,
            suggestion: 'Try: help, clock in, clock out, or complete task'
          }
        };
    }

    return response;
  };

  // Handle voice commands
  const handleVoiceCommand = (command: VoiceCommand) => {
    console.log('Voice command received:', command);
    
    const response = processCommand(command, 'voice');
    setLastResponse(response.text);
    
    // Add to history
    const historyItem: CommandHistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      command,
      response,
      source: 'voice'
    };
    
    setCommandHistory(prev => [...prev, historyItem]);
  };

  // Handle AI responses
  const handleVoiceResponse = (response: VoiceResponse) => {
    console.log('AI response:', response);
    setLastResponse(response.text);
  };

  // Handle voice errors
  const handleVoiceError = (error: string) => {
    console.error('Voice error:', error);
    setLastResponse(`Voice Error: ${error}`);
  };

  // Handle manual text input
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    // Create a mock voice command from text input
    const command: VoiceCommand = {
      intent: parseIntent(textInput),
      entities: extractEntities(textInput),
      confidence: 0.9,
      rawText: textInput,
      timestamp: new Date()
    };

    const response = processCommand(command, 'text');
    setLastResponse(response.text);

    // Add to history
    const historyItem: CommandHistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      command,
      response,
      source: 'text'
    };

    setCommandHistory(prev => [...prev, historyItem]);
    setTextInput('');
  };

  // Simple intent parsing for text input
  const parseIntent = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('help')) return 'help';
    if (lowerText.includes('clock in') || lowerText.includes('start work')) return 'clock_in';
    if (lowerText.includes('clock out') || lowerText.includes('end work')) return 'clock_out';
    if (lowerText.includes('complete') || lowerText.includes('done') || lowerText.includes('finish')) return 'complete_task';
    if (lowerText.includes('status') || lowerText.includes('check')) return 'get_status';
    
    return 'unknown';
  };

  // Extract entities from text
  const extractEntities = (text: string): Record<string, any> => {
    const entities: Record<string, any> = {};
    
    // Extract task name for complete_task intent
    if (text.toLowerCase().includes('complete') || text.toLowerCase().includes('done')) {
      const taskMatch = text.match(/complete (.+)|mark (.+) (as )?complete|(.+) is done/i);
      if (taskMatch) {
        entities.taskName = taskMatch[1] || taskMatch[2] || taskMatch[4];
      }
    }
    
    return entities;
  };

  // Clear history
  const clearHistory = () => {
    setCommandHistory([]);
    setLastResponse('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎤 Voice AI Workforce
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Live Demo - Voice Commands for Workplace Productivity
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <span className={`px-3 py-1 rounded-full ${isLoggedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {currentStatus}
            </span>
            <span className="text-gray-500">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Voice Controls */}
          <div className="space-y-6">
            {/* Voice Button Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Voice Control</h2>
              
              <div className="flex flex-col items-center space-y-4">
                <VoiceButton
                  config={voiceConfig}
                  size="xl"
                  variant="primary"
                  onCommand={handleVoiceCommand}
                  onResponse={handleVoiceResponse}
                  // @ts-ignore
                  onError={handleVoiceError}
                  aria-label="Voice command button"
                />
                
                <p className="text-sm text-gray-600 text-center">
                  Click the microphone and try saying:<br />
                  <strong>"help"</strong>, <strong>"clock in"</strong>, <strong>"clock out"</strong>, or <strong>"complete task"</strong>
                </p>
              </div>

              {/* Last Response */}
              {lastResponse && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Response:</strong> {lastResponse}
                  </p>
                </div>
              )}
            </div>

            {/* Text Input Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Manual Text Input</h2>
              
              <form onSubmit={handleTextSubmit} className="space-y-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type a command (e.g., 'clock in', 'help', 'complete setup task')"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send Command
                </button>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTextSubmit({ preventDefault: () => {} } as any)}
                  onMouseDown={() => setTextInput('help')}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Help
                </button>
                <button
                  onClick={() => handleTextSubmit({ preventDefault: () => {} } as any)}
                  onMouseDown={() => setTextInput(isLoggedIn ? 'clock out' : 'clock in')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    isLoggedIn 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isLoggedIn ? 'Clock Out' : 'Clock In'}
                </button>
                <button
                  onClick={() => handleTextSubmit({ preventDefault: () => {} } as any)}
                  onMouseDown={() => setTextInput('complete task')}
                  className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  Complete Task
                </button>
                <button
                  onClick={() => handleTextSubmit({ preventDefault: () => {} } as any)}
                  onMouseDown={() => setTextInput('status')}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Check Status
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Command History */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Command History</h2>
              <button
                onClick={clearHistory}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
              >
                Clear
              </button>
            </div>

            <div 
              ref={historyRef}
              className="h-96 overflow-y-auto space-y-3 border border-gray-200 rounded-lg p-3"
            >
              {commandHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No commands yet.</p>
                  <p className="text-sm">Try using voice or text input above!</p>
                </div>
              ) : (
                commandHistory.map((item) => (
                  <div key={item.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.source === 'voice' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.source === 'voice' ? '🎤 Voice' : '⌨️ Text'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        "{item.command.rawText}"
                      </p>
                      {item.response && (
                        <p className={`mt-1 ${
                          item.response.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          → {item.response.text}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Voice AI Workforce Demo - Built with React, TypeScript, and Web Speech API
          </p>
          <p className="mt-1">
            Try different commands and see how the AI responds! 
            <span className="ml-2">
              <strong>Supported:</strong> help, clock in/out, complete tasks, status
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;