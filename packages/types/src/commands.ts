// packages/types/src/commands.ts

import { CommandDefinition, CommandCategory, HTTPMethod } from './types';

// =====================================
// DEFAULT COMMAND CATEGORIES
// =====================================

export const DEFAULT_CATEGORIES: CommandCategory[] = [
  {
    id: 'timesheet',
    name: 'Time Tracking',
    description: 'Clock in/out and manage work time',
    icon: '⏰',
    color: '#3B82F6',
    commands: ['clock_in', 'clock_out', 'break_start', 'break_end', 'overtime_start']
  },
  {
    id: 'tasks',
    name: 'Task Management',
    description: 'Complete and manage tasks',
    icon: '✅',
    color: '#10B981',
    commands: ['complete_task', 'start_task', 'get_tasks', 'assign_task']
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Send messages and reports',
    icon: '💬',
    color: '#8B5CF6',
    commands: ['send_message', 'report_issue', 'call_supervisor', 'team_status']
  },
  {
    id: 'status',
    name: 'Status & Reports',
    description: 'Check status and generate reports',
    icon: '📊',
    color: '#F59E0B',
    commands: ['get_status', 'project_status', 'daily_report', 'team_report']
  },
  {
    id: 'help',
    name: 'Help & Support',
    description: 'Get help and information',
    icon: '❓',
    color: '#6B7280',
    commands: ['help', 'commands_list', 'tutorial', 'contact_support']
  }
];

// =====================================
// DEFAULT COMMANDS
// =====================================

