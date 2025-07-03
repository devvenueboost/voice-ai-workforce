# Voice AI Workforce - Complete Troubleshooting Guide

## 🆕 Mode-Related Issues

### Mode Not Working or Showing Wrong Interface

**Problem:** Interface mode not applying correctly or showing wrong level of detail

**Diagnostic Steps:**
```typescript
// 1. Check mode configuration
const config = {
  interfaceMode: 'end-user', // Verify this is set
  visibility: {
    showProviders: false, // Should be false for end-user
    showDebugInfo: false,
    showConfidenceScores: false
  }
};

// 2. Validate mode resolution
const { visibility, labels } = useVoiceVisibility(config, mode, visibilityOverrides);
console.log('Resolved visibility:', visibility);
console.log('Resolved labels:', labels);
```

**Common Solutions:**
```typescript
// ❌ WRONG - Conflicting mode settings
const config = {
  interfaceMode: 'end-user',
  visibility: {
    showProviders: true, // Conflicts with end-user mode!
    showDebugInfo: true  // Will be overridden
  }
};

// ✅ CORRECT - Consistent mode settings
const config = {
  interfaceMode: 'end-user',
  visibility: {
    useGenericLabels: true,
    customLabels: {
      providers: { generic: 'Voice Assistant' }
    }
  }
};
```

### Provider Information Visible in End-User Mode

**Problem:** Technical provider names showing when they should be hidden

**Diagnosis:**
```typescript
// Check component props override global mode
<VoiceButton
  config={endUserConfig}
  mode="developer" // ❌ This overrides config.interfaceMode!
/>

// Check visibility overrides
<VoiceButton
  config={endUserConfig}
  visibilityOverrides={{
    showProviders: true // ❌ This forces provider visibility
  }}
/>
```

**Solutions:**
```typescript
// ✅ CORRECT - Let global mode take precedence
<VoiceButton config={endUserConfig} />

// ✅ CORRECT - Explicit end-user mode
<VoiceButton 
  config={config} 
  mode="end-user"
  customLabels={{
    providers: { generic: 'Voice Assistant' }
  }}
/>
```

### Custom Labels Not Updating

**Problem:** Custom labels not showing or being overridden

**Diagnosis:**
```typescript
// Check label precedence (highest to lowest):
// 1. Component customLabels prop
// 2. visibilityOverrides.customLabels  
// 3. config.visibility.customLabels
// 4. Mode defaults

// Debug label resolution
const effectiveLabels = {
  voiceButton: { 
    ...labels.voiceButton, 
    ...propCustomLabels?.voiceButton 
  },
  errors: { 
    ...labels.errors, 
    ...propCustomLabels?.errors 
  }
};
console.log('Final labels:', effectiveLabels);
```

**Solutions:**
```typescript
// ✅ Set labels at config level
const config = {
  interfaceMode: 'end-user',
  visibility: {
    customLabels: {
      voiceButton: {
        startText: 'Ask for Help',
        stopText: 'Stop',
        errorText: 'Voice Unavailable'
      },
      errors: {
        generic: 'Voice assistant temporarily unavailable'
      }
    }
  }
};

// ✅ Override at component level
<VoiceButton
  config={config}
  customLabels={{
    voiceButton: { startText: 'Get Help' }
  }}
/>
```

## 📱 Installation Issues

### Mode Configuration Validation Errors

**Problem:**
```typescript
// TypeScript error: Mode interfaces not found
import { VoiceInterfaceMode, VisibilityConfig } from '@voice-ai-workforce/types';
// Error: Module not found
```

**Solutions:**
```bash
# Install/update types package
npm install @voice-ai-workforce/types@latest

# Verify package exports
npm list @voice-ai-workforce/types

# Check TypeScript configuration
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

### Mode Preset Loading Issues

**Problem:** Default mode configurations not loading

**Diagnostic:**
```typescript
// Check if mode presets are available
import { DEFAULT_MODE_PRESETS } from '@voice-ai-workforce/types';
console.log('Available presets:', DEFAULT_MODE_PRESETS);

