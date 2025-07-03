// packages/react/src/components/VoiceStatusIndicator.tsx

import React, { useEffect, useState } from 'react';
import { useVoiceAI } from '../hooks/useVoiceAI';
import { useComponentTheme, useVoiceContext } from './VoiceProvider';
import { 
  VoiceAIConfig,
  VoiceModeProps,
  useVoiceVisibility
} from '../../../types/src/types';
import { VoiceAIThemeProps } from '../types/theme';
import { getStatusColor } from '../utils/theme';

// Status variant type specifically for this component
type VoiceStatusVariant = 'dot' | 'minimal' | 'badge' | 'full';

// Props interface with mode support
export interface VoiceStatusIndicatorProps extends Omit<VoiceAIThemeProps, 'variant'>, VoiceModeProps {
  config: VoiceAIConfig;
  variant?: VoiceStatusVariant;
  autoUpdate?: boolean;
  updateInterval?: number;
  onClick?: () => void;
  tooltip?: boolean;
  
  // Legacy props - now controlled by visibility config
  showProvider?: boolean;
  showConnection?: boolean;
  showLabel?: boolean;
}

// Status type
type VoiceStatus = 'online' | 'offline' | 'listening' | 'processing' | 'error';

// Connection quality type
type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'offline';

// Icons with proper SVG props
const WifiIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.65-4.35-1.65-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.86 9.14 5 13z"/>
  </svg>
);

const MicrophoneIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

const LoadingSpinner = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
);

const AlertIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>
);

const CheckIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M9 16.17L4.83 12l-1.42 1.42L9 19 21 7l-1.42-1.42z"/>
  </svg>
);

const CloudOffIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.28 2.28C6.15 6.69 8.83 6 12 6c1.66 0 3.14.69 4.22 1.78L19 5l1.41 1.41L3.41 23.41 2 22 3 5.27z"/>
  </svg>
);

