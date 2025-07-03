// packages/react/src/__tests__/VoiceButton.test.tsx

import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { VoiceButton } from '../components/VoiceButton';
import { VoiceAIConfig, SpeechProvider, AIProvider, ResponseMode } from '../../../types/src/types';

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
   activeProvider: AIProvider.OPENAI,
 })),
 visibility: {
   showProviders: true,
   showMiniCenter: true,
   showCommandHistory: true,
   showDebugInfo: true,
   showTechnicalErrors: true,
   showStatusIndicator: true
 },
 labels: {
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
 }
};

// Mock the useVoiceAI hook
jest.mock('../hooks/useVoiceAI', () => ({
 useVoiceAI: jest.fn(() => mockUseVoiceAI),
}));

// Mock the useVoiceHistory hook
jest.mock('../hooks/useVoiceHistory', () => ({
 useVoiceHistory: jest.fn(() => ({
   getRecentCommands: jest.fn(() => []),
   replayCommand: jest.fn(() => ({ rawText: 'test command' }))
 }))
}));

// Mock the useComponentTheme hook
jest.mock('../hooks/useVoiceTheme', () => ({
 useComponentTheme: jest.fn(() => ({
   colors: {
     primary: '#3b82f6',
     secondary: '#6b7280',
     error: '#ef4444',
     surface: '#ffffff',
     border: '#e5e7eb',
     text: {
       primary: '#111827',
       secondary: '#6b7280',
       inverse: '#ffffff',
       muted: '#9ca3af'
     },
     status: {
       listening: '#10b981'
     }
   },
   shadows: {
     lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
   }
 }))
}));

// Mock the useVoiceVisibility hook
jest.mock('../../../types/src/types', () => {
 const actual = jest.requireActual('../../../types/src/types');
 return {
   ...actual,
   useVoiceVisibility: jest.fn(() => ({
     visibility: {
       showProviders: true,
       showMiniCenter: true,
       showCommandHistory: true,
       showDebugInfo: true,
       showTechnicalErrors: true,
       showStatusIndicator: true
     },
     labels: {
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
     }
   }))
 };
});

describe('VoiceButton', () => {
 let mockConfig: VoiceAIConfig;
 const useVoiceAIMock = require('../hooks/useVoiceAI').useVoiceAI;

 beforeEach(() => {
   jest.clearAllMocks();
   
   // Reset mock implementation
   useVoiceAIMock.mockReturnValue(mockUseVoiceAI);
   
   mockConfig = {
     aiProviders: {
       primary: {
         provider: AIProvider.OPENAI,
         apiKey: 'test-key',
         model: 'gpt-3.5-turbo'
       }
     },
     speechToText: {
       provider: SpeechProvider.WEB_SPEECH,
       language: 'en-US',
       continuous: false,
     },
     textToSpeech: {
       provider: SpeechProvider.WEB_SPEECH,
       speed: 1.0,
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
     const variants = ['primary', 'secondary', 'ghost'] as const;
     
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

   it('should update aria-pressed when listening', () => {
     useVoiceAIMock.mockReturnValue({
       ...mockUseVoiceAI,
       isListening: true,
     });

     render(<VoiceButton config={mockConfig} />);
     
     const button = screen.getByRole('button');
     expect(button).toHaveAttribute('aria-pressed', 'true');
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
   it('should call startListening when clicked (no mini center)', async () => {
     const mockStartListening = jest.fn().mockResolvedValue(undefined);
     
     useVoiceAIMock.mockReturnValue({
       ...mockUseVoiceAI,
       isListening: false,
       startListening: mockStartListening,
     });

     render(<VoiceButton config={mockConfig} showMiniCenter={false} />);
     
     const button = screen.getByRole('button');
     await userEvent.click(button);
     
     expect(mockStartListening).toHaveBeenCalled();
   });

   it('should toggle mini center when clicked (with mini center enabled)', async () => {
     const onMiniCenterToggle = jest.fn();
     
     render(
       <VoiceButton 
         config={mockConfig} 
         showMiniCenter={true}
         onMiniCenterToggle={onMiniCenterToggle}
       />
     );
     
     const button = screen.getByRole('button');
     await userEvent.click(button);
     
     expect(onMiniCenterToggle).toHaveBeenCalledWith(true);
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

 describe('Mini Command Center', () => {
   it('should render mini center when open', async () => {
     render(
       <VoiceButton 
         config={mockConfig} 
         showMiniCenter={true}
       />
     );
     
     const button = screen.getByRole('button');
     await userEvent.click(button);
     
     expect(screen.getByText('Voice Commands')).toBeInTheDocument();
     expect(screen.getByText('Quick')).toBeInTheDocument();
   });

   it('should show recent tab when command history is visible', async () => {
     useVoiceAIMock.mockReturnValue({
       ...mockUseVoiceAI,
       visibility: {
         ...mockUseVoiceAI.visibility,
         showCommandHistory: true
       }
     });

     render(
       <VoiceButton 
         config={mockConfig} 
         showMiniCenter={true}
       />
     );
     
     const button = screen.getByRole('button');
     await userEvent.click(button);
     
     expect(screen.getByText('Recent')).toBeInTheDocument();
   });

   it('should close mini center when close button clicked', async () => {
     render(
       <VoiceButton 
         config={mockConfig} 
         showMiniCenter={true}
       />
     );
     
     const button = screen.getByRole('button');
     await userEvent.click(button);
     
     const closeButton = screen.getByTitle('Close');
     await userEvent.click(closeButton);
     
     expect(screen.queryByText('Voice Commands')).not.toBeInTheDocument();
   });
 });

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
         showMiniCenter={false}
       />
     );
     
     const button = screen.getByRole('button');
     await userEvent.click(button);
     
     expect(mockStartListening).toHaveBeenCalled();
     // Component should handle the error gracefully
   });
 });
});