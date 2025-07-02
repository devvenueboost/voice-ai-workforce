// packages/core/src/VoiceAI.ts

import {
  VoiceAIConfig,
  VoiceCommand,
  VoiceResponse,
  VoiceAIState,
  VoiceAIEvents,
  VoiceAIError,
  SpeechProvider,
  AIProvider,
  ResponseMode,
  HTTPMethod,
  CommandDefinition,
  CommandRegistry,
  AIProviderConfig,
  OpenAIConfig,
  AnthropicConfig,
  GoogleConfig
} from '../../types/src/types';

import { DEFAULT_COMMAND_REGISTRY, findCommandByTrigger, getCommandByIntent } from '../../types/src/commands';

export class VoiceAI {
  private config: VoiceAIConfig;
  private state: VoiceAIState;
  private speechRecognition: any;
  private speechSynthesis!: SpeechSynthesis;
  private eventListeners: Partial<VoiceAIEvents> = {};
  private commandRegistry: CommandRegistry;
  private providerInstances: Map<AIProvider, any> = new Map();

  constructor(config: VoiceAIConfig, events?: Partial<VoiceAIEvents>) {
    this.validateConfig(config);
    this.config = this.mergeWithDefaults(config);
    this.eventListeners = events || {};
    this.commandRegistry = this.initializeCommandRegistry();
    
    this.state = {
      isListening: false,
      isProcessing: false,
      isAvailable: false,
      commandHistory: [],
      suggestedCommands: [],
      providerStatus: {},
      isCommandCenterOpen: false
    };
    
    this.initialize();
  }

  private validateConfig(config: VoiceAIConfig): void {
    if (!config.aiProviders?.primary) {
      throw new Error('Primary AI provider configuration is required');
    }
    
    if (!config.apiBaseUrl) {
      console.warn('⚠️ No apiBaseUrl provided. API calls will fail. This should only be used for demo purposes.');
    }

    // Validate AI provider configs
    this.validateAIProviderConfig(config.aiProviders.primary);
    
    if (config.aiProviders.fallbacks) {
      config.aiProviders.fallbacks.forEach(provider => this.validateAIProviderConfig(provider));
    }
  }

  private validateAIProviderConfig(provider: AIProviderConfig): void {
    switch (provider.provider) {
      case AIProvider.OPENAI:
        if (!(provider as OpenAIConfig).apiKey) {
          console.warn('⚠️ OpenAI provider configured but no API key provided. Falling back to keywords.');
        }
        break;
      case AIProvider.ANTHROPIC:
        if (!(provider as AnthropicConfig).apiKey) {
          console.warn('⚠️ Anthropic provider configured but no API key provided. Falling back to keywords.');
        }
        break;
      case AIProvider.GOOGLE:
        if (!(provider as GoogleConfig).apiKey) {
          console.warn('⚠️ Google provider configured but no API key provided. Falling back to keywords.');
        }
        break;
      case AIProvider.KEYWORDS:
        // Keywords fallback is always valid
        break;
    }
  }

  private mergeWithDefaults(config: VoiceAIConfig): VoiceAIConfig {
    const envApiKey = typeof process !== 'undefined' ? process.env?.VOICE_AI_API_KEY : undefined;
    const envBaseUrl = typeof process !== 'undefined' ? process.env?.VOICE_AI_API_URL : undefined;

    return {
      apiBaseUrl: config.apiBaseUrl || envBaseUrl,
      apiKey: config.apiKey || envApiKey,
      
      aiProviders: {
        primary: config.aiProviders.primary,
        fallbacks: config.aiProviders.fallbacks || [
          { provider: AIProvider.KEYWORDS, fallbackMode: true }
        ],
        retryAttempts: config.aiProviders.retryAttempts || 2,
        timeoutMs: config.aiProviders.timeoutMs || 5000
      },
      
      speechToText: {
        provider: SpeechProvider.WEB_SPEECH,
        language: 'en-US',
        continuous: false,
        interimResults: false,
        ...config.speechToText
      },
      
      textToSpeech: {
        provider: SpeechProvider.WEB_SPEECH,
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
        ...config.textToSpeech
      },
      
      commands: {
        registry: DEFAULT_COMMAND_REGISTRY,
        customCommands: [],
        enabledCategories: [],
        disabledCommands: [],
        ...config.commands
      },
      
      wakeWord: config.wakeWord,
      autoListen: config.autoListen || false,
      responseMode: config.responseMode || ResponseMode.BOTH,
      confidenceThreshold: config.confidenceThreshold || 0.7,
      
      ui: {
        theme: 'auto',
        position: 'left',
        showCommandHistory: true,
        showSuggestions: true,
        commandCenterWidth: 320,
        animations: true,
        sounds: false,
        ...config.ui
      },
      
      context: config.context || {},
      
      advanced: {
        enableAnalytics: false,
        enableCaching: true,
        maxHistoryItems: 50,
        enableOfflineMode: false,
        debugMode: false,
        ...config.advanced
      }
    };
  }

