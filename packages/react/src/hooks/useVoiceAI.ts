// packages/react/src/hooks/useVoiceAI.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceAI } from '../../../core/src/VoiceAI';
import { 
  VoiceAIConfig, 
  VoiceCommand, 
  VoiceResponse, 
  VoiceAIState, 
  VoiceAIError,
  VoiceInterfaceMode,
  VisibilityConfig,
  CustomLabels,
  useVoiceVisibility,
  VoiceModeProps
} from '../../../types/src/types';

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
  // NEW: Resolve visibility and labels based on mode
  const { visibility, labels } = useVoiceVisibility(
    options.config, 
    options.mode, 
    options.visibilityOverrides
  );

  // Merge prop labels with resolved labels
  const effectiveLabels = {
    voiceButton: { ...labels.voiceButton, ...options.customLabels?.voiceButton },
    status: { ...labels.status, ...options.customLabels?.status },
    providers: { ...labels.providers, ...options.customLabels?.providers },
    errors: { ...labels.errors, ...options.customLabels?.errors }
  };

  // Internal state
  const [state, setState] = useState<VoiceAIState>({
    isListening: false,
    isProcessing: false,
    isAvailable: false
  });

  // Keep VoiceAI instance in ref to persist across renders
  const voiceAIRef = useRef<VoiceAI | null>(null);

  // Helper function to filter errors based on visibility settings
  const filterError = useCallback((error: VoiceAIError): VoiceAIError => {
    if (!visibility.showTechnicalErrors) {
      return {
        ...error,
        message: effectiveLabels.errors.generic || 'An error occurred',
        details: undefined // Hide technical details
      };
    }
    return error;
  }, [visibility.showTechnicalErrors, effectiveLabels.errors.generic]);

  // Helper function to get filtered error message for state
  const getFilteredErrorMessage = useCallback((error: VoiceAIError): string => {
    if (!visibility.showTechnicalErrors) {
      return effectiveLabels.errors.generic || 'An error occurred';
    }
    return error.message;
  }, [visibility.showTechnicalErrors, effectiveLabels.errors.generic]);

  // Initialize VoiceAI instance
  useEffect(() => {
    const initializeVoiceAI = async () => {
      try {
        // Create mode-aware config
        const modeAwareConfig: VoiceAIConfig = {
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

        // Create VoiceAI instance with event handlers
        voiceAIRef.current = new VoiceAI(modeAwareConfig, {
          onCommand: (command: VoiceCommand) => {
            // Filter command history based on visibility
            const processedCommand = visibility.showCommandHistory ? command : {
              ...command,
              // Clear sensitive data if history is disabled
              entities: visibility.showDebugInfo ? command.entities : {},
              provider: visibility.showProviders ? command.provider : undefined
            };
            
            setState(prev => ({ 
              ...prev, 
              currentCommand: processedCommand 
            }));
            options.onCommand?.(processedCommand);
          },
          onResponse: (response: VoiceResponse) => {
            // Filter response metadata based on visibility
            const processedResponse: VoiceResponse = {
              ...response,
              metadata: visibility.showDebugInfo ? response.metadata : {
                // Only keep essential metadata
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
            options.onResponse?.(processedResponse);
          },
          onError: (error: VoiceAIError) => {
            const filteredError = filterError(error);
            const errorMessage = getFilteredErrorMessage(error);
            
            setState(prev => ({ 
              ...prev, 
              error: errorMessage 
            }));
            options.onError?.(filteredError);
          },
          onStateChange: (newState: VoiceAIState) => {
            // Filter state based on visibility settings
            const filteredState: VoiceAIState = {
              ...newState,
              // Filter provider information
              activeProvider: visibility.showProviders ? newState.activeProvider : undefined,
              providerStatus: visibility.showProviderStatus ? newState.providerStatus : undefined,
              // Filter command history
              commandHistory: visibility.showCommandHistory ? newState.commandHistory : [],
              // Filter suggested commands based on advanced settings
              suggestedCommands: visibility.showAdvancedSettings ? newState.suggestedCommands : []
            };

            setState(filteredState);
          }
        });

        // Auto-start if requested and if listening is available
        if (options.autoStart && voiceAIRef.current && visibility.showMiniCenter !== false) {
          await voiceAIRef.current.startListening();
        }
      } catch (error) {
        const voiceError: VoiceAIError = {
          code: 'INITIALIZATION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to initialize VoiceAI',
          details: visibility.showTechnicalErrors ? error : undefined
        };

        const filteredError = filterError(voiceError);
        const errorMessage = getFilteredErrorMessage(voiceError);

        setState(prev => ({ 
          ...prev, 
          error: errorMessage,
          isAvailable: false 
        }));
        options.onError?.(filteredError);
      }
    };

    initializeVoiceAI();

    // Cleanup on unmount
    return () => {
      if (voiceAIRef.current) {
        voiceAIRef.current.stopListening().catch(console.error);
      }
    };
  }, [
    options.config, 
    options.autoStart, 
    options.mode, 
    visibility,
    effectiveLabels,
    filterError,
    getFilteredErrorMessage
  ]);

  // Actions with mode-aware error handling
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
      
      // Don't call onError for user-facing operation failures in end-user mode
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
      
      // Filter response based on visibility
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
    
    // Merge with mode-aware settings
    const modeAwareConfig = {
      ...newConfig,
      interfaceMode: options.mode || newConfig.interfaceMode || options.config.interfaceMode,
      visibility: {
        ...newConfig.visibility,
        ...visibility
      }
    };
    
    voiceAIRef.current.updateConfig(modeAwareConfig);
  }, [options.mode, options.config.interfaceMode, visibility]);

  const updateContext = useCallback((context: Record<string, any>) => {
    if (!voiceAIRef.current) return;
    
    // Filter context based on visibility settings
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
    
    // Filter state based on visibility settings
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