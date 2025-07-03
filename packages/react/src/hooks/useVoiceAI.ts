// packages/react/src/hooks/useVoiceAI.ts - FIXED VERSION

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { VoiceAI } from '../../../core/src/VoiceAI';
import { 
  VoiceAIConfig, 
  VoiceCommand, 
  VoiceResponse, 
  VoiceAIState, 
  VoiceAIError,
  VisibilityConfig,
  CustomLabels,
  VoiceModeProps
} from '../../../types/src/types';
import { useVoiceVisibility } from './useVoiceVisibility';

export interface UseVoiceAIOptions extends VoiceModeProps {
  config: VoiceAIConfig;
  onCommand?: (command: VoiceCommand) => void;
  onResponse?: (response: VoiceResponse) => void;
  onError?: (error: VoiceAIError) => void;
  autoStart?: boolean;
}

export interface UseVoiceAIReturn {
  // State
  isListening: boolean;
  isProcessing: boolean;
  isAvailable: boolean;
  currentCommand?: VoiceCommand;
  lastResponse?: VoiceResponse;
  error?: string;
  
  // Actions
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  processText: (text: string) => Promise<VoiceResponse | undefined>;
  speak: (text: string) => Promise<void>;
  
  // Configuration
  updateConfig: (newConfig: Partial<VoiceAIConfig>) => void;
  updateContext: (context: Record<string, any>) => void;
  
  // Utils
  getState: () => VoiceAIState;
  
  // NEW: Mode-aware properties
  visibility: VisibilityConfig;
  labels: CustomLabels;
}

