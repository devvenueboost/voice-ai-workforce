# Installation Guide

## Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- A modern browser with Web Speech API support (Chrome, Edge, Safari)
- TypeScript 4.5+ (recommended for type safety)

## Quick Start Installation

### Basic Installation

```bash
# Install the main packages
npm install @voice-ai-workforce/react @voice-ai-workforce/core @voice-ai-workforce/types

# For TypeScript projects
npm install --save-dev @types/react @types/react-dom
```

### Simple Setup (End-User Mode)

For customer-facing applications where you want a clean, simple interface:

```tsx
import React from 'react';
import { VoiceButton } from '@voice-ai-workforce/react';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

const config = {
  speechToText: { provider: SpeechProvider.WEB_SPEECH },
  textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
  aiProvider: { provider: AIProvider.OPENAI },
  responseMode: ResponseMode.BOTH,
  
  // Clean, simple interface for end users
  interfaceMode: 'end-user' as const,
};

function CustomerApp() {
  return (
    <div>
      <h1>Welcome to Our Service</h1>
      <VoiceButton config={config} />
      {/* Shows: "Start Voice" button with minimal UI */}
    </div>
  );
}
```

### Advanced Setup (Developer Mode)

For development and debugging with full technical details:

```tsx
import React from 'react';
import { VoiceButton, VoiceCommandCenter } from '@voice-ai-workforce/react';
import { SpeechProvider, AIProvider, ResponseMode } from '@voice-ai-workforce/types';

const config = {
  speechToText: { provider: SpeechProvider.WEB_SPEECH },
  textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
  aiProvider: { provider: AIProvider.OPENAI },
  responseMode: ResponseMode.BOTH,
  
  // Full debug interface for developers
  interfaceMode: 'developer' as const,
  visibility: {
    showDebugInfo: true,
    showProviders: true,
    showConfidenceScores: true,
    showProcessingTimes: true
  }
};

function DeveloperApp() {
  const [centerOpen, setCenterOpen] = React.useState(false);
  
  return (
    <div>
      <h1>Voice AI Development Console</h1>
      
      <VoiceButton 
        config={config}
        onCommand={(cmd) => console.log('Debug:', cmd)}
        onError={(err) => console.error('Technical error:', err)}
      />
      
      <VoiceCommandCenter
        config={config}
        isOpen={centerOpen}
        onClose={() => setCenterOpen(false)}
      />
      {/* Shows: Full debug info, provider status, analytics, etc. */}
    </div>
  );
}
```

## Framework-Specific Installation

### React/Next.js Projects

#### Next.js 13+ (App Router)

```typescript
// app/layout.tsx
'use client';

import { VoiceProvider } from '@voice-ai-workforce/react';

const voiceConfig = {
  // Your voice AI configuration
  interfaceMode: process.env.NODE_ENV === 'development' ? 'developer' : 'project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <VoiceProvider config={voiceConfig}>
          {children}
        </VoiceProvider>
      </body>
    </html>
  );
}
```

```typescript
// app/page.tsx
'use client';

import { VoiceButton } from '@voice-ai-workforce/react';
import { useVoiceConfig } from './hooks/useVoiceConfig';

export default function HomePage() {
  const config = useVoiceConfig('end-user'); // Mode for this page
  
  return (
    <main>
      <VoiceButton config={config} />
    </main>
  );
}
```

#### Next.js 12 (Pages Router)

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { VoiceProvider } from '@voice-ai-workforce/react';

const voiceConfig = {
  // Configuration based on environment
  interfaceMode: process.env.NEXT_PUBLIC_VOICE_MODE || 'project',
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <VoiceProvider config={voiceConfig}>
      <Component {...pageProps} />
    </VoiceProvider>
  );
}
```

#### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Environment-based mode selection
    NEXT_PUBLIC_VOICE_MODE: process.env.NODE_ENV === 'development' ? 'developer' : 'project',
  },
  experimental: {
    transpilePackages: [
      '@voice-ai-workforce/core',
      '@voice-ai-workforce/react',
      '@voice-ai-workforce/types'
    ]
  }
}

module.exports = nextConfig
```

### Vite Projects

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Environment-based configuration
    __VOICE_MODE__: JSON.stringify(
      process.env.NODE_ENV === 'development' ? 'developer' : 'project'
    ),
  },
  optimizeDeps: {
    include: [
      '@voice-ai-workforce/core',
      '@voice-ai-workforce/react',
      '@voice-ai-workforce/types'
    ]
  }
})
```

```typescript
// src/config/voice.ts
import { VoiceAIConfig } from '@voice-ai-workforce/types';

declare const __VOICE_MODE__: string;

