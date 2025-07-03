// packages/react/src/hooks/useVoiceVisibility.ts
import { useMemo } from 'react';
import {
  VoiceAIConfig,
  VoiceInterfaceMode,
  VisibilityConfig,
  CustomLabels,
  DEFAULT_MODE_PRESETS,
  BusinessContext,
  CommandDefinition,
  CommandComplexity,
  EntityType
} from '../../../types/src/types';

/**
 * Enhanced hook for components to get their effective visibility configuration and labels
 * based on global config, component mode, business context, and overrides
 */
export function useVoiceVisibility(
  config: VoiceAIConfig,
  componentMode?: VoiceInterfaceMode,
  componentOverrides?: Partial<VisibilityConfig>,
  businessContext?: BusinessContext
) {
  // Use useMemo to prevent infinite re-renders - this is CRITICAL
  const result = useMemo(() => {
    const visibility = resolveVisibilityConfig(
      config.interfaceMode,
      componentMode,
      config.visibility,
      componentOverrides,
      businessContext
    );
    
    const labels = getEffectiveLabels(
      visibility,
      config.visibility?.customLabels,
      businessContext
    );
    
    const businessFeatures = resolveBusinessFeatures(config, businessContext);
    
    return {
      visibility,
      labels,
      businessFeatures,
      canHandleBusinessCommands: businessFeatures.hasBusinessIntegration,
      businessName: businessContext?.name
    };
  }, [
    config.interfaceMode,
    componentMode,
    // Use JSON.stringify for stable object comparisons
    JSON.stringify(config.visibility),
    JSON.stringify(componentOverrides),
    JSON.stringify(config.visibility?.customLabels),
    JSON.stringify(businessContext),
    JSON.stringify(config.businessContext),
    JSON.stringify(config.fallback)
  ]);

  return result;
}

/**
 * Enhanced utility function to resolve final visibility config with business context:
 * 1. Start with mode preset
 * 2. Apply business context rules
 * 3. Apply global config overrides
 * 4. Apply component-level overrides
 * 5. Apply business-specific visibility rules
 */
function resolveVisibilityConfig(
  globalMode?: VoiceInterfaceMode,
  componentMode?: VoiceInterfaceMode,
  globalVisibility?: VisibilityConfig,
  componentOverrides?: Partial<VisibilityConfig>,
  businessContext?: BusinessContext
): VisibilityConfig {
  // Determine effective mode (component overrides global)
  const effectiveMode = componentMode || globalMode || 'project';

  // Start with mode preset
  const modePreset = DEFAULT_MODE_PRESETS[effectiveMode];
  
  // Apply business context modifications
  const withBusinessContext = applyBusinessContextToVisibility(modePreset, businessContext);
  
  // Apply global visibility config if it exists
  const withGlobalConfig = globalVisibility
    ? { ...withBusinessContext, ...globalVisibility }
    : withBusinessContext;
    
  // Apply component-level overrides if they exist
  const finalConfig = componentOverrides
    ? { ...withGlobalConfig, ...componentOverrides }
    : withGlobalConfig;
    
  return finalConfig;
}

/**
 * Apply business context rules to visibility configuration
 */
function applyBusinessContextToVisibility(
  baseConfig: VisibilityConfig,
  businessContext?: BusinessContext
): VisibilityConfig {
  if (!businessContext) return baseConfig;

  const businessConfig = { ...baseConfig };
  
  
  // Enable business features if business context exists
  if (businessContext.capabilities?.length > 0) {
    businessConfig.showBusinessCommands = true;
  }
  
  
  return businessConfig;
}

/**
 * Enhanced utility function to get effective labels with business context
 */
function getEffectiveLabels(
  visibility: VisibilityConfig,
  customLabels?: Partial<CustomLabels>,
  businessContext?: BusinessContext
): CustomLabels {
  // Get base labels based on whether we're using generic labels
  const baseLabels = visibility.useGenericLabels
    ? DEFAULT_MODE_PRESETS['end-user'].customLabels!
    : getDefaultLabels(businessContext);

  // Apply business branding to labels
  const businessBrandedLabels = applyBusinessBranding(baseLabels, businessContext);
  
  // Merge with custom labels if they exist
  if (!customLabels) return businessBrandedLabels;
  
  return {
    voiceButton: {
      ...businessBrandedLabels.voiceButton,
      ...customLabels.voiceButton
    },
    status: {
      ...businessBrandedLabels.status,
      ...customLabels.status
    },
    providers: {
      ...businessBrandedLabels.providers,
      ...customLabels.providers
    },
    errors: {
      ...businessBrandedLabels.errors,
      ...customLabels.errors
    }
  };
}

