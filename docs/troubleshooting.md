# Troubleshooting Guide

## Installation Issues

### Package Not Found

**Problem:**
```bash
Module not found: Can't resolve '@voice-ai-workforce/core'
```

**Solutions:**
```bash
# Check if packages are built
cd voice-ai-workforce
npm run build:sequential

# Check if packages exist in node_modules
ls -la node_modules/@voice-ai-workforce/

# If using local development, ensure packages are copied/linked
npm link @voice-ai-workforce/types @voice-ai-workforce/core @voice-ai-workforce/react
```

### TypeScript Compilation Errors

**Problem:**
```typescript
TS2307: Cannot find module '@voice-ai-workforce/types' or its corresponding type declarations.
```

**Solutions:**
```bash
# Ensure types package is built
cd packages/types && npm run build

# Add to tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}

# If using local packages, verify dist folder exists
ls -la packages/types/dist/
```

### Import/Export Issues

**Problem:**
```typescript
import { VoiceAI } from '@voice-ai-workforce/core';
// TypeError: VoiceAI is not a constructor
```

**Solutions:**
```typescript
// Try different import syntax
import { VoiceAI } from '@voice-ai-workforce/core';
// or
const { VoiceAI } = require('@voice-ai-workforce/core');

// Check if module is properly exported
console.log(require('@voice-ai-workforce/core'));
```

## Voice Recognition Issues

### Microphone Access Denied

**Problem:** Browser blocks microphone access

**Solutions:**
```javascript
// Check microphone permissions
navigator.permissions.query({ name: 'microphone' }).then(result => {
  console.log('Microphone permission:', result.state);
  if (result.state === 'denied') {
    alert('Please enable microphone access in browser settings');
  }
});

// Handle permission errors gracefully
const voiceAI = new VoiceAI(config, {
  onError: (error) => {
    if (error.code === 'START_LISTENING_FAILED') {
      console.log('Microphone access required');
      // Show instructions to enable microphone
    }
  }
});
```

### Speech Recognition Not Working

**Problem:** Voice recognition doesn't start or stops immediately

**Solutions:**
```javascript
// Check browser support
const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
if (!hasRecognition) {
  console.log('Speech recognition not supported in this browser');
  // Show text input fallback
}

// Check HTTPS requirement
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  console.log('Speech recognition requires HTTPS in production');
}

// Debug speech recognition events
const voiceAI = new VoiceAI(config, {
  onStateChange: (state) => {
    console.log('Voice AI state:', state);
  },
  onError: (error) => {
    console.log('Voice AI error:', error);
  }
});
```

### No Speech Recognition Results

**Problem:** Speech recognition starts but doesn't capture speech

**Solutions:**
```javascript
// Check microphone levels
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    
    // Check if audio is being captured
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
    console.log('Microphone volume level:', volume);
  })
  .catch(err => console.log('Microphone error:', err));

// Try different language settings
const config = {
  speechToText: {
    provider: SpeechProvider.WEB_SPEECH,
    language: 'en-US', // Try 'en-GB', 'en-AU', etc.
    continuous: false,
  },
  // ... rest of config
};
```

## Speech Synthesis Issues

### Text-to-Speech Not Working

**Problem:** Speech synthesis doesn't play audio

**Solutions:**
```javascript
// Check browser support
if (!('speechSynthesis' in window)) {
  console.log('Speech synthesis not supported');
  // Disable text-to-speech features
}

// Check if voices are available
speechSynthesis.addEventListener('voiceschanged', () => {
  const voices = speechSynthesis.getVoices();
  console.log('Available voices:', voices.length);
  if (voices.length === 0) {
    console.log('No voices available');
  }
});

// Debug speech synthesis
const voiceAI = new VoiceAI(config, {
  onResponse: (response) => {
    console.log('Speaking:', response.text);
  }
});

// Test speech synthesis directly
speechSynthesis.speak(new SpeechSynthesisUtterance('Test'));
```

### Speech Synthesis Interruption

**Problem:** Speech gets cut off or interrupted

**Solutions:**
```javascript
// Ensure previous speech is completed
const voiceAI = new VoiceAI({
  ...config,
  textToSpeech: {
    provider: SpeechProvider.WEB_SPEECH,
    speed: 0.9, // Slower speed can help
  }
});

// Cancel previous speech before new one
speechSynthesis.cancel();
speechSynthesis.speak(utterance);
```

## Command Recognition Issues

### Commands Not Recognized

**Problem:** Voice commands don't trigger responses

**Solutions:**
```javascript
// Test with text input first
const voiceAI = new VoiceAI(config);

// Test built-in commands
const testCommands = ['help', 'clock me in', 'clock me out', 'complete task'];
for (const command of testCommands) {
  const response = await voiceAI.processTextInput(command);
  console.log(`Command: "${command}" -> Response: "${response.text}"`);
}

// Check command processing
const voiceAI = new VoiceAI(config, {
  onCommand: (command) => {
    console.log('Command received:', command);
    console.log('Intent:', command.intent);
    console.log('Confidence:', command.confidence);
  }
});
```

### Low Recognition Confidence

**Problem:** Commands are recognized with low confidence

**Solutions:**
```javascript
// Speak clearly and use exact phrases
const suggestions = {
  'help': 'Say "help" clearly',
  'clock_in': 'Say "clock me in" or "start work"',
  'clock_out': 'Say "clock me out" or "end work"',
  'complete_task': 'Say "complete [task name]" or "mark task done"'
};

// Check recognition results
const voiceAI = new VoiceAI(config, {
  onCommand: (command) => {
    if (command.confidence < 0.5) {
      console.log('Low confidence recognition:', command.rawText);
      // Ask user to repeat
    }
  }
});
```

## React Integration Issues

### Hook Not Updating# Troubleshooting Guide

## Installation Issues

### NPM Installation Failures

#### Error: `Module not found`

**Problem:**
```bash
Module not found: Can't resolve '@voice-ai-workforce/core'
```

**Solutions:**
```bash
# Clear NPM cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Install specific versions
npm install @voice-ai-workforce/core@latest
```

#### Error: `Peer dependency warnings`

**Problem:**
```bash
npm WARN peer dep missing: react@>=16.8.0
```

**Solutions:**
```bash
# Install missing peer dependencies
npm install react@^18.0.0 react-dom@^18.0.0

# Or use legacy peer deps flag
npm install --legacy-peer-deps
```

#### Error: `Package not found`

**Problem:**
```bash
404 Not Found - GET https://registry.npmjs.org/@voice-ai-workforce/core
```

**Solutions:**
```bash
# Check package name spelling
npm search voice-ai-workforce

# Verify NPM registry
npm config get registry

# Reset to default registry
npm config set registry https://registry.npmjs.org/
```

### TypeScript Compilation Errors

#### Error: `Cannot find module '@voice-ai-workforce/types'`

**Problem:**
```typescript
TS2307: Cannot find module '@voice-ai-workforce/types' or its corresponding type declarations.
```

**Solutions:**
```bash
# Install types package
npm install @voice-ai-workforce/types

# Add to tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "types": ["@voice-ai-workforce/types"]
  }
}
```

#### Error: `Type imports not working`

**Problem:**
```typescript
import { VoiceAIConfig } from '@voice-ai-workforce/types';
// Types not recognized
```

**Solutions:**
```typescript
// Use type-only imports
import type { VoiceAIConfig } from '@voice-ai-workforce