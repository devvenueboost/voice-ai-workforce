// jest.setup.js (root level)
require('@testing-library/jest-dom');

// Mock Web Speech API for testing
global.webkitSpeechRecognition = class MockSpeechRecognition {
  constructor() {
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    this.continuous = false;
    this.lang = 'en-US';
    this.interimResults = false;
  }

  start() {}
  stop() {}

  addEventListener(event, handler) {
    this[`on${event}`] = handler;
  }

  removeEventListener(event, handler) {
    this[`on${event}`] = null;
  }
};

global.SpeechRecognition = global.webkitSpeechRecognition;

global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(() => []),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

global.SpeechSynthesisUtterance = class MockSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.voice = null;
    this.volume = 1;
    this.rate = 1;
    this.pitch = 1;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
  }
};