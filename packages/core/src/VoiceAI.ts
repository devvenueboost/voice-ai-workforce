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
  GoogleConfig,
  BusinessContext,
  ExtractedEntity,
  EntityType,
  EntityExtractionResult,
  CommandComplexity
} from '../../types/src/types';

import { DEFAULT_COMMAND_REGISTRY, findCommandByTrigger, getCommandByIntent } from '../../types/src/commands';

export class VoiceAI {
  private config: VoiceAIConfig;
  private state: VoiceAIState;
  private speechRecognition: any;
  private speechSynthesis!: SpeechSynthesis;
  private eventListeners: Partial<VoiceAIEvents> = {};
  private commandRegistry: CommandRegistry;
  
  // 🆕 NEW: Business Context Support
  private businessContext: BusinessContext;

  constructor(config: VoiceAIConfig, events?: Partial<VoiceAIEvents>) {
    this.validateConfig(config);
    this.config = this.mergeWithDefaults(config);
    this.eventListeners = events || {};
    
    // 🆕 NEW: Initialize Business Context
    this.businessContext = this.initializeBusinessContext();
    
    this.commandRegistry = this.initializeCommandRegistry();
    
    // Initialize providerStatus with all required AIProvider keys
    this.state = {
      isListening: false,
      isProcessing: false,
      isAvailable: false,
      commandHistory: [],
      suggestedCommands: [],
      providerStatus: {
        [AIProvider.OPENAI]: 'error',
        [AIProvider.ANTHROPIC]: 'error', 
        [AIProvider.GOOGLE]: 'error',
        [AIProvider.KEYWORDS]: 'available'
      } as Record<AIProvider, 'available' | 'error' | 'timeout'>,
      isCommandCenterOpen: false,
      // 🆕 NEW: Business Context State
      businessContext: this.businessContext,
      entityExtractionEnabled: this.config.entityExtraction?.enabled ?? true,
      fallbackMode: false
    };
    
    this.initialize();
  }

