// packages/react/src/hooks/useVoiceVisibility.ts

import { useMemo } from 'react';
import { 
  VoiceAIConfig,
  VoiceInterfaceMode,
  VisibilityConfig,
  CustomLabels,
  DEFAULT_MODE_PRESETS
} from '../../../types/src/types';

/**
 * Hook for components to get their effective visibility configuration and labels
 * based on global config, component mode, and overrides
 */
export function useVoiceVisibility(
  config: VoiceAIConfig,
  componentMode?: VoiceInterfaceMode,
  componentOverrides?: Partial<VisibilityConfig>
) {
  // Use useMemo to prevent infinite re-renders - this is CRITICAL
  const result = useMemo(() => {
    const visibility = resolveVisibilityConfig(
      config.interfaceMode,
      componentMode,
      config.visibility,
      componentOverrides
    );
    
    const labels = getEffectiveLabels(visibility, config.visibility?.customLabels);
    
    return { visibility, labels };
  }, [
    config.interfaceMode,
    componentMode,
    // Use JSON.stringify for stable object comparisons
    JSON.stringify(config.visibility),
    JSON.stringify(componentOverrides),
    JSON.stringify(config.visibility?.customLabels)
  ]);
  
  return result;
}

/**
 * Utility function to resolve final visibility config with proper precedence:
 * 1. Start with mode preset
 * 2. Apply global config overrides
 * 3. Apply component-level overrides
 */
function resolveVisibilityConfig(
  globalMode?: VoiceInterfaceMode,
  componentMode?: VoiceInterfaceMode,
  globalVisibility?: VisibilityConfig,
  componentOverrides?: Partial<VisibilityConfig>
): VisibilityConfig {
  // Determine effective mode (component overrides global)
  const effectiveMode = componentMode || globalMode || 'project';
  
  // Start with mode preset
  const modePreset = DEFAULT_MODE_PRESETS[effectiveMode];
  
  // Apply global visibility config if it exists
  const withGlobalConfig = globalVisibility 
    ? { ...modePreset, ...globalVisibility }
    : modePreset;
  
  // Apply component-level overrides if they exist
  const finalConfig = componentOverrides 
    ? { ...withGlobalConfig, ...componentOverrides }
    : withGlobalConfig;
  
  return finalConfig;
}

/**
 * Utility function to get effective labels based on visibility config
 */
function getEffectiveLabels(
  visibility: VisibilityConfig,
  customLabels?: Partial<CustomLabels>
): CustomLabels {
  // Get base labels based on whether we're using generic labels
  const baseLabels = visibility.useGenericLabels 
    ? DEFAULT_MODE_PRESETS['end-user'].customLabels!
    : {
        voiceButton: {
          startText: 'Start Listening',
          stopText: 'Stop Listening',
          processingText: 'Processing voice...',
          errorText: 'Voice error'
        },
        status: {
          online: 'Online',
          offline: 'Offline',
          listening: 'Listening',
          processing: 'Processing',
          error: 'Error'
        },
        providers: {
          generic: 'AI Provider',
          fallback: 'Keywords'
        },
        errors: {
          generic: 'An error occurred',
          connection: 'Connection failed',
          permission: 'Permission denied'
        }
      };

  // Merge with custom labels if they exist
  if (!customLabels) return baseLabels;
  
  return {
    voiceButton: { ...baseLabels.voiceButton, ...customLabels.voiceButton },
    status: { ...baseLabels.status, ...customLabels.status },
    providers: { ...baseLabels.providers, ...customLabels.providers },
    errors: { ...baseLabels.errors, ...customLabels.errors }
  };
}