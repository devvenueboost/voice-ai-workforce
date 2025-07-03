// packages/types/src/commands.ts

import { CommandDefinition, CommandCategory, HTTPMethod } from './types';

// =====================================
// ENHANCED COMMAND CATEGORIES
// =====================================

export const DEFAULT_CATEGORIES: CommandCategory[] = [
  {
    id: 'timesheet',
    name: 'Time Tracking',
    description: 'Advanced time management and reporting',
    icon: '⏰',
    color: '#3B82F6',
    commands: ['clock_in', 'clock_out', 'break_start', 'break_end', 'overtime_start', 'generate_timesheet', 'time_status']
  },
  {
    id: 'tasks',
    name: 'Task Management',
    description: 'Complete task operations and automation',
    icon: '✅',
    color: '#10B981',
    commands: ['complete_task', 'complete_task_number', 'start_task', 'get_tasks', 'assign_task', 'auto_assign_tasks', 'task_status']
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Generate comprehensive reports and insights',
    icon: '📈',
    color: '#8B5CF6',
    commands: ['daily_report', 'weekly_report', 'project_report', 'team_performance', 'productivity_report']
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Team communication and notifications',
    icon: '💬',
    color: '#EC4899',
    commands: ['send_message', 'report_issue', 'call_supervisor', 'team_status', 'broadcast_message', 'emergency_alert']
  },
  {
    id: 'status',
    name: 'Status & Monitoring',
    description: 'Real-time status and progress tracking',
    icon: '📊',
    color: '#F59E0B',
    commands: ['get_status', 'project_status', 'team_status', 'task_status', 'system_status']
  },
  {
    id: 'help',
    name: 'Help & Support',
    description: 'Advanced help and system information',
    icon: '❓',
    color: '#6B7280',
    commands: ['help', 'commands_list', 'tutorial', 'contact_support', 'voice_tips']
  }
];

// =====================================
// ENHANCED COMMANDS
// =====================================

