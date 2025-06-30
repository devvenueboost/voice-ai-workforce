// jest.setup.js (root level)
require('@testing-library/jest-dom');

// Mock Web Speech API globally
global.webkitSpeechRecognition = jest.fn(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onresult: null,
  onerror: null,
  onend: null,
  continuous: false,
  lang: 'en-US',
  interimResults: false,
}));

global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(() => []),
};

global.SpeechSynthesisUtterance = jest.fn(function(text) {
    this.text = text || '';
    this.lang = 'en-US';
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    this.onend = null;
    this.onerror = null;
  });

// Suppress console warnings during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('ReactDOMTestUtils.act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});