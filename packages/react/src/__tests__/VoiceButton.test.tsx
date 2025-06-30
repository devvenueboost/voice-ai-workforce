// packages/react/src/__tests__/VoiceButton.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { VoiceButton } from '../components/VoiceButton';
import { VoiceAIConfig, SpeechProvider, AIProvider, ResponseMode } from '../../../../packages/types/src/types';

// Mock the core VoiceAI functionality
jest.mock('../hooks/useVoiceAI', () => ({
  useVoiceAI: jest.fn(() => ({
    isListening: false,
    isProcessing: false,
    isAvailable: true,
    error: null,
    startListening: jest.fn(),
    stopListening: jest.fn(),
  })),
}));

describe('VoiceButton', () => {
  let mockConfig: VoiceAIConfig;

  beforeEach(() => {
    mockConfig = {
      speechToText: {
        provider: SpeechProvider.WEB_SPEECH,
        language: 'en-US',
        continuous: false,
      },
      textToSpeech: {
        provider: SpeechProvider.WEB_SPEECH,
        speed: 1.0,
      },
      aiProvider: {
        provider: AIProvider.OPENAI,
        model: 'gpt-3.5-turbo',
      },
      responseMode: ResponseMode.BOTH,
    };
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('w-12', 'h-12'); // default md size
    });

    it('should render with different sizes', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'] as const;
      
      sizes.forEach((size) => {
        const { unmount } = render(
          <VoiceButton config={mockConfig} size={size} />
        );
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should render with different variants', () => {
      const variants = ['primary', 'secondary', 'ghost', 'danger'] as const;
      
      variants.forEach((variant) => {
        const { unmount } = render(
          <VoiceButton config={mockConfig} variant={variant} />
        );
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should apply custom className', () => {
      render(
        <VoiceButton 
          config={mockConfig} 
          className="custom-class" 
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should render custom children', () => {
      render(
        <VoiceButton config={mockConfig}>
          <span data-testid="custom-icon">🎤</span>
        </VoiceButton>
      );
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria attributes', () => {
      render(
        <VoiceButton 
          config={mockConfig}
          aria-label="Voice command button"
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Voice command button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should be focusable', () => {
      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should handle keyboard interactions', () => {
      const onCommand = jest.fn();
      render(
        <VoiceButton 
          config={mockConfig}
          onCommand={onCommand}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      
      // Should be accessible via keyboard
      expect(button).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call startListening when clicked', () => {
      const mockStartListening = jest.fn();
      
      // Mock useVoiceAI for this test
      const useVoiceAI = require('../hooks/useVoiceAI').useVoiceAI;
      useVoiceAI.mockReturnValue({
        isListening: false,
        isProcessing: false,
        isAvailable: true,
        error: null,
        startListening: mockStartListening,
        stopListening: jest.fn(),
      });

      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockStartListening).toHaveBeenCalled();
    });

    it('should call stopListening when clicked while listening', () => {
      const mockStopListening = jest.fn();
      
      // Mock useVoiceAI to simulate listening state
      const useVoiceAI = require('../hooks/useVoiceAI').useVoiceAI;
      useVoiceAI.mockReturnValue({
        isListening: true,
        isProcessing: false,
        isAvailable: true,
        error: null,
        startListening: jest.fn(),
        stopListening: mockStopListening,
      });

      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockStopListening).toHaveBeenCalled();
    });

    it('should not respond to clicks when disabled', () => {
      const mockStartListening = jest.fn();
      
      const useVoiceAI = require('../hooks/useVoiceAI').useVoiceAI;
      useVoiceAI.mockReturnValue({
        isListening: false,
        isProcessing: false,
        isAvailable: true,
        error: null,
        startListening: mockStartListening,
        stopListening: jest.fn(),
      });

      render(<VoiceButton config={mockConfig} disabled />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockStartListening).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });
  });

  describe('States', () => {
    it('should show microphone icon when idle', () => {
      const useVoiceAI = require('../hooks/useVoiceAI').useVoiceAI;
      useVoiceAI.mockReturnValue({
        isListening: false,
        isProcessing: false,
        isAvailable: true,
        error: null,
        startListening: jest.fn(),
        stopListening: jest.fn(),
      });

      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      // Should contain SVG microphone icon
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should show stop icon when listening', () => {
      const useVoiceAI = require('../hooks/useVoiceAI').useVoiceAI;
      useVoiceAI.mockReturnValue({
        isListening: true,
        isProcessing: false,
        isAvailable: true,
        error: null,
        startListening: jest.fn(),
        stopListening: jest.fn(),
      });

      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('animate-pulse');
    });

    it('should show loading spinner when processing', () => {
      const useVoiceAI = require('../hooks/useVoiceAI').useVoiceAI;
      useVoiceAI.mockReturnValue({
        isListening: false,
        isProcessing: true,
        isAvailable: true,
        error: null,
        startListening: jest.fn(),
        stopListening: jest.fn(),
      });

      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      // Should contain loading spinner
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should show error state when error occurs', () => {
      const useVoiceAI = require('../hooks/useVoiceAI').useVoiceAI;
      useVoiceAI.mockReturnValue({
        isListening: false,
        isProcessing: false,
        isAvailable: true,
        error: 'Microphone not available',
        startListening: jest.fn(),
        stopListening: jest.fn(),
      });

      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-red-500');
    });
  });

  describe('Event Callbacks', () => {
    it('should call onCommand when command is received', () => {
      const onCommand = jest.fn();
      const mockCommand = {
        intent: 'test',
        entities: {},
        confidence: 0.9,
        rawText: 'test command',
        timestamp: new Date(),
      };

      render(
        <VoiceButton 
          config={mockConfig}
          onCommand={onCommand}
        />
      );

      // Simulate the useVoiceAI hook calling onCommand
      const useVoiceAI = require('../hooks/useVoiceAI').useVoiceAI;
      const mockImplementation = useVoiceAI.mock.calls[0][0];
      if (mockImplementation.onCommand) {
        mockImplementation.onCommand(mockCommand);
      }

      expect(onCommand).toHaveBeenCalledWith(mockCommand);
    });

    it('should call onResponse when response is received', () => {
      const onResponse = jest.fn();
      const mockResponse = {
        text: 'Command executed successfully',
        success: true,
        data: {},
      };

      render(
        <VoiceButton 
          config={mockConfig}
          onResponse={onResponse}
        />
      );

      // Simulate the useVoiceAI hook calling onResponse
      const useVoiceAI = require('../hooks/useVoiceAI').useVoiceAI;
      const mockImplementation = useVoiceAI.mock.calls[0][0];
      if (mockImplementation.onResponse) {
        mockImplementation.onResponse(mockResponse);
      }

      expect(onResponse).toHaveBeenCalledWith(mockResponse);
    });

    it('should call onError when error occurs', () => {
      const onError = jest.fn();
      const errorMessage = 'Voice recognition failed';

      render(
        <VoiceButton 
          config={mockConfig}
          onError={onError}
        />
      );

      // Simulate the useVoiceAI hook calling onError
      const useVoiceAI = require('../hooks/useVoiceAI').useVoiceAI;
      const mockImplementation = useVoiceAI.mock.calls[0][0];
      if (mockImplementation.onError) {
        mockImplementation.onError({
          code: 'SPEECH_ERROR',
          message: errorMessage,
          details: {}
        });
      }

      expect(onError).toHaveBeenCalledWith(errorMessage);
    });
  });
});