export const DEFAULT_COMMANDS: CommandDefinition[] = [
  // ENHANCED HELP COMMANDS
  {
    id: 'help',
    name: 'Advanced Help',
    triggers: ['help', 'what can you do', 'commands', 'assistance', 'voice help'],
    intent: 'help',
    category: 'help',
    complexity: 'simple',
    requiresBusinessData: false,
    description: 'Get comprehensive help and available commands',
    examples: ['Help me', 'What can you do?', 'Show me voice commands'],
    response: {
      text: "I'm your {{businessName}} voice assistant! I can help you with:\n\n⏰ Time: 'Clock me in/out', 'Generate timesheet'\n✅ Tasks: 'Show my tasks', 'Complete task 5', 'Auto assign tasks'\n📈 Reports: 'Generate daily report', 'Show productivity'\n💬 Communication: 'Send message to team', 'Report issue'\n📊 Status: 'Project status', 'Task status'\n\nTry saying any command or ask 'What are my tasks?'",
      variables: { businessName: '{{businessName}}' }
    },
    action: {
      type: 'ui',
      payload: {
        component: 'command_center',
        props: { showCategories: true, highlightHelp: true }
      }
    }
  },

  // ENHANCED TIMESHEET COMMANDS
  {
    id: 'clock_in',
    name: 'Smart Clock In',
    triggers: ['clock in', 'start work', 'begin shift', 'clock me in', 'start my day', 'punch in'],
    intent: 'clock_in',
    category: 'timesheet',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Clock in with location and project detection',
    examples: ['Clock me in', 'Start work', 'Begin my shift'],
    response: {
      text: "Clocking you in to {{businessName}} now. Detecting your location and current project...",
      variables: { businessName: '{{businessName}}', timestamp: '{{timestamp}}' }
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/timesheet/clock-in',
        method: HTTPMethod.POST,
        bodyTemplate: {
          timestamp: '{{timestamp}}',
          action: 'clock_in',
          source: 'voice_ai',
          detectLocation: true,
          detectProject: true
        }
      }
    }
  },

  {
    id: 'clock_out',
    name: 'Smart Clock Out',
    triggers: ['clock out', 'end work', 'finish shift', 'clock me out', 'end my day', 'punch out'],
    intent: 'clock_out',
    category: 'timesheet',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Clock out with automatic day summary',
    examples: ['Clock me out', 'End work', 'Finish my shift'],
    response: {
      text: "Clocking you out of {{businessName}}. Generating your day summary...",
      variables: { businessName: '{{businessName}}', timestamp: '{{timestamp}}' }
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/timesheet/clock-out',
        method: HTTPMethod.POST,
        bodyTemplate: {
          timestamp: '{{timestamp}}',
          action: 'clock_out',
          source: 'voice_ai',
          generateSummary: true
        }
      }
    }
  },

  {
    id: 'generate_timesheet',
    name: 'Generate Timesheet',
    triggers: ['generate timesheet', 'create timesheet', 'show my timesheet', 'timesheet report'],
    intent: 'generate_timesheet',
    category: 'timesheet',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Generate comprehensive timesheet report',
    examples: ['Generate my timesheet', 'Show timesheet for this week', 'Create timesheet report'],
    response: {
      text: "Generating your comprehensive timesheet report with hours, projects, and productivity metrics...",
      variables: {}
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/timesheet/generate',
        method: HTTPMethod.POST,
        bodyTemplate: {
          period: 'current_week',
          includeProjects: true,
          includeProductivity: true,
          source: 'voice_ai'
        }
      }
    }
  },

  // ENHANCED TASK COMMANDS
  {
    id: 'get_tasks',
    name: 'Get My Tasks',
    triggers: ['get my tasks', 'show tasks', 'what are my tasks', 'task list', 'list my tasks', 'show my work'],
    intent: 'get_tasks',
    category: 'tasks',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Get intelligent task list with priorities and deadlines',
    examples: ['Show my tasks', 'What are my tasks today?', 'List my work'],
    response: {
      text: "Getting your current tasks with priorities, deadlines, and project assignments...",
      variables: {}
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/tasks/my-tasks',
        method: HTTPMethod.GET,
        queryParams: {
          includePriority: true,
          includeDeadlines: true,
          includeProjects: true,
          source: 'voice_ai'
        }
      }
    }
  },

  {
    id: 'complete_task_number',
    name: 'Complete Task by Number',
    triggers: ['complete task', 'finish task', 'done task', 'mark task complete', 'task done'],
    intent: 'complete_task_number',
    category: 'tasks',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Complete a specific task by number or name',
    examples: ['Complete task 5', 'Finish task number 3', 'Mark task 7 as done'],
    response: {
      text: "Completing task {{taskIdentifier}} and updating project progress...",
      variables: { taskIdentifier: '{{taskIdentifier}}', timestamp: '{{timestamp}}' }
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/tasks/complete',
        method: HTTPMethod.PUT,
        bodyTemplate: {
          taskIdentifier: '{{taskIdentifier}}',
          completedAt: '{{timestamp}}',
          source: 'voice_ai',
          updateProgress: true
        }
      }
    },
    validation: {
      requiredEntities: ['taskIdentifier']
    }
  },

  {
    id: 'auto_assign_tasks',
    name: 'Auto Assign Tasks',
    triggers: ['auto assign tasks', 'assign tasks automatically', 'smart assign', 'distribute tasks'],
    intent: 'auto_assign_tasks',
    category: 'tasks',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Automatically assign tasks based on skills and workload',
    examples: ['Auto assign new tasks', 'Smart assign tasks to team', 'Distribute tasks automatically'],
    response: {
      text: "Running intelligent task assignment based on team skills, workload, and availability...",
      variables: {}
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/tasks/auto-assign',
        method: HTTPMethod.POST,
        bodyTemplate: {
          criteria: 'skills_workload_availability',
          source: 'voice_ai',
          notifyAssignees: true
        }
      }
    }
  },

  {
    id: 'task_status',
    name: 'Task Status',
    triggers: ['task status', 'status of task', 'how is task', 'task progress'],
    intent: 'task_status',
    category: 'status',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Get detailed status of specific task',
    examples: ['Status of task 5', 'How is the foundation task?', 'Task 3 progress'],
    response: {
      text: "Getting detailed status for {{taskIdentifier}} including progress, assignee, and timeline...",
      variables: { taskIdentifier: '{{taskIdentifier}}' }
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/tasks/{{taskId}}/status',
        method: HTTPMethod.GET,
        queryParams: {
          includeProgress: true,
          includeTimeline: true,
          includeAssignee: true
        }
      }
    },
    validation: {
      requiredEntities: ['taskIdentifier']
    }
  },

  // ADVANCED REPORTING COMMANDS
  {
    id: 'daily_report',
    name: 'Generate Daily Report',
    triggers: ['generate daily report', 'daily report', 'create daily summary', 'day report'],
    intent: 'daily_report',
    category: 'reports',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Generate comprehensive daily activity and productivity report',
    examples: ['Generate daily report', 'Create today\'s summary', 'Daily productivity report'],
    response: {
      text: "Generating comprehensive daily report with productivity metrics, completed tasks, time analysis, and team performance...",
      variables: {}
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/reports/daily',
        method: HTTPMethod.POST,
        bodyTemplate: {
          date: '{{currentDate}}',
          includeProductivity: true,
          includeTasks: true,
          includeTimeAnalysis: true,
          includeTeamMetrics: true,
          source: 'voice_ai'
        }
      }
    }
  },

  {
    id: 'productivity_report',
    name: 'Productivity Analysis',
    triggers: ['productivity report', 'show productivity', 'productivity analysis', 'efficiency report'],
    intent: 'productivity_report',
    category: 'reports',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Advanced productivity analysis with trends and insights',
    examples: ['Show my productivity', 'Productivity analysis', 'How efficient am I?'],
    response: {
      text: "Analyzing your productivity patterns, efficiency trends, and performance insights...",
      variables: {}
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/reports/productivity',
        method: HTTPMethod.GET,
        queryParams: {
          period: 'week',
          includeTrends: true,
          includeComparisons: true,
          includeInsights: true
        }
      }
    }
  },

  // ENHANCED COMMUNICATION COMMANDS
  {
    id: 'send_message',
    name: 'Send Team Message',
    triggers: ['send message', 'message team', 'tell team', 'notify team', 'broadcast message'],
    intent: 'send_message',
    category: 'communication',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Send message to team or specific person',
    examples: ['Send message to team', 'Tell John about the delay', 'Notify team about meeting'],
    response: {
      text: "Sending message: '{{messageContent}}' to {{recipient}}...",
      variables: { messageContent: '{{messageContent}}', recipient: '{{recipient}}' }
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/communication/send-message',
        method: HTTPMethod.POST,
        bodyTemplate: {
          message: '{{messageContent}}',
          recipient: '{{recipient}}',
          source: 'voice_ai',
          priority: 'normal'
        }
      }
    },
    validation: {
      requiredEntities: ['messageContent', 'recipient']
    }
  },

  {
    id: 'report_issue',
    name: 'Smart Issue Reporting',
    triggers: ['report issue', 'problem found', 'there is a problem', 'issue alert', 'report problem'],
    intent: 'report_issue',
    category: 'communication',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Report issue with automatic categorization and routing',
    examples: ['Report safety issue', 'There is equipment problem', 'Issue with foundation'],
    response: {
      text: "Reporting {{issueType}} issue with automatic priority assessment and team notification...",
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
          source: 'voice_ai',
          autoAssignPriority: true,
          autoNotifyTeam: true
        }
      }
    }
  },

  // STATUS AND MONITORING COMMANDS
  {
    id: 'get_status',
    name: 'Smart Status Check',
    triggers: ['get status', 'my status', 'current status', 'work status', 'show status'],
    intent: 'get_status',
    category: 'status',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Get comprehensive work status with insights',
    examples: ['What\'s my status?', 'Show current status', 'Work status update'],
    response: {
      text: "Getting your comprehensive status including active tasks, time tracking, project progress, and team updates...",
      variables: {}
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/status/comprehensive',
        method: HTTPMethod.GET,
        queryParams: {
          includeTasks: true,
          includeTimeTracking: true,
          includeProjects: true,
          includeTeamUpdates: true
        }
      }
    }
  },

  {
    id: 'project_status',
    name: 'Project Status',
    triggers: ['project status', 'project progress', 'how is project', 'project update'],
    intent: 'project_status',
    category: 'status',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Get detailed project status with timeline and progress',
    examples: ['How is the downtown project?', 'Project status update', 'Show project progress'],
    response: {
      text: "Getting status for {{projectName}} with progress, timeline, team assignments, and upcoming milestones...",
      variables: { projectName: '{{projectName}}' }
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/projects/{{projectId}}/status',
        method: HTTPMethod.GET,
        queryParams: {
          includeProgress: true,
          includeTimeline: true,
          includeTeam: true,
          includeMilestones: true
        }
      }
    }
  },

  {
    id: 'team_status',
    name: 'Team Status',
    triggers: ['team status', 'how is my team', 'team update', 'team progress'],
    intent: 'team_status',
    category: 'status',
    complexity: 'business',
    requiresBusinessData: true,
    description: 'Get team status with availability and performance',
    examples: ['How is my team doing?', 'Team status update', 'Show team progress'],
    response: {
      text: "Getting your team's status including availability, current tasks, performance metrics, and location updates...",
      variables: {}
    },
    action: {
      type: 'api',
      payload: {
        endpoint: '/api/teams/status',
        method: HTTPMethod.GET,
        queryParams: {
          includeAvailability: true,
          includeTasks: true,
          includePerformance: true,
          includeLocations: true
        }
      }
    }
  },

  // ADVANCED HELP COMMANDS
  {
    id: 'commands_list',
    name: 'Show All Commands',
    triggers: ['show commands', 'list commands', 'what commands', 'available commands', 'voice commands'],
    intent: 'commands_list',
    category: 'help',
    complexity: 'simple',
    requiresBusinessData: false,
    description: 'Show all available voice commands by category',
    examples: ['Show all commands', 'What commands are available?', 'List voice commands'],
    response: {
      text: "Here are all available {{businessName}} voice commands organized by category. You can also use the command center for interactive exploration.",
      variables: { businessName: '{{businessName}}' }
    },
    action: {
      type: 'ui',
      payload: {
        component: 'command_center',
        props: { showCategories: true, expandAll: true }
      }
    }
  },

  {
    id: 'voice_tips',
    name: 'Voice Tips',
    triggers: ['voice tips', 'how to use voice', 'voice help', 'voice guide'],
    intent: 'voice_tips',
    category: 'help',
    complexity: 'simple',
    requiresBusinessData: false,
    description: 'Get tips for effective voice usage',
    examples: ['Voice tips', 'How to use voice commands?', 'Voice usage guide'],
    response: {
      text: "Voice Tips for {{businessName}}:\n\n🎯 Be specific: 'Complete task 5' instead of 'complete task'\n⏱️ Use natural language: 'Clock me in' or 'Start my day'\n📋 Try shortcuts: 'Status', 'Tasks', 'Report'\n🔊 Speak clearly and wait for confirmation\n💡 Say 'Help' anytime for available commands",
      variables: { businessName: '{{businessName}}' }
    }
  }
];

