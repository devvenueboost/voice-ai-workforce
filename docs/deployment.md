# Deployment Guide

## Package Distribution Setup

### Preparing for NPM Publishing

Since the packages aren't published yet, here's how to prepare them:

#### 1. Update Package.json Files

Each package needs proper metadata for publishing:

```json
// packages/types/package.json
{
  "name": "@voice-ai-workforce/types",
  "version": "1.0.0",
  "description": "TypeScript definitions for Voice AI Workforce",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "repository": {
    "type": "git",
    "url": "https://github.com/devvenueboost/voice-ai-workforce.git"
  },
  "keywords": ["typescript", "voice-ai", "workforce"],
  "author": "Griseld Gerveni <development@venueboost.io>",
  "license": "MIT"
}
```

#### 2. Create NPM Organization (Optional)

```bash
# Create organization on npmjs.com
# Then publish with scoped names:
npm publish --access public
```

#### 3. Publishing Workflow

```bash
# Build all packages
npm run build:sequential

# Version bump (choose one)
npm version patch    # 1.0.0 -> 1.0.1
npm version minor    # 1.0.0 -> 1.1.0  
npm version major    # 1.0.0 -> 2.0.0

# Publish to NPM
cd packages/types && npm publish --access public
cd packages/core && npm publish --access public  
cd packages/react && npm publish --access public
```

## Local Development Integration

### Method 1: Direct Import (Current)

Copy the built packages directly to your project:

```bash
# After building the voice-ai-workforce project
npm run build:sequential

# Copy to your project's node_modules
mkdir -p your-project/node_modules/@voice-ai-workforce
cp -r voice-ai-workforce/packages/types/dist your-project/node_modules/@voice-ai-workforce/types
cp -r voice-ai-workforce/packages/core/dist your-project/node_modules/@voice-ai-workforce/core
cp -r voice-ai-workforce/packages/react/dist your-project/node_modules/@voice-ai-workforce/react
```

### Method 2: Symlink (Development)

```bash
# In voice-ai-workforce directory
npm run build:sequential

# Create symlinks
cd packages/types && npm link
cd ../core && npm link @voice-ai-workforce/types && npm link
cd ../react && npm link @voice-ai-workforce/types && npm link @voice-ai-workforce/core && npm link

# In your project directory
npm link @voice-ai-workforce/types @voice-ai-workforce/core @voice-ai-workforce/react
```

## Framework Integration

### React/Next.js Projects

#### Basic Setup

```bash
# Install React dependencies
npm install react@^18.0.0 react-dom@^18.0.0

# Copy or link voice AI packages
# (Use methods above)
```

#### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Transpile local packages if needed
    transpilePackages: [
      '@voice-ai-workforce/core',
      '@voice-ai-workforce/react',
      '@voice-ai-workforce/types'
    ]
  }
}

module.exports = nextConfig
```

#### Usage in Next.js

```tsx
// app/voice/page.tsx
'use client';

import { VoiceButton } from '@voice-ai-workforce/react';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

export default function VoicePage() {
  const config = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
  };

  return (
    <main>
      <h1>Voice AI Demo</h1>
      <VoiceButton config={config} />
    </main>
  );
}
```

### Vite Projects

#### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@voice-ai-workforce/core',
      '@voice-ai-workforce/react',
      '@voice-ai-workforce/types'
    ]
  }
})
```

### Create React App

Works out of the box once packages are copied/linked:

```tsx
// src/App.js
import { VoiceButton } from '@voice-ai-workforce/react';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

function App() {
  const config = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
  };

  return (
    <div className="App">
      <VoiceButton config={config} />
    </div>
  );
}

export default App;
```

## Browser Requirements

### HTTPS Requirement

Voice recognition requires HTTPS in production:

```javascript
// Check if HTTPS is available
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  console.warn('Voice recognition requires HTTPS in production');
}
```

### Microphone Permissions

Handle permission requests gracefully:

```javascript
// Check microphone permission status
navigator.permissions.query({ name: 'microphone' }).then(result => {
  if (result.state === 'denied') {
    console.log('Microphone access denied');
    // Show text input fallback
  }
});
```

## Production Deployment

### Static Site Hosting

Works with any static hosting (Vercel, Netlify, GitHub Pages):

```bash
# Build your React app
npm run build

# Deploy dist/build folder to hosting service
```

### Environment Variables

For production configurations:

```bash
# .env.production
REACT_APP_VOICE_LANGUAGE=en-US
REACT_APP_VOICE_SPEED=1.0
```

```javascript
// Use in your config
const config = {
  speechToText: {
    provider: SpeechProvider.WEB_SPEECH,
    language: process.env.REACT_APP_VOICE_LANGUAGE || 'en-US',
  },
  textToSpeech: {
    provider: SpeechProvider.WEB_SPEECH,
    speed: parseFloat(process.env.REACT_APP_VOICE_SPEED) || 1.0,
  },
  aiProvider: {
    provider: AIProvider.OPENAI,
  },
  responseMode: ResponseMode.BOTH,
};
```

## Distribution Checklist

### Before Publishing

- [ ] All packages build successfully (`npm run build:sequential`)
- [ ] Tests pass (`npm test`)
- [ ] Demo works (`cd examples/basic-demo && npm run dev`)
- [ ] Version numbers updated consistently
- [ ] README files updated
- [ ] License file included

### Publishing Steps

1. **Build packages**: `npm run build:sequential`
2. **Run tests**: `npm test`
3. **Update versions**: `npm version patch --workspaces`
4. **Publish types**: `cd packages/types && npm publish --access public`
5. **Publish core**: `cd packages/core && npm publish --access public`
6. **Publish react**: `cd packages/react && npm publish --access public`

### After Publishing

- [ ] Test installation: `npm install @voice-ai-workforce/react`
- [ ] Update documentation with NPM installation instructions
- [ ] Create GitHub release with changelog
- [ ] Update demo to use published packages

## Common Integration Issues

### TypeScript Errors

```bash
# If TypeScript can't find types
npm install --save-dev @types/node

# Add to tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

### Module Resolution

```javascript
// webpack.config.js - if using custom webpack
module.exports = {
  resolve: {
    alias: {
      '@voice-ai-workforce/core': path.resolve('./node_modules/@voice-ai-workforce/core'),
      '@voice-ai-workforce/react': path.resolve('./node_modules/@voice-ai-workforce/react'),
      '@voice-ai-workforce/types': path.resolve('./node_modules/@voice-ai-workforce/types'),
    }
  }
};
```

### Browser Compatibility

Add polyfills if needed:

```javascript
// Check for speech synthesis support
if (!('speechSynthesis' in window)) {
  console.warn('Speech synthesis not supported');
  // Disable text-to-speech features
}

// Check for speech recognition support  
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
  console.warn('Speech recognition not supported');
  // Show text input only
}
```

## Rollback Strategy

If issues arise after deployment:

```bash
# Unpublish problematic version (within 24 hours)
npm unpublish @voice-ai-workforce/react@1.0.1

# Or deprecate version
npm deprecate @voice-ai-workforce/react@1.0.1 "Use version 1.0.0 instead"

# Users can install specific version
npm install @voice-ai-workforce/react@1.0.0
```

This deployment guide focuses on realistic distribution methods for your actual monorepo structure and the packages you've built.