// Validate mode enum
import { VoiceInterfaceMode } from '@voice-ai-workforce/types';
console.log('Valid modes:', Object.values(VoiceInterfaceMode));
```

**Solutions:**
```typescript
// ✅ Explicit mode validation
const validateMode = (mode: string): VoiceInterfaceMode => {
  const validModes = ['developer', 'project', 'end-user'];
  if (!validModes.includes(mode)) {
    console.warn(`Invalid mode: ${mode}, defaulting to 'end-user'`);
    return 'end-user';
  }
  return mode as VoiceInterfaceMode;
};
```

## 🎤 Voice Recognition Issues

### Mode-Specific Error Messages

**Same Error in Different Modes:**

**Developer Mode:**
```typescript
// Full technical error with stack trace
{
  code: 'START_LISTENING_FAILED',
  message: 'Failed to start listening: DOMException: The operation was aborted.',
  details: {
    name: 'AbortError',
    stack: 'Error: at navigator.mediaDevices.getUserMedia...',
    browser: 'Chrome 91.0.4472.124',
    permissions: { microphone: 'prompt' }
  },
  recoverable: true,
  suggestions: [
    'Check microphone permissions in chrome://settings/content/microphone',
    'Verify no other applications are using the microphone',
    'Try refreshing the page and allowing microphone access'
  ]
}
```

**Project Mode:**
```typescript
// Technical but user-friendly error
{
  code: 'START_LISTENING_FAILED',
  message: 'Unable to access microphone. Please check browser permissions.',
  suggestions: [
    'Allow microphone access when prompted',
    'Check microphone settings in browser',
    'Ensure microphone is not in use by other applications'
  ]
}
```

**End-User Mode:**
```typescript
// Simple user-friendly message
{
  code: 'VOICE_UNAVAILABLE',
  message: 'Voice assistant is temporarily unavailable',
  // No technical details exposed
}
```

### Browser Support by Mode

| Browser | Developer Mode | Project Mode | End-User Mode |
|---------|---------------|--------------|---------------|
| **Chrome** | ✅ Full debugging | ✅ Business features | ✅ Simple interface |
| **Firefox** | ✅ All debug tools | ✅ Full functionality | ✅ User-friendly |
| **Safari** | ⚠️ Limited debug | ✅ Works well | ✅ Optimized for mobile |
| **Edge** | ✅ Complete support | ✅ All features | ✅ Clean interface |

## ⚛️ React Integration Issues

### Mode Prop Validation

**Problem:** Component mode props not working as expected

**Diagnostic:**
```typescript
// Check prop precedence
const MyComponent = ({ config, mode, visibilityOverrides }) => {
  // This order matters:
  // 1. mode prop overrides config.interfaceMode
  // 2. visibilityOverrides override mode defaults
  // 3. customLabels override everything
  
  console.log('Config mode:', config.interfaceMode);
  console.log('Prop mode:', mode);
  console.log('Final mode:', mode || config.interfaceMode || 'end-user');
};
```

**Solutions:**
```typescript
// ✅ CORRECT - Clear mode hierarchy
<VoiceButton
  config={baseConfig}       // interfaceMode: 'project'
  mode="end-user"          // Overrides to 'end-user'
  visibilityOverrides={{    // Fine-tune visibility
    showMiniCenter: false
  }}
  customLabels={{          // Override specific labels
    voiceButton: { startText: 'Ask Question' }
  }}
/>