// =====================================
// ENHANCED COMMAND REGISTRY
// =====================================

export const DEFAULT_COMMAND_REGISTRY = {
  commands: DEFAULT_COMMANDS,
  categories: DEFAULT_CATEGORIES,
  aliases: {
    'start': 'clock_in',
    'stop': 'clock_out',
    'punch in': 'clock_in',
    'punch out': 'clock_out',
    'done': 'complete_task_number',
    'finished': 'complete_task_number',
    'complete': 'complete_task_number',
    'status': 'get_status',
    'tasks': 'get_tasks',
    'report': 'daily_report',
    'timesheet': 'generate_timesheet',
    'assign': 'auto_assign_tasks',
    'message': 'send_message',
    'issue': 'report_issue',
    'team': 'team_status',
    'project': 'project_status'
  }
};

// =====================================
// ENHANCED UTILITY FUNCTIONS
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

export function getBusinessCommands(): CommandDefinition[] {
  return DEFAULT_COMMANDS.filter(cmd => cmd.requiresBusinessData === true);
}

export function getSimpleCommands(): CommandDefinition[] {
  return DEFAULT_COMMANDS.filter(cmd => cmd.requiresBusinessData === false);
}

export function getCommandsByComplexity(complexity: 'simple' | 'business'): CommandDefinition[] {
  return DEFAULT_COMMANDS.filter(cmd => cmd.complexity === complexity);
}