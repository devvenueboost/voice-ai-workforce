// packages/react/src/hooks/useVoiceAI.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceAI } from '@voice-ai-workforce/core';
import { 
  VoiceAIConfig, 
  VoiceCommand, 
  VoiceResponse, 
  VoiceAIState,
  VoiceAIError 
} from '@voice-ai-workforce/types';

export interface UseVoiceAIOptions {
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
}

export function useVoiceAI(options: UseVoiceAIOptions): UseVoiceAIReturn {
  // Internal state
  const [state, setState] = useState<VoiceAIState>({
    isListening: false,
    isProcessing: false,
    isAvailable: false
  });

  // Keep VoiceAI instance in ref to persist across renders
  const voiceAIRef = useRef<VoiceAI | null>(null);

  // Initialize VoiceAI instance
  useEffect(() => {
    const initializeVoiceAI = async () => {
      try {
        // Create VoiceAI instance with event handlers
        voiceAIRef.current = new VoiceAI(options.config, {
          onCommand: (command: VoiceCommand) => {
            setState(prev => ({ ...prev, currentCommand: command }));
            options.onCommand?.(command);
          },
          onResponse: (response: VoiceResponse) => {
            setState(prev => ({ ...prev, lastResponse: response }));
            options.onResponse?.(response);
          },
          onError: (error: VoiceAIError) => {
            setState(prev => ({ ...prev, error: error.message }));
            options.onError?.(error);
          },
          onStateChange: (newState: VoiceAIState) => {
            setState(newState);
          }
        });

        // Auto-start if requested
        if (options.autoStart && voiceAIRef.current) {
          await voiceAIRef.current.startListening();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize VoiceAI';
        setState(prev => ({ 
          ...prev, 
          error: errorMessage,
          isAvailable: false 
        }));
        options.onError?.({
          code: 'INITIALIZATION_FAILED',
          message: errorMessage,
          details: error
        });
      }
    };

    initializeVoiceAI();

    // Cleanup on unmount
    return () => {
      if (voiceAIRef.current) {
        voiceAIRef.current.stopListening().catch(console.error);
      }
    };
  }, [options.config, options.autoStart]);

  // Actions
  const startListening = useCallback(async () => {
    if (!voiceAIRef.current) return;
    
    try {
      await voiceAIRef.current.startListening();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start listening';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  const stopListening = useCallback(async () => {
    if (!voiceAIRef.current) return;
    
    try {
      await voiceAIRef.current.stopListening();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop listening';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  const processText = useCallback(async (text: string): Promise<VoiceResponse | undefined> => {
    if (!voiceAIRef.current) return;
    
    try {
      const response = await voiceAIRef.current.processTextInput(text);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process text';
      setState(prev => ({ ...prev, error: errorMessage }));
      return undefined;
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!voiceAIRef.current) return;
    
    try {
      await voiceAIRef.current.speak(text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to speak text';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  const updateConfig = useCallback((newConfig: Partial<VoiceAIConfig>) => {
    if (!voiceAIRef.current) return;
    voiceAIRef.current.updateConfig(newConfig);
  }, []);

  const updateContext = useCallback((context: Record<string, any>) => {
    if (!voiceAIRef.current) return;
    voiceAIRef.current.updateContext(context);
  }, []);

  const getState = useCallback((): VoiceAIState => {
    return voiceAIRef.current?.getState() || state;
  }, [state]);

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
    getState
  };
}