export function useVoiceAI(options: UseVoiceAIOptions): UseVoiceAIReturn {
  // NEW: Resolve visibility and labels based on mode - STABLE
  const visibilityResult = useVoiceVisibility(
    options.config, 
    options.mode, 
    options.visibilityOverrides
  );

  // STABLE reference to visibility and labels
  const visibility = useMemo(() => visibilityResult.visibility, [
    JSON.stringify(visibilityResult.visibility)
  ]);
  
  const labels = useMemo(() => visibilityResult.labels, [
    JSON.stringify(visibilityResult.labels)
  ]);

  // Merge prop labels with resolved labels - STABLE
  const effectiveLabels = useMemo(() => ({
    voiceButton: { ...labels.voiceButton, ...options.customLabels?.voiceButton },
    status: { ...labels.status, ...options.customLabels?.status },
    providers: { ...labels.providers, ...options.customLabels?.providers },
    errors: { ...labels.errors, ...options.customLabels?.errors }
  }), [labels, options.customLabels]);

  // Internal state
  const [state, setState] = useState<VoiceAIState>({
    isListening: false,
    isProcessing: false,
    isAvailable: false
  });

  // Keep VoiceAI instance in ref to persist across renders
  const voiceAIRef = useRef<VoiceAI | null>(null);
  // Track if we're initializing to prevent multiple instances
  const initializingRef = useRef(false);
  // Track cleanup to prevent memory leaks
  const cleanupRef = useRef<(() => void) | null>(null);

  // STABLE config to prevent unnecessary recreations - SIMPLIFIED
  const stableConfigKey = useMemo(() => {
    return JSON.stringify({
      speechProvider: options.config.speechToText?.provider,
      ttsProvider: options.config.textToSpeech?.provider,
      aiProvider: options.config.aiProviders?.primary?.provider,
      mode: options.mode || options.config.interfaceMode,
      apiBaseUrl: options.config.apiBaseUrl
    });
  }, [
    options.config.speechToText?.provider,
    options.config.textToSpeech?.provider,
    options.config.aiProviders?.primary?.provider,
    options.mode,
    options.config.interfaceMode,
    options.config.apiBaseUrl
  ]);

  // Helper function to filter errors - STABLE
  const filterError = useCallback((error: VoiceAIError): VoiceAIError => {
    if (!visibility.showTechnicalErrors) {
      return {
        ...error,
        message: effectiveLabels.errors.generic || 'An error occurred',
        details: undefined
      };
    }
    return error;
  }, [visibility.showTechnicalErrors, effectiveLabels.errors.generic]);

  // Helper function to get filtered error message - STABLE
  const getFilteredErrorMessage = useCallback((error: VoiceAIError): string => {
    if (!visibility.showTechnicalErrors) {
      return effectiveLabels.errors.generic || 'An error occurred';
    }
    return error.message;
  }, [visibility.showTechnicalErrors, effectiveLabels.errors.generic]);

  // STABLE event handlers - CRITICAL FIX
  const stableHandlers = useMemo(() => ({
    onCommand: (command: VoiceCommand) => {
      // Filter command based on visibility
      const processedCommand = {
        ...command,
        entities: visibility.showDebugInfo ? command.entities : {},
        provider: visibility.showProviders ? command.provider : undefined
      };
      
      setState(prev => ({ 
        ...prev, 
        currentCommand: processedCommand 
      }));
      
      // Call external handler
      options.onCommand?.(processedCommand);
    },
    
    onResponse: (response: VoiceResponse) => {
      // Filter response metadata based on visibility
      const processedResponse: VoiceResponse = {
        ...response,
        metadata: visibility.showDebugInfo ? response.metadata : {
          ...(visibility.showProviders && response.metadata?.provider && {
            provider: response.metadata.provider
          }),
          ...(visibility.showConfidenceScores && response.metadata?.confidence && {
            confidence: response.metadata.confidence
          })
        }
      };

      setState(prev => ({ 
        ...prev, 
        lastResponse: processedResponse 
      }));
      
      // Call external handler
      options.onResponse?.(processedResponse);
    },
    
    onError: (error: VoiceAIError) => {
      const filteredError = filterError(error);
      const errorMessage = getFilteredErrorMessage(error);
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage 
      }));
      
      // Call external handler
      options.onError?.(filteredError);
    },
    
    onStateChange: (newState: VoiceAIState) => {
      // Filter state based on visibility settings
      const filteredState: VoiceAIState = {
        ...newState,
        activeProvider: visibility.showProviders ? newState.activeProvider : undefined,
        providerStatus: visibility.showProviderStatus ? newState.providerStatus : undefined,
        commandHistory: visibility.showCommandHistory ? newState.commandHistory : [],
        suggestedCommands: visibility.showAdvancedSettings ? newState.suggestedCommands : []
      };

      setState(filteredState);
    }
  }), [
    visibility.showDebugInfo,
    visibility.showProviders, 
    visibility.showConfidenceScores,
    visibility.showProviderStatus,
    visibility.showCommandHistory,
    visibility.showAdvancedSettings,
    filterError,
    getFilteredErrorMessage,
    options.onCommand,
    options.onResponse,
    options.onError
  ]);

  // Initialize VoiceAI instance - FIXED TO PREVENT MEMORY LEAKS
  useEffect(() => {
    let isMounted = true;
    
    const initializeVoiceAI = async () => {
      // Prevent multiple initializations
      if (initializingRef.current) return;
      initializingRef.current = true;

      try {
        // Clean up existing instance FIRST
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }

        if (voiceAIRef.current) {
          try {
            await voiceAIRef.current.stopListening();
          } catch (e) {
            console.warn('Error stopping previous instance:', e);
          }
          voiceAIRef.current = null;
        }

        // Create minimal config with mode-aware settings
        const modeAwareConfig = {
          ...options.config,
          interfaceMode: options.mode || options.config.interfaceMode,
          visibility: {
            ...options.config.visibility,
            ...visibility,
            customLabels: {
              ...options.config.visibility?.customLabels,
              ...effectiveLabels
            }
          }
        };

        // Only proceed if component is still mounted
        if (!isMounted) return;

        // Create VoiceAI instance with stable handlers
        voiceAIRef.current = new VoiceAI(modeAwareConfig, stableHandlers);

        // Set up cleanup function
        cleanupRef.current = () => {
          if (voiceAIRef.current) {
            try {
              voiceAIRef.current.stopListening().catch(console.warn);
            } catch (e) {
              console.warn('Cleanup error:', e);
            }
            voiceAIRef.current = null;
          }
        };

        // Update availability state
        if (isMounted) {
          setState(prev => ({ ...prev, isAvailable: true }));
        }

        // Auto-start if requested (but only for certain modes)
        if (options.autoStart && voiceAIRef.current && visibility.showMiniCenter !== false && isMounted) {
          try {
            await voiceAIRef.current.startListening();
          } catch (e) {
            console.warn('Auto-start failed:', e);
          }
        }
      } catch (error) {
        console.error('VoiceAI initialization failed:', error);
        
        if (isMounted) {
          const voiceError: VoiceAIError = {
            code: 'INITIALIZATION_FAILED',
            message: error instanceof Error ? error.message : 'Failed to initialize VoiceAI',
            details: visibility.showTechnicalErrors ? error : undefined
          };

          const errorMessage = getFilteredErrorMessage(voiceError);
          setState(prev => ({ 
            ...prev, 
            error: errorMessage,
            isAvailable: false 
          }));
          
          options.onError?.(filterError(voiceError));
        }
      } finally {
        initializingRef.current = false;
      }
    };

    initializeVoiceAI();

    // Cleanup function
    return () => {
      isMounted = false;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      initializingRef.current = false;
    };
  }, [stableConfigKey, JSON.stringify(stableHandlers)]); // SIMPLIFIED DEPENDENCIES

  // Actions with stable references - CRITICAL FIX
  const startListening = useCallback(async () => {
    if (!voiceAIRef.current) return;
    
    try {
      await voiceAIRef.current.startListening();
    } catch (error) {
      const voiceError: VoiceAIError = {
        code: 'START_LISTENING_FAILED',
        message: error instanceof Error ? error.message : 'Failed to start listening',
        details: visibility.showTechnicalErrors ? error : undefined
      };

      const errorMessage = getFilteredErrorMessage(voiceError);
      setState(prev => ({ ...prev, error: errorMessage }));
      
      if (visibility.showTechnicalErrors) {
        options.onError?.(filterError(voiceError));
      }
    }
  }, [visibility.showTechnicalErrors, getFilteredErrorMessage, filterError, options.onError]);

  const stopListening = useCallback(async () => {
    if (!voiceAIRef.current) return;
    
    try {
      await voiceAIRef.current.stopListening();
    } catch (error) {
      const voiceError: VoiceAIError = {
        code: 'STOP_LISTENING_FAILED',
        message: error instanceof Error ? error.message : 'Failed to stop listening',
        details: visibility.showTechnicalErrors ? error : undefined
      };

      const errorMessage = getFilteredErrorMessage(voiceError);
      setState(prev => ({ ...prev, error: errorMessage }));
      
      if (visibility.showTechnicalErrors) {
        options.onError?.(filterError(voiceError));
      }
    }
  }, [visibility.showTechnicalErrors, getFilteredErrorMessage, filterError, options.onError]);

  const processText = useCallback(async (text: string): Promise<VoiceResponse | undefined> => {
    if (!voiceAIRef.current) return;
    
    try {
      const response = await voiceAIRef.current.processTextInput(text);
      if (!response) return undefined;
      
      return {
        ...response,
        metadata: visibility.showDebugInfo ? response.metadata : {
          ...(visibility.showProviders && response.metadata?.provider && {
            provider: response.metadata.provider
          }),
          ...(visibility.showConfidenceScores && response.metadata?.confidence && {
            confidence: response.metadata.confidence
          })
        }
      };
    } catch (error) {
      const voiceError: VoiceAIError = {
        code: 'PROCESS_TEXT_FAILED',
        message: error instanceof Error ? error.message : 'Failed to process text',
        details: visibility.showTechnicalErrors ? error : undefined
      };

      const errorMessage = getFilteredErrorMessage(voiceError);
      setState(prev => ({ ...prev, error: errorMessage }));
      
      if (visibility.showTechnicalErrors) {
        options.onError?.(filterError(voiceError));
      }
      return undefined;
    }
  }, [visibility, getFilteredErrorMessage, filterError, options.onError]);

  const speak = useCallback(async (text: string) => {
    if (!voiceAIRef.current) return;
    
    try {
      await voiceAIRef.current.speak(text);
    } catch (error) {
      const voiceError: VoiceAIError = {
        code: 'SPEAK_FAILED',
        message: error instanceof Error ? error.message : 'Failed to speak text',
        details: visibility.showTechnicalErrors ? error : undefined
      };

      const errorMessage = getFilteredErrorMessage(voiceError);
      setState(prev => ({ ...prev, error: errorMessage }));
      
      if (visibility.showTechnicalErrors) {
        options.onError?.(filterError(voiceError));
      }
    }
  }, [visibility.showTechnicalErrors, getFilteredErrorMessage, filterError, options.onError]);

  const updateConfig = useCallback((newConfig: Partial<VoiceAIConfig>) => {
    if (!voiceAIRef.current) return;
    
    const updatedConfig = {
      ...newConfig,
      interfaceMode: options.mode || newConfig.interfaceMode || options.config.interfaceMode,
      visibility: {
        ...newConfig.visibility,
        ...visibility
      }
    };
    
    voiceAIRef.current.updateConfig(updatedConfig);
  }, [options.mode, options.config.interfaceMode, visibility]);

  const updateContext = useCallback((context: Record<string, any>) => {
    if (!voiceAIRef.current) return;
    
    const filteredContext = visibility.showDebugInfo 
      ? context 
      : Object.fromEntries(
          Object.entries(context).filter(([key]) => 
            !key.startsWith('debug_') && !key.startsWith('internal_')
          )
        );
    
    voiceAIRef.current.updateContext(filteredContext);
  }, [visibility.showDebugInfo]);

  const getState = useCallback((): VoiceAIState => {
    const currentState = voiceAIRef.current?.getState() || state;
    
    return {
      ...currentState,
      activeProvider: visibility.showProviders ? currentState.activeProvider : undefined,
      providerStatus: visibility.showProviderStatus ? currentState.providerStatus : undefined,
      commandHistory: visibility.showCommandHistory ? currentState.commandHistory : [],
      suggestedCommands: visibility.showAdvancedSettings ? currentState.suggestedCommands : []
    };
  }, [state, visibility]);

  return {
    // State
    isListening: state.isListening,
    isProcessing: state.isProcessing,
    isAvailable: state.isAvailable,
    currentCommand: state.currentCommand,
    lastResponse: state.lastResponse,
    error: state.error,
    
    // Actions
    startListening,
    stopListening,
    processText,
    speak,
    
    // Configuration
    updateConfig,
    updateContext,
    
    // Utils
    getState,
    
    // NEW: Mode-aware properties
    visibility,
    labels: effectiveLabels
  };
}