// ✅ CORRECT - Environment-based mode
const getMode = () => {
  if (process.env.NODE_ENV === 'development') return 'developer';
  if (user.role === 'admin') return 'project';
  return 'end-user';
};
```

### Visibility Override Conflicts

**Problem:** Visibility settings not applying consistently

**Diagnosis:**
```typescript
// Debug visibility resolution
const debugVisibility = (config, mode, overrides) => {
  const baseVisibility = getModeDefaults(mode);
  const configVisibility = config.visibility || {};
  const finalVisibility = { ...baseVisibility, ...configVisibility, ...overrides };
  
  console.log('Mode defaults:', baseVisibility);
  console.log('Config overrides:', configVisibility);
  console.log('Prop overrides:', overrides);
  console.log('Final visibility:', finalVisibility);
  
  return finalVisibility;
};
```

## 🔧 Mode Debugging Tools

### Mode Configuration Validator

```typescript
const validateModeConfig = (config: VoiceAIConfig) => {
  const issues = [];
  
  // Check mode consistency
  if (config.interfaceMode === 'end-user' && config.visibility?.showDebugInfo) {
    issues.push('showDebugInfo conflicts with end-user mode');
  }
  
  if (config.interfaceMode === 'end-user' && config.visibility?.showProviders) {
    issues.push('showProviders should be false for end-user mode');
  }
  
  // Check required labels for end-user mode
  if (config.interfaceMode === 'end-user' && !config.visibility?.useGenericLabels) {
    issues.push('end-user mode should use generic labels');
  }
  
  // Validate custom labels
  if (config.visibility?.customLabels) {
    const required = ['voiceButton', 'errors'];
    for (const section of required) {
      if (!config.visibility.customLabels[section]) {
        issues.push(`Missing custom labels for: ${section}`);
      }
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    recommendations: generateRecommendations(config)
  };
};

// Usage
const validation = validateModeConfig(myConfig);
if (!validation.isValid) {
  console.warn('Mode configuration issues:', validation.issues);
  console.log('Recommendations:', validation.recommendations);
}
```

### Mode Testing Checklist

```typescript
const testAllModes = async () => {
  const modes = ['developer', 'project', 'end-user'];
  const results = {};
  
  for (const mode of modes) {
    console.log(`Testing ${mode} mode...`);
    
    const config = {
      ...baseConfig,
      interfaceMode: mode
    };
    
    const { visibility, labels } = useVoiceVisibility(config);
    
    results[mode] = {
      // Test visibility settings
      showsProviders: visibility.showProviders,
      showsDebugInfo: visibility.showDebugInfo,
      showsConfidenceScores: visibility.showConfidenceScores,
      
      // Test labels
      buttonText: labels.voiceButton.startText,
      errorText: labels.errors.generic,
      
      // Test functionality
      canShowMiniCenter: visibility.showMiniCenter,
      canShowHistory: visibility.showCommandHistory,
      canShowSettings: visibility.showAdvancedSettings
    };
  }
  
  console.table(results);
  return results;
};
```

### Component vs Global Mode Conflict Detector

```typescript
const detectModeConflicts = (config, componentProps) => {
  const conflicts = [];
  
  // Check mode override
  if (config.interfaceMode && componentProps.mode && 
      config.interfaceMode !== componentProps.mode) {
    conflicts.push({
      type: 'mode_override',
      message: `Component mode "${componentProps.mode}" overrides config mode "${config.interfaceMode}"`,
      recommendation: 'Remove component mode prop or make them consistent'
    });
  }
  
  // Check visibility conflicts
  if (componentProps.visibilityOverrides) {
    const configVisibility = config.visibility || {};
    Object.keys(componentProps.visibilityOverrides).forEach(key => {
      if (configVisibility[key] !== componentProps.visibilityOverrides[key]) {
        conflicts.push({
          type: 'visibility_override',
          setting: key,
          configValue: configVisibility[key],
          componentValue: componentProps.visibilityOverrides[key]
        });
      }
    });
  }
  
  return conflicts;
};
```

## 🌍 Environment-Specific Troubleshooting

### Development Environment (Developer Mode)

**Common Issues:**
```typescript
// Console spam from debug logs
const config = {
  interfaceMode: 'developer',
  advanced: {
    debugMode: true // Only for development
  }
};

// Too much technical information
const developmentVisibility = {
  showDebugInfo: true,
  showProviders: true,
  showConfidenceScores: true,
  showProcessingTimes: true,
  showTechnicalErrors: true,
  showAdvancedSettings: true,
  showAnalytics: true
};
```

**Solutions:**
```typescript
// Use environment-based debug control
const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  interfaceMode: isDevelopment ? 'developer' : 'project',
  advanced: {
    debugMode: isDevelopment
  },
  visibility: isDevelopment ? developmentVisibility : productionVisibility
};
```

### Staging Environment (Project Mode)

**Common Issues:**
```typescript
// Business features not visible to testers
const stagingConfig = {
  interfaceMode: 'project',
  visibility: {
    showProviders: true,        // Good for testing
    showConfidenceScores: true, // Useful for QA
    showAdvancedSettings: true, // Allow configuration testing
    showDebugInfo: false,       // Hide technical noise
    showTechnicalErrors: false  // Use business-friendly errors
  }
};
```

### Production Environment (End-User Mode)

**Common Issues:**
```typescript
// Technical information leaking to users
const productionConfig = {
  interfaceMode: 'end-user',
  visibility: {
    useGenericLabels: true,
    showProviders: false,
    showDebugInfo: false,
    showConfidenceScores: false,
    showTechnicalErrors: false,
    customLabels: {
      voiceButton: {
        startText: 'Start Voice',
        stopText: 'Stop',
        processingText: 'Listening...',
        errorText: 'Voice Unavailable'
      },
      providers: {
        generic: 'Voice Assistant'
      },
      errors: {
        generic: 'Voice assistant is temporarily unavailable',
        connection: 'Please check your internet connection',
        permission: 'Microphone access is required'
      }
    }
  }
};
```

## 🧪 Validation Scripts

### Quick Mode Validation

```bash
# Create a test script to validate your mode setup
npm run test:modes

