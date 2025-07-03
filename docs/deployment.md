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
  "description": "TypeScript definitions for Voice AI Workforce with 3-tier mode system",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "repository": {
    "type": "git",
    "url": "https://github.com/devvenueboost/voice-ai-workforce.git"
  },
  "keywords": ["typescript", "voice-ai", "workforce", "modes", "interface"],
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

## Mode-Specific Deployment Strategies

### Environment-Based Mode Configuration

Configure different modes for different deployment environments:

#### Development Environment

```bash
# .env.development
NODE_ENV=development
REACT_APP_VOICE_MODE=developer
REACT_APP_VOICE_DEBUG=true
REACT_APP_SHOW_PROVIDERS=true
REACT_APP_SHOW_PROCESSING_TIMES=true
REACT_APP_ENABLE_ANALYTICS=true
```

```typescript
// config/voice-dev.ts
export const developmentConfig = {
  speechToText: { provider: SpeechProvider.WEB_SPEECH },
  textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
  aiProvider: { provider: AIProvider.OPENAI },
  responseMode: ResponseMode.BOTH,
  
  // Developer mode with full debugging
  interfaceMode: 'developer' as const,
  visibility: {
    showDebugInfo: true,
    showProviders: true,
    showConfidenceScores: true,
    showProcessingTimes: true,
    showTechnicalErrors: true,
    showAdvancedSettings: true,
    showAnalytics: true,
    showExportOptions: true,
  }
};
```

#### Staging Environment

```bash
# .env.staging  
NODE_ENV=staging
REACT_APP_VOICE_MODE=project
REACT_APP_VOICE_DEBUG=false
REACT_APP_SHOW_PROVIDERS=true
REACT_APP_SHOW_PROCESSING_TIMES=false
REACT_APP_ENABLE_ANALYTICS=true
```

```typescript
// config/voice-staging.ts
export const stagingConfig = {
  speechToText: { provider: SpeechProvider.WEB_SPEECH },
  textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
  aiProvider: { provider: AIProvider.OPENAI },
  responseMode: ResponseMode.BOTH,
  
  // Project mode for business testing
  interfaceMode: 'project' as const,
  visibility: {
    showDebugInfo: false,
    showProviders: true,
    showConfidenceScores: true,
    showProcessingTimes: false,
    showTechnicalErrors: false,
    showAdvancedSettings: true,
    showAnalytics: true,
  }
};
```

#### Production Environment

```bash
# .env.production
NODE_ENV=production
REACT_APP_VOICE_MODE=end-user
REACT_APP_VOICE_DEBUG=false
REACT_APP_SHOW_PROVIDERS=false
REACT_APP_SHOW_PROCESSING_TIMES=false
REACT_APP_ENABLE_ANALYTICS=false
```

```typescript
// config/voice-production.ts
export const productionConfig = {
  speechToText: { provider: SpeechProvider.WEB_SPEECH },
  textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
  aiProvider: { provider: AIProvider.OPENAI },
  responseMode: ResponseMode.BOTH,
  
  // End-user mode for clean production interface
  interfaceMode: 'end-user' as const,
  visibility: {
    showDebugInfo: false,
    showProviders: false,
    showConfidenceScores: false,
    showProcessingTimes: false,
    showTechnicalErrors: false,
    showAdvancedSettings: false,
    showAnalytics: false,
    useGenericLabels: true,
    customLabels: {
      voiceButton: {
        startText: 'Start Voice',
        stopText: 'Stop Voice',
        processingText: 'Processing...',
        errorText: 'Voice Unavailable'
      },
      providers: {
        generic: 'Voice Assistant'
      },
      errors: {
        generic: 'Voice assistant is temporarily unavailable',
        connection: 'Please check your connection',
        permission: 'Microphone permission required'
      }
    }
  }
};
```

### Multi-Tenant Deployment

For applications serving different types of users (like Staffluent):

```typescript
// config/voice-multi-tenant.ts
export const getConfigForUserType = (userType: string) => {
  const baseConfig = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
  };

  switch (userType) {
    case 'business_admin':
      return {
        ...baseConfig,
        interfaceMode: 'project' as const,
        visibility: {
          showProviders: true,
          showConfidenceScores: true,
          showAdvancedSettings: true,
          showAnalytics: true,
        }
      };

    case 'team_leader':
      return {
        ...baseConfig,
        interfaceMode: 'project' as const,
        visibility: {
          showProviders: false,
          showConfidenceScores: true,
          showAdvancedSettings: false,
          showAnalytics: false,
        }
      };

    case 'employee':
    case 'customer':
      return {
        ...baseConfig,
        interfaceMode: 'end-user' as const,
        visibility: {
          useGenericLabels: true,
          showProviders: false,
          showDebugInfo: false,
        },
        customLabels: {
          voiceButton: {
            startText: userType === 'customer' ? 'Ask for Help' : 'Voice Command'
          }
        }
      };

    default:
      return { ...baseConfig, interfaceMode: 'end-user' as const };
  }
};
```

