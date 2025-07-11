// packages/react/src/components/VoiceCommandCenter.tsx - Updated with Mode Support

import React, { useState } from 'react';
import { useVoiceAI } from '../hooks/useVoiceAI';
import {
    VoiceCommand,
    VoiceResponse,
    VoiceAIConfig,
    VoiceAIError,
    CommandDefinition,
    VoiceModeProps
  } from '../../../types/src/types';
  import { useVoiceVisibility } from '../hooks/useVoiceVisibility';

// Enhanced props interface with mode support
export interface VoiceCommandCenterPropsWithMode extends VoiceModeProps {
  config: VoiceAIConfig;
  isOpen: boolean;
  onClose?: () => void;
  position?: 'left' | 'right';
  width?: number;
  showCategories?: boolean;
  showHistory?: boolean;
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
}

// Icons (keeping existing ones)
const MicIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const ChevronIcon = ({ className, direction }: { className?: string; direction: 'up' | 'down' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" 
       style={{ transform: direction === 'down' ? 'rotate(180deg)' : '' }}>
    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
  </svg>
);

const HistoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
  </svg>
);

export const VoiceCommandCenter: React.FC<VoiceCommandCenterPropsWithMode> = ({
  config,
  isOpen,
  onClose,
  position = 'left',
  width = 320,
  showCategories = true,
  showHistory = true,
  onCommand,
  onResponse,
  onError,
  
  // NEW: Mode support props
  mode,
  visibilityOverrides,
  customLabels: propCustomLabels
}) => {
  // NEW: Resolve visibility and labels based on mode
  const { visibility, labels } = useVoiceVisibility(config, mode, visibilityOverrides);
  
  // Merge prop labels with resolved labels
  const effectiveLabels = {
    voiceButton: { ...labels.voiceButton, ...propCustomLabels?.voiceButton },
    status: { ...labels.status, ...propCustomLabels?.status },
    providers: { ...labels.providers, ...propCustomLabels?.providers },
    errors: { ...labels.errors, ...propCustomLabels?.errors }
  };

  // Determine which tabs to show based on visibility
  const availableTabs = [
    { id: 'commands', label: 'Commands', icon: MicIcon, visible: true },
    { id: 'history', label: 'History', icon: HistoryIcon, visible: visibility.showCommandHistory && showHistory },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, visible: visibility.showAdvancedSettings }
  ].filter(tab => tab.visible);

  const [activeTab, setActiveTab] = useState<'commands' | 'history' | 'settings'>(
    availableTabs[0]?.id as any || 'commands'
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  
  const {
    isListening,
    isProcessing,
    isAvailable,
     // @ts-ignore
    currentCommand,
     // @ts-ignore
    lastResponse,
    error,
    startListening,
    stopListening,
    processText,
    getState
  } = useVoiceAI({
    config,
    onCommand,
    onResponse,
    onError: (error) => {
      // Filter error based on visibility settings
      let filteredError = error;
      if (!visibility.showTechnicalErrors) {
        filteredError = {
          ...error,
          message: effectiveLabels.errors.generic || 'An error occurred',
          details: undefined
        };
      }
      onError?.(filteredError);
    },
    autoStart: false
  });

  const state = getState();
  const commandHistory = visibility.showCommandHistory ? (state.commandHistory || []) : [];
   // @ts-ignore
  const suggestedCommands = state.suggestedCommands || [];
  
  // Get available commands and categories
  const availableCommands = config.commands?.registry?.commands || [];
  const availableCategories = config.commands?.registry?.categories || [];
  
  // Filter commands based on search and category
  const filteredCommands = availableCommands.filter(cmd => {
    const matchesSearch = searchQuery === '' || 
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.triggers.some(trigger => trigger.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || cmd.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle command execution
  const handleCommandClick = async (command: CommandDefinition) => {
    try {
      if (command.examples && command.examples.length > 0) {
        await processText(command.examples[0]);
      } else {
        await processText(command.triggers[0]);
      }
    } catch (error) {
      console.error('Failed to execute command:', error);
    }
  };

  // Handle voice toggle
  const handleVoiceToggle = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Panel positioning and styling
  const panelClasses = [
    'fixed top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-50',
    'dark:bg-gray-900 dark:border-gray-700',
    position === 'left' ? 'left-0' : 'right-0',
    isOpen ? 'translate-x-0' : (position === 'left' ? '-translate-x-full' : 'translate-x-full'),
    isMinimized ? 'w-16' : `w-${Math.floor(width / 4) * 4}` // Approximate Tailwind width
  ].join(' ');

  const contentClasses = isMinimized ? 'hidden' : 'flex flex-col h-full';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && !isMinimized && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div className={panelClasses} style={{ width: isMinimized ? 64 : width }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!isMinimized && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {effectiveLabels.providers.generic || 'Voice Commands'}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ChevronIcon className="w-4 h-4" direction={position === 'left' ? 'up' : 'down'} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
          
          {isMinimized && (
            <button
              onClick={() => setIsMinimized(false)}
              className="w-full p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <MicIcon className="w-6 h-6 mx-auto" />
            </button>
          )}
        </div>

        <div className={contentClasses}>
          {/* Voice Control */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleVoiceToggle}
              disabled={!isAvailable}
              className={[
                'w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all',
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white',
                !isAvailable && 'opacity-50 cursor-not-allowed',
                (isListening || isProcessing) && 'animate-pulse'
              ].join(' ')}
            >
              <MicIcon className="w-5 h-5" />
              <span>
                {isProcessing 
                  ? (effectiveLabels.voiceButton.processingText || 'Processing...') 
                  : isListening 
                    ? (effectiveLabels.voiceButton.stopText || 'Stop Listening') 
                    : (effectiveLabels.voiceButton.startText || 'Start Listening')
                }
              </span>
            </button>
            
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {visibility.showTechnicalErrors ? error : effectiveLabels.errors.generic}
              </div>
            )}

            {/* Provider status - only show if visibility allows */}
            {visibility.showProviderStatus && state.activeProvider && (
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {visibility.showProviders 
                    ? `Provider: ${state.activeProvider}`
                    : effectiveLabels.providers.generic
                  }
                </span>
                {state.providerStatus && (
                  <span className={[
                    'px-2 py-1 rounded',
                    state.providerStatus[state.activeProvider] === 'available' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  ].join(' ')}>
                    {state.providerStatus[state.activeProvider]}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tabs - only show available tabs */}
          {availableTabs.length > 1 && (
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {availableTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={[
                    'flex-1 flex items-center justify-center space-x-1 py-3 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  ].join(' ')}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'commands' && (
              <div className="h-full flex flex-col">
                {/* Search */}
                <div className="p-3">
                  <input
                    type="text"
                    placeholder="Search commands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* Categories - only show if visibility allows */}
                {visibility.showAdvancedSettings && showCategories && (
                  <div className="px-3 pb-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={[
                          'px-2 py-1 text-xs rounded-full transition-colors',
                          selectedCategory === null
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                        ].join(' ')}
                      >
                        All
                      </button>
                      {availableCategories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={[
                            'px-2 py-1 text-xs rounded-full transition-colors',
                            selectedCategory === category.id
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                          ].join(' ')}
                        >
                          {category.icon} {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Commands List */}
                <div className="flex-1 overflow-y-auto">
                  {/* Show grouped by category if enabled, otherwise flat list */}
                  {visibility.showAdvancedSettings && showCategories ? (
                    // Grouped by category
                    availableCategories
                      .filter(category => 
                        selectedCategory === null || selectedCategory === category.id
                      )
                      .map(category => {
                        const categoryCommands = filteredCommands.filter(cmd => cmd.category === category.id);
                        if (categoryCommands.length === 0) return null;

                        const isExpanded = expandedCategories.has(category.id);
                        
                        return (
                          <div key={category.id} className="border-b border-gray-100 dark:border-gray-800">
                            <button
                              onClick={() => toggleCategory(category.id)}
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <div className="flex items-center space-x-2">
                                <span>{category.icon}</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {category.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({categoryCommands.length})
                                </span>
                              </div>
                              <ChevronIcon 
                                className="w-4 h-4 text-gray-400" 
                                direction={isExpanded ? 'up' : 'down'} 
                              />
                            </button>
                            
                            {isExpanded && (
                              <div className="pb-2">
                                {categoryCommands.map(command => (
                                  <CommandItem
                                    key={command.id}
                                    command={command}
                                    onClick={() => handleCommandClick(command)}
                                    showConfidence={visibility.showConfidenceScores}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    // Flat list
                    <div className="space-y-1 p-2">
                      {filteredCommands.map(command => (
                        <CommandItem
                          key={command.id}
                          command={command}
                          onClick={() => handleCommandClick(command)}
                          showConfidence={visibility.showConfidenceScores}
                        />
                      ))}
                    </div>
                  )}
                  
                  {filteredCommands.length === 0 && (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No commands found matching your search.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && visibility.showCommandHistory && showHistory && (
              <div className="h-full overflow-y-auto p-3">
                <div className="space-y-2">
                  {commandHistory.slice(0, 20).map((command, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {command.intent}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {command.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        "{command.rawText}"
                      </div>
                      <div className="flex items-center justify-between">
                        {/* Only show confidence if visibility allows */}
                        {visibility.showConfidenceScores && (
                          <span className={[
                            'text-xs px-2 py-1 rounded',
                            command.confidence > 0.8 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : command.confidence > 0.6
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          ].join(' ')}>
                            {Math.round(command.confidence * 100)}% confidence
                          </span>
                        )}
                        <button
                          onClick={() => processText(command.rawText)}
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center space-x-1"
                        >
                          <PlayIcon className="w-3 h-3" />
                          <span>Repeat</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {commandHistory.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No command history yet. Start using voice commands!
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && visibility.showAdvancedSettings && (
              <div className="p-4 space-y-4">
                {/* Provider info - only show if visibility allows */}
                {visibility.showProviders && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">AI Providers</h3>
                    <div className="space-y-2">
                      {Object.entries(state.providerStatus || {}).map(([provider, status]) => (
                        <div key={provider} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                            {provider}
                          </span>
                          <span className={[
                            'text-xs px-2 py-1 rounded',
                            status === 'available' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          ].join(' ')}>
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Statistics</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div>Commands available: {availableCommands.length}</div>
                    <div>Categories: {availableCategories.length}</div>
                    {visibility.showCommandHistory && (
                      <div>History: {commandHistory.length} commands</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Command Item Component - updated with visibility support
const CommandItem: React.FC<{
  command: CommandDefinition;
  onClick: () => void;
  showConfidence?: boolean;
  // @ts-ignore
}> = ({ command, onClick, showConfidence = false }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm text-gray-900 dark:text-white">
          {command.name}
        </span>
        <PlayIcon className="w-4 h-4 text-gray-400" />
      </div>
      {command.description && (
        <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
          {command.description}
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {command.triggers.slice(0, 2).map((trigger, index) => (
          <span
            key={index}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded dark:bg-gray-700 dark:text-gray-300"
          >
            "{trigger}"
          </span>
        ))}
        {command.triggers.length > 2 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            +{command.triggers.length - 2} more
          </span>
        )}
      </div>
    </button>
  );
};

export default VoiceCommandCenter;