export const getVoiceConfig = (pageMode?: string): VoiceAIConfig => ({
  speechToText: { provider: 'web-speech' },
  textToSpeech: { provider: 'web-speech' },
  aiProvider: { provider: 'openai' },
  responseMode: 'both',
  
  // Use page-specific mode or global mode
  interfaceMode: pageMode || __VOICE_MODE__ || 'project',
});
```

### Create React App

```typescript
// src/config/voice.ts
export const voiceConfig = {
  speechToText: { provider: 'web-speech' as const },
  textToSpeech: { provider: 'web-speech' as const },
  aiProvider: { provider: 'openai' as const },
  responseMode: 'both' as const,
  
  // Environment-based mode
  interfaceMode: process.env.NODE_ENV === 'development' 
    ? 'developer' as const 
    : 'project' as const,
};
```

```typescript
// src/App.tsx
import { VoiceButton } from '@voice-ai-workforce/react';
import { voiceConfig } from './config/voice';

function App() {
  return (
    <div className="App">
      <VoiceButton config={voiceConfig} />
    </div>
  );
}

export default App;
```

## Mode Configuration

### Environment-Based Mode Selection

Set up automatic mode selection based on environment:

```bash
# .env.development
REACT_APP_VOICE_MODE=developer
REACT_APP_SHOW_DEBUG=true

# .env.production  
REACT_APP_VOICE_MODE=end-user
REACT_APP_SHOW_DEBUG=false

# .env.staging
REACT_APP_VOICE_MODE=project
REACT_APP_SHOW_DEBUG=false
```

```typescript
// config/voice-modes.ts
import type { VoiceInterfaceMode, VisibilityConfig } from '@voice-ai-workforce/types';

export const getModeConfig = (): {
  mode: VoiceInterfaceMode;
  visibility: VisibilityConfig;
} => {
  const envMode = process.env.REACT_APP_VOICE_MODE as VoiceInterfaceMode;
  const showDebug = process.env.REACT_APP_SHOW_DEBUG === 'true';
  
  switch (envMode) {
    case 'developer':
      return {
        mode: 'developer',
        visibility: {
          showDebugInfo: showDebug,
          showProviders: true,
          showConfidenceScores: true,
          showTechnicalErrors: true,
        }
      };
      
    case 'end-user':
      return {
        mode: 'end-user',
        visibility: {
          useGenericLabels: true,
          showProviders: false,
          showDebugInfo: false,
          showTechnicalErrors: false,
        }
      };
      
    default:
      return {
        mode: 'project',
        visibility: {
          showProviders: true,
          showDebugInfo: false,
          showConfidenceScores: true,
        }
      };
  }
};
```

### User Role-Based Mode Selection

Automatically select mode based on user role:

```typescript
// hooks/useVoiceMode.ts
import { useMemo } from 'react';
import type { VoiceInterfaceMode } from '@voice-ai-workforce/types';

interface User {
  role: 'admin' | 'manager' | 'employee' | 'customer';
  permissions: string[];
}

export const useVoiceMode = (user: User): VoiceInterfaceMode => {
  return useMemo(() => {
    // Admin users get developer mode
    if (user.role === 'admin' || user.permissions.includes('debug')) {
      return 'developer';
    }
    
    // Managers get project mode
    if (user.role === 'manager') {
      return 'project';
    }
    
    // Employees and customers get end-user mode
    return 'end-user';
  }, [user.role, user.permissions]);
};
```

```typescript
// components/AdaptiveVoiceButton.tsx
import { VoiceButton } from '@voice-ai-workforce/react';
import { useUser } from '../hooks/useUser';
import { useVoiceMode } from '../hooks/useVoiceMode';

export function AdaptiveVoiceButton() {
  const user = useUser();
  const mode = useVoiceMode(user);
  
  return (
    <VoiceButton
      config={baseConfig}
      mode={mode}
      customLabels={{
        voiceButton: {
          startText: user.role === 'customer' ? 'Ask Question' : 'Start Voice'
        }
      }}
    />
  );
}
```

### Page-Specific Mode Overrides

Different modes for different parts of your application:

```typescript
// pages/AdminDashboard.tsx
import { VoiceCommandCenter } from '@voice-ai-workforce/react';

export function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <VoiceCommandCenter
        config={baseConfig}
        mode="developer" // Full debug interface for admins
        isOpen={true}
      />
    </div>
  );
}
```

```typescript
// pages/CustomerSupport.tsx
import { VoiceButton } from '@voice-ai-workforce/react';

export function CustomerSupport() {
  return (
    <div>
      <h1>Customer Support</h1>
      <VoiceButton
        config={baseConfig}
        mode="end-user" // Simple interface for customers
        customLabels={{
          voiceButton: {
            startText: 'Ask for Help',
            stopText: 'Stop'
          }
        }}
      />
    </div>
  );
}
```

## TypeScript Configuration

### Complete Type Setup

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src",
    "src/**/*",
    "@voice-ai-workforce/types"
  ]
}
```

### Type-Safe Mode Configuration