### Build-Time Mode Optimization

Optimize bundles for specific modes:

```javascript
// webpack.config.js
const webpack = require('webpack');

module.exports = (env) => {
  const isDevelopment = env.NODE_ENV === 'development';
  const voiceMode = env.VOICE_MODE || 'project';
  
  return {
    // Bundle splitting for mode-specific features
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          voiceCore: {
            test: /[\\/]node_modules[\\/]@voice-ai-workforce[\\/]core/,
            name: 'voice-core',
            chunks: 'all',
          },
          voiceReact: {
            test: /[\\/]node_modules[\\/]@voice-ai-workforce[\\/]react/,
            name: 'voice-react',
            chunks: 'all',
          },
          // Separate debug features for developer mode
          voiceDebug: {
            test: /[\\/]src[\\/].*debug/,
            name: 'voice-debug',
            chunks: 'all',
            enforce: voiceMode === 'developer',
          },
        },
      },
    },
    
    plugins: [
      new webpack.DefinePlugin({
        'process.env.VOICE_MODE': JSON.stringify(voiceMode),
        'process.env.ENABLE_VOICE_DEBUG': JSON.stringify(isDevelopment || voiceMode === 'developer'),
        'process.env.SHOW_VOICE_PROVIDERS': JSON.stringify(voiceMode !== 'end-user'),
        'process.env.USE_GENERIC_LABELS': JSON.stringify(voiceMode === 'end-user'),
      }),
      
      // Conditional loading for mode-specific features
      ...(voiceMode === 'end-user' ? [
        new webpack.IgnorePlugin({
          resourceRegExp: /voice-analytics|voice-debug|voice-advanced/,
        })
      ] : []),
    ],
  };
};
```

### Framework-Specific Deployment

#### Next.js Deployment

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Mode configuration
    VOICE_MODE: process.env.VOICE_MODE || 'project',
    VOICE_DEBUG: process.env.NODE_ENV === 'development' ? 'true' : 'false',
  },
  
  // Environment-specific optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: process.env.VOICE_MODE === 'end-user',
    },
  }),
  
  experimental: {
    transpilePackages: [
      '@voice-ai-workforce/core',
      '@voice-ai-workforce/react',
      '@voice-ai-workforce/types'
    ]
  },
  
  // Optimize for different deployment targets
  output: process.env.NEXT_OUTPUT || 'standalone',
  
  // Mode-specific redirects
  async redirects() {
    return process.env.VOICE_MODE === 'end-user' ? [
      {
        source: '/admin/:path*',
        destination: '/404',
        permanent: false,
      },
    ] : [];
  },
};

module.exports = nextConfig;
```

```dockerfile
# Dockerfile for Next.js with mode support
FROM node:18-alpine AS base
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Build stage with mode argument
FROM base AS builder
ARG VOICE_MODE=project
ARG NODE_ENV=production

COPY . .
ENV VOICE_MODE=${VOICE_MODE}
ENV NODE_ENV=${NODE_ENV}

RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ARG VOICE_MODE=project
ENV VOICE_MODE=${VOICE_MODE}

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

#### Vite Deployment

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const voiceMode = env.VITE_VOICE_MODE || 'project';
  
  return {
    plugins: [react()],
    
    define: {
      __VOICE_MODE__: JSON.stringify(voiceMode),
      __VOICE_DEBUG__: JSON.stringify(mode === 'development'),
    },
    
    build: {
      // Mode-specific build optimizations
      rollupOptions: {
        output: {
          manualChunks: {
            'voice-core': ['@voice-ai-workforce/core'],
            'voice-react': ['@voice-ai-workforce/react'],
            ...(voiceMode === 'developer' && {
              'voice-debug': ['debug-utils', 'performance-tools']
            }),
          },
        },
      },
      
      // Minification based on mode
      minify: voiceMode === 'end-user' ? 'esbuild' : 'terser',
      
      // Source maps for non-production modes
      sourcemap: voiceMode !== 'end-user',
    },
    
    optimizeDeps: {
      include: [
        '@voice-ai-workforce/core',
        '@voice-ai-workforce/react',
        '@voice-ai-workforce/types'
      ]
    }
  };
});
```

## Cloud Deployment

### Docker Deployment with Mode Support

```dockerfile
# Multi-stage Dockerfile with mode configuration
FROM node:18-alpine AS base

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS development
ARG VOICE_MODE=developer
ENV NODE_ENV=development
ENV VOICE_MODE=${VOICE_MODE}
COPY . .
RUN npm run build:dev
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS staging  
ARG VOICE_MODE=project
ENV NODE_ENV=staging
ENV VOICE_MODE=${VOICE_MODE}
COPY . .
RUN npm run build:staging
EXPOSE 3000
CMD ["npm", "run", "start"]

