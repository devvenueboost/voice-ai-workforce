// packages/core/src/commandClassifier.ts

import {
    VoiceCommand,
    CommandDefinition,
    CommandComplexity,
    BusinessContext,
    EntityType
  } from '../../types/src/types';
  
  export interface CommandClassification {
    complexity: CommandComplexity;
    canHandle: boolean;
    shouldFallback: boolean;
    fallbackReason?: string;
    confidence: number;
    businessRelevance: number; // 0-1 scale
    requiredEntities: EntityType[];
    detectedKeywords: string[];
  }
  
  export interface ClassificationConfig {
    confidenceThreshold: number;
    businessRelevanceThreshold: number;
    enableSmartFallback: boolean;
    strictMode: boolean; // If true, be more conservative about handling
  }
  
  /**
   * Intelligent command classifier that determines what voice package can handle
   * vs what needs business API integration
   */
  export class CommandClassifier {
    private businessKeywords: Record<string, number> = {
      // High business relevance (0.8-1.0)
      'clock': 0.9,
      'timesheet': 0.95,
      'overtime': 0.9,
      'schedule': 0.8,
      'shift': 0.9,
      'break': 0.8,
      
      // Task management (0.8-0.95)
      'task': 0.9,
      'project': 0.85,
      'assign': 0.8,
      'complete': 0.85,
      'finish': 0.8,
      'deadline': 0.8,
      'priority': 0.8,
      
      // Team and client operations (0.7-0.9)
      'team': 0.8,
      'client': 0.85,
      'customer': 0.8,
      'manager': 0.7,
      'supervisor': 0.75,
      'employee': 0.8,
      'staff': 0.8,
      
      // Reporting and analytics (0.8-0.95)
      'report': 0.85,
      'analytics': 0.8,
      'metrics': 0.8,
      'dashboard': 0.8,
      'statistics': 0.8,
      'performance': 0.85,
      
      // Quality and compliance (0.8-0.9)
      'quality': 0.8,
      'inspection': 0.85,
      'compliance': 0.8,
      'safety': 0.85,
      'audit': 0.8,
      
      // Communication (0.7-0.85)
      'message': 0.75,
      'notify': 0.7,
      'alert': 0.75,
      'email': 0.7,
      'communication': 0.75,
      
      // Financial and invoicing (0.8-0.9)
      'invoice': 0.85,
      'payment': 0.8,
      'billing': 0.8,
      'expense': 0.8,
      'budget': 0.8,
      
      // Location and field operations (0.7-0.85)
      'location': 0.75,
      'site': 0.8,
      'field': 0.8,
      'route': 0.8,
      'travel': 0.7,
      
      // Equipment and supplies (0.8-0.9)
      'equipment': 0.85,
      'supplies': 0.8,
      'inventory': 0.85,
      'maintenance': 0.8,
      'repair': 0.8
    };
  
    private simpleKeywords: Set<string> = new Set([
      'help', 'hello', 'hi', 'hey', 'thanks', 'thank you', 'goodbye', 'bye',
      'what', 'how', 'when', 'where', 'why', 'commands', 'tutorial', 'guide',
      'settings', 'preferences', 'options', 'version', 'about', 'info'
    ]);
  
    private fallbackPhrases: Record<string, string> = {
      'data_required': 'Requires access to business data',
      'complex_operation': 'Complex business operation requiring system integration',
      'user_context': 'Needs user-specific information from business system',
      'real_time_data': 'Requires real-time business data',
      'authentication': 'Requires business authentication and permissions',
      'database_operation': 'Database operation requiring business API',
      'external_integration': 'Requires integration with external business systems',
      'workflow_management': 'Complex workflow requiring business logic',
      'compliance_check': 'Compliance validation requiring business rules',
      'low_confidence': 'Low confidence in command understanding',
      'unknown_command': 'Unknown command requiring business interpretation',
      'entity_extraction_failed': 'Failed to extract required information',
      'ambiguous_request': 'Ambiguous request requiring clarification'
    };
  
    constructor(
      private businessContext: BusinessContext,
      private config: ClassificationConfig = {
        confidenceThreshold: 0.7,
        businessRelevanceThreshold: 0.6,
        enableSmartFallback: true,
        strictMode: false
      }
    ) {}
  
    /**
     * Classify a command to determine handling capability
     */
    classifyCommand(
      command: VoiceCommand, 
      commandDefinition?: CommandDefinition
    ): CommandClassification {
      
      // Start with command definition if available
      if (commandDefinition) {
        return this.classifyDefinedCommand(command, commandDefinition);
      }
  
      // Analyze unknown command
      return this.classifyUnknownCommand(command);
    }
  
    /**
     * Classify a command with known definition
     */
    private classifyDefinedCommand(
      command: VoiceCommand,
      commandDef: CommandDefinition
    ): CommandClassification {
      
      const baseClassification: CommandClassification = {
        complexity: commandDef.complexity,
        canHandle: !commandDef.requiresBusinessData,
        shouldFallback: commandDef.requiresBusinessData,
        fallbackReason: commandDef.fallbackReason,
        confidence: command.confidence,
        businessRelevance: this.calculateBusinessRelevance(command.rawText),
        requiredEntities: commandDef.entityRequirements || [],
        detectedKeywords: this.detectKeywords(command.rawText)
      };
  
      // Apply confidence-based adjustments
      if (this.config.enableSmartFallback) {
        return this.applySmartFallback(baseClassification, command);
      }
  
      return baseClassification;
    }
  
    /**
     * Classify an unknown command
     */
    private classifyUnknownCommand(command: VoiceCommand): CommandClassification {
      const text = command.rawText.toLowerCase();
      const detectedKeywords = this.detectKeywords(text);
      const businessRelevance = this.calculateBusinessRelevance(text);
      
      // Simple commands that voice package can handle
      if (this.isSimpleCommand(text)) {
        return {
          complexity: CommandComplexity.SIMPLE,
          canHandle: true,
          shouldFallback: false,
          confidence: Math.max(command.confidence, 0.8),
          businessRelevance,
          requiredEntities: [],
          detectedKeywords
        };
      }
  
      // Business commands that need fallback
      if (businessRelevance >= this.config.businessRelevanceThreshold) {
        return {
          complexity: CommandComplexity.BUSINESS,
          canHandle: false,
          shouldFallback: true,
          fallbackReason: this.determineFallbackReason(text, businessRelevance, command.confidence),
          confidence: command.confidence,
          businessRelevance,
          requiredEntities: this.detectRequiredEntities(text),
          detectedKeywords
        };
      }
  
      // Low confidence or ambiguous commands
      return {
        complexity: CommandComplexity.SIMPLE,
        canHandle: false,
        shouldFallback: true,
        fallbackReason: command.confidence < this.config.confidenceThreshold 
          ? this.fallbackPhrases.low_confidence 
          : this.fallbackPhrases.unknown_command,
        confidence: command.confidence,
        businessRelevance,
        requiredEntities: [],
        detectedKeywords
      };
    }
  
    /**
     * Apply smart fallback logic based on confidence and context
     */
    private applySmartFallback(
      classification: CommandClassification,
      command: VoiceCommand
    ): CommandClassification {
      
      // If confidence is too low, force fallback
      if (command.confidence < this.config.confidenceThreshold) {
        return {
          ...classification,
          canHandle: false,
          shouldFallback: true,
          fallbackReason: this.fallbackPhrases.low_confidence
        };
      }
  
      // If in strict mode, be more conservative
      if (this.config.strictMode && classification.businessRelevance > 0.5) {
        return {
          ...classification,
          canHandle: false,
          shouldFallback: true,
          fallbackReason: this.fallbackPhrases.complex_operation
        };
      }
  
      // Check for missing required entities
      if (classification.requiredEntities.length > 0) {
        const extractedEntities = Object.keys(command.entities);
        const missingEntities = classification.requiredEntities.filter(
          entity => !extractedEntities.includes(entity)
        );
        
        if (missingEntities.length > 0) {
          return {
            ...classification,
            canHandle: false,
            shouldFallback: true,
            fallbackReason: this.fallbackPhrases.entity_extraction_failed
          };
        }
      }
  
      return classification;
    }
  
    /**
     * Calculate business relevance score (0-1)
     */
    private calculateBusinessRelevance(text: string): number {
      const words = text.toLowerCase().split(/\s+/);
      let totalRelevance = 0;
      let relevantWordCount = 0;
  
      for (const word of words) {
        if (this.businessKeywords[word]) {
          totalRelevance += this.businessKeywords[word];
          relevantWordCount++;
        }
      }
  
      if (relevantWordCount === 0) return 0;
      
      // Average relevance with bonus for multiple business words
      const avgRelevance = totalRelevance / relevantWordCount;
      const densityBonus = Math.min(relevantWordCount / words.length, 0.3);
      
      return Math.min(avgRelevance + densityBonus, 1.0);
    }
  
    /**
     * Detect keywords in text
     */
    private detectKeywords(text: string): string[] {
      const words = text.toLowerCase().split(/\s+/);
      const detected: string[] = [];
  
      for (const word of words) {
        if (this.businessKeywords[word] || this.simpleKeywords.has(word)) {
          detected.push(word);
        }
      }
  
      return detected;
    }
  
    /**
     * Check if command is simple and can be handled by voice package
     */
    private isSimpleCommand(text: string): boolean {
      const words = text.toLowerCase().split(/\s+/);
      
      // Check for simple keyword patterns
      const hasSimpleKeywords = words.some(word => this.simpleKeywords.has(word));
      
      // Check for help patterns
      const isHelpPattern = /\b(help|what.*do|show.*command|how.*work)\b/i.test(text);
      
      // Check for greeting patterns
      const isGreeting = /\b(hi|hello|hey|good\s+(morning|afternoon|evening))\b/i.test(text);
      
      return hasSimpleKeywords || isHelpPattern || isGreeting;
    }
  
    /**
     * Detect what entities are likely required for this command
     */
    private detectRequiredEntities(text: string): EntityType[] {
      const entities: EntityType[] = [];
      const lowerText = text.toLowerCase();
  
      // Task-related commands
      if (/\b(task|complete|finish|assign)\b/.test(lowerText)) {
        entities.push(EntityType.TASK_IDENTIFIER);
      }
  
      // Message/communication commands
      if (/\b(message|tell|notify|send)\b/.test(lowerText)) {
        entities.push(EntityType.RECIPIENT, EntityType.MESSAGE_CONTENT);
      }
  
      // Project commands
      if (/\bproject\b/.test(lowerText)) {
        entities.push(EntityType.PROJECT_NAME);
      }
  
      // Priority-related commands
      if (/\b(priority|urgent|important)\b/.test(lowerText)) {
        entities.push(EntityType.PRIORITY_LEVEL);
      }
  
      // Time-related commands
      if (/\b(schedule|time|date|when)\b/.test(lowerText)) {
        entities.push(EntityType.DATE_TIME);
      }
  
      return entities;
    }
  
    /**
     * Determine specific fallback reason based on analysis
     */
    private determineFallbackReason(
      text: string, 
      businessRelevance: number, 
      confidence: number
    ): string {
      
      // Low confidence
      if (confidence < this.config.confidenceThreshold) {
        return this.fallbackPhrases.low_confidence;
      }
  
      // High business relevance patterns
      if (businessRelevance > 0.8) {
        if (/\b(clock|timesheet|schedule)\b/i.test(text)) {
          return this.fallbackPhrases.real_time_data;
        }
        if (/\b(assign|project|task)\b/i.test(text)) {
          return this.fallbackPhrases.workflow_management;
        }
        if (/\b(report|analytics|metrics)\b/i.test(text)) {
          return this.fallbackPhrases.database_operation;
        }
        if (/\b(user|employee|staff|team)\b/i.test(text)) {
          return this.fallbackPhrases.user_context;
        }
      }
  
      // Medium business relevance
      if (businessRelevance > 0.6) {
        return this.fallbackPhrases.complex_operation;
      }
  
      // Default fallback
      return this.fallbackPhrases.data_required;
    }
  
    /**
     * Update business keywords based on business context
     */
    updateBusinessContext(context: BusinessContext): void {
      this.businessContext = context;
      
      // Add domain-specific keywords
      this.addDomainKeywords(context.domain);
      
      // Add capability-specific keywords
      context.capabilities.forEach(capability => {
        this.addCapabilityKeywords(capability);
      });
    }
  
    /**
     * Add domain-specific keywords
     */
    private addDomainKeywords(domain: string): void {
      const domainKeywords: Record<string, Record<string, number>> = {
        construction: {
          'foundation': 0.8,
          'concrete': 0.8,
          'blueprint': 0.8,
          'contractor': 0.8,
          'building': 0.8,
          'permit': 0.8,
          'materials': 0.8,
          'crane': 0.8,
          'scaffold': 0.8
        },
        retail: {
          'customer': 0.9,
          'sale': 0.9,
          'inventory': 0.9,
          'product': 0.8,
          'checkout': 0.8,
          'register': 0.8,
          'discount': 0.8,
          'refund': 0.8
        },
        healthcare: {
          'patient': 0.9,
          'appointment': 0.9,
          'medical': 0.8,
          'treatment': 0.8,
          'diagnosis': 0.8,
          'prescription': 0.8,
          'clinic': 0.8
        },
        manufacturing: {
          'production': 0.9,
          'assembly': 0.8,
          'quality': 0.9,
          'machine': 0.8,
          'operator': 0.8,
          'shift': 0.9,
          'output': 0.8
        }
      };
  
      const keywords = domainKeywords[domain];
      if (keywords) {
        Object.assign(this.businessKeywords, keywords);
      }
    }
  
    /**
     * Add capability-specific keywords
     */
    private addCapabilityKeywords(capability: string): void {
      const capabilityKeywords: Record<string, Record<string, number>> = {
        'time tracking': {
          'clock': 0.95,
          'time': 0.9,
          'hours': 0.9,
          'overtime': 0.9,
          'break': 0.8,
          'shift': 0.9
        },
        'task management': {
          'task': 0.95,
          'todo': 0.9,
          'complete': 0.9,
          'assign': 0.9,
          'deadline': 0.8,
          'priority': 0.8
        },
        'project management': {
          'project': 0.95,
          'milestone': 0.8,
          'progress': 0.8,
          'status': 0.8,
          'timeline': 0.8
        },
        'team coordination': {
          'team': 0.9,
          'member': 0.8,
          'leader': 0.8,
          'meeting': 0.8,
          'collaboration': 0.8
        }
      };
  
      const keywords = capabilityKeywords[capability];
      if (keywords) {
        Object.assign(this.businessKeywords, keywords);
      }
    }
  
    /**
     * Get classification statistics for debugging
     */
    getClassificationStats(commands: VoiceCommand[]): {
      totalCommands: number;
      canHandle: number;
      shouldFallback: number;
      avgConfidence: number;
      avgBusinessRelevance: number;
      complexityBreakdown: Record<CommandComplexity, number>;
      topFallbackReasons: Array<{ reason: string; count: number }>;
    } {
      const classifications = commands.map(cmd => this.classifyCommand(cmd));
      
      const stats = {
        totalCommands: commands.length,
        canHandle: classifications.filter(c => c.canHandle).length,
        shouldFallback: classifications.filter(c => c.shouldFallback).length,
        avgConfidence: classifications.reduce((sum, c) => sum + c.confidence, 0) / commands.length,
        avgBusinessRelevance: classifications.reduce((sum, c) => sum + c.businessRelevance, 0) / commands.length,
        complexityBreakdown: {
          [CommandComplexity.SIMPLE]: 0,
          [CommandComplexity.BUSINESS]: 0,
          [CommandComplexity.HYBRID]: 0
        },
        topFallbackReasons: [] as Array<{ reason: string; count: number }>
      };
  
      // Count complexity breakdown
      classifications.forEach(c => {
        stats.complexityBreakdown[c.complexity]++;
      });
  
      // Count fallback reasons
      const reasonCounts: Record<string, number> = {};
      classifications
        .filter(c => c.fallbackReason)
        .forEach(c => {
          const reason = c.fallbackReason!;
          reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        });
  
      stats.topFallbackReasons = Object.entries(reasonCounts)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
  
      return stats;
    }
  
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<ClassificationConfig>): void {
      this.config = { ...this.config, ...newConfig };
    }
  
    /**
     * Add custom business keywords
     */
    addCustomKeywords(keywords: Record<string, number>): void {
      Object.assign(this.businessKeywords, keywords);
    }
  
    /**
     * Get current business keywords
     */
    getBusinessKeywords(): Record<string, number> {
      return { ...this.businessKeywords };
    }
  }