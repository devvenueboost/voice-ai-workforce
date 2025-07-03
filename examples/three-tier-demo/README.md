# Voice AI Workforce Demo

A live demo showcasing the Voice AI Workforce package capabilities.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎤 Features Demonstrated

### Voice Commands
- **"help"** - Show available commands
- **"clock in"** - Start work session
- **"clock out"** - End work session  
- **"complete task"** - Mark task as done
- **"status"** - Check current status

### Interactive Elements
- 🎤 **Voice Button** - Click to start/stop listening
- ⌨️ **Text Input** - Type commands manually
- 🎯 **Quick Actions** - One-click command buttons
- 📝 **Command History** - See all interactions
- 📊 **Real-time Status** - Live work session tracking

## 🎯 Try These Commands

**Voice Examples:**
- "Hey, help me get started"
- "Clock me in please"
- "I want to complete the setup task"
- "What's my current status?"
- "Clock me out for the day"

**Text Examples:**
- `help`
- `clock in`
- `complete database migration task`
- `status check`
- `clock out`

## 🌐 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

**Note:** Voice recognition requires microphone permissions and HTTPS in production.

## 🔧 Development

### Project Structure
```
examples/three-tier-demo/
├── src/
│   ├── App.tsx          # Main demo application
│   ├── main.tsx         # React entry point
│   └── index.css        # Tailwind styles
├── public/              # Static assets
├── package.json         # Dependencies
└── vite.config.ts       # Vite configuration
```

### Available Scripts
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Mobile Support

The demo is fully responsive and works on mobile devices. On mobile:
- Tap the microphone button to start voice recognition
- Use text input as an alternative to voice
- All features work the same as desktop

## 🔒 Permissions

The demo requires:
- **Microphone access** - For voice recognition
- **HTTPS** - Required for Web Speech API in production

## 🎨 Customization

### Styling
The demo uses Tailwind CSS. Customize appearance by:
1. Editing `tailwind.config.js`
2. Modifying CSS classes in `App.tsx`
3. Adding custom styles to `index.css`

### Voice Configuration
Modify voice settings in `App.tsx`:
```typescript
const voiceConfig: VoiceAIConfig = {
  speechToText: {
    provider: 'web-speech',
    language: 'en-US',  // Change language
    continuous: false   // Auto-listen mode
  },
  textToSpeech: {
    provider: 'web-speech',
    speed: 1.0  // Speech speed
  }
  // ... other config
};
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

### Netlify
1. Connect repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy!

### Manual Deploy
```bash
npm run build
# Upload dist/ folder to your web server
```

## 🎯 Next Steps

This demo showcases basic Voice AI Workforce functionality. For production use:

1. **Add Authentication** - User login/logout
2. **Connect Real APIs** - Replace mock responses
3. **Add More Commands** - Extend command vocabulary  
4. **Error Handling** - Production-ready error management
5. **Analytics** - Track usage and performance

## 📞 Support

- 📖 **Documentation**: Check the main package README
- 🐛 **Issues**: Report bugs in the GitHub repo
- 💡 **Feature Requests**: Open an issue with your ideas

---

Built with ❤️ using React, TypeScript, Vite, and Tailwind CSS