FROM base AS production
ARG VOICE_MODE=end-user
ENV NODE_ENV=production
ENV VOICE_MODE=${VOICE_MODE}
COPY . .
RUN npm run build:production
EXPOSE 3000
CMD ["npm", "run", "start"]
```

```yaml
# docker-compose.yml for multi-mode deployment
version: '3.8'

services:
  # Development with developer mode
  voice-dev:
    build:
      context: .
      target: development
      args:
        VOICE_MODE: developer
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - VOICE_MODE=developer
      - VOICE_DEBUG=true
    volumes:
      - .:/app
      - /app/node_modules

  # Staging with project mode
  voice-staging:
    build:
      context: .
      target: staging
      args:
        VOICE_MODE: project
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=staging
      - VOICE_MODE=project
      - VOICE_DEBUG=false

  # Production with end-user mode
  voice-prod:
    build:
      context: .
      target: production
      args:
        VOICE_MODE: end-user
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=production
      - VOICE_MODE=end-user
      - VOICE_DEBUG=false
```

### Kubernetes Deployment

```yaml
# k8s-deployment.yml with mode-specific configurations
apiVersion: apps/v1
kind: Deployment
metadata:
  name: voice-ai-app
  labels:
    app: voice-ai-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: voice-ai-app
  template:
    metadata:
      labels:
        app: voice-ai-app
    spec:
      containers:
      - name: voice-ai-app
        image: voice-ai-workforce:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: VOICE_MODE
          valueFrom:
            configMapKeyRef:
              name: voice-config
              key: voice-mode
        - name: VOICE_DEBUG
          valueFrom:
            configMapKeyRef:
              name: voice-config
              key: voice-debug
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: voice-config
data:
  voice-mode: "end-user"
  voice-debug: "false"
  voice-language: "en-US"

---
# Service for different environments
apiVersion: v1
kind: Service
metadata:
  name: voice-ai-service
spec:
  selector:
    app: voice-ai-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### CDN and Edge Deployment

```typescript
// edge-config.ts for CDN deployment
export const getEdgeConfig = (region: string, userType: string) => {
  const baseConfig = {
    speechToText: { provider: SpeechProvider.WEB_SPEECH },
    textToSpeech: { provider: SpeechProvider.WEB_SPEECH },
    aiProvider: { provider: AIProvider.OPENAI },
    responseMode: ResponseMode.BOTH,
  };

  // Region-specific optimizations
  const regionConfig = {
    'us-east': { language: 'en-US', speed: 1.0 },
    'us-west': { language: 'en-US', speed: 1.0 },
    'eu-west': { language: 'en-GB', speed: 0.9 },
    'asia-pacific': { language: 'en-AU', speed: 0.8 },
  };

  // User-type specific mode
  const modeConfig = {
    admin: 'project' as const,
    employee: 'end-user' as const,
    customer: 'end-user' as const,
  };

  return {
    ...baseConfig,
    ...regionConfig[region],
    interfaceMode: modeConfig[userType] || 'end-user',
    visibility: {
      useGenericLabels: userType !== 'admin',
      showProviders: userType === 'admin',
      showDebugInfo: false,
    }
  };
};
```

## Performance Optimization by Mode

### Bundle Size Optimization

```typescript
// webpack-mode-optimization.js
const ModeOptimizationPlugin = (mode) => {
  const optimizations = {
    'end-user': {
      // Remove debug code
      minimizer: ['terser-webpack-plugin'],
      usedExports: true,
      sideEffects: false,
      // Tree shake debug utilities
      exclude: /debug|analytics|advanced/,
    },
    'project': {
      // Keep some debug for business users
      minimizer: ['terser-webpack-plugin'],
      usedExports: true,
      // Keep analytics
      include: /analytics/,
    },
    'developer': {
      // Keep everything for developers
      minimize: false,
      devtool: 'source-map',
    }
  };

  return optimizations[mode] || optimizations['project'];
};

module.exports = { ModeOptimizationPlugin };
```

### Runtime Performance

```typescript
// performance-by-mode.ts
export const getPerformanceConfig = (mode: VoiceInterfaceMode) => {
  switch (mode) {
    case 'end-user':
      return {
        // Minimal features for fastest loading
        enableAnalytics: false,
        enableDebugLogging: false,
        enableAdvancedFeatures: false,
        cacheStrategy: 'aggressive',
        bundleSize: 'minimal',
      };
      
    case 'project':
      return {
        // Balanced performance
        enableAnalytics: true,
        enableDebugLogging: false,
        enableAdvancedFeatures: true,
        cacheStrategy: 'balanced',
        bundleSize: 'standard',
      };
      
    case 'developer':
      return {
        // Full features for development
        enableAnalytics: true,
        enableDebugLogging: true,
        enableAdvancedFeatures: true,
        cacheStrategy: 'minimal',
        bundleSize: 'full',
      };
  }
};
```

