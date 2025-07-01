// packages/core/src/VoiceAI.ts
import { SpeechProvider, AIProvider, ResponseMode, ActionType, HTTPMethod } from '../../types/src/types';
export class VoiceAI {
    constructor(config, events) {
        this.eventListeners = {};
        this.validateConfig(config);
        this.config = this.mergeWithDefaults(config);
        this.eventListeners = events || {};
        this.state = {
            isListening: false,
            isProcessing: false,
            isAvailable: false
        };
        this.initialize();
    }
    validateConfig(config) {
        if (!config.apiBaseUrl) {
            console.warn('⚠️ No apiBaseUrl provided. API calls will fail. This should only be used for demo purposes.');
        }
        if (config.aiProvider?.provider === AIProvider.OPENAI && !config.aiProvider.apiKey) {
            console.warn('⚠️ OpenAI provider selected but no API key provided. Falling back to keyword matching.');
        }
    }
    mergeWithDefaults(config) {
        const envApiKey = typeof process !== 'undefined' ? process.env?.VOICE_AI_API_KEY : undefined;
        const envBaseUrl = typeof process !== 'undefined' ? process.env?.VOICE_AI_API_URL : undefined;
        return {
            apiBaseUrl: config.apiBaseUrl || envBaseUrl,
            apiKey: config.apiKey || envApiKey,
            speechToText: {
                ...{
                    provider: SpeechProvider.WEB_SPEECH,
                    language: 'en-US',
                    continuous: false
                },
                ...config.speechToText
            },
            textToSpeech: {
                ...{
                    provider: SpeechProvider.WEB_SPEECH,
                    speed: 1.0
                },
                ...config.textToSpeech
            },
            aiProvider: config.aiProvider ? {
                ...{
                    provider: AIProvider.OPENAI,
                    model: 'gpt-3.5-turbo'
                },
                ...config.aiProvider
            } : undefined,
            apiCalls: {
                clock_in: {
                    endpoint: '/api/timesheet/clock-in',
                    method: HTTPMethod.POST,
                    bodyTemplate: { timestamp: '{{timestamp}}', action: 'clock_in' }
                },
                clock_out: {
                    endpoint: '/api/timesheet/clock-out',
                    method: HTTPMethod.POST,
                    bodyTemplate: { timestamp: '{{timestamp}}', action: 'clock_out' }
                },
                complete_task: {
                    endpoint: '/api/tasks/complete',
                    method: HTTPMethod.PUT,
                    bodyTemplate: { taskName: '{{taskName}}', completedAt: '{{timestamp}}' }
                },
                get_status: {
                    endpoint: '/api/status',
                    method: HTTPMethod.GET
                },
                break_start: {
                    endpoint: '/api/timesheet/break-start',
                    method: HTTPMethod.POST,
                    bodyTemplate: { timestamp: '{{timestamp}}', action: 'break_start' }
                },
                break_end: {
                    endpoint: '/api/timesheet/break-end',
                    method: HTTPMethod.POST,
                    bodyTemplate: { timestamp: '{{timestamp}}', action: 'break_end' }
                },
                report_issue: {
                    endpoint: '/api/issues/report',
                    method: HTTPMethod.POST,
                    bodyTemplate: {
                        description: '{{rawText}}',
                        type: '{{issueType}}',
                        reportedAt: '{{timestamp}}'
                    }
                },
                ...config.apiCalls
            },
            wakeWord: config.wakeWord,
            autoListen: config.autoListen || false,
            responseMode: config.responseMode || ResponseMode.BOTH,
            context: config.context || {}
        };
    }
    async initialize() {
        try {
            await this.initializeSpeechRecognition();
            await this.initializeSpeechSynthesis();
            this.updateState({ isAvailable: true });
            if (this.config.autoListen) {
                await this.startListening();
            }
        }
        catch (error) {
            this.handleError({
                code: 'INITIALIZATION_FAILED',
                message: 'Failed to initialize voice services',
                details: error
            });
        }
    }
    async initializeSpeechRecognition() {
        if (this.config.speechToText.provider === SpeechProvider.WEB_SPEECH) {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                throw new Error('Speech recognition not supported in this browser');
            }
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            this.speechRecognition.continuous = this.config.speechToText.continuous;
            this.speechRecognition.lang = this.config.speechToText.language;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleSpeechResult(transcript);
            };
            this.speechRecognition.onerror = (event) => {
                this.handleError({
                    code: 'SPEECH_RECOGNITION_ERROR',
                    message: 'Speech recognition error',
                    details: event.error
                });
            };
            this.speechRecognition.onend = () => {
                this.updateState({ isListening: false });
            };
        }
    }
    async initializeSpeechSynthesis() {
        if (this.config.textToSpeech.provider === SpeechProvider.WEB_SPEECH) {
            if (!('speechSynthesis' in window)) {
                throw new Error('Speech synthesis not supported in this browser');
            }
            this.speechSynthesis = window.speechSynthesis;
        }
    }
    async startListening() {
        if (!this.state.isAvailable || this.state.isListening) {
            return;
        }
        try {
            this.updateState({ isListening: true });
            if (this.speechRecognition) {
                this.speechRecognition.start();
            }
        }
        catch (error) {
            this.updateState({ isListening: false });
            this.handleError({
                code: 'START_LISTENING_FAILED',
                message: 'Failed to start listening',
                details: error
            });
        }
    }
    async stopListening() {
        if (!this.state.isListening) {
            return;
        }
        try {
            if (this.speechRecognition) {
                this.speechRecognition.stop();
            }
            this.updateState({ isListening: false });
        }
        catch (error) {
            this.handleError({
                code: 'STOP_LISTENING_FAILED',
                message: 'Failed to stop listening',
                details: error
            });
        }
    }
    async processTextInput(text) {
        return this.handleSpeechResult(text);
    }
    async speak(text) {
        if (this.config.responseMode === ResponseMode.TEXT) {
            return;
        }
        try {
            if (this.config.textToSpeech.provider === SpeechProvider.WEB_SPEECH) {
                await this.speakWithWebSpeech(text);
            }
        }
        catch (error) {
            this.handleError({
                code: 'SPEECH_SYNTHESIS_FAILED',
                message: 'Failed to speak text',
                details: error
            });
        }
    }
    async handleSpeechResult(transcript) {
        try {
            this.updateState({ isProcessing: true });
            const command = await this.parseCommand(transcript);
            this.eventListeners.onCommand?.(command);
            const response = await this.generateResponse(command);
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
        }
        catch (error) {
            this.updateState({ isProcessing: false });
            const errorResponse = {
                text: "I'm sorry, I didn't understand that. Could you try again?",
                success: false,
                data: { error: error instanceof Error ? error.message : 'Unknown error' }
            };
            this.handleError({
                code: 'PROCESSING_FAILED',
                message: 'Failed to process voice input',
                details: error
            });
            return errorResponse;
        }
    }
    async parseCommand(transcript) {
        if (this.config.aiProvider?.provider === AIProvider.OPENAI && this.config.aiProvider.apiKey) {
            try {
                return await this.parseCommandWithOpenAI(transcript);
            }
            catch (error) {
                console.warn('OpenAI parsing failed, falling back to keyword matching:', error);
            }
        }
        return this.parseCommandWithKeywords(transcript);
    }
    async parseCommandWithOpenAI(transcript) {
        const prompt = `
Extract the intent and entities from this workforce management voice command: "${transcript}"

Available intents: clock_in, clock_out, complete_task, get_status, break_start, break_end, report_issue, help

Return ONLY valid JSON in this exact format:
{
  "intent": "detected_intent",
  "entities": {
    "taskName": "extracted task name if any",
    "issueType": "extracted issue type if any"
  },
  "confidence": 0.8
}

Examples:
- "clock me in" → {"intent": "clock_in", "entities": {}, "confidence": 0.9}
- "mark database cleanup as done" → {"intent": "complete_task", "entities": {"taskName": "database cleanup"}, "confidence": 0.85}
`;
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.aiProvider.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.config.aiProvider.model || 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                max_tokens: 200
            })
        });
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
            timestamp: new Date()
        };
    }
    parseCommandWithKeywords(transcript) {
        const entities = {};
        let intent = 'unknown';
        const lowerText = transcript.toLowerCase();
        if (lowerText.includes('clock in') || lowerText.includes('start work')) {
            intent = 'clock_in';
        }
        else if (lowerText.includes('clock out') || lowerText.includes('end work')) {
            intent = 'clock_out';
        }
        else if (lowerText.includes('break') && lowerText.includes('start')) {
            intent = 'break_start';
        }
        else if (lowerText.includes('break') && lowerText.includes('end')) {
            intent = 'break_end';
        }
        else if (lowerText.includes('complete') || lowerText.includes('done')) {
            intent = 'complete_task';
            const taskMatch = lowerText.match(/complete (.+)|mark (.+) (as )?complete|(.+) is done/);
            if (taskMatch) {
                entities.taskName = taskMatch[1] || taskMatch[2] || taskMatch[4];
            }
        }
        else if (lowerText.includes('issue') || lowerText.includes('problem')) {
            intent = 'report_issue';
            entities.issueType = 'general';
        }
        else if (lowerText.includes('status') || lowerText.includes('progress')) {
            intent = 'get_status';
        }
        else if (lowerText.includes('help')) {
            intent = 'help';
        }
        return {
            intent,
            entities,
            confidence: intent === 'unknown' ? 0.3 : 0.8,
            rawText: transcript,
            timestamp: new Date()
        };
    }
    async generateResponse(command) {
        switch (command.intent) {
            case 'help':
                return {
                    text: "I can help you with: clock in, clock out, complete tasks, start/end breaks, check status, report issues, and more. Just speak naturally!",
                    success: true
                };
            case 'clock_in':
                return {
                    text: "I'll clock you in now.",
                    success: true,
                    actions: this.createApiAction('clock_in', command)
                };
            case 'clock_out':
                return {
                    text: "I'll clock you out now. Great work today!",
                    success: true,
                    actions: this.createApiAction('clock_out', command)
                };
            case 'complete_task': {
                const taskName = command.entities.taskName || 'current task';
                return {
                    text: `I'll mark "${taskName}" as complete.`,
                    success: true,
                    actions: this.createApiAction('complete_task', command)
                };
            }
            case 'get_status':
                return {
                    text: "Let me check your current status.",
                    success: true,
                    actions: this.createApiAction('get_status', command)
                };
            case 'break_start':
                return {
                    text: "Starting your break now. Enjoy your time off!",
                    success: true,
                    actions: this.createApiAction('break_start', command)
                };
            case 'break_end':
                return {
                    text: "Welcome back! I'll end your break now.",
                    success: true,
                    actions: this.createApiAction('break_end', command)
                };
            case 'report_issue':
                return {
                    text: "I've logged your issue report. Someone will follow up with you soon.",
                    success: true,
                    actions: this.createApiAction('report_issue', command)
                };
            default:
                return {
                    text: "I'm not sure how to help with that. Try saying 'help' to see what I can do.",
                    success: false
                };
        }
    }
    createApiAction(intent, command) {
        const apiConfig = this.config.apiCalls?.[intent];
        if (!apiConfig || !this.config.apiBaseUrl) {
            return [];
        }
        let body = apiConfig.bodyTemplate ? { ...apiConfig.bodyTemplate } : {};
        body = this.replaceTemplateVariables(body, command);
        return [{
                type: ActionType.API_CALL,
                payload: {
                    endpoint: apiConfig.endpoint,
                    method: apiConfig.method,
                    data: apiConfig.method === HTTPMethod.GET ? undefined : body,
                    headers: apiConfig.headers
                }
            }];
    }
    replaceTemplateVariables(obj, command) {
        const variables = {
            timestamp: new Date().toISOString(),
            taskName: command.entities.taskName || '',
            issueType: command.entities.issueType || '',
            rawText: command.rawText,
            confidence: command.confidence.toString()
        };
        const jsonStr = JSON.stringify(obj);
        const replaced = jsonStr.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return variables[key] || match;
        });
        return JSON.parse(replaced);
    }
    async executeActions(actions) {
        for (const action of actions) {
            try {
                if (action.type === ActionType.API_CALL && this.config.apiBaseUrl) {
                    await this.makeApiCall(action.payload);
                }
            }
            catch (error) {
                console.error('Action execution failed:', action, error);
            }
        }
    }
    async makeApiCall(payload) {
        if (!this.config.apiBaseUrl) {
            throw new Error('API base URL not configured. Cannot make API calls.');
        }
        const url = `${this.config.apiBaseUrl}${payload.endpoint}`;
        const options = {
            method: payload.method || 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
                ...(payload.headers || {})
            }
        };
        if (payload.data && payload.method !== 'GET') {
            options.body = JSON.stringify(payload.data);
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    async speakWithWebSpeech(text) {
        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = this.config.textToSpeech.speed || 1.0;
            if (this.config.textToSpeech.voice) {
                const voices = this.speechSynthesis.getVoices();
                const voice = voices.find(v => v.name === this.config.textToSpeech.voice);
                if (voice)
                    utterance.voice = voice;
            }
            utterance.onend = () => resolve();
            utterance.onerror = (event) => reject(event.error);
            this.speechSynthesis.speak(utterance);
        });
    }
    updateState(newState) {
        this.state = { ...this.state, ...newState };
        this.eventListeners.onStateChange?.(this.state);
    }
    handleError(error) {
        this.updateState({ error: error.message });
        this.eventListeners.onError?.(error);
    }
    getState() {
        return { ...this.state };
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    updateContext(context) {
        this.config.context = { ...this.config.context, ...context };
    }
}
