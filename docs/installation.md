# Installation Guide

## Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- A modern browser with Web Speech API support (Chrome, Edge, Safari)

## Local Development Setup

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/devvenueboost/voice-ai-workforce.git
cd voice-ai-workforce

# Install dependencies
npm install

# Build packages in order
npm run build:sequential
```

### Package Structure

```
voice-ai-workforce/
├── packages/
│   ├── types/          # TypeScript definitions
│   ├── core/           # Core VoiceAI functionality  
│   └── react/          # React components and hooks
└── examples/
    └── basic-demo/     # Working demo application
```

## Using in Your Project

### Method 1: Local Development (Current)

Since packages aren't published to NPM yet, use local linking:

```bash
# In the voice-ai-workforce directory
npm run build:sequential

# Link packages locally
cd packages/types && npm link
cd ../core && npm link @voice-ai-workforce/types && npm link
cd ../react && npm link @voice-ai-workforce/types && npm link @voice-ai-workforce/core && npm link

# In your project directory
npm link @voice-ai-workforce/types @voice-ai-workforce/core @voice-ai-workforce/react
```

### Method 2: Copy Packages

```bash
# Copy built packages to your project
cp -r voice-ai-workforce/packages/types/dist your-project/node_modules/@voice-ai-workforce/types
cp -r voice-ai-workforce/packages/core/dist your-project/node_modules/@voice-ai-workforce/core  
cp -r voice-ai-workforce/packages/react/dist your-project/node_modules/@voice-ai-workforce/react
```

## Framework Integration

### React/Next.js Projects

```tsx
// Import the components
import { VoiceButton } from '@voice-ai-workforce/react';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

const config = {
  speechToText: {
    provider: SpeechProvider.WEB_SPEECH,
    language: 'en-US',
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

function App() {
  return (
    <div>
      <h1>Voice AI Demo</h1>
      <VoiceButton 
        config={config}
        onCommand={(command) => console.log('Command:', command)}
        onResponse={(response) => console.log('Response:', response)}
      />
    </div>
  );
}
```

### Vanilla JavaScript

```javascript
// Import core functionality
import { VoiceAI } from '@voice-ai-workforce/core';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

const config = {
  speechToText: {
    provider: SpeechProvider.WEB_SPEECH,
    language: 'en-US',
  },
  textToSpeech: {
    provider: SpeechProvider.WEB_SPEECH,
    speed: 1.0,
  },
  aiProvider: {
    provider: AIProvider.OPENAI,
  },
  responseMode: ResponseMode.BOTH,
};

const voiceAI = new VoiceAI(config, {
  onCommand: (command) => console.log('Command received:', command),
  onResponse: (response) => console.log('Response generated:', response),
});

// Start listening
document.getElementById('start-button').addEventListener('click', async () => {
  await voiceAI.startListening();
});
```

## Browser Compatibility

| Browser | Speech Recognition | Speech Synthesis | Status |
|---------|-------------------|------------------|--------|
| Chrome  | ✅                | ✅               | Full support |
| Edge    | ✅                | ✅               | Full support |
| Safari  | ✅                | ✅               | Full support |
| Firefox | ❌                | ✅               | No speech recognition |

## Troubleshooting

### Common Issues

**1. Module not found errors:**
- Ensure packages are built: `npm run build:sequential`
- Check that packages are linked properly

**2. TypeScript errors:**
- Make sure @voice-ai-workforce/types is imported
- Check tsconfig.json includes the types

**3. Browser permissions:**
- Chrome requires HTTPS for microphone access (except localhost)
- User must grant microphone permission

## Running the Demo

```bash
# Start the demo application
cd examples/basic-demo
npm run dev
```

Open http://localhost:5173 and test voice commands:
- "help"
- "clock me in" 
- "clock me out"
- "complete task"

## Next Steps

- Check out the [API Reference](./api-reference.md) for detailed documentation
- Explore [Examples](./examples.md) for usage patterns
- See [Troubleshooting](./troubleshooting.md) for common issues