  private initializeCommandRegistry(): CommandRegistry {
    const registry = { ...this.config.commands?.registry || DEFAULT_COMMAND_REGISTRY };
    
    // Add custom commands if provided
    if (this.config.commands?.customCommands) {
      registry.commands = [...registry.commands, ...this.config.commands.customCommands];
    }
    
    // Filter commands based on enabled categories and disabled commands
    if (this.config.commands?.enabledCategories?.length) {
      registry.commands = registry.commands.filter(cmd => 
        this.config.commands!.enabledCategories!.includes(cmd.category || '')
      );
    }
    
    if (this.config.commands?.disabledCommands?.length) {
      registry.commands = registry.commands.filter(cmd => 
        !this.config.commands!.disabledCommands!.includes(cmd.id)
      );
    }
    
    return registry;
  }

  private async initialize(): Promise<void> {
    try {
      await this.initializeSpeechRecognition();
      await this.initializeSpeechSynthesis();
      await this.initializeAIProviders();
      
      this.updateState({ isAvailable: true });
      
      if (this.config.autoListen) {
        await this.startListening();
      }
    } catch (error) {
      this.handleError({
        code: 'INITIALIZATION_FAILED',
        message: 'Failed to initialize voice services',
        details: error,
        recoverable: false
      });
    }
  }

  private async initializeAIProviders(): Promise<void> {
    // Initialize provider status
    const providerStatus: Record<AIProvider, 'available' | 'error' | 'timeout'> = {} as any;
    
    // Test primary provider
    try {
      await this.testAIProvider(this.config.aiProviders.primary);
      providerStatus[this.config.aiProviders.primary.provider] = 'available';
    } catch (error) {
      console.warn(`Primary AI provider ${this.config.aiProviders.primary.provider} failed:`, error);
      providerStatus[this.config.aiProviders.primary.provider] = 'error';
    }
    
    // Test fallback providers
    if (this.config.aiProviders.fallbacks) {
      for (const provider of this.config.aiProviders.fallbacks) {
        try {
          await this.testAIProvider(provider);
          providerStatus[provider.provider] = 'available';
        } catch (error) {
          providerStatus[provider.provider] = 'error';
        }
      }
    }
    
    this.updateState({ 
      providerStatus,
      activeProvider: this.config.aiProviders.primary.provider
    });
  }

  private async testAIProvider(provider: AIProviderConfig): Promise<void> {
    if (provider.provider === AIProvider.KEYWORDS) {
      return; // Keywords provider is always available
    }
    
    // Simple test to validate provider configuration
    // We'll implement actual provider testing in the provider-specific methods
    return Promise.resolve();
  }

