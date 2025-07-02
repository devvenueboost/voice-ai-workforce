// packages/react/src/hooks/useVoiceTheme.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VoiceAITheme, DEFAULT_VOICE_AI_THEME } from '../types/theme';
import { mergeThemes, generateCSSProperties } from '../utils/theme';

// Theme context interface
interface VoiceThemeContextType {
  theme: VoiceAITheme;
  setTheme: (theme: Partial<VoiceAITheme>) => void;
  resetTheme: () => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

// Create theme context
const VoiceThemeContext = createContext<VoiceThemeContextType | null>(null);

// Theme provider props
interface VoiceThemeProviderProps {
  children: ReactNode;
  initialTheme?: Partial<VoiceAITheme>;
  enableDarkMode?: boolean;
  persistTheme?: boolean;
  storageKey?: string;
}

// Theme provider component
export const VoiceThemeProvider: React.FC<VoiceThemeProviderProps> = ({
  children,
  initialTheme,
  enableDarkMode = true,
  persistTheme = true,
  storageKey = 'voice-ai-theme',
}) => {
  const [customTheme, setCustomTheme] = useState<Partial<VoiceAITheme> | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (persistTheme && typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem(storageKey);
        const savedDarkMode = localStorage.getItem(`${storageKey}-dark`);
        
        if (savedTheme) {
          setCustomTheme(JSON.parse(savedTheme));
        }
        
        if (savedDarkMode) {
          setIsDark(JSON.parse(savedDarkMode));
        } else if (enableDarkMode) {
          // Auto-detect system dark mode preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setIsDark(prefersDark);
        }
      } catch (error) {
        console.warn('Failed to load theme from localStorage:', error);
      }
    } else if (initialTheme) {
      setCustomTheme(initialTheme);
    }
  }, [persistTheme, storageKey, initialTheme, enableDarkMode]);

  // Create merged theme
  const theme = React.useMemo(() => {
    let baseTheme = DEFAULT_VOICE_AI_THEME;
    
    // Apply dark mode adjustments
    if (isDark) {
      baseTheme = {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          background: '#1F2937',
          surface: '#374151',
          border: '#4B5563',
          text: {
            primary: '#F9FAFB',
            secondary: '#D1D5DB',
            muted: '#9CA3AF',
            inverse: '#111827',
          },
        },
      };
    }
    
    // Merge with custom theme
    if (customTheme) {
      baseTheme = mergeThemes(baseTheme, customTheme);
    }
    
    return baseTheme;
  }, [customTheme, isDark]);

  // Update theme
  const setTheme = React.useCallback((newTheme: Partial<VoiceAITheme>) => {
    setCustomTheme(prev => mergeThemes(prev || {}, newTheme));
    
    if (persistTheme && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newTheme));
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    }
  }, [persistTheme, storageKey]);

  // Reset theme to default
  const resetTheme = React.useCallback(() => {
    setCustomTheme(null);
    
    if (persistTheme && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn('Failed to remove theme from localStorage:', error);
      }
    }
  }, [persistTheme, storageKey]);

  // Toggle dark mode
  const toggleDarkMode = React.useCallback(() => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    
    if (persistTheme && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${storageKey}-dark`, JSON.stringify(newDarkMode));
      } catch (error) {
        console.warn('Failed to save dark mode preference:', error);
      }
    }
  }, [isDark, persistTheme, storageKey]);

  // Apply CSS custom properties
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cssProps = generateCSSProperties(theme);
      const root = document.documentElement;
      
      Object.entries(cssProps).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
  }, [theme]);

  const contextValue: VoiceThemeContextType = {
    theme,
    setTheme,
    resetTheme,
    isDark,
    toggleDarkMode,
  };

  return (
    <VoiceThemeContext.Provider value={contextValue}>
      {children}
    </VoiceThemeContext.Provider>
  );
};

// Hook to use theme context
export const useVoiceTheme = (): VoiceThemeContextType => {
  const context = useContext(VoiceThemeContext);
  
  if (!context) {
    // Return default theme if no provider
    console.warn('useVoiceTheme must be used within a VoiceThemeProvider. Using default theme.');
    
    return {
      theme: DEFAULT_VOICE_AI_THEME,
      setTheme: () => {},
      resetTheme: () => {},
      isDark: false,
      toggleDarkMode: () => {},
    };
  }
  
  return context;
};

// Hook for component-level theme customization
export const useComponentTheme = (customTheme?: Partial<VoiceAITheme>) => {
  const { theme: globalTheme } = useVoiceTheme();
  
  const componentTheme = React.useMemo(() => {
    if (!customTheme) return globalTheme;
    return mergeThemes(globalTheme, customTheme);
  }, [globalTheme, customTheme]);
  
  return componentTheme;
};

// Hook for getting theme-aware styles
export const useThemeStyles = () => {
  const { theme } = useVoiceTheme();
  
  return React.useMemo(() => ({
    // Button styles
    primaryButton: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.text.inverse,
      borderColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.text.inverse,
      borderColor: theme.colors.secondary,
    },
    ghostButton: {
      backgroundColor: 'transparent',
      color: theme.colors.text.primary,
      borderColor: theme.colors.border,
    },
    
    // Panel styles
    panel: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      color: theme.colors.text.primary,
      boxShadow: theme.shadows.lg,
    },
    
    // Status styles
    statusOnline: {
      backgroundColor: theme.colors.status.online,
    },
    statusOffline: {
      backgroundColor: theme.colors.status.offline,
    },
    statusProcessing: {
      backgroundColor: theme.colors.status.processing,
    },
    statusListening: {
      backgroundColor: theme.colors.status.listening,
    },
  }), [theme]);
};

// Hook for responsive theme values
export const useResponsiveTheme = () => {
  const { theme } = useVoiceTheme();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return {
    theme,
    isMobile,
    spacing: isMobile ? theme.spacing.sm : theme.spacing.md,
    fontSize: isMobile ? theme.typography.fontSize.sm : theme.typography.fontSize.md,
  };
};