// packages/react/src/components/VoiceProvider.tsx

import React, { createContext, useContext, useMemo } from 'react';
import { 
  VoiceAIConfig, 
  VoiceInterfaceMode, 
  VisibilityConfig, 
  CustomLabels,
  useVoiceVisibility
} from '../../../types/src/types';
import { VoiceAITheme, VoiceAIThemeProps } from '../types/theme';

// Default theme
const defaultTheme: VoiceAITheme = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    surface: '#ffffff',
    background: '#f8fafc',
    border: '#e2e8f0',
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      muted: '#94a3b8',
      inverse: '#ffffff'
    },
    status: {
      online: '#059669',
      offline: '#64748b',
      listening: '#2563eb',
      processing: '#d97706'
    }
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem'
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  // @ts-ignore
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  }
};

// Combined context interface
interface VoiceContextValue {
  // Theme context
  theme: VoiceAITheme;
  updateTheme: (newTheme: Partial<VoiceAITheme>) => void;
  resetTheme: () => void;
  
  // Voice configuration context
  config?: VoiceAIConfig;
  mode?: VoiceInterfaceMode;
  visibility: VisibilityConfig;
  labels: CustomLabels;
  updateConfig: (newConfig: Partial<VoiceAIConfig>) => void;
  setMode: (mode: VoiceInterfaceMode) => void;
  updateVisibility: (visibility: Partial<VisibilityConfig>) => void;
  updateLabels: (labels: Partial<CustomLabels>) => void;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

// Provider props
export interface VoiceProviderProps {
  children: React.ReactNode;
  theme?: Partial<VoiceAITheme>;
  config?: VoiceAIConfig;
  mode?: VoiceInterfaceMode;
  visibilityOverrides?: Partial<VisibilityConfig>;
  customLabels?: Partial<CustomLabels>;
}

// Deep merge helper
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue;
      }
    }
  }
  
  return result;
}

export const VoiceProvider: React.FC<VoiceProviderProps> = ({
  children,
  theme: initialTheme,
  config,
  mode: initialMode,
  visibilityOverrides,
  customLabels: initialCustomLabels
}) => {
  // Theme state
  const [customTheme, setCustomTheme] = React.useState<Partial<VoiceAITheme>>(initialTheme || {});
  
  // Voice configuration state
  const [voiceConfig, setVoiceConfig] = React.useState<VoiceAIConfig | undefined>(config);
  const [currentMode, setCurrentMode] = React.useState<VoiceInterfaceMode | undefined>(initialMode);
  const [visibilityConfig, setVisibilityConfig] = React.useState<Partial<VisibilityConfig>>(visibilityOverrides || {});
  const [labelsConfig, setLabelsConfig] = React.useState<Partial<CustomLabels>>(initialCustomLabels || {});

  // Merge default theme with custom theme
  const mergedTheme = useMemo(() => {
    return deepMerge(defaultTheme, customTheme);
  }, [customTheme]);

  // Resolve visibility and labels based on current config and mode
  const { visibility, labels } = useVoiceVisibility(
    voiceConfig || config,
    currentMode,
    visibilityConfig
  );

  // Merge provider labels with resolved labels
  const effectiveLabels = useMemo(() => ({
    voiceButton: { ...labels.voiceButton, ...labelsConfig.voiceButton },
    status: { ...labels.status, ...labelsConfig.status },
    providers: { ...labels.providers, ...labelsConfig.providers },
    errors: { ...labels.errors, ...labelsConfig.errors }
  }), [labels, labelsConfig]);

  // Theme management functions
  const updateTheme = React.useCallback((newTheme: Partial<VoiceAITheme>) => {
    setCustomTheme(prev => deepMerge(prev, newTheme));
  }, []);

  const resetTheme = React.useCallback(() => {
    setCustomTheme(initialTheme || {});
  }, [initialTheme]);

  // Voice configuration management functions
  const updateConfig = React.useCallback((newConfig: Partial<VoiceAIConfig>) => {
    setVoiceConfig(prev => prev ? { ...prev, ...newConfig } : newConfig as VoiceAIConfig);
  }, []);

  const setMode = React.useCallback((mode: VoiceInterfaceMode) => {
    setCurrentMode(mode);
  }, []);

  const updateVisibility = React.useCallback((newVisibility: Partial<VisibilityConfig>) => {
    setVisibilityConfig(prev => ({ ...prev, ...newVisibility }));
  }, []);

  const updateLabels = React.useCallback((newLabels: Partial<CustomLabels>) => {
    setLabelsConfig(prev => ({ ...prev, ...newLabels }));
  }, []);

  const contextValue = useMemo(() => ({
    // Theme context
    theme: mergedTheme,
    updateTheme,
    resetTheme,
    
    // Voice configuration context
    config: voiceConfig || config,
    mode: currentMode,
    visibility,
    labels: effectiveLabels,
    updateConfig,
    setMode,
    updateVisibility,
    updateLabels
  }), [
    mergedTheme, 
    updateTheme, 
    resetTheme,
    voiceConfig,
    config,
    currentMode,
    visibility,
    effectiveLabels,
    updateConfig,
    setMode,
    updateVisibility,
    updateLabels
  ]);

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
};

// Hook to use the combined context
export const useVoiceContext = (): VoiceContextValue => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoiceContext must be used within a VoiceProvider');
  }
  return context;
};

// Legacy hook for theme-only usage (backward compatibility)
export const useVoiceThemeContext = () => {
  const context = useVoiceContext();
  return {
    theme: context.theme,
    updateTheme: context.updateTheme,
    resetTheme: context.resetTheme
  };
};

// Hook to get component theme (merges context + component-level theme)
export const useComponentTheme = (componentTheme?: Partial<VoiceAITheme>): VoiceAITheme => {
  const { theme: contextTheme } = useVoiceContext();
  
  return useMemo(() => {
    if (!componentTheme) return contextTheme;
    return deepMerge(contextTheme, componentTheme);
  }, [contextTheme, componentTheme]);
};

export default VoiceProvider;