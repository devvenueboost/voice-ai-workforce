// packages/core/src/workforce.ts

import { VoiceAI } from './VoiceAI';
import { VoiceAIConfig, UserRole, WorkforceConfig, VoiceAIEvents } from '../../types/src/types';

// Helper function to create workforce-specific VoiceAI instances
export function createWorkforceVoiceAI(
  workforceConfig: WorkforceConfig,
  events?: Partial<VoiceAIEvents>
): VoiceAI {
  
  const config: VoiceAIConfig = {
    speechToText: {
      provider: 'web-speech' as any,
      language: 'en-US',
      continuous: false
    },
    textToSpeech: {
      provider: 'web-speech' as any,
      speed: 1.0
    },
    aiProvider: {
      provider: 'openai' as any,
      model: 'gpt-3.5-turbo'
    },
    responseMode: 'both' as any,
    context: {
      userRole: workforceConfig.userRole,
      permissions: workforceConfig.permissions,
      // @ts-ignore
      endpoints: workforceConfig.endpoints
    }
  };

  return new VoiceAI(config, events);
}

// Pre-configured settings for different user roles
export const WorkforcePresets = {
  [UserRole.ADMIN]: {
    wakeWord: 'Hey Assistant',
    autoListen: false,
    endpoints: {
      analytics: '/api/analytics',
      reports: '/api/reports',
      teamStatus: '/api/teams/status'
    }
  },
  
  [UserRole.FIELD_WORKER]: {
    wakeWord: 'Hey Workforce',
    autoListen: true,
    endpoints: {
      clockIn: '/api/timesheet/clock-in',
      clockOut: '/api/timesheet/clock-out',
      updateTask: '/api/tasks/update',
      reportIssue: '/api/issues/create'
    }
  },
  
  [UserRole.MANAGER]: {
    wakeWord: 'Hey Manager',
    autoListen: false,
    endpoints: {
      assignTask: '/api/tasks/assign',
      teamStatus: '/api/teams/status',
      projectStatus: '/api/projects/status'
    }
  },
  
  [UserRole.CLIENT]: {
    wakeWord: 'Hey Support',
    autoListen: false,
    endpoints: {
      projectStatus: '/api/client/projects/status',
      createTicket: '/api/client/support/tickets'
    }
  }
};

// Quick setup function with presets
export function createQuickWorkforceVoice(
  userRole: UserRole,
  apiBaseUrl: string,
  apiKey?: string,
  customEndpoints?: Record<string, string>
): VoiceAI {
  
  const preset = WorkforcePresets[userRole];
  
  const config: VoiceAIConfig = {
    apiBaseUrl,
    apiKey,
    speechToText: {
      provider: 'web-speech' as any,
      language: 'en-US',
      continuous: preset.autoListen
    },
    textToSpeech: {
      provider: 'web-speech' as any,
      speed: 1.0
    },
    aiProvider: {
      provider: 'openai' as any,
      model: 'gpt-3.5-turbo'
    },
    wakeWord: preset.wakeWord,
    autoListen: preset.autoListen,
    responseMode: 'both' as any,
    context: {
      userRole,
        // @ts-ignore
      endpoints: { ...preset.endpoints, ...customEndpoints }
    }
  };

  return new VoiceAI(config);
}