  private async initializeSpeechRecognition(): Promise<void> {
    if (this.config.speechToText.provider === SpeechProvider.WEB_SPEECH) {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported in this browser');
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      
      this.speechRecognition.continuous = this.config.speechToText.continuous;
      this.speechRecognition.lang = this.config.speechToText.language;
      this.speechRecognition.interimResults = this.config.speechToText.interimResults;
      this.speechRecognition.maxAlternatives = this.config.speechToText.maxAlternatives || 1;
      
      this.speechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.handleSpeechResult(transcript);
      };
      
      this.speechRecognition.onerror = (event: any) => {
        this.handleError({
          code: 'SPEECH_RECOGNITION_ERROR',
          message: 'Speech recognition error',
          details: event.error,
          recoverable: true,
          suggestions: ['Check microphone permissions', 'Try speaking more clearly']
        });
      };
      
      this.speechRecognition.onend = () => {
        this.updateState({ isListening: false });
      };
    }
  }

  private async initializeSpeechSynthesis(): Promise<void> {
    if (this.config.textToSpeech.provider === SpeechProvider.WEB_SPEECH) {
      if (!('speechSynthesis' in window)) {
        throw new Error('Speech synthesis not supported in this browser');
      }
      
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  // =====================================
  // PUBLIC METHODS
  // =====================================

  async startListening(): Promise<void> {
    if (!this.state.isAvailable || this.state.isListening) {
      return;
    }

    try {
      this.updateState({ isListening: true });
      
      if (this.speechRecognition) {
        this.speechRecognition.start();
      }
    } catch (error) {
      this.updateState({ isListening: false });
      this.handleError({
        code: 'START_LISTENING_FAILED',
        message: 'Failed to start listening',
        details: error,
        recoverable: true
      });
    }
  }

  async stopListening(): Promise<void> {
    if (!this.state.isListening) {
      return;
    }

    try {
      if (this.speechRecognition) {
        this.speechRecognition.stop();
      }
      this.updateState({ isListening: false });
    } catch (error) {
      this.handleError({
        code: 'STOP_LISTENING_FAILED',
        message: 'Failed to stop listening',
        details: error,
        recoverable: true
      });
    }
  }

  async processTextInput(text: string): Promise<VoiceResponse> {
    return this.handleSpeechResult(text);
  }

  async speak(text: string): Promise<void> {
    if (this.config.responseMode === ResponseMode.TEXT) {
      return;
    }

    try {
      if (this.config.textToSpeech.provider === SpeechProvider.WEB_SPEECH) {
        await this.speakWithWebSpeech(text);
      }
    } catch (error) {
      this.handleError({
        code: 'SPEECH_SYNTHESIS_FAILED',
        message: 'Failed to speak text',
        details: error,
        recoverable: true
      });
    }
  }

  // =====================================
  // COMMAND PROCESSING
  // =====================================

  private async handleSpeechResult(transcript: string): Promise<VoiceResponse> {
    const startTime = Date.now();
    
    try {
      this.updateState({ isProcessing: true });

      const command = await this.parseCommand(transcript);
      
      // Add to command history
      const newHistory = [command, ...(this.state.commandHistory || [])].slice(0, this.config.advanced?.maxHistoryItems || 50);
      this.updateState({ commandHistory: newHistory });
      
      this.eventListeners.onCommand?.(command);
      
      const response = await this.generateResponse(command);
      
      // Add processing metadata
      response.metadata = {
        ...response.metadata,
        provider: command.provider,
        confidence: command.confidence,
        processingTime: Date.now() - startTime,
        cached: false
      };
      
      if (response.actions) {
        await this.executeActions(response.actions);
      }
      
      if (this.config.responseMode !== ResponseMode.TEXT) {
        await this.speak(response.text);
      }
      
      this.eventListeners.onResponse?.(response);
      
      this.updateState({ 
        isProcessing: false,
        currentCommand: command,
        lastResponse: response
      });
      
      return response;
    } catch (error) {
      this.updateState({ isProcessing: false });
      
      const errorResponse: VoiceResponse = {
        text: "I'm sorry, I didn't understand that. Could you try again?",
        success: false,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        suggestions: this.getSuggestedCommands()
      };
      
      this.handleError({
        code: 'PROCESSING_FAILED',
        message: 'Failed to process voice input',
        details: error,
        recoverable: true
      });
      
      return errorResponse;
    }
  }

  private async parseCommand(transcript: string): Promise<VoiceCommand> {
    const providers = [this.config.aiProviders.primary, ...(this.config.aiProviders.fallbacks || [])];
    
    for (const provider of providers) {
      if (this.state.providerStatus?.[provider.provider] === 'error') {
        continue; // Skip failed providers
      }
      
      try {
        const command = await this.parseCommandWithProvider(transcript, provider);
        if (command.confidence >= (this.config.confidenceThreshold || 0.7)) {
          return command;
        }
      } catch (error) {
        console.warn(`Provider ${provider.provider} failed:`, error);
        
        // Update provider status
        const newStatus = { ...this.state.providerStatus };
        newStatus[provider.provider] = 'error';
        this.updateState({ providerStatus: newStatus });
        
        continue; // Try next provider
      }
    }
    
    // If all AI providers fail, use keywords as ultimate fallback
    return this.parseCommandWithKeywords(transcript);
  }

  private async parseCommandWithProvider(transcript: string, provider: AIProviderConfig): Promise<VoiceCommand> {
    switch (provider.provider) {
      case AIProvider.OPENAI:
        return this.parseCommandWithOpenAI(transcript, provider as OpenAIConfig);
      case AIProvider.ANTHROPIC:
        return this.parseCommandWithAnthropic(transcript, provider as AnthropicConfig);
      case AIProvider.GOOGLE:
        return this.parseCommandWithGoogle(transcript, provider as GoogleConfig);
      case AIProvider.KEYWORDS:
        return this.parseCommandWithKeywords(transcript);
      default:
        throw new Error(`Unsupported provider: ${provider.provider}`);
    }
  }

  private async parseCommandWithOpenAI(transcript: string, config: OpenAIConfig): Promise<VoiceCommand> {
    const availableIntents = this.commandRegistry.commands.map(cmd => cmd.intent);
    
    const prompt = `
Extract the intent and entities from this workforce management voice command: "${transcript}"

Available intents: ${availableIntents.join(', ')}

Return ONLY valid JSON in this exact format:
{
  "intent": "detected_intent",
  "entities": {
    "taskName": "extracted task name if any",
    "userName": "extracted user name if any",
    "location": "extracted location if any",
    "issueType": "extracted issue type if any"
  },
  "confidence": 0.8
}

Examples:
- "clock me in" → {"intent": "clock_in", "entities": {}, "confidence": 0.9}
- "mark database cleanup as done" → {"intent": "complete_task", "entities": {"taskName": "database cleanup"}, "confidence": 0.85}
- "assign cleaning task to John" → {"intent": "assign_task", "entities": {"taskName": "cleaning task", "userName": "John"}, "confidence": 0.9}
`;

    const response = await Promise.race([
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          ...(config.organizationId && { 'OpenAI-Organization': config.organizationId })
        },
        body: JSON.stringify({
          model: config.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature || 0.1,
          max_tokens: config.maxTokens || 200
        })
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OpenAI request timeout')), this.config.aiProviders.timeoutMs || 5000)
      )
    ]) as Response;

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    const aiResponse = JSON.parse(content);

    return {
      intent: aiResponse.intent,
      entities: aiResponse.entities || {},
      confidence: aiResponse.confidence || 0.7,
      rawText: transcript,
      timestamp: new Date(),
      provider: AIProvider.OPENAI
    };
  }

  private async parseCommandWithAnthropic(transcript: string, config: AnthropicConfig): Promise<VoiceCommand> {
    const availableIntents = this.commandRegistry.commands.map(cmd => cmd.intent);
    
    const prompt = `Extract intent and entities from: "${transcript}"\nAvailable intents: ${availableIntents.join(', ')}\nReturn JSON: {"intent": "...", "entities": {...}, "confidence": 0.8}`;

    const response = await Promise.race([
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: config.model || 'claude-3-haiku-20240307',
          max_tokens: config.maxTokens || 200,
          temperature: config.temperature || 0.1,
          messages: [{ role: 'user', content: prompt }]
        })
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Anthropic request timeout')), this.config.aiProviders.timeoutMs || 5000)
      )
    ]) as Response;

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text.trim();
    
    const aiResponse = JSON.parse(content);

    return {
      intent: aiResponse.intent,
      entities: aiResponse.entities || {},
      confidence: aiResponse.confidence || 0.7,
      rawText: transcript,
      timestamp: new Date(),
      provider: AIProvider.ANTHROPIC
    };
  }

  private async parseCommandWithGoogle(transcript: string, config: GoogleConfig): Promise<VoiceCommand> {
    const availableIntents = this.commandRegistry.commands.map(cmd => cmd.intent);
    
    const prompt = `Extract intent and entities from: "${transcript}"\nAvailable intents: ${availableIntents.join(', ')}\nReturn JSON: {"intent": "...", "entities": {...}, "confidence": 0.8}`;

    const response = await Promise.race([
      fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-pro'}:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: config.temperature || 0.1,
            maxOutputTokens: config.maxOutputTokens || 200
          }
        })
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Google request timeout')), this.config.aiProviders.timeoutMs || 5000)
      )
    ]) as Response;

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text.trim();
    
    const aiResponse = JSON.parse(content);

    return {
      intent: aiResponse.intent,
      entities: aiResponse.entities || {},
      confidence: aiResponse.confidence || 0.7,
      rawText: transcript,
      timestamp: new Date(),
      provider: AIProvider.GOOGLE
    };
  }

  private parseCommandWithKeywords(transcript: string): VoiceCommand {
    const entities: Record<string, any> = {};
    let intent = 'unknown';
    let confidence = 0.3;
    
    // First try to find exact command matches
    const commandMatch = findCommandByTrigger(transcript);
    if (commandMatch) {
      intent = commandMatch.intent;
      confidence = 0.8;
      
      // Extract entities based on command validation rules
      if (commandMatch.validation?.requiredEntities?.includes('taskName')) {
        const taskMatch = transcript.match(/(?:complete|mark|finish|done)\s+(.+?)(?:\s+(?:as\s+)?(?:complete|done)|$)/i);
        if (taskMatch) {
          entities.taskName = taskMatch[1].trim();
        }
      }
      
      if (commandMatch.validation?.requiredEntities?.includes('userName')) {
        const userMatch = transcript.match(/(?:to|for)\s+([a-zA-Z\s]+)/i);
        if (userMatch) {
          entities.userName = userMatch[1].trim();
        }
      }
      
      if (commandMatch.validation?.requiredEntities?.includes('location')) {
        const locationMatch = transcript.match(/(?:at|to|in)\s+(.+)/i);
        if (locationMatch) {
          entities.location = locationMatch[1].trim();
        }
      }
    } else {
      // Fallback to basic keyword matching
      const lowerText = transcript.toLowerCase();
      
      if (lowerText.includes('clock in') || lowerText.includes('start work')) {
        intent = 'clock_in';
        confidence = 0.8;
      } else if (lowerText.includes('clock out') || lowerText.includes('end work')) {
        intent = 'clock_out';
        confidence = 0.8;
      } else if (lowerText.includes('help')) {
        intent = 'help';
        confidence = 0.9;
      }
      // Add more keyword patterns as needed
    }

    return {
      intent,
      entities,
      confidence,
      rawText: transcript,
      timestamp: new Date(),
      provider: AIProvider.KEYWORDS
    };
  }

  private async generateResponse(command: VoiceCommand): Promise<VoiceResponse> {
    const commandDef = getCommandByIntent(command.intent);
    
    if (commandDef) {
      // Use command definition response
      let responseText = commandDef.response?.text || "I'll handle that for you.";
      
      // Replace variables in response text
      if (commandDef.response?.variables) {
        responseText = this.replaceTemplateVariables(responseText, command, commandDef.response.variables);
      }
      
      return {
        text: responseText,
        success: true,
        actions: commandDef.action ? [commandDef.action] : undefined,
        suggestions: this.getSuggestedCommands()
      };
    }
    
    // Fallback responses for unknown commands
    switch (command.intent) {
      case 'help':
        return {
          text: "I can help you with time tracking, tasks, status checks, and more. Say 'show commands' to see everything I can do!",
          success: true,
          suggestions: ['show commands', 'clock in', 'get my tasks', 'project status']
        };
        
      default:
        return {
          text: "I'm not sure how to help with that. Try saying 'help' to see what I can do.",
          success: false,
          suggestions: this.getSuggestedCommands()
        };
    }
  }

  private getSuggestedCommands(): string[] {
    const commands = this.commandRegistry.commands
      .filter(cmd => cmd.examples && cmd.examples.length > 0)
      .slice(0, 4)
      .map(cmd => cmd.examples![0]);
    
    return commands.length > 0 ? commands : ['help', 'clock in', 'get status'];
  }

  // =====================================
  // UTILITY METHODS
  // =====================================

  private replaceTemplateVariables(text: string, command: VoiceCommand, variables: Record<string, string>): string {
    const allVariables = {
      timestamp: new Date().toISOString(),
      taskName: command.entities.taskName || '',
      userName: command.entities.userName || '',
      location: command.entities.location || '',
      issueType: command.entities.issueType || '',
      rawText: command.rawText,
      confidence: command.confidence.toString(),
      ...variables
    };

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return allVariables[key as keyof typeof allVariables] || match;
    });
  }

  private async executeActions(actions: any[]): Promise<void> {
    for (const action of actions) {
      try {
        if (action.type === 'api' && this.config.apiBaseUrl) {
          await this.makeApiCall(action.payload);
        } else if (action.type === 'ui') {
          this.eventListeners.onCommandExecuted?.(action, { success: true });
        }
      } catch (error) {
        console.error('Action execution failed:', action, error);
        this.eventListeners.onCommandExecuted?.(action, { success: false, error });
      }
    }
  }

  private async makeApiCall(payload: any): Promise<any> {
    if (!this.config.apiBaseUrl) {
      throw new Error('API base URL not configured. Cannot make API calls.');
    }

    // Replace template variables in endpoint
    let endpoint = payload.endpoint;
    if (payload.bodyTemplate) {
      Object.keys(payload.bodyTemplate).forEach(key => {
        const value = payload.bodyTemplate[key];
        if (typeof value === 'string' && value.includes('{{')) {
          endpoint = endpoint.replace(`{{${key}}}`, value);
        }
      });
    }

    const url = `${this.config.apiBaseUrl}${endpoint}`;
    const options: RequestInit = {
      method: payload.method || HTTPMethod.POST,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        ...(payload.headers || {})
      }
    };

    if (payload.bodyTemplate && payload.method !== HTTPMethod.GET) {
      options.body = JSON.stringify(payload.bodyTemplate);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async speakWithWebSpeech(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.rate = this.config.textToSpeech.speed || 1.0;
      utterance.pitch = this.config.textToSpeech.pitch || 1.0;
      utterance.volume = this.config.textToSpeech.volume || 1.0;
      
      if (this.config.textToSpeech.voice) {
        const voices = this.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name === this.config.textToSpeech.voice);
        if (voice) utterance.voice = voice;
      }
      
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);
      
      this.speechSynthesis.speak(utterance);
    });
  }

  private updateState(newState: Partial<VoiceAIState>): void {
    this.state = { ...this.state, ...newState };
    this.eventListeners.onStateChange?.(this.state);
  }

  private handleError(error: VoiceAIError): void {
    this.updateState({ error: error.message });
    this.eventListeners.onError?.(error);
  }

  // =====================================
  // PUBLIC API METHODS
  // =====================================

  getState(): VoiceAIState {
    return { ...this.state };
  }

  updateConfig(newConfig: Partial<VoiceAIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reinitialize command registry if commands config changed
    if (newConfig.commands) {
      this.commandRegistry = this.initializeCommandRegistry();
    }
  }

  updateContext(context: Record<string, any>): void {
    this.config.context = { ...this.config.context, ...context };
  }

  getCommandRegistry(): CommandRegistry {
    return { ...this.commandRegistry };
  }

  async switchAIProvider(provider: AIProvider): Promise<void> {
    // Find the provider config
    let providerConfig: AIProviderConfig | undefined;
    
    if (this.config.aiProviders.primary.provider === provider) {
      providerConfig = this.config.aiProviders.primary;
    } else {
      providerConfig = this.config.aiProviders.fallbacks?.find(p => p.provider === provider);
    }
    
    if (!providerConfig) {
      throw new Error(`Provider ${provider} not configured`);
    }
    
    // Test the provider
    await this.testAIProvider(providerConfig);
    
    // Update active provider
    this.updateState({ activeProvider: provider });
    this.eventListeners.onProviderSwitch?.(provider);
  }

  // Command Center Methods
  openCommandCenter(): void {
    this.updateState({ isCommandCenterOpen: true });
  }

  closeCommandCenter(): void {
    this.updateState({ isCommandCenterOpen: false });
  }

  getAvailableCommands(category?: string): CommandDefinition[] {
    if (category) {
      return this.commandRegistry.commands.filter(cmd => cmd.category === category);
    }
    return [...this.commandRegistry.commands];
  }

  async executeCommand(commandId: string, entities?: Record<string, any>): Promise<VoiceResponse> {
    const command = this.commandRegistry.commands.find(cmd => cmd.id === commandId);
    if (!command) {
      throw new Error(`Command ${commandId} not found`);
    }

    const voiceCommand: VoiceCommand = {
      intent: command.intent,
      entities: entities || {},
      confidence: 1.0,
      rawText: `Executed: ${command.name}`,
      timestamp: new Date(),
      provider: AIProvider.KEYWORDS
    };

    return this.generateResponse(voiceCommand);
  }
}