export const DEFAULT_COMMANDS: CommandDefinition[] = [
  // TIMESHEET COMMANDS
  {
    id: 'clock_in',
    name: 'Clock In',
    triggers: ['clock in', 'start work', 'begin shift', 'clock me in'],
    intent: 'clock_in',
    category: 'timesheet',
    description: 'Start your work shift',
    examples: ['Clock me in', 'Start work', 'Begin my shift'],
    response: {
      text: "I'll clock you in now. Have a great shift!",
      variables: { timestamp: '{{timestamp}}' }
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/timesheet/clock-in',
        method: HTTPMethod.POST,
        bodyTemplate: {
          timestamp: '{{timestamp}}',
          action: 'clock_in',
          source: 'voice_ai'
        }
      }
    }
  },
  
  {
    id: 'clock_out',
    name: 'Clock Out',
    triggers: ['clock out', 'end work', 'finish shift', 'clock me out'],
    intent: 'clock_out',
    category: 'timesheet',
    description: 'End your work shift',
    examples: ['Clock me out', 'End work', 'Finish my shift'],
    response: {
      text: "I'll clock you out now. Great work today!",
      variables: { timestamp: '{{timestamp}}' }
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/timesheet/clock-out',
        method: HTTPMethod.POST,
        bodyTemplate: {
          timestamp: '{{timestamp}}',
          action: 'clock_out',
          source: 'voice_ai'
        }
      }
    }
  },

  {
    id: 'break_start',
    name: 'Start Break',
    triggers: ['start break', 'begin break', 'going on break', 'break time'],
    intent: 'break_start',
    category: 'timesheet',
    description: 'Start your break period',
    examples: ['Start my break', 'Going on break', 'Break time'],
    response: {
      text: "Starting your break now. Enjoy your time off!",
      variables: { timestamp: '{{timestamp}}' }
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/timesheet/break-start',
        method: HTTPMethod.POST,
        bodyTemplate: {
          timestamp: '{{timestamp}}',
          action: 'break_start',
          source: 'voice_ai'
        }
      }
    }
  },

  {
    id: 'break_end',
    name: 'End Break',
    triggers: ['end break', 'back from break', 'resume work', 'break over'],
    intent: 'break_end',
    category: 'timesheet',
    description: 'End your break period',
    examples: ['End my break', 'Back from break', 'Resume work'],
    response: {
      text: "Welcome back! I'll end your break now.",
      variables: { timestamp: '{{timestamp}}' }
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/timesheet/break-end',
        method: HTTPMethod.POST,
        bodyTemplate: {
          timestamp: '{{timestamp}}',
          action: 'break_end',
          source: 'voice_ai'
        }
      }
    }
  },

  // TASK COMMANDS
  {
    id: 'complete_task',
    name: 'Complete Task',
    triggers: ['complete task', 'task done', 'finished task', 'mark complete'],
    intent: 'complete_task',
    category: 'tasks',
    description: 'Mark a task as completed',
    examples: ['Complete database cleanup task', 'Mark inventory task as done'],
    response: {
      text: "I'll mark \"{{taskName}}\" as complete.",
      variables: { taskName: '{{taskName}}', timestamp: '{{timestamp}}' }
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/tasks/complete',
        method: HTTPMethod.PUT,
        bodyTemplate: {
          taskName: '{{taskName}}',
          completedAt: '{{timestamp}}',
          source: 'voice_ai'
        }
      }
    },
    validation: {
      requiredEntities: ['taskName']
    }
  },

  {
    id: 'get_tasks',
    name: 'Get My Tasks',
    triggers: ['get my tasks', 'show tasks', 'what are my tasks', 'task list'],
    intent: 'get_tasks',
    category: 'tasks',
    description: 'Get your current task list',
    examples: ['Show my tasks', 'What are my tasks today?'],
    response: {
      text: "Let me get your current tasks.",
      variables: {}
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/tasks/my-tasks',
        method: HTTPMethod.GET
      }
    }
  },

  // STATUS COMMANDS
  {
    id: 'get_status',
    name: 'Get Status',
    triggers: ['get status', 'my status', 'current status', 'work status'],
    intent: 'get_status',
    category: 'status',
    description: 'Get your current work status',
    examples: ['What\'s my status?', 'Get current status'],
    response: {
      text: "Let me check your current work status.",
      variables: {}
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/status/current',
        method: HTTPMethod.GET
      }
    }
  },

  {
    id: 'project_status',
    name: 'Project Status',
    triggers: ['project status', 'project progress', 'how is project'],
    intent: 'project_status',
    category: 'status',
    description: 'Get current project status',
    examples: ['How is the downtown project?', 'Project status update'],
    response: {
      text: "Let me get the status for {{projectName}}.",
      variables: { projectName: '{{projectName}}' }
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/projects/{{projectId}}/status',
        method: HTTPMethod.GET
      }
    }
  },

  // COMMUNICATION COMMANDS
  {
    id: 'report_issue',
    name: 'Report Issue',
    triggers: ['report issue', 'problem found', 'there is a problem', 'issue alert'],
    intent: 'report_issue',
    category: 'communication',
    description: 'Report a problem or issue',
    examples: ['Report equipment issue', 'There is a safety problem'],
    response: {
      text: "I've logged your {{issueType}} issue. Someone will follow up soon.",
      variables: { issueType: '{{issueType}}', description: '{{rawText}}' }
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/issues/report',
        method: HTTPMethod.POST,
        bodyTemplate: {
          description: '{{rawText}}',
          type: '{{issueType}}',
          reportedAt: '{{timestamp}}',
          source: 'voice_ai'
        }
      }
    }
  },

  {
    id: 'team_status',
    name: 'Team Status',
    triggers: ['team status', 'how is my team', 'team update'],
    intent: 'team_status',
    category: 'communication',
    description: 'Get your team\'s current status',
    examples: ['How is my team doing?', 'Team status update'],
    response: {
      text: "Let me get your team's current status.",
      variables: {}
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/teams/status',
        method: HTTPMethod.GET
      }
    }
  },

  // HELP COMMANDS
  {
    id: 'help',
    name: 'Help',
    triggers: ['help', 'what can you do', 'commands', 'assistance'],
    intent: 'help',
    category: 'help',
    description: 'Get help and see available commands',
    examples: ['Help me', 'What can you do?', 'Show commands'],
    response: {
      text: "I can help you with time tracking, tasks, status checks, and reporting issues. Say 'show commands' to see everything I can do!",
      variables: {}
    },
    action: {
      type: 'ui',
      payload: {
        component: 'command_center',
        props: { showCategories: true, highlightHelp: true }
      }
    }
  },

  {
    id: 'commands_list',
    name: 'Show Commands',
    triggers: ['show commands', 'list commands', 'what commands', 'available commands'],
    intent: 'commands_list',
    category: 'help',
    description: 'Show all available voice commands',
    examples: ['Show all commands', 'What commands are available?'],
    response: {
      text: "Here are all the commands I understand. You can also use the command center to explore them.",
      variables: {}
    },
    action: {
      type: 'ui',
      payload: {
        component: 'command_center',
        props: { showCategories: true, expandAll: true }
      }
    }
  }
];

// =====================================
// COMMAND REGISTRY
// =====================================

export const DEFAULT_COMMAND_REGISTRY = {
  commands: DEFAULT_COMMANDS,
  categories: DEFAULT_CATEGORIES,
  aliases: {
    'start': 'clock_in',
    'stop': 'clock_out',
    'done': 'complete_task',
    'finished': 'complete_task',
    'status': 'get_status',
    'tasks': 'get_tasks'
  }
};

// =====================================
// UTILITY FUNCTIONS
// =====================================

export function getCommandsByCategory(categoryId: string): CommandDefinition[] {
  const category = DEFAULT_CATEGORIES.find(cat => cat.id === categoryId);
  if (!category) return [];
  
  return DEFAULT_COMMANDS.filter(cmd => category.commands.includes(cmd.id));
}

export function getCommandByIntent(intent: string): CommandDefinition | undefined {
  return DEFAULT_COMMANDS.find(cmd => cmd.intent === intent);
}

export function getCommandById(id: string): CommandDefinition | undefined {
  return DEFAULT_COMMANDS.find(cmd => cmd.id === id);
}

export function findCommandByTrigger(trigger: string): CommandDefinition | undefined {
  const lowerTrigger = trigger.toLowerCase();
  return DEFAULT_COMMANDS.find(cmd => 
    cmd.triggers.some(t => lowerTrigger.includes(t.toLowerCase()))
  );
}