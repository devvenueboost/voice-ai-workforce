// packages/react/src/utils/theme.ts

import { VoiceAITheme, VoiceAISize, VoiceAIPosition } from '../types/theme';

// Size-based CSS classes
export const SIZE_CLASSES = {
  button: {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl'
  },
  panel: {
    xs: 'w-64 max-h-80',
    sm: 'w-80 max-h-96',
    md: 'w-96 max-h-[32rem]',
    lg: 'w-[28rem] max-h-[36rem]',
    xl: 'w-[32rem] max-h-[40rem]'
  },
  text: {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  },
  spacing: {
    xs: 'p-1 space-y-1',
    sm: 'p-2 space-y-2',
    md: 'p-4 space-y-4',
    lg: 'p-6 space-y-6',
    xl: 'p-8 space-y-8'
  }
};

// Position-based CSS classes for floating elements
export const POSITION_CLASSES: Record<VoiceAIPosition, string> = {
  top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  'top-left': 'bottom-full right-0 mb-2',
  'top-right': 'bottom-full left-0 mb-2',
  'bottom-left': 'top-full right-0 mt-2',
  'bottom-right': 'top-full left-0 mt-2'
};

// Animation classes
export const ANIMATION_CLASSES = {
  fadeIn: 'animate-in fade-in-0 zoom-in-95 duration-200',
  fadeOut: 'animate-out fade-out-0 zoom-out-95 duration-200',
  slideInFromTop: 'animate-in slide-in-from-top-2 duration-200',
  slideInFromBottom: 'animate-in slide-in-from-bottom-2 duration-200',
  slideInFromLeft: 'animate-in slide-in-from-left-2 duration-200',
  slideInFromRight: 'animate-in slide-in-from-right-2 duration-200',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin'
};

// Status color utilities
export function getStatusColor(status: string, theme: VoiceAITheme): string {
  switch (status) {
    case 'online':
    case 'available':
    case 'connected':
      return theme.colors.status.online;
    case 'listening':
    case 'active':
      return theme.colors.status.listening;
    case 'processing':
    case 'thinking':
      return theme.colors.status.processing;
    case 'error':
    case 'failed':
      return theme.colors.status.error;
    case 'offline':
    case 'disconnected':
    default:
      return theme.colors.status.offline;
  }
}

// Variant color utilities
export function getVariantStyles(variant: string, theme: VoiceAITheme) {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: theme.colors.primary,
        color: theme.colors.text.inverse,
        borderColor: theme.colors.primary
      };
    case 'secondary':
      return {
        backgroundColor: theme.colors.secondary,
        color: theme.colors.text.inverse,
        borderColor: theme.colors.secondary
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        color: theme.colors.primary,
        borderColor: theme.colors.primary
      };
    case 'ghost':
    default:
      return {
        backgroundColor: 'transparent',
        color: theme.colors.text.primary,
        borderColor: theme.colors.border
      };
  }
}

// Size utilities
export function getSizeStyles(size: VoiceAISize) {
  const sizeMap = {
    xs: { padding: '0.25rem', fontSize: '0.75rem' },
    sm: { padding: '0.5rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem', fontSize: '1rem' },
    lg: { padding: '1rem', fontSize: '1.125rem' },
    xl: { padding: '1.25rem', fontSize: '1.25rem' }
  };
  
  return sizeMap[size] || sizeMap.md;
}

// Theme validation utility
export function validateTheme(theme: Partial<VoiceAITheme>): string[] {
  const errors: string[] = [];
  
  // Validate required color properties
  if (theme.colors) {
    const requiredColors = ['primary', 'secondary', 'surface', 'background', 'border'];
    for (const color of requiredColors) {
      if (theme.colors[color as keyof typeof theme.colors] && 
          !isValidColor(theme.colors[color as keyof typeof theme.colors] as string)) {
        errors.push(`Invalid color value for ${color}`);
      }
    }
  }
  
  return errors;
}

// Color validation helper
function isValidColor(color: string): boolean {
  const style = new Option().style;
  style.color = color;
  return style.color !== '';
}

// Theme merger utility (deep merge)
export function mergeThemes(base: VoiceAITheme, override: Partial<VoiceAITheme>): VoiceAITheme {
  const merged = { ...base };
  
  for (const key in override) {
    if (override.hasOwnProperty(key)) {
      const overrideValue = override[key as keyof VoiceAITheme];
      const baseValue = merged[key as keyof VoiceAITheme];
      
      if (typeof overrideValue === 'object' && overrideValue !== null && !Array.isArray(overrideValue) &&
          typeof baseValue === 'object' && baseValue !== null && !Array.isArray(baseValue)) {
        merged[key as keyof VoiceAITheme] = mergeThemes(baseValue as any, overrideValue as any);
      } else if (overrideValue !== undefined) {
        merged[key as keyof VoiceAITheme] = overrideValue as any;
      }
    }
  }
  
  return merged;
}

// CSS custom properties generator
export function generateCSSCustomProperties(theme: VoiceAITheme): Record<string, string> {
  return {
    '--voice-ai-primary': theme.colors.primary,
    '--voice-ai-secondary': theme.colors.secondary,
    '--voice-ai-success': theme.colors.success,
    '--voice-ai-warning': theme.colors.warning,
    '--voice-ai-error': theme.colors.error,
    '--voice-ai-surface': theme.colors.surface,
    '--voice-ai-background': theme.colors.background,
    '--voice-ai-border': theme.colors.border,
    '--voice-ai-text-primary': theme.colors.text.primary,
    '--voice-ai-text-secondary': theme.colors.text.secondary,
    '--voice-ai-text-muted': theme.colors.text.muted,
    '--voice-ai-text-inverse': theme.colors.text.inverse,
    '--voice-ai-shadow-sm': theme.shadows.sm,
    '--voice-ai-shadow-md': theme.shadows.md,
    '--voice-ai-shadow-lg': theme.shadows.lg,
    '--voice-ai-shadow-xl': theme.shadows.xl,
    '--voice-ai-spacing-xs': theme.spacing.xs,
    '--voice-ai-spacing-sm': theme.spacing.sm,
    '--voice-ai-spacing-md': theme.spacing.md,
    '--voice-ai-spacing-lg': theme.spacing.lg,
    '--voice-ai-spacing-xl': theme.spacing.xl,
    '--voice-ai-radius-sm': theme.borderRadius.sm,
    '--voice-ai-radius-md': theme.borderRadius.md,
    '--voice-ai-radius-lg': theme.borderRadius.lg,
    '--voice-ai-radius-full': theme.borderRadius.full,
    '--voice-ai-font-family': theme.typography.fontFamily,
    '--voice-ai-font-size-xs': theme.typography.fontSize.xs,
    '--voice-ai-font-size-sm': theme.typography.fontSize.sm,
    '--voice-ai-font-size-md': theme.typography.fontSize.md,
    '--voice-ai-font-size-lg': theme.typography.fontSize.lg,
    '--voice-ai-font-size-xl': theme.typography.fontSize.xl
  };
}

// Responsive breakpoint utilities
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Media query helpers
export function createMediaQuery(breakpoint: keyof typeof BREAKPOINTS): string {
  return `@media (min-width: ${BREAKPOINTS[breakpoint]})`;
}

// Accessibility utilities
export function getAccessibleContrast(background: string, foreground: string): number {
  // Simplified contrast calculation
  // In a real implementation, you'd use a proper color contrast algorithm
  return 4.5; // Placeholder for WCAG AA compliance
}

export function ensureAccessibleColors(theme: VoiceAITheme): VoiceAITheme {
  // In a real implementation, this would adjust colors for accessibility
  return theme;
}

// Dark mode utilities
export function createDarkTheme(lightTheme: VoiceAITheme): VoiceAITheme {
  return {
    ...lightTheme,
    colors: {
      ...lightTheme.colors,
      surface: '#1f2937',
      background: '#111827',
      border: '#374151',
      text: {
        primary: '#f9fafb',
        secondary: '#d1d5db',
        muted: '#9ca3af',
        inverse: '#1f2937'
      }
    }
  };
}

// Export commonly used combinations
export const COMMON_THEMES = {
  light: {
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      surface: '#ffffff',
      background: '#f8fafc',
      border: '#e2e8f0'
    }
  },
  dark: {
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      surface: '#1f2937',
      background: '#111827',
      border: '#374151'
    }
  }
};

export default {
  SIZE_CLASSES,
  POSITION_CLASSES,
  ANIMATION_CLASSES,
  getStatusColor,
  getVariantStyles,
  getSizeStyles,
  validateTheme,
  mergeThemes,
  generateCSSCustomProperties,
  BREAKPOINTS,
  createMediaQuery,
  getAccessibleContrast,
  ensureAccessibleColors,
  createDarkTheme,
  COMMON_THEMES
};