export const VoiceStatusIndicator: React.FC<VoiceStatusIndicatorProps> = ({
  config,
  variant = 'badge',
  autoUpdate = true,
  updateInterval = 5000,
  onClick,
  tooltip = true,
  theme: customTheme,
  size = 'md',
  className = '',
  style,
  
  // Legacy props - now controlled by visibility
  showProvider,
  showConnection,
  showLabel,
  
  // NEW: Mode support props
  mode,
  visibilityOverrides,
  customLabels: propCustomLabels,
  ...props
}) => {
  const theme = useComponentTheme(customTheme);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('good');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // NEW: Resolve visibility and labels based on mode
  const { visibility, labels } = useVoiceVisibility(config, mode, visibilityOverrides);
  
  // Merge prop labels with resolved labels
  const effectiveLabels = {
    voiceButton: { ...labels.voiceButton, ...propCustomLabels?.voiceButton },
    status: { ...labels.status, ...propCustomLabels?.status },
    providers: { ...labels.providers, ...propCustomLabels?.providers },
    errors: { ...labels.errors, ...propCustomLabels?.errors }
  };

  // Determine what to show based on mode and legacy props
  const shouldShowProvider = showProvider !== undefined ? showProvider : visibility.showProviders;
  const shouldShowConnection = showConnection !== undefined ? showConnection : visibility.showProviderStatus;
  const shouldShowLabel = showLabel !== undefined ? showLabel : !visibility.useGenericLabels;

  // Voice AI state
  const {
    isListening,
    isProcessing,
    isAvailable,
    error,
    getState
  } = useVoiceAI({
    config,
    autoStart: false
  });

  const state = getState();

  // Determine current status
  const getCurrentStatus = (): VoiceStatus => {
    if (error) return 'error';
    if (isProcessing) return 'processing';
    if (isListening) return 'listening';
    if (isAvailable) return 'online';
    return 'offline';
  };

  const currentStatus = getCurrentStatus();

  // Check connection quality
  const checkConnectionQuality = async (): Promise<ConnectionQuality> => {
    if (!navigator.onLine) {
      return 'offline';
    }

    try {
      const start = performance.now();
      await fetch('https://www.google.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      const responseTime = performance.now() - start;

      if (responseTime < 100) return 'excellent';
      if (responseTime < 300) return 'good';
      if (responseTime < 1000) return 'poor';
      return 'poor';
    } catch {
      return 'offline';
    }
  };

  // Auto-update connection quality
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const updateConnection = async () => {
      const quality = await checkConnectionQuality();
      setConnectionQuality(quality);
      setLastUpdate(new Date());
    };

    if (autoUpdate) {
      updateConnection(); // Initial check
      interval = setInterval(updateConnection, updateInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoUpdate, updateInterval]);

  // Get status display info using effective labels
  const getStatusInfo = () => {
    switch (currentStatus) {
      case 'online':
        return {
          color: getStatusColor('online', theme),
          icon: CheckIcon,
          label: effectiveLabels.status.online || 'Online',
          description: 'Voice AI is ready'
        };
      case 'listening':
        return {
          color: getStatusColor('listening', theme),
          icon: MicrophoneIcon,
          label: effectiveLabels.status.listening || 'Listening',
          description: 'Listening for voice input'
        };
      case 'processing':
        return {
          color: getStatusColor('processing', theme),
          icon: LoadingSpinner,
          label: effectiveLabels.status.processing || 'Processing',
          description: 'Processing voice command'
        };
      case 'error':
        return {
          color: theme.colors.error,
          icon: AlertIcon,
          label: effectiveLabels.status.error || 'Error',
          description: visibility.showTechnicalErrors ? (error || 'Voice AI error') : effectiveLabels.errors.generic
        };
      case 'offline':
      default:
        return {
          color: getStatusColor('offline', theme),
          icon: CloudOffIcon,
          label: effectiveLabels.status.offline || 'Offline',
          description: 'Voice AI is not available'
        };
    }
  };

  // Get connection display info
  const getConnectionInfo = () => {
    switch (connectionQuality) {
      case 'excellent':
        return {
          color: theme.colors.success,
          bars: 4,
          label: 'Excellent',
          description: 'Strong connection'
        };
      case 'good':
        return {
          color: theme.colors.success,
          bars: 3,
          label: 'Good',
          description: 'Good connection'
        };
      case 'poor':
        return {
          color: theme.colors.warning,
          bars: 2,
          label: 'Poor',
          description: 'Weak connection'
        };
      case 'offline':
      default:
        return {
          color: theme.colors.error,
          bars: 0,
          label: 'Offline',
          description: 'No connection'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const connectionInfo = getConnectionInfo();
  const StatusIcon = statusInfo.icon;

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case 'dot':
        return (
          <div
            className={`w-3 h-3 rounded-full ${className}`}
            style={{ backgroundColor: statusInfo.color, ...style }}
            title={tooltip ? `${statusInfo.label}: ${statusInfo.description}` : undefined}
          />
        );

      case 'minimal':
        return (
          <div className={`flex items-center space-x-1 ${className}`} style={style}>
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusInfo.color }}
            />
            {shouldShowLabel && (
              <span className="text-xs font-medium" style={{ color: theme.colors.text.secondary }}>
                {statusInfo.label}
              </span>
            )}
          </div>
        );

      case 'badge':
        return (
          <div 
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}
            style={{ 
              backgroundColor: `${statusInfo.color}20`,
              color: statusInfo.color,
              border: `1px solid ${statusInfo.color}40`,
              ...style
            }}
            title={tooltip ? statusInfo.description : undefined}
          >
            <StatusIcon className="w-3 h-3 mr-1" style={{ color: statusInfo.color }} />
            {shouldShowLabel && statusInfo.label}
          </div>
        );

      case 'full':
      default:
        return (
          <div 
            className={`bg-white rounded-lg border p-3 shadow-sm ${className}`}
            style={{ 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              ...style
            }}
          >
            {/* Main Status */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <StatusIcon 
                  className="w-5 h-5"
                  style={{ color: statusInfo.color }}
                />
                {currentStatus === 'processing' && (
                  <div className="absolute inset-0 rounded-full border-2 border-current opacity-30 animate-ping" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>
                  {statusInfo.label}
                </div>
                <div className="text-xs" style={{ color: theme.colors.text.secondary }}>
                  {statusInfo.description}
                </div>
              </div>
            </div>

            {/* Provider Info - only show if visibility allows */}
            {shouldShowProvider && state.activeProvider && (
              <div className="mt-2 pt-2 border-t" style={{ borderColor: theme.colors.border }}>
                <div className="text-xs" style={{ color: theme.colors.text.muted }}>
                  {visibility.showProviders 
                    ? `Provider: ${state.activeProvider}`
                    : effectiveLabels.providers.generic
                  }
                </div>
              </div>
            )}

            {/* Connection Info - only show if visibility allows */}
            {shouldShowConnection && (
              <div className="mt-2 pt-2 border-t flex items-center justify-between" 
                   style={{ borderColor: theme.colors.border }}>
                <div className="flex items-center space-x-2">
                  <WifiIcon className="w-4 h-4" style={{ color: connectionInfo.color }} />
                  <span className="text-xs" style={{ color: theme.colors.text.muted }}>
                    {connectionInfo.label}
                  </span>
                </div>
                
                {/* Connection Bars */}
                <div className="flex items-end space-x-0.5">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`w-1 bg-current transition-opacity ${
                        bar <= connectionInfo.bars ? 'opacity-100' : 'opacity-20'
                      }`}
                      style={{ 
                        height: `${bar * 2 + 2}px`,
                        color: connectionInfo.color
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Last Update - only show if not in end-user mode */}
            {!visibility.useGenericLabels && (
              <div className="mt-2 text-xs text-center" style={{ color: theme.colors.text.muted }}>
                Updated {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div 
      className={onClick ? 'cursor-pointer' : ''}
      onClick={onClick}
      {...props}
    >
      {renderContent()}
    </div>
  );
};

export default VoiceStatusIndicator;