/**
 * Get default labels with optional business context
 */
function getDefaultLabels(businessContext?: BusinessContext): CustomLabels {
  const businessName = businessContext?.name || 'your system';

  return {
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
      fallback: businessName
    },
    errors: {
      generic: 'An error occurred',
      connection: 'Connection failed',
      permission: 'Permission denied'
    }
  };
}

/**
 * Apply business branding to labels
 */
function applyBusinessBranding(
  baseLabels: CustomLabels,
  businessContext?: BusinessContext
): CustomLabels {
  if (!businessContext?.name) return baseLabels;

  const businessName = businessContext.name;
  return {
    ...baseLabels,
    voiceButton: {
      ...baseLabels.voiceButton,
      processingText: `Processing in ${businessName}...`
    },
    providers: {
      ...baseLabels.providers,
      fallback: businessName,
      generic: `${businessName} AI`
    },
    errors: {
      ...baseLabels.errors,
      connection: `Connection to ${businessName} failed`
    }
  };
}

/**
 * Resolve business features based on configuration and context
 */
function resolveBusinessFeatures(
  config: VoiceAIConfig,
  businessContext?: BusinessContext
) {
  const features = {
    hasBusinessIntegration: false,
    hasEntityExtraction: false,
    hasCommandClassification: false,
    hasFallbackSupport: false,
    supportedCommandTypes: [] as CommandComplexity[],
    supportedEntityTypes: [] as EntityType[],
    businessCapabilities: [] as string[]
  };

  // Check if business context is available
  if (businessContext) {
    features.hasBusinessIntegration = true;
    features.businessCapabilities = businessContext.capabilities || [];
  }
  
  // Check if entity extraction is configured
  if (config.entityExtraction?.enabled) {
    features.hasEntityExtraction = true;
  }
  
  // Check if command classification is enabled
  if (config.businessContext) {
    features.hasCommandClassification = true;
  }
  
  // Determine supported command types
  if (features.hasBusinessIntegration) {
    features.supportedCommandTypes = [
      CommandComplexity.SIMPLE,
      CommandComplexity.BUSINESS,
      CommandComplexity.HYBRID
    ];
  } else {
    features.supportedCommandTypes = [CommandComplexity.SIMPLE];
  }
  
  return features;
}

/**
 * Utility function to check if a command should be visible based on business context
 */
export function shouldShowCommand(
  command: CommandDefinition,
  businessFeatures: ReturnType<typeof resolveBusinessFeatures>
): boolean {
  // Always show simple commands
  if (command.complexity === CommandComplexity.SIMPLE) {
    return true;
  }

  // Show business commands only if business integration is available
  if (command.complexity === CommandComplexity.BUSINESS) {
    return businessFeatures.hasBusinessIntegration;
  }
  
  // Show hybrid commands if business integration is available
  if (command.complexity === CommandComplexity.HYBRID) {
    return businessFeatures.hasBusinessIntegration;
  }
  
  // Check if command requires specific business data
  if (command.requiresBusinessData && !businessFeatures.hasBusinessIntegration) {
    return false;
  }
  
  return true;
}

/**
 * Utility function to filter commands based on business capabilities
 */
export function filterCommandsByBusinessCapabilities(
  commands: CommandDefinition[],
  businessFeatures: ReturnType<typeof resolveBusinessFeatures>
): CommandDefinition[] {
  return commands.filter(command => {
    // Check basic visibility
    if (!shouldShowCommand(command, businessFeatures)) {
      return false;
    }
    
    
    return true;
  });
}

/**
 * Utility function to get business-aware error messages
 */
export function getBusinessAwareErrorMessage(
  errorType: string,
  businessContext?: BusinessContext
): string {
  const businessName = businessContext?.name || 'the system';

  switch (errorType) {
    case 'business_connection_failed':
      return `Failed to connect to ${businessName}. Please try again.`;
    case 'business_command_not_supported':
      return `This command is not supported in ${businessName}.`;
    case 'business_data_required':
      return `This action requires ${businessName} data access.`;
    case 'fallback_required':
      return `I'll handle that in ${businessName} for you.`;
    default:
      return 'An error occurred. Please try again.';
  }
}

/**
 * Utility function to check if voice package can handle a command type
 */
export function canVoicePackageHandle(
  commandComplexity: CommandComplexity,
  businessFeatures: ReturnType<typeof resolveBusinessFeatures>
): boolean {
  switch (commandComplexity) {
    case CommandComplexity.SIMPLE:
      return true;
    case CommandComplexity.BUSINESS:
      return false; // Always requires business API
    case CommandComplexity.HYBRID:
      return businessFeatures.hasFallbackSupport;
    default:
      return false;
  }
}