```typescript
// types/voice-config.ts
import type { 
  VoiceAIConfig, 
  VoiceInterfaceMode, 
  VisibilityConfig,
  CustomLabels 
} from '@voice-ai-workforce/types';

export interface AppVoiceConfig extends VoiceAIConfig {
  interfaceMode: VoiceInterfaceMode; // Make required in your app
}

export interface ModeOverride {
  mode?: VoiceInterfaceMode;
  visibility?: Partial<VisibilityConfig>;
  labels?: Partial<CustomLabels>;
}

// Type guard for mode validation
export const isValidMode = (mode: string): mode is VoiceInterfaceMode => {
  return ['developer', 'project', 'end-user'].includes(mode);
};
```

```typescript
// config/voice.ts
import type { AppVoiceConfig } from '../types/voice-config';

export const createVoiceConfig = (
  mode: VoiceInterfaceMode = 'project'
): AppVoiceConfig => ({
  speechToText: { provider: 'web-speech' },
  textToSpeech: { provider: 'web-speech' },
  aiProvider: { provider: 'openai' },
  responseMode: 'both',
  interfaceMode: mode, // Type-safe mode assignment
});
```

## Troubleshooting Installation

### Common Issues

**1. Type Errors:**
```bash
# If TypeScript can't find the types
npm install --save-dev @types/node

# Ensure proper module resolution
"moduleResolution": "node"
```

**2. Mode Not Working:**
```typescript
// Verify mode is properly set
console.log('Current mode:', config.interfaceMode);

// Check if mode presets are working
import { useVoiceVisibility } from '../hooks/useVoiceVisibility';
const { visibility } = useVoiceVisibility(config);
console.log('Visibility config:', visibility);
```

**3. Build Errors:**
```javascript
// webpack.config.js - Add aliases if needed
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

### Validation Setup

Create a setup validation utility:

```typescript
// utils/validateVoiceSetup.ts
export const validateVoiceSetup = () => {
  const checks = {
    browserSupport: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    speechSynthesis: 'speechSynthesis' in window,
    https: location.protocol === 'https:' || location.hostname === 'localhost',
    packages: {
      core: true, // Add actual package checks
      react: true,
      types: true,
    }
  };
  
  const issues = [];
  if (!checks.browserSupport) issues.push('Speech recognition not supported');
  if (!checks.speechSynthesis) issues.push('Speech synthesis not supported');
  if (!checks.https) issues.push('HTTPS required for microphone access');
  
  return { 
    valid: issues.length === 0, 
    issues,
    checks 
  };
};
```

```typescript
// Use in your app
import { validateVoiceSetup } from './utils/validateVoiceSetup';

function App() {
  const { valid, issues } = validateVoiceSetup();
  
  if (!valid) {
    return (
      <div>
        <h2>Voice AI Setup Issues:</h2>
        <ul>
          {issues.map((issue, i) => <li key={i}>{issue}</li>)}
        </ul>
      </div>
    );
  }
  
  return <YourVoiceApp />;
}
```

## Production Installation

### Environment Variables

```bash
# Production environment
NODE_ENV=production
REACT_APP_VOICE_MODE=end-user
REACT_APP_VOICE_LANGUAGE=en-US
REACT_APP_VOICE_SPEED=1.0

# Development environment  
NODE_ENV=development
REACT_APP_VOICE_MODE=developer
REACT_APP_VOICE_LANGUAGE=en-US
REACT_APP_VOICE_SPEED=1.5
```

### Bundle Optimization

```javascript
// webpack.config.js - Split voice AI into separate chunk
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        voiceAI: {
          test: /[\\/]node_modules[\\/]@voice-ai-workforce/,
          name: 'voice-ai',
          chunks: 'all',
        },
      },
    },
  },
};
```

### Feature Detection

```typescript
// components/VoiceFeatureWrapper.tsx
import { Suspense, lazy } from 'react';

const VoiceButton = lazy(() => import('@voice-ai-workforce/react').then(m => ({ 
  default: m.VoiceButton 
})));

export function VoiceFeatureWrapper({ config, mode }) {
  const hasVoiceSupport = 'speechSynthesis' in window;
  
  if (!hasVoiceSupport) {
    return <div>Voice features not available in this browser</div>;
  }
  
  return (
    <Suspense fallback={<div>Loading voice features...</div>}>
      <VoiceButton config={config} mode={mode} />
    </Suspense>
  );
}
```

## Next Steps

After installation:

1. **Configure your mode**: Choose the appropriate mode for your use case
2. **Test browser compatibility**: Verify voice features work in your target browsers  
3. **Set up error handling**: Implement proper error boundaries and fallbacks
4. **Customize labels**: Set up user-friendly labels for your application
5. **Deploy with confidence**: Use environment-based configuration for different deployments

For advanced configuration options, see the [API Reference](./api-reference.md).

For usage examples, see the [Examples](./examples.md) guide.