## Monitoring and Analytics

### Mode-Specific Monitoring

```typescript
// monitoring-config.ts
export const setupMonitoring = (mode: VoiceInterfaceMode) => {
  const baseConfig = {
    errorReporting: true,
    performanceTracking: true,
    userAnalytics: true,
  };

  const modeSpecificConfig = {
    'end-user': {
      ...baseConfig,
      debugLogging: false,
      detailedErrorReporting: false,
      userPrivacy: 'strict',
    },
    'project': {
      ...baseConfig,
      debugLogging: true,
      detailedErrorReporting: true,
      userPrivacy: 'balanced',
    },
    'developer': {
      ...baseConfig,
      debugLogging: true,
      detailedErrorReporting: true,
      performanceDetailLevel: 'verbose',
      userPrivacy: 'minimal',
    }
  };

  return modeSpecificConfig[mode];
};
```

### Health Checks

```typescript
// health-check.ts
export const createHealthCheck = (mode: VoiceInterfaceMode) => {
  return {
    '/health': () => ({
      status: 'ok',
      mode,
      timestamp: new Date().toISOString(),
      features: {
        voiceRecognition: checkVoiceRecognition(),
        speechSynthesis: checkSpeechSynthesis(),
        aiProvider: checkAIProvider(),
        ...(mode === 'developer' && {
          debugFeatures: checkDebugFeatures(),
          analytics: checkAnalytics(),
        })
      }
    }),
    
    '/health/mode': () => ({
      currentMode: mode,
      availableModes: ['developer', 'project', 'end-user'],
      modeFeatures: getModeFeatures(mode),
    })
  };
};
```

## Security Considerations

### Mode-Specific Security

```typescript
// security-by-mode.ts
export const getSecurityConfig = (mode: VoiceInterfaceMode) => {
  const baseConfig = {
    sanitizeInputs: true,
    validateCommands: true,
    encryptStorage: true,
  };

  switch (mode) {
    case 'end-user':
      return {
        ...baseConfig,
        // Strictest security for end users
        hideErrorDetails: true,
        limitDebugInfo: true,
        disableAdvancedFeatures: true,
        logLevel: 'error',
      };
      
    case 'project':
      return {
        ...baseConfig,
        // Balanced security for business users
        hideErrorDetails: false,
        limitDebugInfo: true,
        logLevel: 'warning',
      };
      
    case 'developer':
      return {
        ...baseConfig,
        // Minimal restrictions for developers
        hideErrorDetails: false,
        limitDebugInfo: false,
        logLevel: 'debug',
        enableSourceMaps: true,
      };
  }
};
```

## Rollback Strategy

### Mode-Safe Rollbacks

```bash
#!/bin/bash
# rollback-script.sh

MODE=${1:-"end-user"}
VERSION=${2:-"previous"}

echo "Rolling back to $VERSION with mode: $MODE"

# Rollback application
kubectl set image deployment/voice-ai-app voice-ai-app=voice-ai-workforce:$VERSION

# Update configuration for mode
kubectl patch configmap voice-config -p '{"data":{"voice-mode":"'$MODE'"}}'

# Restart pods with new configuration
kubectl rollout restart deployment/voice-ai-app

# Wait for rollout to complete
kubectl rollout status deployment/voice-ai-app

echo "Rollback completed successfully"
```

### Testing After Deployment

```typescript
// deployment-test.ts
export const testModeDeployment = async (mode: VoiceInterfaceMode) => {
  const tests = {
    'end-user': [
      'Voice button shows generic labels',
      'No provider information visible',
      'Error messages are user-friendly',
      'No debug information exposed',
    ],
    'project': [
      'Provider information visible',
      'Confidence scores available',
      'Some analytics features enabled',
      'Balanced error reporting',
    ],
    'developer': [
      'All debug information available',
      'Full provider details shown',
      'Complete error stack traces',
      'Analytics and export features',
    ]
  };

  console.log(`Testing ${mode} mode deployment...`);
  
  for (const test of tests[mode]) {
    try {
      await runTest(test);
      console.log(`✅ ${test}`);
    } catch (error) {
      console.log(`❌ ${test}: ${error.message}`);
    }
  }
};
```

This deployment guide focuses on the practical aspects of deploying voice AI applications with the new mode system, ensuring optimal performance and user experience for each target audience.