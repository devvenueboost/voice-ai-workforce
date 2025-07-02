// packages/react/src/components/VoiceButton.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useVoiceAI } from '../hooks/useVoiceAI';
import { useComponentTheme } from '../hooks/useVoiceTheme';
import { useVoiceHistory } from '../hooks/useVoiceHistory';
import { VoiceCommand, VoiceResponse, VoiceAIConfig, VoiceAIError, CommandDefinition } from '../../../types/src/types';
import { VoiceAIThemeProps, VoiceAIPosition, VoiceAISize, VoiceAIVariant } from '../types/theme';
import { SIZE_CLASSES, POSITION_CLASSES, ANIMATION_CLASSES } from '../utils/theme';

// Extended props interface
export interface VoiceButtonProps extends VoiceAIThemeProps {
  // Core configuration
  config: VoiceAIConfig;
  
  // Mini center functionality
  showMiniCenter?: boolean;
  miniCenterPosition?: VoiceAIPosition;
  quickCommands?: string[];
  maxRecentCommands?: number;
  autoCloseMiniCenter?: boolean;
  autoCloseDelay?: number;
  
  // Styling
  disabled?: boolean;
  
  // Event handlers
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
  onMiniCenterToggle?: (isOpen: boolean) => void;
  
  // Custom content
  children?: React.ReactNode;
  listenText?: string;
  stopText?: string;
  
  // Accessibility
  'aria-label'?: string;
}

// Default quick commands
const DEFAULT_QUICK_COMMANDS = ['help', 'status', 'clock in', 'clock out'];

// Icons (using simple SVG for now)
const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

const StopIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 6h12v12H6V6z"/>
  </svg>
);

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
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

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  config,
  size = 'md',
  variant = 'primary',
  theme: customTheme,
  className = '',
  style,
  disabled = false,
  showMiniCenter = false,
  miniCenterPosition = 'bottom',
  quickCommands = DEFAULT_QUICK_COMMANDS,
  maxRecentCommands = 3,
  autoCloseMiniCenter = true,
  autoCloseDelay = 3000,
  onCommand,
  onResponse,
  onError,
  onMiniCenterToggle,
  children,
  listenText = 'Start Listening',
  stopText = 'Stop Listening',
  'aria-label': ariaLabel,
  ...props
}) => {
  const theme = useComponentTheme(customTheme);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const miniCenterRef = useRef<HTMLDivElement>(null);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout>();
  
  // State
  const [isMiniCenterOpen, setIsMiniCenterOpen] = useState(false);
  const [miniCenterTab, setMiniCenterTab] = useState<'quick' | 'recent'>('quick');

  // Voice AI hook
  const {
    isListening,
    isProcessing,
    isAvailable,
    error,
    startListening,
    stopListening,
    processText,
    getState
  } = useVoiceAI({
    config,
    onCommand: (command) => {
      onCommand?.(command);
      if (showMiniCenter && autoCloseMiniCenter) {
        scheduleAutoClose();
      }
    },
    onResponse,
    onError,
    autoStart: false
  });

  // History hook
  const { getRecentCommands, replayCommand } = useVoiceHistory();

  // Get recent commands and quick commands
  const recentCommands = getRecentCommands(maxRecentCommands);
  const availableCommands = config.commands?.registry?.commands || [];
  const quickCommandDefs = quickCommands
    .map(cmdName => availableCommands.find(cmd => 
      cmd.triggers.some(trigger => trigger.toLowerCase().includes(cmdName.toLowerCase()))
    ))
    .filter(Boolean) as CommandDefinition[];

  // Auto-close functionality
  const scheduleAutoClose = () => {
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
    }
    
    if (autoCloseMiniCenter) {
      autoCloseTimeoutRef.current = setTimeout(() => {
        setIsMiniCenterOpen(false);
      }, autoCloseDelay);
    }
  };

  const cancelAutoClose = () => {
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
    }
  };

  // Handle button click
  const handleButtonClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (disabled || !isAvailable) return;
    
    if (showMiniCenter && !isListening) {
      // Toggle mini center
      const newOpen = !isMiniCenterOpen;
      setIsMiniCenterOpen(newOpen);
      onMiniCenterToggle?.(newOpen);
      
      if (newOpen) {
        cancelAutoClose();
      }
    } else {
      // Normal voice toggle
      try {
        if (isListening) {
          await stopListening();
        } else {
          await startListening();
        }
      } catch (err) {
        onError?.({
          code: 'VOICE_OPERATION_FAILED',
          message: err instanceof Error ? err.message : 'Voice operation failed',
          details: err
        });
      }
    }
  };

  // Handle quick command execution
  const handleQuickCommand = async (command: CommandDefinition) => {
    try {
      if (command.examples && command.examples.length > 0) {
        await processText(command.examples[0]);
      } else {
        await processText(command.triggers[0]);
      }
      
      if (autoCloseMiniCenter) {
        setIsMiniCenterOpen(false);
      }
    } catch (err) {
      onError?.({
        code: 'COMMAND_EXECUTION_FAILED',
        message: 'Failed to execute command',
        details: err
      });
    }
  };

  // Handle recent command replay
  const handleReplayCommand = async (commandId: string) => {
    try {
      const command = replayCommand(commandId);
      if (command) {
        await processText(command.rawText);
        
        if (autoCloseMiniCenter) {
          setIsMiniCenterOpen(false);
        }
      }
    } catch (err) {
      onError?.({
        code: 'COMMAND_REPLAY_FAILED',
        message: 'Failed to replay command',
        details: err
      });
    }
  };

  // Handle voice toggle from mini center
  const handleVoiceToggle = async () => {
    try {
      if (isListening) {
        await stopListening();
      } else {
        await startListening();
        if (autoCloseMiniCenter) {
          setIsMiniCenterOpen(false);
        }
      }
    } catch (err) {
      onError?.({
        code: 'VOICE_OPERATION_FAILED',
        message: err instanceof Error ? err.message : 'Voice operation failed',
        details: err
      });
    }
  };

  // Close mini center when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMiniCenterOpen &&
        buttonRef.current &&
        miniCenterRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !miniCenterRef.current.contains(event.target as Node)
      ) {
        setIsMiniCenterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMiniCenterOpen]);

  // Cleanup auto-close timeout
  useEffect(() => {
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, []);

  // Build button classes
  const isActive = isListening || isProcessing;
  const showError = !!error;
  
  const buttonClasses = [
    'relative inline-flex items-center justify-center rounded-full border-2 font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    SIZE_CLASSES.button[size],
    showError ? 'border-red-500 bg-red-50 text-red-600' : '',
    isActive && !showError ? 'animate-pulse' : '',
    className
  ].filter(Boolean).join(' ');

  // Apply theme colors via style
  const buttonStyle: React.CSSProperties = {
    ...style,
    backgroundColor: showError ? theme.colors.error : 
                    variant === 'primary' ? theme.colors.primary :
                    variant === 'secondary' ? theme.colors.secondary :
                    'transparent',
    color: showError ? theme.colors.text.inverse :
           variant === 'ghost' ? theme.colors.text.primary : theme.colors.text.inverse,
    borderColor: showError ? theme.colors.error :
                 variant === 'primary' ? theme.colors.primary :
                 variant === 'secondary' ? theme.colors.secondary :
                 theme.colors.border,
  };

  // Determine icon to show
  const renderIcon = () => {
    if (isProcessing) {
      return <LoadingSpinner className="w-1/2 h-1/2" />;
    }
    
    if (isListening) {
      return <StopIcon className="w-1/2 h-1/2" />;
    }
    
    return <MicrophoneIcon className="w-1/2 h-1/2" />;
  };

  // Accessibility label
  const accessibilityLabel = ariaLabel || (
    isListening ? stopText : 
    isProcessing ? 'Processing voice...' :
    error ? `Voice error: ${error}` :
    listenText
  );

  return (
    <div className="relative inline-block">
      {/* Main Button */}
      <button
        ref={buttonRef}
        type="button"
        className={buttonClasses}
        style={buttonStyle}
        onClick={handleButtonClick}
        disabled={disabled || !isAvailable}
        aria-label={accessibilityLabel}
        aria-pressed={isListening}
        aria-expanded={showMiniCenter ? isMiniCenterOpen : undefined}
        title={accessibilityLabel}
        {...props}
      >
        {/* Main icon */}
        {children || renderIcon()}
        
        {/* Active indicator ring */}
        {isActive && !showError && (
          <div className="absolute inset-0 rounded-full border-2 border-current opacity-30 animate-ping" />
        )}
        
        {/* Error indicator */}
        {showError && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
        
        {/* Mini center indicator */}
        {showMiniCenter && !isListening && !isProcessing && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Mini Command Center */}
      {showMiniCenter && isMiniCenterOpen && (
        <div
          ref={miniCenterRef}
          className={`absolute z-50 ${POSITION_CLASSES[miniCenterPosition]} ${ANIMATION_CLASSES.fadeIn}`}
          style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
          onMouseEnter={cancelAutoClose}
          onMouseLeave={scheduleAutoClose}
        >
          <div className="w-72 bg-white rounded-lg shadow-lg border p-4" style={{ 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            boxShadow: theme.shadows.lg
          }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm" style={{ color: theme.colors.text.primary }}>
                Voice Commands
              </h3>
              <div className="flex items-center space-x-2">
                {/* Voice Toggle */}
                <button
                  onClick={handleVoiceToggle}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  style={{ color: isListening ? theme.colors.status.listening : theme.colors.text.secondary }}
                  title={isListening ? 'Stop Listening' : 'Start Listening'}
                >
                  {isListening ? <StopIcon className="w-4 h-4" /> : <MicrophoneIcon className="w-4 h-4" />}
                </button>
                
                {/* Close */}
                <button
                  onClick={() => setIsMiniCenterOpen(false)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  style={{ color: theme.colors.text.secondary }}
                  title="Close"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-3">
              <button
                onClick={() => setMiniCenterTab('quick')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  miniCenterTab === 'quick' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Quick
              </button>
              <button
                onClick={() => setMiniCenterTab('recent')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  miniCenterTab === 'recent' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Recent
              </button>
            </div>

            {/* Content */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {miniCenterTab === 'quick' && (
                <>
                  {quickCommandDefs.map((command, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickCommand(command)}
                      className="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors group"
                      style={{ backgroundColor: 'transparent' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>
                            {command.name}
                          </div>
                          <div className="text-xs" style={{ color: theme.colors.text.secondary }}>
                            "{command.triggers[0]}"
                          </div>
                        </div>
                        <PlayIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                          // @ts-ignore
                                 style={{ color: theme.colors.text.secondary }} />
                      </div>
                    </button>
                  ))}
                  
                  {quickCommandDefs.length === 0 && (
                    <div className="text-center py-4 text-sm" style={{ color: theme.colors.text.muted }}>
                      No quick commands available
                    </div>
                  )}
                </>
              )}

              {miniCenterTab === 'recent' && (
                <>
                  {recentCommands.map((command) => (
                    <button
                      key={command.id}
                      onClick={() => handleReplayCommand(command.id)}
                      className="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>
                            {command.intent}
                          </div>
                          <div className="text-xs" style={{ color: theme.colors.text.secondary }}>
                            "{command.rawText}"
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs" style={{ color: theme.colors.text.muted }}>
                            {Math.round(command.confidence * 100)}%
                          </span>
                          <PlayIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                            // @ts-ignore
                                   style={{ color: theme.colors.text.secondary }} />
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {recentCommands.length === 0 && (
                    <div className="text-center py-4 text-sm" style={{ color: theme.colors.text.muted }}>
                      No recent commands
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Status Footer */}
            <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs" 
                 style={{ borderColor: theme.colors.border, color: theme.colors.text.muted }}>
              <span>
                Provider: {getState().activeProvider || 'Unknown'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceButton;