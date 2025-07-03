// packages/react/src/__tests__/VoiceButton.test.tsx

import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { VoiceButton } from '../components/VoiceButton';
import { VoiceAIConfig, SpeechProvider, AIProvider, ResponseMode } from '../../../../packages/types/src/types';

// Create a mock hook that can be easily controlled
const mockUseVoiceAI = {
  isListening: false,
  isProcessing: false,
  isAvailable: true,
  error: null,
  startListening: jest.fn().mockResolvedValue(undefined),
  stopListening: jest.fn().mockResolvedValue(undefined),
  processText: jest.fn(),
  speak: jest.fn(),
  updateConfig: jest.fn(),
  updateContext: jest.fn(),
  getState: jest.fn(() => ({
    isListening: false,
    isProcessing: false,
    isAvailable: true,
  })),
};

// Mock the useVoiceAI hook
jest.mock('../hooks/useVoiceAI', () => ({
  useVoiceAI: jest.fn(() => mockUseVoiceAI),
}));

describe('VoiceButton', () => {
  let mockConfig: VoiceAIConfig;
  const useVoiceAIMock = require('../hooks/useVoiceAI').useVoiceAI;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock implementation
    useVoiceAIMock.mockReturnValue(mockUseVoiceAI);
    
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
      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      
      // Should be accessible via keyboard
      expect(button).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call startListening when clicked', async () => {
      const mockStartListening = jest.fn().mockResolvedValue(undefined);
      
      useVoiceAIMock.mockReturnValue({
        ...mockUseVoiceAI,
        isListening: false,
        startListening: mockStartListening,
      });

      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(mockStartListening).toHaveBeenCalled();
    });

    it('should call stopListening when clicked while listening', async () => {
      const mockStopListening = jest.fn().mockResolvedValue(undefined);
      
      useVoiceAIMock.mockReturnValue({
        ...mockUseVoiceAI,
        isListening: true,
        stopListening: mockStopListening,
      });

      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(mockStopListening).toHaveBeenCalled();
    });

    it('should not respond to clicks when disabled', async () => {
      const mockStartListening = jest.fn();
      
      useVoiceAIMock.mockReturnValue({
        ...mockUseVoiceAI,
        startListening: mockStartListening,
      });

      render(<VoiceButton config={mockConfig} disabled />);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(mockStartListening).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });

    it('should not respond to clicks when not available', async () => {
      const mockStartListening = jest.fn();
      
      useVoiceAIMock.mockReturnValue({
        ...mockUseVoiceAI,
        isAvailable: false,
        startListening: mockStartListening,
      });

      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(mockStartListening).not.toHaveBeenCalled();
    });
  });

  describe('States', () => {
    it('should show microphone icon when idle', () => {
      useVoiceAIMock.mockReturnValue({
        ...mockUseVoiceAI,
        isListening: false,
        isProcessing: false,
      });

      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      // Should contain SVG microphone icon
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should show stop icon when listening', () => {
      useVoiceAIMock.mockReturnValue({
        ...mockUseVoiceAI,
        isListening: true,
        isProcessing: false,
      });

      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('animate-pulse');
    });

    it('should show loading spinner when processing', () => {
      useVoiceAIMock.mockReturnValue({
        ...mockUseVoiceAI,
        isListening: false,
        isProcessing: true,
      });

      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      // Should contain loading spinner
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should show error state when error occurs', () => {
      useVoiceAIMock.mockReturnValue({
        ...mockUseVoiceAI,
        error: 'Microphone not available',
      });

      render(<VoiceButton config={mockConfig} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-red-500');
    });
  });

  // describe('Event Callbacks', () => {
  //   it('should pass onCommand to useVoiceAI hook', () => {
  //     const onCommand = jest.fn();

  //     render(
  //       <VoiceButton 
  //         config={mockConfig}
  //         onCommand={onCommand}
  //       />
  //     );

  //     // Check that useVoiceAI was called with onCommand
  //     expect(useVoiceAIMock).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         onCommand: onCommand,
  //       })
  //     );
  //   });

  //   it('should pass onResponse to useVoiceAI hook', () => {
  //     const onResponse = jest.fn();

  //     render(
  //       <VoiceButton 
  //         config={mockConfig}
  //         onResponse={onResponse}
  //       />
  //     );

  //     // Check that useVoiceAI was called with onResponse
  //     expect(useVoiceAIMock).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         onResponse: onResponse,
  //       })
  //     );
  //   });

  //   it('should pass onError to useVoiceAI hook', () => {
  //     const onError = jest.fn();

  //     render(
  //       <VoiceButton 
  //         config={mockConfig}
  //         onError={onError}
  //       />
  //     );

  //     // Check that useVoiceAI was called with onError
  //     expect(useVoiceAIMock).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         onError: onError,
  //       })
  //     );
  //   });
  // });

  describe('Error Handling', () => {
    it('should handle click errors gracefully', async () => {
      const mockStartListening = jest.fn().mockRejectedValue(new Error('Voice error'));
      const onError = jest.fn();
      
      useVoiceAIMock.mockReturnValue({
        ...mockUseVoiceAI,
        startListening: mockStartListening,
      });

      render(
        <VoiceButton 
          config={mockConfig} 
          onError={onError}
        />
      );
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(mockStartListening).toHaveBeenCalled();
      // Component should handle the error gracefully
    });
  });
});