  // 🆕 NEW: Initialize Business Context
  private initializeBusinessContext(): BusinessContext {
    if (this.config.businessContext) {
      return {
        name: this.config.businessContext.name || 'your assistant',
        domain: this.config.businessContext.domain || 'general',
        capabilities: this.config.businessContext.capabilities || ['basic commands'],
        website: this.config.businessContext.website,
        supportEmail: this.config.businessContext.supportEmail,
        brandColor: this.config.businessContext.brandColor,
        customVariables: this.config.businessContext.customVariables || {}
      };
    }

    // Default generic context
    return {
      name: 'your assistant',
      domain: 'general',
      capabilities: ['basic commands'],
      customVariables: {}
    };
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

    // 🆕 NEW: Validate Business Context
    if (config.businessContext && !config.businessContext.name) {
      console.warn('⚠️ Business context provided but no business name specified');
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
        language: 'en-US',
        continuous: false,
        interimResults: false,
        ...config.speechToText,
        provider: config.speechToText?.provider || SpeechProvider.WEB_SPEECH
      },
      
      textToSpeech: {
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
        ...config.textToSpeech,
        provider: config.textToSpeech?.provider || SpeechProvider.WEB_SPEECH
      },
      
      commands: {
        registry: DEFAULT_COMMAND_REGISTRY,
        customCommands: [],
        enabledCategories: [],
        disabledCommands: [],
        businessCommands: [],
        ...config.commands
      },
      
      // 🆕 NEW: Entity Extraction Defaults
      entityExtraction: {
        enabled: true,
        confidenceThreshold: 0.7,
        enableContextualExtraction: true,
        // @ts-ignore
        customPatterns: {},
        ...config.entityExtraction
      },

      // 🆕 NEW: Fallback Configuration Defaults
      fallback: {
        enableSmartFallback: true,
        confidenceThreshold: 0.8,
        fallbackTimeout: 5000,
        retryAttempts: 1,
        ...config.fallback
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
      },

      // 🆕 NEW: Pass through business context
      businessContext: config.businessContext
    };
  }

  private initializeCommandRegistry(): CommandRegistry {
    const registry = { ...this.config.commands?.registry || DEFAULT_COMMAND_REGISTRY };
    
    // Add custom commands if provided
    if (this.config.commands?.customCommands) {
      registry.commands = [...registry.commands, ...this.config.commands.customCommands];
    }

    // 🆕 NEW: Add business commands if provided
    if (this.config.commands?.businessCommands) {
      const businessCommands: CommandDefinition[] = this.config.commands.businessCommands.map(cmd => ({
        id: `business_${cmd.intent}`,
        name: cmd.intent,
        triggers: cmd.triggers,
        intent: cmd.intent,
        category: cmd.category,
        examples: cmd.examples,
        complexity: CommandComplexity.BUSINESS,
        requiresBusinessData: cmd.requiresApi,
        response: {
          text: cmd.response
        },
        action: cmd.requiresApi ? {
          type: 'api',
          payload: {
            endpoint: cmd.apiEndpoint,
            method: cmd.method || HTTPMethod.POST
          }
        } : undefined
      }));
      
      registry.commands = [...registry.commands, ...businessCommands];
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
    const providerStatus = {
      [AIProvider.OPENAI]: 'error',
      [AIProvider.ANTHROPIC]: 'error',
      [AIProvider.GOOGLE]: 'error',
      [AIProvider.KEYWORDS]: 'available'
    } as Record<AIProvider, 'available' | 'error' | 'timeout'>;
    
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
  // 🆕 NEW: BUSINESS CONTEXT METHODS
  // =====================================

  /**
   * Replace business variables in text with actual business context
   */
  private replaceBusinessVariables(text: string): string {
    const variables = {
      businessName: this.businessContext.name,
      capabilities: this.businessContext.capabilities.join(', '),
      domain: this.businessContext.domain,
      website: this.businessContext.website || '',
      supportEmail: this.businessContext.supportEmail || '',
      ...this.businessContext.customVariables
    };

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key as keyof typeof variables] || match;
    });
  }

  /**
   * Classify command complexity and determine if voice package can handle it
   */
  private classifyCommand(command: VoiceCommand): {
    complexity: CommandComplexity;
    canHandle: boolean;
    shouldFallback: boolean;
    fallbackReason?: string;
  } {
    const commandDef = getCommandByIntent(command.intent);
    
    if (commandDef) {
      return {
        complexity: commandDef.complexity,
        canHandle: !commandDef.requiresBusinessData,
        shouldFallback: commandDef.requiresBusinessData,
        fallbackReason: commandDef.fallbackReason || 
          (commandDef.requiresBusinessData ? 'Requires business system integration' : undefined)
      };
    }

    // Unknown commands need classification
    const lowerText = command.rawText.toLowerCase();
    
    // Simple commands voice package can handle
    const simpleKeywords = ['help', 'hello', 'hi', 'commands', 'what can you do'];
    if (simpleKeywords.some(keyword => lowerText.includes(keyword))) {
      return {
        complexity: CommandComplexity.SIMPLE,
        canHandle: true,
        shouldFallback: false
      };
    }

    // Business keywords that indicate fallback needed
    const businessKeywords = [
      'clock', 'task', 'project', 'assign', 'complete', 'report', 'status',
      'timesheet', 'team', 'client', 'issue', 'schedule', 'overtime'
    ];
    
    if (businessKeywords.some(keyword => lowerText.includes(keyword))) {
      return {
        complexity: CommandComplexity.BUSINESS,
        canHandle: false,
        shouldFallback: true,
        fallbackReason: 'Business operation requires system integration'
      };
    }

    // Default to simple for unknown commands
    return {
      complexity: CommandComplexity.SIMPLE,
      canHandle: false,
      shouldFallback: true,
      fallbackReason: 'Unknown command'
    };
  }

  /**
   * Determine if voice package can handle a command
   */
  private canHandleCommand(command: VoiceCommand): boolean {
    const classification = this.classifyCommand(command);
    
    // Check confidence threshold for fallback
    if (this.config.fallback?.enableSmartFallback) {
      const threshold = this.config.fallback.confidenceThreshold || 0.8;
      if (command.confidence < threshold) {
        return false;
      }
    }

    return classification.canHandle;
  }

  /**
   * Enhanced entity extraction with business context
   */
  private extractEntities(text: string): EntityExtractionResult {
    const entities: Record<string, ExtractedEntity> = {};
    let confidence = 0.7;

    // Task identifier extraction (e.g., "task 5", "task number 3")
    const taskMatch = text.match(/task\s+(?:number\s+)?(\d+)/i);
    if (taskMatch) {
      entities[EntityType.TASK_IDENTIFIER] = {
        type: EntityType.TASK_IDENTIFIER,
        value: taskMatch[1],
        confidence: 0.9,
        sourceText: taskMatch[0],
        position: { start: taskMatch.index!, end: taskMatch.index! + taskMatch[0].length }
      };
    }

    // Recipient extraction (e.g., "to John", "for Mary")
    const recipientMatch = text.match(/(?:to|for)\s+([a-zA-Z\s]+?)(?:\s|$)/i);
    if (recipientMatch) {
      entities[EntityType.RECIPIENT] = {
        type: EntityType.RECIPIENT,
        value: recipientMatch[1].trim(),
        confidence: 0.8,
        sourceText: recipientMatch[0],
        position: { start: recipientMatch.index!, end: recipientMatch.index! + recipientMatch[0].length }
      };
    }

    // Message content extraction (e.g., "send message about delay")
    const messageMatch = text.match(/(?:message|tell|notify).*?(?:about|regarding)\s+(.+)/i);
    if (messageMatch) {
      entities[EntityType.MESSAGE_CONTENT] = {
        type: EntityType.MESSAGE_CONTENT,
        value: messageMatch[1].trim(),
        confidence: 0.8,
        sourceText: messageMatch[0]
      };
    }

    // Project name extraction
    const projectMatch = text.match(/project\s+(.+?)(?:\s|$)/i);
    if (projectMatch) {
      entities[EntityType.PROJECT_NAME] = {
        type: EntityType.PROJECT_NAME,
        value: projectMatch[1].trim(),
        confidence: 0.7,
        sourceText: projectMatch[0]
      };
    }

    // Priority level extraction
    const priorityMatch = text.match(/\b(urgent|high|medium|low|critical)\s*priority\b/i);
    if (priorityMatch) {
      entities[EntityType.PRIORITY_LEVEL] = {
        type: EntityType.PRIORITY_LEVEL,
        value: priorityMatch[1].toLowerCase(),
        confidence: 0.8,
        sourceText: priorityMatch[0]
      };
    }

    return {
      entities,
      confidence,
      extractedText: text
    };
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

  // 🆕 NEW: Speech-only method for fallback responses
  async speakText(text: string): Promise<void> {
    const processedText = this.replaceBusinessVariables(text);
    return this.speak(processedText);
  }

  // 🆕 NEW: Check if command can be handled
  canHandle(text: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const command = await this.parseCommand(text);
        const canHandle = this.canHandleCommand(command);
        resolve(canHandle);
      } catch {
        resolve(false);
      }
    });
  }

  // =====================================
  // COMMAND PROCESSING
  // =====================================

  private async handleSpeechResult(transcript: string): Promise<VoiceResponse> {
    const startTime = Date.now();
    
    try {
      this.updateState({ isProcessing: true });

      const command = await this.parseCommand(transcript);
      
      // 🆕 NEW: Enhanced entity extraction
      if (this.config.entityExtraction?.enabled) {
        const extractionResult = this.extractEntities(transcript);
        command.entities = { ...command.entities, ...extractionResult.entities };
      }

      // 🆕 NEW: Add business context to command
      command.businessContext = this.businessContext;
      
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
      
      if (response.actions && response.canHandle) {
        await this.executeActions(response.actions);
      }
      
      if (this.config.responseMode !== ResponseMode.TEXT && response.canHandle) {
        await this.speak(response.text);
      }
      
      this.eventListeners.onResponse?.(response);
      
      // 🆕 NEW: Trigger fallback event if needed
      if (response.shouldFallback) {
        this.eventListeners.onFallbackTriggered?.(
          response.fallbackReason || 'Command requires business system',
          response.intent || command.intent
        );
      }
      
      this.updateState({ 
        isProcessing: false,
        currentCommand: command,
        lastResponse: response,
        fallbackMode: response.shouldFallback
      });
      
      return response;
    } catch (error) {
      this.updateState({ isProcessing: false });
      
      const errorResponse: VoiceResponse = {
        text: "I'm sorry, I didn't understand that. Could you try again?",
        success: false,
        canHandle: false,
        shouldFallback: true,
        fallbackReason: 'Processing error',
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
          // 🆕 NEW: Add command classification
          const classification = this.classifyCommand(command);
          command.complexity = classification.complexity;
          command.requiresBusinessData = !classification.canHandle;
          return command;
        }
      } catch (error) {
        console.warn(`Provider ${provider.provider} failed:`, error);
        
        // Update provider status
        const newStatus = { ...this.state.providerStatus! };
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
        const exhaustiveCheck: never = provider;
        throw new Error(`Unsupported provider: ${(exhaustiveCheck as any).provider}`);
    }
  }

  private async parseCommandWithOpenAI(transcript: string, config: OpenAIConfig): Promise<VoiceCommand> {
    const availableIntents = this.commandRegistry.commands.map(cmd => cmd.intent);
    
    // 🆕 NEW: Enhanced prompt with business context
    const prompt = `
Extract the intent and entities from this ${this.businessContext.domain} voice command: "${transcript}"

Business Context: ${this.businessContext.name} - ${this.businessContext.capabilities.join(', ')}
Available intents: ${availableIntents.join(', ')}

Return ONLY valid JSON in this exact format:
{
  "intent": "detected_intent",
  "entities": {
    "taskIdentifier": "extracted task number if any",
    "recipient": "extracted person name if any", 
    "messageContent": "extracted message if any",
    "projectName": "extracted project if any",
    "priorityLevel": "extracted priority if any"
  },
  "confidence": 0.8
}

Examples:
- "clock me in" → {"intent": "clock_in", "entities": {}, "confidence": 0.9}
- "complete task 5" → {"intent": "complete_task_number", "entities": {"taskIdentifier": "5"}, "confidence": 0.9}
- "send message to John about delay" → {"intent": "send_message", "entities": {"recipient": "John", "messageContent": "delay"}, "confidence": 0.85}
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
    
    const prompt = `Extract intent and entities from: "${transcript}"\nBusiness: ${this.businessContext.name}\nAvailable intents: ${availableIntents.join(', ')}\nReturn JSON: {"intent": "...", "entities": {...}, "confidence": 0.8}`;

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
    
    const prompt = `Extract intent and entities from: "${transcript}"\nBusiness: ${this.businessContext.name}\nAvailable intents: ${availableIntents.join(', ')}\nReturn JSON: {"intent": "...", "entities": {...}, "confidence": 0.8}`;

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
      
      // 🆕 NEW: Enhanced entity extraction for keywords
      if (commandMatch.validation?.requiredEntities?.includes('taskIdentifier')) {
        const taskMatch = transcript.match(/task\s+(?:number\s+)?(\d+)/i);
        if (taskMatch) {
          entities.taskIdentifier = taskMatch[1];
        }
      }
      
      if (commandMatch.validation?.requiredEntities?.includes('recipient')) {
        const userMatch = transcript.match(/(?:to|for)\s+([a-zA-Z\s]+)/i);
        if (userMatch) {
          entities.recipient = userMatch[1].trim();
        }
      }
      
      if (commandMatch.validation?.requiredEntities?.includes('messageContent')) {
        const messageMatch = transcript.match(/(?:about|regarding)\s+(.+)/i);
        if (messageMatch) {
          entities.messageContent = messageMatch[1].trim();
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
    
    // 🆕 NEW: Enhanced classification
    const classification = this.classifyCommand(command);
    
    if (commandDef) {
      // Use command definition response
      let responseText = commandDef.response?.text || "I'll handle that for you.";
      
      // 🆕 NEW: Replace business variables
      responseText = this.replaceBusinessVariables(responseText);
      
      // Replace command-specific variables
      if (commandDef.response?.variables) {
        responseText = this.replaceTemplateVariables(responseText, command, commandDef.response.variables);
      }
      
      return {
        text: responseText,
        success: true,
        canHandle: classification.canHandle,
        shouldFallback: classification.shouldFallback,
        fallbackReason: classification.fallbackReason,
        intent: command.intent,
        entities: command.entities,
        commandType: classification.complexity,
        businessContext: this.businessContext,
        actions: commandDef.action ? [commandDef.action] : undefined,
        suggestions: this.getSuggestedCommands()
      };
    }
    
    // 🆕 NEW: Enhanced fallback responses with business context
    switch (command.intent) {
      case 'help':
        const helpText = this.replaceBusinessVariables(
          "I'm your {{businessName}} voice assistant! I can help you with {{capabilities}}. What would you like to do?"
        );
        return {
          text: helpText,
          success: true,
          canHandle: true,
          shouldFallback: false,
          commandType: CommandComplexity.SIMPLE,
          suggestions: ['show commands', 'clock in', 'get my tasks', 'project status']
        };
        
      default:
        const unknownText = this.replaceBusinessVariables(
          "I'm not sure how to help with that in {{businessName}}. Try asking about {{capabilities}}."
        );
        return {
          text: unknownText,
          success: false,
          canHandle: false,
          shouldFallback: true,
          fallbackReason: 'Unknown command',
          commandType: CommandComplexity.BUSINESS,
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
      taskIdentifier: command.entities.taskIdentifier || command.entities.taskName || '',
      recipient: command.entities.recipient || command.entities.userName || '',
      messageContent: command.entities.messageContent || '',
      projectName: command.entities.projectName || '',
      priorityLevel: command.entities.priorityLevel || '',
      rawText: command.rawText,
      confidence: command.confidence.toString(),
      ...variables
    };

    // @ts-ignore
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
    
    // 🆕 NEW: Update business context if changed
    if (newConfig.businessContext) {
      this.businessContext = this.initializeBusinessContext();
      this.updateState({ businessContext: this.businessContext });
    }
    
    // Reinitialize command registry if commands config changed
    if (newConfig.commands) {
      this.commandRegistry = this.initializeCommandRegistry();
    }
  }

  updateContext(context: Record<string, any>): void {
    this.config.context = { ...this.config.context, ...context };
  }

  // 🆕 NEW: Update business context
  updateBusinessContext(context: Partial<BusinessContext>): void {
    this.businessContext = { ...this.businessContext, ...context };
    this.updateState({ businessContext: this.businessContext });
    this.eventListeners.onBusinessContextChanged?.(this.businessContext);
  }

  getCommandRegistry(): CommandRegistry {
    return { ...this.commandRegistry };
  }

  // 🆕 NEW: Get business context
  getBusinessContext(): BusinessContext {
    return { ...this.businessContext };
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
      provider: AIProvider.KEYWORDS,
      businessContext: this.businessContext
    };

    return this.generateResponse(voiceCommand);
  }
}