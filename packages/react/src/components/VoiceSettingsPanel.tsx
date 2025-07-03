// packages/react/src/components/VoiceSettingsPanel.tsx

import React, { useState, useEffect } from 'react';
import { useVoiceAI } from '../hooks/useVoiceAI';
import { useComponentTheme, useVoiceContext } from './VoiceProvider';
import { 
  VoiceAIConfig, 
  AIProvider,
  VoiceModeProps,
  useVoiceVisibility
} from '../../../types/src/types';
import { VoiceAIThemeProps } from '../types/theme';
import { SIZE_CLASSES } from '../utils/theme';

// Props interface with mode support
export interface VoiceSettingsPanelProps extends VoiceAIThemeProps, VoiceModeProps {
  config: VoiceAIConfig;
  onConfigChange?: (config: Partial<VoiceAIConfig>) => void;
  onClose?: () => void;
  
  // Legacy props - now controlled by visibility config
  showAdvanced?: boolean;
  showThemeSettings?: boolean;
  showAudioSettings?: boolean;
  showProviderSettings?: boolean;
}

// Settings state interface
interface SettingsState {
  // Provider settings
  preferredProvider: AIProvider;
  fallbackProviders: AIProvider[];
  
  // Audio settings
  microphoneGain: number;
  noiseReduction: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  
  // Voice settings
  confidenceThreshold: number;
  speechTimeout: number;
  silenceTimeout: number;
  
  // UI settings
  autoStart: boolean;
  showVisualFeedback: boolean;
  playAudioFeedback: boolean;
  
  // Advanced settings
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  retryAttempts: number;
  requestTimeout: number;
}

// Icons
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
  </svg>
);

const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

const PaletteIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12,3c-4.97,0-9,4.03-9,9c0,0.83,0.12,1.64,0.33,2.41C4.06,15.31,4.92,16,6,16c1.66,0,3-1.34,3-3c0-1.66-1.34-3-3-3 c-0.44,0-0.85,0.09-1.23,0.26C4.28,8.53,4,6.84,4,5c0-0.55,0.45-1,1-1s1,0.45,1,1c0,0.28,0.22,0.5,0.5,0.5S7,5.28,7,5 c0-1.1-0.9-2-2-2s-2,0.9-2,2c0,2.21,0.34,4.31,0.96,6.26C3.36,11.09,3,10.59,3,10c0-4.97,4.03-9,9-9s9,4.03,9,9 c0,2.12-0.74,4.07-1.97,5.61c-0.26,0.33-0.13,0.81,0.26,0.95C20.47,16.91,21.73,17,23,17c0.55,0,1-0.45,1-1 C24,7.03,19.97,3,12,3z"/>
  </svg>
);

const CloudIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const ResetIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
  </svg>
);

const ModeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

export const VoiceSettingsPanel: React.FC<VoiceSettingsPanelProps> = ({
  config,
  onConfigChange,
  onClose,
  theme: customTheme,
  size = 'md',
  className = '',
  style,
  
  // Legacy props - now controlled by visibility
  showAdvanced,
  showThemeSettings,
  showAudioSettings,
  showProviderSettings,
  
  // NEW: Mode support props
  mode,
  visibilityOverrides,
  customLabels: propCustomLabels,
  ...props
}) => {
  const theme = useComponentTheme(customTheme);
  const { updateTheme, resetTheme, setMode: setContextMode, updateVisibility, updateLabels } = useVoiceContext();
  
  // NEW: Resolve visibility and labels based on mode
  const { visibility, labels } = useVoiceVisibility(config, mode, visibilityOverrides);
  
  // Merge prop labels with resolved labels
  const effectiveLabels = {
    voiceButton: { ...labels.voiceButton, ...propCustomLabels?.voiceButton },
    status: { ...labels.status, ...propCustomLabels?.status },
    providers: { ...labels.providers, ...propCustomLabels?.providers },
    errors: { ...labels.errors, ...propCustomLabels?.errors }
  };

  // Determine what tabs to show based on mode and legacy props
  const shouldShowAdvanced = showAdvanced !== undefined ? showAdvanced : visibility.showAdvancedSettings;
  const shouldShowTheme = showThemeSettings !== undefined ? showThemeSettings : visibility.showAdvancedSettings;
  const shouldShowAudio = showAudioSettings !== undefined ? showAudioSettings : visibility.showAdvancedSettings;
  const shouldShowProvider = showProviderSettings !== undefined ? showProviderSettings : visibility.showProviders;

  // Available tabs based on visibility
  const availableTabs = [
    { id: 'general', label: 'General', icon: SettingsIcon, visible: true },
    { id: 'audio', label: 'Audio', icon: MicrophoneIcon, visible: shouldShowAudio },
    { id: 'providers', label: 'Providers', icon: CloudIcon, visible: shouldShowProvider },
    { id: 'theme', label: 'Theme', icon: PaletteIcon, visible: shouldShowTheme },
    { id: 'mode', label: 'Mode', icon: ModeIcon, visible: visibility.showAdvancedSettings },
    { id: 'advanced', label: 'Advanced', icon: SettingsIcon, visible: shouldShowAdvanced }
  ].filter(tab => tab.visible);

  const [activeTab, setActiveTab] = useState<string>(availableTabs[0]?.id || 'general');

  // Voice AI state
  const { getState } = useVoiceAI({ config, autoStart: false });
  const state = getState();

  // Settings state
  const [settings, setSettings] = useState<SettingsState>({
    preferredProvider: config.aiProviders?.primary?.provider || AIProvider.OPENAI,
    fallbackProviders: config.aiProviders?.fallbacks?.map(f => f.provider) || [],
    microphoneGain: 1.0,
    noiseReduction: true,
    echoCancellation: true,
    autoGainControl: true,
    confidenceThreshold: config.confidenceThreshold || 0.8,
    speechTimeout: 5000,
    silenceTimeout: 2000,
    autoStart: config.autoListen || false,
    showVisualFeedback: true,
    playAudioFeedback: true,
    logLevel: 'info',
    retryAttempts: config.aiProviders?.retryAttempts || 3,
    requestTimeout: config.aiProviders?.timeoutMs || 10000,
  });

  // Handle settings change
  const handleSettingChange = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply changes to config
    const configUpdate: Partial<VoiceAIConfig> = {};
    
    switch (key) {
      case 'preferredProvider':
        if (config.aiProviders) {
          configUpdate.aiProviders = {
            ...config.aiProviders,
            // @ts-ignore
            primary: { ...config.aiProviders.primary, provider: value as AIProvider }
          };
        }
        break;
      case 'confidenceThreshold':
        configUpdate.confidenceThreshold = value as number;
        break;
      case 'autoStart':
        configUpdate.autoListen = value as boolean;
        break;
      case 'retryAttempts':
        if (config.aiProviders) {
          configUpdate.aiProviders = {
            ...config.aiProviders,
            retryAttempts: value as number
          };
        }
        break;
      case 'requestTimeout':
        if (config.aiProviders) {
          configUpdate.aiProviders = {
            ...config.aiProviders,
            timeoutMs: value as number
          };
        }
        break;
    }
    
    if (Object.keys(configUpdate).length > 0) {
      onConfigChange?.(configUpdate);
    }
  };

  // Reset all settings
  const handleResetSettings = () => {
    setSettings({
      preferredProvider: AIProvider.OPENAI,
      fallbackProviders: [],
      microphoneGain: 1.0,
      noiseReduction: true,
      echoCancellation: true,
      autoGainControl: true,
      confidenceThreshold: 0.8,
      speechTimeout: 5000,
      silenceTimeout: 2000,
      autoStart: false,
      showVisualFeedback: true,
      playAudioFeedback: true,
      logLevel: 'info',
      retryAttempts: 3,
      requestTimeout: 10000,
    });
    
    resetTheme();
  };

  const panelClasses = [
    'bg-white rounded-lg border shadow-lg',
    SIZE_CLASSES.panel?.[size] || 'w-96 max-h-96',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={panelClasses}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        boxShadow: theme.shadows.lg,
        ...style
      }}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" 
           style={{ borderColor: theme.colors.border }}>
        <div className="flex items-center space-x-2">
            {/* @ts-ignore */}
          <SettingsIcon className="w-5 h-5" style={{ color: theme.colors.text.primary }} />
          <h3 className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
            Voice Settings
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetSettings}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            style={{ color: theme.colors.text.secondary }}
            title="Reset to defaults"
          >
            <ResetIcon className="w-4 h-4" />
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              style={{ color: theme.colors.text.secondary }}
              title="Close settings"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs - only show available tabs */}
      {availableTabs.length > 1 && (
        <div className="flex border-b overflow-x-auto" style={{ borderColor: theme.colors.border }}>
          {availableTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2'
                  : 'hover:bg-gray-50'
              }`}
              style={{
                color: activeTab === tab.id ? theme.colors.primary : theme.colors.text.secondary,
                borderBottomColor: activeTab === tab.id ? theme.colors.primary : 'transparent'
              }}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Auto Start
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.autoStart}
                  onChange={(e) => handleSettingChange('autoStart', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                  Automatically start voice recognition when component loads
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Confidence Threshold
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.confidenceThreshold}
                onChange={(e) => handleSettingChange('confidenceThreshold', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: theme.colors.text.muted }}>
                <span>Low (0.1)</span>
                <span>Current: {settings.confidenceThreshold}</span>
                <span>High (1.0)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Feedback Options
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.showVisualFeedback}
                    onChange={(e) => handleSettingChange('showVisualFeedback', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    Show visual feedback
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.playAudioFeedback}
                    onChange={(e) => handleSettingChange('playAudioFeedback', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    Play audio feedback
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audio Settings */}
        {activeTab === 'audio' && shouldShowAudio && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Microphone Gain
              </label>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={settings.microphoneGain}
                onChange={(e) => handleSettingChange('microphoneGain', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: theme.colors.text.muted }}>
                <span>Low (0.1)</span>
                <span>Current: {settings.microphoneGain}x</span>
                <span>High (2.0)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Audio Processing
              </label>
              <div className="space-y-2">
                {[
                  { key: 'noiseReduction' as const, label: 'Noise Reduction' },
                  { key: 'echoCancellation' as const, label: 'Echo Cancellation' },
                  { key: 'autoGainControl' as const, label: 'Auto Gain Control' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(e) => handleSettingChange(key, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                  Speech Timeout (ms)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="30000"
                  step="1000"
                  value={settings.speechTimeout}
                  onChange={(e) => handleSettingChange('speechTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  style={{ 
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                  Silence Timeout (ms)
                </label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="500"
                  value={settings.silenceTimeout}
                  onChange={(e) => handleSettingChange('silenceTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  style={{ 
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Provider Settings */}
        {activeTab === 'providers' && shouldShowProvider && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Preferred Provider
              </label>
              <select
                value={settings.preferredProvider}
                onChange={(e) => handleSettingChange('preferredProvider', e.target.value as AIProvider)}
                className="w-full px-3 py-2 border rounded-md text-sm"
                style={{ 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border
                }}
              >
                <option value={AIProvider.OPENAI}>OpenAI</option>
                <option value={AIProvider.ANTHROPIC}>Anthropic</option>
                <option value={AIProvider.GOOGLE}>Google</option>
                <option value={AIProvider.KEYWORDS}>Keywords Only</option>
              </select>
            </div>

            {/* Only show provider status if visibility allows */}
            {visibility.showProviderStatus && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                  Provider Status
                </label>
                <div className="space-y-2">
                  {Object.entries(state.providerStatus || {}).map(([provider, status]) => (
                    <div key={provider} className="flex items-center justify-between py-2 px-3 rounded"
                         style={{ backgroundColor: theme.colors.background }}>
                      <span className="text-sm capitalize" style={{ color: theme.colors.text.primary }}>
                        {visibility.showProviders ? provider : effectiveLabels.providers.generic}
                      </span>
                      <span 
                        className={`px-2 py-1 text-xs rounded ${
                          status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Theme Settings */}
        {activeTab === 'theme' && shouldShowTheme && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Color Scheme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Blue', primary: '#2563eb' },
                  { name: 'Green', primary: '#059669' },
                  { name: 'Purple', primary: '#7c3aed' },
                  { name: 'Red', primary: '#dc2626' },
                  { name: 'Orange', primary: '#d97706' },
                  { name: 'Gray', primary: '#64748b' }
                ].map((color) => (
                  <button
                    key={color.name}
                    onClick={() => updateTheme({ 
                      colors: { 
                        ...theme.colors,
                        primary: color.primary 
                      } 
                    })}
                    className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50 transition-colors"
                    style={{ borderColor: theme.colors.border }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color.primary }}
                    />
                    <span className="text-xs" style={{ color: theme.colors.text.secondary }}>
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Border Radius
              </label>
              <select
                value={theme.borderRadius.md}
                onChange={(e) => updateTheme({ 
                  borderRadius: { 
                    ...theme.borderRadius,
                    md: e.target.value
                  } 
                })}
                className="w-full px-3 py-2 border rounded-md text-sm"
                style={{ 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border
                }}
              >
                <option value="0">Square</option>
                <option value="0.25rem">Small</option>
                <option value="0.375rem">Medium</option>
                <option value="0.5rem">Large</option>
                <option value="1rem">Extra Large</option>
              </select>
            </div>
          </div>
        )}

        {/* Mode Settings */}
        {activeTab === 'mode' && visibility.showAdvancedSettings && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Interface Mode
              </label>
              <div className="space-y-2">
                {[
                  { 
                    id: 'developer', 
                    label: 'Developer Mode', 
                    description: 'Shows all technical details and options' 
                  },
                  { 
                    id: 'project', 
                    label: 'Project Mode', 
                    description: 'Balanced view for project configuration' 
                  },
                  { 
                    id: 'end-user', 
                    label: 'End User Mode', 
                    description: 'Simplified interface for end users' 
                  }
                ].map((modeOption) => (
                  <div key={modeOption.id} className="border rounded p-3" style={{ borderColor: theme.colors.border }}>
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="interfaceMode"
                        value={modeOption.id}
                        checked={mode === modeOption.id}
                        onChange={() => setContextMode && setContextMode(modeOption.id as any)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-sm" style={{ color: theme.colors.text.primary }}>
                          {modeOption.label}
                        </div>
                        <div className="text-xs" style={{ color: theme.colors.text.secondary }}>
                          {modeOption.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {activeTab === 'advanced' && shouldShowAdvanced && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                Log Level
              </label>
              <select
                value={settings.logLevel}
                onChange={(e) => handleSettingChange('logLevel', e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md text-sm"
                style={{ 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border
                }}
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                  Retry Attempts
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={settings.retryAttempts}
                  onChange={(e) => handleSettingChange('retryAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  style={{ 
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                  Request Timeout (ms)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="30000"
                  step="1000"
                  value={settings.requestTimeout}
                  onChange={(e) => handleSettingChange('requestTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  style={{ 
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border
                  }}
                />
              </div>
            </div>

            {/* Debug information - only show if visibility allows */}
            {visibility.showDebugInfo && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                  Debug Information
                </label>
                <div className="p-3 rounded bg-gray-50 text-xs font-mono"
                     style={{ backgroundColor: theme.colors.background }}>
                  <div>Active Provider: {state.activeProvider || 'None'}</div>
                  <div>Available Providers: {Object.keys(state.providerStatus || {}).join(', ')}</div>
                  <div>Commands Available: {config.commands?.registry?.commands?.length || 0}</div>
                  <div>Current Mode: {mode || config.interfaceMode || 'project'}</div>
                  <div>Theme: {theme.colors.primary}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceSettingsPanel;