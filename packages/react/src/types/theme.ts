// packages/react/src/types/theme.ts

import React from 'react';

// Core theme colors
export interface VoiceAIColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  status: {
    online: string;
    offline: string;
    processing: string;
    listening: string;
  };
}

// Typography settings
export interface VoiceAITypography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

// Spacing system
export interface VoiceAISpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

// Border radius system
export interface VoiceAIBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

// Shadow system
export interface VoiceAIShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Animation settings
export interface VoiceAIAnimations {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  scale: {
    enter: string;
    exit: string;
  };
}

// Component size variants
export type VoiceAISize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Component color variants
export type VoiceAIVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';

// Custom icons interface
export interface VoiceAIIcons {
  microphone?: React.ComponentType<{className?: string}>;
  stop?: React.ComponentType<{className?: string}>;
  loading?: React.ComponentType<{className?: string}>;
  settings?: React.ComponentType<{className?: string}>;
  history?: React.ComponentType<{className?: string}>;
  close?: React.ComponentType<{className?: string}>;
  chevronDown?: React.ComponentType<{className?: string}>;
  chevronUp?: React.ComponentType<{className?: string}>;
  play?: React.ComponentType<{className?: string}>;
  pause?: React.ComponentType<{className?: string}>;
  search?: React.ComponentType<{className?: string}>;
  filter?: React.ComponentType<{className?: string}>;
  export?: React.ComponentType<{className?: string}>;
  refresh?: React.ComponentType<{className?: string}>;
}

// Layout preferences
export interface VoiceAILayout {
  compact?: boolean;
  showLabels?: boolean;
  showIcons?: boolean;
  orientation?: 'horizontal' | 'vertical';
  maxWidth?: string;
  maxHeight?: string;
}

// Complete theme interface
export interface VoiceAITheme {
  colors: VoiceAIColors;
  typography: VoiceAITypography;
  spacing: VoiceAISpacing;
  borderRadius: VoiceAIBorderRadius;
  shadows: VoiceAIShadows;
  animations: VoiceAIAnimations;
  icons?: VoiceAIIcons;
  layout?: VoiceAILayout;
}

// Theme customization props
export interface VoiceAIThemeProps {
  theme?: Partial<VoiceAITheme>;
  size?: VoiceAISize;
  variant?: VoiceAIVariant;
  className?: string;
  style?: React.CSSProperties;
}

// Component position types
export type VoiceAIPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// Status indicator variants
export type VoiceAIStatusVariant = 'dot' | 'badge' | 'full' | 'minimal';

// History panel filters
export interface VoiceAIHistoryFilters {
  dateFrom?: Date;
  dateTo?: Date;
  commandType?: string;
  success?: boolean;
  provider?: string;
}

// Settings panel sections
export type VoiceAISettingsSection = 'providers' | 'voice' | 'ui' | 'commands' | 'advanced';

// Default theme
export const DEFAULT_VOICE_AI_THEME: VoiceAITheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      muted: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    status: {
      online: '#10B981',
      offline: '#6B7280',
      processing: '#F59E0B',
      listening: '#3B82F6',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    scale: {
      enter: '1.05',
      exit: '0.95',
    },
  },
  layout: {
    compact: false,
    showLabels: true,
    showIcons: true,
    orientation: 'vertical',
    maxWidth: '400px',
    maxHeight: '600px',
  },
};

// Brand theme presets
export const BRAND_THEMES = {
  microsoft: {
    colors: {
      primary: '#5B5FC7',
      secondary: '#464775',
      background: '#F5F5F5',
      surface: '#FFFFFF',
    },
  },
  slack: {
    colors: {
      primary: '#4A154B',
      secondary: '#ECE8EC',
      background: '#FFFFFF',
      surface: '#F8F8F8',
    },
  },
  construction: {
    colors: {
      primary: '#FF6B00',
      secondary: '#1F2937',
      background: '#F9FAFB',
      surface: '#FFFFFF',
    },
  },
  healthcare: {
    colors: {
      primary: '#0EA5E9',
      secondary: '#64748B',
      background: '#F8FAFC',
      surface: '#FFFFFF',
    },
  },
} as const;