# Or manual validation
node -e "
const { VoiceAI } = require('@voice-ai-workforce/core');
const config = require('./your-config.js');

console.log('Testing mode configuration...');
const voiceAI = new VoiceAI(config);
console.log('✅ Mode configuration is valid');
"
```

### Environment Setup Validator

```typescript
// validate-environment.js
const validateEnvironment = () => {
  const env = process.env.NODE_ENV;
  const checks = [];
  
  // Check mode configuration
  if (env === 'production') {
    checks.push({
      name: 'Production Mode',
      valid: config.interfaceMode === 'end-user',
      message: 'Production should use end-user mode'
    });
  }
  
  if (env === 'development') {
    checks.push({
      name: 'Development Mode',
      valid: config.interfaceMode === 'developer',
      message: 'Development should use developer mode'
    });
  }
  
  // Check API key configuration
  checks.push({
    name: 'API Keys',
    valid: !config.visibility?.showTechnicalErrors || !!process.env.VOICE_AI_API_KEY,
    message: 'API keys required for technical error details'
  });
  
  const failed = checks.filter(check => !check.valid);
  if (failed.length > 0) {
    console.error('❌ Environment validation failed:');
    failed.forEach(check => console.error(`  - ${check.message}`));
    process.exit(1);
  }
  
  console.log('✅ Environment validation passed');
};

validateEnvironment();
```

## 🆘 Emergency Mode Reset

If modes are completely broken, use this emergency reset:

```typescript
// emergency-reset.js
const emergencyConfig = {
  interfaceMode: 'end-user', // Safest mode
  speechToText: { provider: 'web-speech' },
  textToSpeech: { provider: 'web-speech' },
  aiProvider: { provider: 'keywords' }, // Most reliable fallback
  visibility: {
    // Minimal safe settings
    showProviders: false,
    showDebugInfo: false,
    showConfidenceScores: false,
    showTechnicalErrors: false,
    useGenericLabels: true,
    customLabels: {
      voiceButton: { startText: 'Voice' },
      errors: { generic: 'Unavailable' }
    }
  }
};

// Test this works, then gradually add features back
```

## 📞 Getting Help

### When to Contact Support

**Mode Issues:** Configuration not working after following this guide
**Integration Issues:** Problems integrating with your specific setup  
**Performance Issues:** Mode switching causing performance problems
**Custom Requirements:** Need custom mode configurations

### Information to Include

1. **Environment Details:**
   ```typescript
   console.log({
     nodeEnv: process.env.NODE_ENV,
     packageVersion: require('@voice-ai-workforce/core/package.json').version,
     browser: navigator.userAgent,
     mode: config.interfaceMode
   });
   ```

2. **Configuration:**
   ```typescript
   // Sanitized config (remove API keys)
   const sanitizedConfig = {
     ...config,
     apiKey: config.apiKey ? '[REDACTED]' : undefined
   };
   ```

3. **Error Details:**
   ```typescript
   // Include the actual error and expected behavior
   {
     expected: 'end-user mode with no provider info',
     actual: 'showing OpenAI provider name',
     config: sanitizedConfig,
     componentProps: { mode, visibilityOverrides }
   }
   ```

Remember: The mode system is designed to be flexible - when in doubt, start with `end-user` mode and gradually add features as needed!