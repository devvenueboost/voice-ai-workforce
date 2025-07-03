// examples/three-tier-demo/src/App.tsx
import React, { useState, useRef, useEffect } from 'react';
import { VoiceButton } from '../../../packages/react/src/components/VoiceButton';
import { VoiceCommandCenter } from '../../../packages/react/src/components/VoiceCommandCenter';
import { VoiceCommand, VoiceResponse, VoiceAIConfig, UserRole, VoiceInterfaceMode } from '../../../packages/types/src/types';

// Command history interface
interface CommandHistoryItem {
  id: string;
  timestamp: Date;
  command: VoiceCommand;
  response?: VoiceResponse;
  source: 'voice' | 'text';
  mode: VoiceInterfaceMode;
}

function App() {
  // State for command history and interactions
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
  const [textInput, setTextInput] = useState('');
  const [currentStatus, setCurrentStatus] = useState('Ready');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('');
  
  // NEW: Mode selection state
  const [selectedMode, setSelectedMode] = useState<VoiceInterfaceMode>('project');
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  
  // Refs for auto-scrolling
  const historyRef = useRef<HTMLDivElement>(null);

  // Base voice AI configuration
  const baseVoiceConfig: Omit<VoiceAIConfig, 'interfaceMode' | 'visibility'> = {
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
      // @ts-ignore
      endpoints: {
        clockIn: '/api/timesheet/clock-in',
        clockOut: '/api/timesheet/clock-out',
        updateTask: '/api/tasks/update'
      }
    }
  };

  // Mode-specific configurations
  const getModeConfig = (mode: VoiceInterfaceMode): VoiceAIConfig => ({
    ...baseVoiceConfig,
    interfaceMode: mode,
    visibility: mode === 'developer' ? {
      showDebugInfo: true,
      showProviders: true,
      showConfidenceScores: true,
      showProcessingTimes: true,
      showTechnicalErrors: true,
      showAdvancedSettings: true,
      showAnalytics: true
    } : mode === 'project' ? {
      showProviders: true,
      showConfidenceScores: true,
      showAdvancedSettings: true,
      showDebugInfo: false,
      showTechnicalErrors: false
    } : {
      useGenericLabels: true,
      showProviders: false,
      showDebugInfo: false,
      showConfidenceScores: false,
      showTechnicalErrors: false,
      showAdvancedSettings: false,
      customLabels: {
        voiceButton: {
          startText: 'Ask for Help',
          stopText: 'Stop',
          processingText: 'Listening...'
        },
        providers: {
          generic: 'Voice Assistant'
        },
        errors: {
          generic: 'Voice assistant temporarily unavailable'
        }
      }
    }
  });

  // Current mode configuration
  const voiceConfig = getModeConfig(selectedMode);

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
          text: selectedMode === 'end-user' 
            ? "I can help you clock in, clock out, and complete tasks. Just ask!"
            : selectedMode === 'project'
            ? "Available commands: clock in/out, complete tasks, check status. Confidence tracking enabled."
            : "Debug Mode: Available intents=['help','clock_in','clock_out','complete_task','get_status']. Provider=OpenAI, Processing time will be shown.",
          success: true,
          data: {
            availableCommands: ['clock in', 'clock out', 'complete task', 'status', 'help'],
            mode: selectedMode
          },
          metadata: selectedMode === 'developer' ? {
            provider: 'openai' as any,
            confidence: 0.98,
            processingTime: 125,
            cached: false
          } : selectedMode === 'project' ? {
            provider: 'openai' as any,
            confidence: 0.98
          } : undefined
        };
        break;

      case 'clock_in':
        if (isLoggedIn) {
          response = {
            text: selectedMode === 'end-user' 
              ? "You're already clocked in!"
              : selectedMode === 'project'
              ? "Clock-in failed: User already has active session."
              : "DEBUG: Clock-in attempt blocked. Current state: isLoggedIn=true, lastClockIn=earlier_today",
            success: false,
            data: { reason: 'already_logged_in', mode: selectedMode },
            metadata: selectedMode === 'developer' ? {
              provider: 'openai' as any,
              confidence: 0.95,
              processingTime: 89,
              cached: false
            } : selectedMode === 'project' ? {
              confidence: 0.95
            } : undefined
          };
        } else {
          setIsLoggedIn(true);
          setCurrentStatus('Clocked In');
          response = {
            text: selectedMode === 'end-user'
              ? "You're now clocked in! Have a great day."
              : selectedMode === 'project'
              ? "Clock-in successful. Session started, time tracking active."
              : "DEBUG: Clock-in executed successfully. State updated: isLoggedIn=true, timestamp=" + new Date().toISOString(),
            success: true,
            data: { 
              clockInTime: new Date().toLocaleTimeString(),
              status: 'active',
              mode: selectedMode
            },
            metadata: selectedMode === 'developer' ? {
              provider: 'openai' as any,
              confidence: 0.92,
              processingTime: 156,
              cached: false
            } : selectedMode === 'project' ? {
              confidence: 0.92
            } : undefined
          };
        }
        break;

      case 'clock_out':
        if (!isLoggedIn) {
          response = {
            text: selectedMode === 'end-user'
              ? "You're not clocked in right now."
              : selectedMode === 'project'
              ? "Clock-out failed: No active session found."
              : "DEBUG: Clock-out blocked. Current state: isLoggedIn=false, no active session",
            success: false,
            data: { reason: 'not_logged_in', mode: selectedMode },
            metadata: selectedMode === 'developer' ? {
              provider: 'openai' as any,
              confidence: 0.94,
              processingTime: 76,
              cached: false
            } : undefined
          };
        } else {
          setIsLoggedIn(false);
          setCurrentStatus('Clocked Out');
          response = {
            text: selectedMode === 'end-user'
              ? "You're now clocked out. Thanks for your work!"
              : selectedMode === 'project'
              ? "Clock-out successful. Session ended, timesheet updated."
              : "DEBUG: Clock-out executed. State: isLoggedIn=false, session_end=" + new Date().toISOString(),
            success: true,
            data: { 
              clockOutTime: new Date().toLocaleTimeString(),
              status: 'inactive',
              mode: selectedMode
            },
            metadata: selectedMode === 'developer' ? {
              provider: 'openai' as any,
              confidence: 0.91,
              processingTime: 134,
              cached: false
            } : selectedMode === 'project' ? {
              confidence: 0.91
            } : undefined
          };
        }
        break;

      case 'complete_task':
        const taskName = command.entities.taskName || 'current task';
        response = {
          text: selectedMode === 'end-user'
            ? `Great! "${taskName}" is now complete.`
            : selectedMode === 'project'
            ? `Task completion recorded: "${taskName}". Status updated in system.`
            : `DEBUG: Task marked complete. Entity extraction: taskName="${taskName}", confidence=${command.confidence}, timestamp=${new Date().toISOString()}`,
          success: true,
          data: {
            taskName,
            completedAt: new Date().toLocaleTimeString(),
            status: 'completed',
            mode: selectedMode
          },
          metadata: selectedMode === 'developer' ? {
            provider: 'openai' as any,
            confidence: command.confidence || 0.87,
            processingTime: 198,
            cached: false
          } : selectedMode === 'project' ? {
            confidence: command.confidence || 0.87
          } : undefined
        };
        break;

      case 'get_status':
        response = {
          text: selectedMode === 'end-user'
            ? `You are ${isLoggedIn ? 'clocked in and working' : 'currently clocked out'}.`
            : selectedMode === 'project'
            ? `Current status: ${currentStatus}. Session: ${isLoggedIn ? 'Active' : 'Inactive'}. Last update: ${new Date().toLocaleTimeString()}`
            : `DEBUG STATUS: currentStatus="${currentStatus}", isLoggedIn=${isLoggedIn}, mode="${selectedMode}", timestamp="${new Date().toISOString()}"`,
          success: true,
          data: {
            status: currentStatus,
            isLoggedIn,
            timestamp: new Date().toLocaleTimeString(),
            mode: selectedMode
          },
          metadata: selectedMode === 'developer' ? {
            provider: 'openai' as any,
            confidence: 0.99,
            processingTime: 45,
            cached: true
          } : selectedMode === 'project' ? {
            confidence: 0.99
          } : undefined
        };
        break;

      default:
        response = {
          text: selectedMode === 'end-user'
            ? "I didn't understand that. Try asking for help!"
            : selectedMode === 'project'
            ? `Unknown command received. Intent: "${command.intent}". Try: help, clock in/out, complete task, status.`
            : `DEBUG: Unknown intent detected. Raw input: "${command.rawText}", parsed_intent: "${command.intent}", confidence: ${command.confidence}, available_intents: [help,clock_in,clock_out,complete_task,get_status]`,
          success: false,
          data: { 
            unknownIntent: command.intent,
            suggestion: 'Try: help, clock in, clock out, or complete task',
            mode: selectedMode
          },
          metadata: selectedMode === 'developer' ? {
            provider: 'openai' as any,
            confidence: command.confidence || 0.1,
            processingTime: 67,
            cached: false
          } : undefined
        };
    }

    return response;
  };

  // Handle voice commands
  const handleVoiceCommand = (command: VoiceCommand) => {
    console.log(`[${selectedMode.toUpperCase()} MODE] Voice command:`, command);
    
    const response = processCommand(command, 'voice');
    setLastResponse(response.text);
    
    // Add to history
    const historyItem: CommandHistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      command,
      response,
      source: 'voice',
      mode: selectedMode
    };
    
    setCommandHistory(prev => [...prev, historyItem]);
  };

  // Handle AI responses
  const handleVoiceResponse = (response: VoiceResponse) => {
    console.log(`[${selectedMode.toUpperCase()} MODE] AI response:`, response);
    setLastResponse(response.text);
  };

  // Handle voice errors
  const handleVoiceError = (error: any) => {
    console.error(`[${selectedMode.toUpperCase()} MODE] Voice error:`, error);
    const errorMessage = selectedMode === 'end-user' 
      ? 'Voice assistant temporarily unavailable'
      : selectedMode === 'project'
      ? `Voice service error: ${error.message || error}`
      : `DEBUG ERROR: ${JSON.stringify(error)}`;
    setLastResponse(errorMessage);
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
      timestamp: new Date(),
      provider: selectedMode === 'developer' ? 'openai' as any : undefined
    };

    const response = processCommand(command, 'text');
    setLastResponse(response.text);

    // Add to history
    const historyItem: CommandHistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      command,
      response,
      source: 'text',
      mode: selectedMode
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

  // Get mode description
  const getModeDescription = (mode: VoiceInterfaceMode) => {
    switch (mode) {
      case 'developer':
        return 'Full debug info, technical details, processing times, all provider information';
      case 'project':
        return 'Business-appropriate interface with provider info and confidence scores';
      case 'end-user':
        return 'Clean, simple interface with friendly language and no technical details';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎤 Voice AI Workforce - 3-Tier Demo
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Experience how the same voice commands adapt to different user types
          </p>
          
          {/* Mode Selector */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <label className="font-medium text-gray-700">Interface Mode:</label>
            <div className="flex space-x-2">
              {(['developer', 'project', 'end-user'] as VoiceInterfaceMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border'
                  }`}
                >
                  {mode === 'developer' ? '🔧 Developer' : 
                   mode === 'project' ? '🏢 Project' : 
                   '👤 End-User'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mode Description */}
          <div className="max-w-2xl mx-auto mb-4">
            <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <strong>{selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Mode:</strong> {getModeDescription(selectedMode)}
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm">
            <span className={`px-3 py-1 rounded-full ${isLoggedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {currentStatus}
            </span>
            <span className="text-gray-500">
              Mode: <strong>{selectedMode}</strong>
            </span>
            <span className="text-gray-500">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Voice Controls */}
          <div className="space-y-6">
            {/* Voice Button Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">
                {selectedMode === 'end-user' ? 'Voice Assistant' : 
                 selectedMode === 'project' ? 'Voice Control' : 
                 'Voice Debug Console'}
              </h2>
              
              <div className="flex flex-col items-center space-y-4">
                <VoiceButton
                  config={voiceConfig}
                  size="xl"
                  variant="primary"
                  onCommand={handleVoiceCommand}
                  onResponse={handleVoiceResponse}
                  onError={handleVoiceError}
                  aria-label={`Voice command button in ${selectedMode} mode`}
                  showMiniCenter={selectedMode !== 'end-user'}
                />
                
                <p className="text-sm text-gray-600 text-center">
                  {selectedMode === 'end-user' ? (
                    <>Click and ask for help with:<br /><strong>"help"</strong>, <strong>"clock in"</strong>, <strong>"clock out"</strong></>
                  ) : selectedMode === 'project' ? (
                    <>Voice commands with confidence tracking:<br /><strong>"help"</strong>, <strong>"clock in"</strong>, <strong>"complete task"</strong>, <strong>"status"</strong></>
                  ) : (
                    <>Full debug mode with processing metrics:<br /><strong>"help"</strong> - see available intents<br /><strong>"status"</strong> - view system state</>
                  )}
                </p>
              </div>

              {/* Last Response */}
              {lastResponse && (
                <div className={`mt-4 p-3 rounded-lg border ${
                  selectedMode === 'developer' ? 'bg-gray-50 border-gray-300' :
                  selectedMode === 'project' ? 'bg-blue-50 border-blue-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <p className={`text-sm ${
                    selectedMode === 'developer' ? 'text-gray-800' :
                    selectedMode === 'project' ? 'text-blue-800' :
                    'text-green-800'
                  }`}>
                    <strong>Response:</strong> {lastResponse}
                  </p>
                </div>
              )}
            </div>

            {/* Mode Features */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Mode Features</h3>
              <div className="space-y-2 text-sm">
                {selectedMode === 'developer' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Provider information (OpenAI)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Confidence scores & processing times</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Full error messages & stack traces</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Advanced settings & analytics</span>
                    </div>
                  </>
                )}
                
                {selectedMode === 'project' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Provider status (OpenAI)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Confidence scores for quality</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>No debug information</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Business settings access</span>
                    </div>
                  </>
                )}
                
                {selectedMode === 'end-user' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>No provider information</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>No confidence scores</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Friendly error messages</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Simple, clean interface</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Command Center Toggle */}
            {selectedMode !== 'end-user' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <button
                  onClick={() => setShowCommandCenter(!showCommandCenter)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {showCommandCenter ? 'Hide' : 'Show'} Command Center
                </button>
              </div>
            )}
          </div>

          {/* Middle Column - Text Input & Quick Actions */}
          <div className="space-y-6">
            {/* Text Input Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedMode === 'end-user' ? 'Type Your Request' : 'Manual Text Input'}
              </h2>
              
              <form onSubmit={handleTextSubmit} className="space-y-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={
                    selectedMode === 'end-user' 
                      ? "Type what you need help with..."
                      : selectedMode === 'project'
                      ? "Enter command (tracked with confidence)"
                      : "Debug: Enter raw command for intent parsing"
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedMode === 'end-user' ? 'Send Request' : 'Send Command'}
                </button>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setTextInput('help');
                    setTimeout(() => handleTextSubmit({ preventDefault: () => {} } as any), 100);
                  }}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {selectedMode === 'end-user' ? 'Get Help' : 'Help'}
                </button>
                <button
                  onClick={() => {
                    setTextInput(isLoggedIn ? 'clock out' : 'clock in');
                    setTimeout(() => handleTextSubmit({ preventDefault: () => {} } as any), 100);
                  }}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    isLoggedIn 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isLoggedIn ? 'Clock Out' : 'Clock In'}
                </button>
                <button
                  onClick={() => {
                    setTextInput('complete task');
                    setTimeout(() => handleTextSubmit({ preventDefault: () => {} } as any), 100);
                  }}
                  className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  Complete Task
                </button>
                <button
                  onClick={() => {
                    setTextInput('status');
                    setTimeout(() => handleTextSubmit({ preventDefault: () => {} } as any), 100);
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {selectedMode === 'end-user' ? 'My Status' : 'Check Status'}
                </button>
              </div>
            </div>

            {/* Mode Comparison */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Try Different Modes</h3>
              <p className="text-sm text-gray-600 mb-3">
                Test the same command in different modes to see how responses change:
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setTextInput('complete database cleanup task');
                    setTimeout(() => handleTextSubmit({ preventDefault: () => {} } as any), 100);
                  }}
                  className="w-full px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-left"
                >
                  "complete database cleanup task"
                </button>
                <button
                  onClick={() => {
                    setTextInput('unknown command test');
                    setTimeout(() => handleTextSubmit({ preventDefault: () => {} } as any), 100);
                  }}
                  className="w-full px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-left"
                >
                  "unknown command test" (error demo)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Command History */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedMode === 'end-user' ? 'Recent Requests' : 'Command History'}
                </h2>
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
                    <p className="text-sm">
                      {selectedMode === 'end-user' 
                        ? 'Try asking for help above!'
                        : 'Try using voice or text input to see mode differences!'
                      }
                    </p>
                  </div>
                ) : (
                  commandHistory.map((item) => (
                    <div key={item.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.source === 'voice' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {item.source === 'voice' ? '🎤 Voice' : '⌨️ Text'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.mode === 'developer' ? 'bg-gray-100 text-gray-700' :
                            item.mode === 'project' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {item.mode === 'developer' ? '🔧' : 
                             item.mode === 'project' ? '🏢' : '👤'} {item.mode}
                          </span>
                        </div>
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
                        
                        {/* Mode-specific metadata display */}
                        {selectedMode === 'developer' && item.response?.metadata && (
                          <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            <div>Provider: {item.response.metadata.provider}</div>
                            <div>Confidence: {((item.response.metadata.confidence || 0) * 100).toFixed(1)}%</div>
                            <div>Processing: {item.response.metadata.processingTime}ms</div>
                            <div>Cached: {item.response.metadata.cached ? 'Yes' : 'No'}</div>
                          </div>
                        )}
                        
                        {selectedMode === 'project' && item.response?.metadata && (
                          <div className="mt-2 text-xs text-gray-500">
                            {item.response.metadata.provider && (
                              <span>Provider: {item.response.metadata.provider} | </span>
                            )}
                            {item.response.metadata.confidence && (
                              <span>Confidence: {((item.response.metadata.confidence || 0) * 100).toFixed(0)}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Mode Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Session Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Commands:</span>
                  <span className="font-medium">{commandHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Mode:</span>
                  <span className="font-medium capitalize">{selectedMode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Voice Commands:</span>
                  <span className="font-medium">
                    {commandHistory.filter(h => h.source === 'voice').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Text Commands:</span>
                  <span className="font-medium">
                    {commandHistory.filter(h => h.source === 'text').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="font-medium">
                    {commandHistory.length > 0 
                      ? Math.round((commandHistory.filter(h => h.response?.success).length / commandHistory.length) * 100)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Command Center Modal */}
        {showCommandCenter && selectedMode !== 'end-user' && (
          <VoiceCommandCenter
            config={voiceConfig}
            isOpen={showCommandCenter}
            onClose={() => setShowCommandCenter(false)}
            position="right"
            width={400}
            showCategories={selectedMode === 'developer'}
            showHistory={true}
            onCommand={handleVoiceCommand}
            onResponse={handleVoiceResponse}
            onError={handleVoiceError}
          />
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="max-w-4xl mx-auto">
            <p className="mb-2">
              <strong>Voice AI Workforce - 3-Tier Interface Demo</strong>
            </p>
            <p className="mb-2">
              This demo shows how the same voice commands provide different levels of information based on user type:
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <strong>🔧 Developer Mode</strong><br />
                Full debug info, processing times, provider details, technical errors
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <strong>🏢 Project Mode</strong><br />
                Business settings, confidence scores, provider status, user-friendly errors
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <strong>👤 End-User Mode</strong><br />
                Clean interface, friendly language, no technical jargon
              </div>
            </div>
            <p className="mt-4">
              <strong>Try the same command in different modes to see the differences!</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;