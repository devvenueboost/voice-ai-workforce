# 🎤 Voice AI for Workforce Management

> Transform your workforce operations with AI-powered voice commands

*Built with ❤️ by [Griseld Gerveni](https://github.com/devvenueboost), CTO of VenueBoost Inc.*

[![npm](https://img.shields.io/npm/v/@voice-ai-workforce/core)](https://www.npmjs.com/package/@voice-ai-workforce/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ What This Solves

**Before**: "Let me stop what I'm doing, take off my gloves, unlock my phone, navigate through 5 screens, and update my task status..."

**After**: "Mark foundation inspection as complete" ✅ Done in 2 seconds.

## 🚀 Quick Start

```bash
npm install @voice-ai-workforce/core @voice-ai-workforce/react
```

```tsx
import { VoiceAssistant } from '@voice-ai-workforce/react';

<VoiceAssistant 
  apiBaseUrl="https://your-api.com"
  endpoints={{
    clockIn: "/timesheet/clock-in",
    updateTask: "/tasks/update"
  }}
/>
```

## 📦 Packages

- **@voice-ai-workforce/core** - Core voice AI engine
- **@voice-ai-workforce/react** - React components and hooks
- **@voice-ai-workforce/types** - TypeScript type definitions

## 🎬 Examples

- [Basic Demo](./examples/basic-demo) - Simple voice commands showcase
- [Playground](./playground) - Interactive demo

## 📚 Documentation

See [docs](./docs) for detailed guides and API reference.

## 🤝 Contributing

Contributions welcome! Please read our [contributing guide](./CONTRIBUTING.md).

## 📄 License

MIT © [Griseld Gerveni, CTO of VenueBoost Inc.]
