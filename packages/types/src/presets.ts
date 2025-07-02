// packages/types/src/presets.ts

import { 
    VoiceAIConfig, 
    UserRole, 
    WorkforceConfig, 
    AIProvider, 
    SpeechProvider,
    ResponseMode,
    CommandDefinition,
    HTTPMethod
  } from './types';
  import { DEFAULT_COMMAND_REGISTRY } from './commands';
  
  // =====================================
  // ROLE-SPECIFIC COMMAND CONFIGURATIONS
  // =====================================
  
  const ADMIN_COMMANDS: CommandDefinition[] = [
    {
      id: 'team_analytics',
      name: 'Team Analytics',
      triggers: ['team analytics', 'team report', 'performance report'],
      intent: 'team_analytics',
      category: 'admin',
      description: 'Get team performance analytics',
      examples: ['Show team analytics', 'Generate performance report'],
      response: {
        text: "Generating team analytics report.",
        variables: {}
      },
      action: {
        type: 'api',
        payload: {
          endpoint: '/api/admin/analytics/team',
          method: HTTPMethod.GET
        }
      }
    },
    {
      id: 'system_status',
      name: 'System Status',
      triggers: ['system status', 'server status', 'system health'],
      intent: 'system_status',
      category: 'admin',
      description: 'Check system health and status',
      examples: ['Check system status', 'How is the server?'],
      response: {
        text: "Checking system status and health metrics.",
        variables: {}
      },
      action: {
        type: 'api',
        payload: {
          endpoint: '/api/admin/system/status',
          method: HTTPMethod.GET
        }
      }
    }
  ];
  
  const MANAGER_COMMANDS: CommandDefinition[] = [
    {
      id: 'assign_task_to_user',
      name: 'Assign Task',
      triggers: ['assign task', 'give task to', 'task for'],
      intent: 'assign_task',
      category: 'management',
      description: 'Assign a task to a team member',
      examples: ['Assign cleaning task to John', 'Give inventory task to Sarah'],
      response: {
        text: "I'll assign {{taskName}} to {{userName}}.",
        variables: { taskName: '{{taskName}}', userName: '{{userName}}' }
      },
      action: {
        type: 'api',
        payload: {
          endpoint: '/api/tasks/assign',
          method: HTTPMethod.POST,
          bodyTemplate: {
            taskName: '{{taskName}}',
            assignedTo: '{{userName}}',
            assignedBy: '{{currentUser}}',
            assignedAt: '{{timestamp}}'
          }
        }
      }
    },
    {
      id: 'team_performance',
      name: 'Team Performance',
      triggers: ['team performance', 'how is team doing', 'team metrics'],
      intent: 'team_performance',
      category: 'management',
      description: 'Get team performance metrics',
      examples: ['How is my team performing?', 'Show team metrics'],
      response: {
        text: "Getting performance metrics for your team.",
        variables: {}
      },
      action: {
        type: 'api',
        payload: {
          endpoint: '/api/manager/team/performance',
          method: HTTPMethod.GET
        }
      }
    }
  ];
  
  const FIELD_WORKER_COMMANDS: CommandDefinition[] = [
    {
      id: 'location_update',
      name: 'Update Location',
      triggers: ['update location', 'arrived at site', 'at location'],
      intent: 'location_update',
      category: 'field',
      description: 'Update your current location',
      examples: ['I arrived at the downtown site', 'Update my location'],
      response: {
        text: "I'll update your location to {{location}}.",
        variables: { location: '{{location}}' }
      },
      action: {
        type: 'api',
        payload: {
          endpoint: '/api/field/location/update',
          method: HTTPMethod.POST,
          bodyTemplate: {
            location: '{{location}}',
            timestamp: '{{timestamp}}',
            source: 'voice_ai'
          }
        }
      }
    },
    {
      id: 'equipment_status',
      name: 'Equipment Status',
      triggers: ['equipment status', 'check equipment', 'tool status'],
      intent: 'equipment_status',
      category: 'field',
      description: 'Check equipment status',
      examples: ['Check equipment status', 'How are my tools?'],
      response: {
        text: "Checking your equipment status.",
        variables: {}
      },
      action: {
        type: 'api',
        payload: {
          endpoint: '/api/field/equipment/status',
          method: HTTPMethod.GET
        }
      }
    }
  ];
  
  const CLIENT_COMMANDS: CommandDefinition[] = [
    {
      id: 'project_updates',
      name: 'Project Updates',
      triggers: ['project updates', 'project progress', 'how is my project'],
      intent: 'project_updates',
      category: 'client',
      description: 'Get updates on your projects',
      examples: ['How is my renovation project?', 'Project updates please'],
      response: {
        text: "Getting updates on your projects.",
        variables: {}
      },
      action: {
        type: 'api',
        payload: {
          endpoint: '/api/client/projects/updates',
          method: HTTPMethod.GET
        }
      }
    },
    {
      id: 'submit_feedback',
      name: 'Submit Feedback',
      triggers: ['submit feedback', 'give feedback', 'feedback about'],
      intent: 'submit_feedback',
      category: 'client',
      description: 'Submit feedback about services',
      examples: ['Submit feedback about cleaning service', 'Give feedback'],
      response: {
        text: "I'll record your feedback: {{feedback}}",
        variables: { feedback: '{{feedback}}' }
      },
      action: {
        type: 'api',
        payload: {
          endpoint: '/api/client/feedback/submit',
          method: HTTPMethod.POST,
          bodyTemplate: {
            feedback: '{{feedback}}',
            submittedAt: '{{timestamp}}',
            source: 'voice_ai'
          }
        }
      }
    }
  ];
  
  // =====================================
  // ROLE CONFIGURATIONS
  // =====================================
  
  export const ROLE_PRESETS: Record<UserRole, WorkforceConfig> = {
    [UserRole.ADMIN]: {
      userRole: UserRole.ADMIN,
      permissions: ['admin:*', 'analytics:read', 'system:read', 'team:manage'],
      endpoints: {
        analytics: '/api/admin/analytics',
        system: '/api/admin/system',
        teamManagement: '/api/admin/teams',
        userManagement: '/api/admin/users'
      },
      commands: [...DEFAULT_COMMAND_REGISTRY.commands, ...ADMIN_COMMANDS]
    },
    
    [UserRole.MANAGER]: {
      userRole: UserRole.MANAGER,
      permissions: ['team:read', 'team:assign', 'tasks:manage', 'reports:read'],
      endpoints: {
        teamStatus: '/api/manager/team/status',
        taskAssignment: '/api/manager/tasks/assign',
        performance: '/api/manager/performance',
        reports: '/api/manager/reports'
      },
      commands: [...DEFAULT_COMMAND_REGISTRY.commands, ...MANAGER_COMMANDS]
    },
    
    [UserRole.FIELD_WORKER]: {
      userRole: UserRole.FIELD_WORKER,
      permissions: ['timesheet:write', 'tasks:update', 'location:update', 'issues:report'],
      endpoints: {
        timesheet: '/api/field/timesheet',
        tasks: '/api/field/tasks',
        location: '/api/field/location',
        equipment: '/api/field/equipment',
        issues: '/api/field/issues'
      },
      commands: [...DEFAULT_COMMAND_REGISTRY.commands, ...FIELD_WORKER_COMMANDS]
    },
    
    [UserRole.CLIENT]: {
      userRole: UserRole.CLIENT,
      permissions: ['projects:read', 'feedback:write', 'support:create'],
      endpoints: {
        projects: '/api/client/projects',
        feedback: '/api/client/feedback',
        support: '/api/client/support',
        billing: '/api/client/billing'
      },
      commands: [...DEFAULT_COMMAND_REGISTRY.commands, ...CLIENT_COMMANDS]
    }
  };
  
  // =====================================
  // PRESET VOICE AI CONFIGURATIONS
  // =====================================
  
  export function createVoiceAIConfig(
    userRole: UserRole,
    options: {
      apiBaseUrl?: string;
      apiKey?: string;
      aiProvider?: 'openai' | 'anthropic' | 'google';
      aiApiKey?: string;
      theme?: 'light' | 'dark' | 'auto';
      enableAnalytics?: boolean;
    } = {}
  ): VoiceAIConfig {
    const roleConfig = ROLE_PRESETS[userRole];
    
    // Default AI provider configuration
    const getAIProviderConfig = () => {
      const provider = options.aiProvider || 'openai';
      
      switch (provider) {
        case 'openai':
          return {
            provider: AIProvider.OPENAI,
            apiKey: options.aiApiKey || '',
            model: 'gpt-3.5-turbo'
          };
        case 'anthropic':
          return {
            provider: AIProvider.ANTHROPIC,
            apiKey: options.aiApiKey || '',
            model: 'claude-3-haiku-20240307'
          };
        case 'google':
          return {
            provider: AIProvider.GOOGLE,
            apiKey: options.aiApiKey || '',
            model: 'gemini-pro'
          };
        default:
          return {
            provider: AIProvider.KEYWORDS,
            fallbackMode: true
          };
      }
    };
  
    return {
      apiBaseUrl: options.apiBaseUrl,
      apiKey: options.apiKey,
      
      aiProviders: {
        primary: getAIProviderConfig(),
        fallbacks: [
          { provider: AIProvider.KEYWORDS, fallbackMode: true }
        ],
        retryAttempts: 2,
        timeoutMs: 5000
      },
      
      speechToText: {
        provider: SpeechProvider.WEB_SPEECH,
        language: 'en-US',
        continuous: false,
        interimResults: false
      },
      
      textToSpeech: {
        provider: SpeechProvider.WEB_SPEECH,
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0
      },
      
      commands: {
        registry: {
          commands: roleConfig.commands,
          categories: DEFAULT_COMMAND_REGISTRY.categories,
          aliases: DEFAULT_COMMAND_REGISTRY.aliases
        },
        enabledCategories: getEnabledCategoriesForRole(userRole),
        disabledCommands: getDisabledCommandsForRole(userRole)
      },
      
      wakeWord: getWakeWordForRole(userRole),
      autoListen: userRole === UserRole.FIELD_WORKER, // Field workers get auto-listen
      responseMode: ResponseMode.BOTH,
      confidenceThreshold: 0.7,
      
      ui: {
        theme: options.theme || 'auto',
        position: 'left',
        showCommandHistory: true,
        showSuggestions: true,
        commandCenterWidth: 320,
        animations: true,
        sounds: false
      },
      
      context: {
        userRole: userRole,
        permissions: roleConfig.permissions,
        metadata: {
          endpoints: roleConfig.endpoints
        }
      },
      
      advanced: {
        enableAnalytics: options.enableAnalytics || false,
        enableCaching: true,
        maxHistoryItems: 50,
        enableOfflineMode: userRole === UserRole.FIELD_WORKER, // Field workers get offline mode
        debugMode: false
      }
    };
  }
  
  // =====================================
  // UTILITY FUNCTIONS
  // =====================================
  
  function getEnabledCategoriesForRole(role: UserRole): string[] {
    switch (role) {
      case UserRole.ADMIN:
        return ['timesheet', 'tasks', 'communication', 'status', 'admin', 'help'];
      case UserRole.MANAGER:
        return ['timesheet', 'tasks', 'communication', 'status', 'management', 'help'];
      case UserRole.FIELD_WORKER:
        return ['timesheet', 'tasks', 'communication', 'field', 'help'];
      case UserRole.CLIENT:
        return ['communication', 'status', 'client', 'help'];
      default:
        return ['help'];
    }
  }
  
  function getDisabledCommandsForRole(role: UserRole): string[] {
    switch (role) {
      case UserRole.CLIENT:
        return ['clock_in', 'clock_out', 'break_start', 'break_end', 'complete_task'];
      default:
        return [];
    }
  }
  
  function getWakeWordForRole(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'Hey Admin';
      case UserRole.MANAGER:
        return 'Hey Manager';
      case UserRole.FIELD_WORKER:
        return 'Hey Workforce';
      case UserRole.CLIENT:
        return 'Hey Support';
      default:
        return 'Hey Assistant';
    }
  }
  
  // =====================================
  // QUICK SETUP FUNCTIONS
  // =====================================
  
  export function createQuickVoiceAI(
    userRole: UserRole,
    apiBaseUrl: string,
    apiKey?: string,
    aiApiKey?: string
  ): VoiceAIConfig {
    return createVoiceAIConfig(userRole, {
      apiBaseUrl,
      apiKey,
      aiApiKey,
      aiProvider: 'openai',
      enableAnalytics: true
    });
  }
  
  export function createFieldWorkerVoiceAI(
    apiBaseUrl: string,
    apiKey?: string,
    aiApiKey?: string
  ): VoiceAIConfig {
    return createVoiceAIConfig(UserRole.FIELD_WORKER, {
      apiBaseUrl,
      apiKey,
      aiApiKey,
      aiProvider: 'openai',
      theme: 'auto',
      enableAnalytics: true
    });
  }
  
  export function createManagerVoiceAI(
    apiBaseUrl: string,
    apiKey?: string,
    aiApiKey?: string
  ): VoiceAIConfig {
    return createVoiceAIConfig(UserRole.MANAGER, {
      apiBaseUrl,
      apiKey,
      aiApiKey,
      aiProvider: 'anthropic',
      theme: 'light',
      enableAnalytics: true
    });
  }