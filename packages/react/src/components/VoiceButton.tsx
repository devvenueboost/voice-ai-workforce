// packages/react/src/components/VoiceButton.tsx

import React from 'react';
import { useVoiceAI } from '../hooks/useVoiceAI';
import { VoiceCommand, VoiceResponse, VoiceAIConfig, VoiceAIError } from '../../../types/src/types';

// Button size variants
export type VoiceButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// Button visual variants
export type VoiceButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

// Props interface
export interface VoiceButtonProps {
  // Core configuration
  config: VoiceAIConfig;
  
  // Styling
  size?: VoiceButtonSize;
  variant?: VoiceButtonVariant;
  className?: string;
  disabled?: boolean;
  
  // Event handlers
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;

  
  // Custom content
  children?: React.ReactNode;
  listenText?: string;
  stopText?: string;
  
  // Accessibility
  'aria-label'?: string;
}

// Size styles mapping
const sizeStyles: Record<VoiceButtonSize, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl'
};

// Variant styles mapping
const variantStyles: Record<VoiceButtonVariant, string> = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500',
  secondary: 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-gray-300',
  danger: 'bg-red-500 hover:bg-red-600 text-white border-red-500'
};

// Microphone SVG Icon Component
const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
);

// Stop/Square SVG Icon Component
const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 6h12v12H6V6z" />
  </svg>
);

// Loading Spinner Component
const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={`animate-spin ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  config,
  size = 'md',
  variant = 'primary',
  className = '',
  disabled = false,
  onCommand,
  onResponse,
  onError,
  children,
  listenText = 'Start Listening',
  stopText = 'Stop Listening',
  'aria-label': ariaLabel,
  ...props
}) => {
  const {
    isListening,
    isProcessing,
    isAvailable,
    error,
    startListening,
    stopListening,
  } = useVoiceAI({
    config,
    onCommand,
    onResponse,
    onError,
    autoStart: false
  });

  // Handle click to toggle listening
  const handleClick = async () => {
    if (disabled || !isAvailable) return;
    
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
  };

  // Determine button state
  const isActive = isListening || isProcessing;
  const showError = !!error;
  
  // Build CSS classes
  const baseClasses = [
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-full',
    'border-2',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-blue-500',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    sizeStyles[size],
    showError ? 'border-red-500 bg-red-50 text-red-600' : variantStyles[variant]
  ];

  // Add pulse animation when active
  if (isActive && !showError) {
    baseClasses.push('animate-pulse');
  }

  const buttonClasses = `${baseClasses.join(' ')} ${className}`;

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
    <button
      type="button"
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || !isAvailable}
      aria-label={accessibilityLabel}
      aria-pressed={isListening}
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
      
      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute inset-0 rounded-full bg-current opacity-10" />
      )}
    </button>
  );
};

// Export default
export default VoiceButton;