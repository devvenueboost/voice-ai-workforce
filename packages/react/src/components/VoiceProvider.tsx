// packages/react/src/components/VoiceProvider.tsx

import React, { createContext, useContext, useMemo } from 'react';
import { VoiceAIConfig } from '../../../types/src/types';
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

// Theme context
interface VoiceThemeContextValue {
  theme: VoiceAITheme;
  updateTheme: (newTheme: Partial<VoiceAITheme>) => void;
  resetTheme: () => void;
}

const VoiceThemeContext = createContext<VoiceThemeContextValue | null>(null);

// Provider props
export interface VoiceProviderProps {
  children: React.ReactNode;
  theme?: Partial<VoiceAITheme>;
  config?: VoiceAIConfig;
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
  config
}) => {
  const [customTheme, setCustomTheme] = React.useState<Partial<VoiceAITheme>>(initialTheme || {});

  // Merge default theme with custom theme
  const mergedTheme = useMemo(() => {
    return deepMerge(defaultTheme, customTheme);
  }, [customTheme]);

  // Theme management functions
  const updateTheme = React.useCallback((newTheme: Partial<VoiceAITheme>) => {
    setCustomTheme(prev => deepMerge(prev, newTheme));
  }, []);

  const resetTheme = React.useCallback(() => {
    setCustomTheme(initialTheme || {});
  }, [initialTheme]);

  const contextValue = useMemo(() => ({
    theme: mergedTheme,
    updateTheme,
    resetTheme
  }), [mergedTheme, updateTheme, resetTheme]);

  return (
    <VoiceThemeContext.Provider value={contextValue}>
      {children}
    </VoiceThemeContext.Provider>
  );
};

// Hook to use theme context
export const useVoiceThemeContext = (): VoiceThemeContextValue => {
  const context = useContext(VoiceThemeContext);
  if (!context) {
    throw new Error('useVoiceThemeContext must be used within a VoiceProvider');
  }
  return context;
};

// Hook to get component theme (merges context + component-level theme)
export const useComponentTheme = (componentTheme?: Partial<VoiceAITheme>): VoiceAITheme => {
  const { theme: contextTheme } = useVoiceThemeContext();
  
  return useMemo(() => {
    if (!componentTheme) return contextTheme;
    return deepMerge(contextTheme, componentTheme);
  }, [contextTheme, componentTheme]);
};

export default VoiceProvider;