// packages/react/src/components/index.ts

// Core components
export { VoiceButton } from './VoiceButton';
export type { VoiceButtonProps } from './VoiceButton';

export { VoiceCommandCenter } from './VoiceCommandCenter';
export type { VoiceCommandCenterProps } from '../../../types/src/types';

export { VoiceStatusIndicator } from './VoiceStatusIndicator';
export type { VoiceStatusIndicatorProps } from './VoiceStatusIndicator';

export { VoiceHistoryPanel } from './VoiceHistoryPanel';
export type { VoiceHistoryPanelProps } from './VoiceHistoryPanel';

export { VoiceSettingsPanel } from './VoiceSettingsPanel';
export type { VoiceSettingsPanelProps } from './VoiceSettingsPanel';

// Theme provider
export { VoiceProvider, useVoiceThemeContext, useComponentTheme } from './VoiceProvider';
export type { VoiceProviderProps } from './VoiceProvider';

// Re-export types for convenience
export type {
  VoiceAITheme,
  VoiceAIThemeProps,
  VoiceAISize,
  VoiceAIVariant,
  VoiceAIPosition,
  VoiceAIStatusVariant,
  VoiceAIHistoryFilters,
  VoiceButtonVariant,
  VoiceButtonSize
} from '../types/theme';

// Re-export utilities
export {
  SIZE_CLASSES,
  POSITION_CLASSES,
  ANIMATION_CLASSES,
  getStatusColor,
  getVariantStyles,
  getSizeStyles,
  validateTheme,
  mergeThemes,
  generateCSSCustomProperties,
  createDarkTheme,
  COMMON_THEMES
} from '../utils/theme';