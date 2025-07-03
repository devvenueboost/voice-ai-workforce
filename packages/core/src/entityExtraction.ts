// packages/core/src/entityExtraction.ts

import { 
    ExtractedEntity, 
    EntityType, 
    EntityExtractionResult,
    BusinessContext 
  } from '../../types/src/types';
  
  export interface ExtractionPattern {
    regex: RegExp;
    entityType: EntityType;
    confidence: number;
    processor?: (match: RegExpMatchArray, fullText: string) => string;
    validator?: (value: string) => boolean;
    priority: number; // Higher numbers processed first
  }
  
  export interface ExtractionConfig {
    enableAdvancedPatterns: boolean;
    enableContextualExtraction: boolean;
    enableMultipleEntityTypes: boolean;
    confidenceThreshold: number;
    maxEntitiesPerType: number;
  }
  
  /**
   * Advanced entity extraction system for voice commands
   * Extracts specific business-relevant information from natural language
   */
  export class EntityExtractor {
    private patterns: ExtractionPattern[] = [];
    private businessContext?: BusinessContext;
  
    constructor(
      businessContext?: BusinessContext,
      private config: ExtractionConfig = {
        enableAdvancedPatterns: true,
        enableContextualExtraction: true,
        enableMultipleEntityTypes: true,
        confidenceThreshold: 0.6,
        maxEntitiesPerType: 3
      }
    ) {
      this.businessContext = businessContext;
      this.initializePatterns();
    }
  
    /**
     * Initialize extraction patterns
     */
    private initializePatterns(): void {
      this.patterns = [
        // Task Identifier Patterns (highest priority)
        {
          regex: /\btask\s+(?:number\s+|#\s*)?(\d+)\b/gi,
          entityType: EntityType.TASK_IDENTIFIER,
          confidence: 0.95,
          priority: 10
        },
        {
          regex: /\b(?:complete|finish|mark|close|update)\s+(?:task\s+)?(?:number\s+|#\s*)?(\d+)\b/gi,
          entityType: EntityType.TASK_IDENTIFIER,
          confidence: 0.9,
          priority: 9
        },
        {
          regex: /\b(?:item|ticket|job)\s+(?:number\s+|#\s*)?(\d+)\b/gi,
          entityType: EntityType.TASK_IDENTIFIER,
          confidence: 0.8,
          priority: 8
        },
  
        // Task Number (simple numbers in task context)
        {
          regex: /\b(?:task|item|ticket)\s+(\d+)\b/gi,
          entityType: EntityType.TASK_NUMBER,
          confidence: 0.85,
          priority: 7
        },
  
        // Recipient Patterns
        {
          regex: /\b(?:to|for|assign\s+to|send\s+to|notify|tell)\s+([a-zA-Z][a-zA-Z\s]{1,30}?)(?:\s+(?:about|regarding|that|to)|\s*$|[,.!?])/gi,
          entityType: EntityType.RECIPIENT,
          confidence: 0.8,
          priority: 8,
          processor: (match) => this.cleanPersonName(match[1])
        },
        {
          regex: /\b(?:message|email|call|contact)\s+([a-zA-Z][a-zA-Z\s]{1,30}?)(?:\s+(?:about|regarding|and)|\s*$|[,.!?])/gi,
          entityType: EntityType.RECIPIENT,
          confidence: 0.75,
          priority: 7,
          processor: (match) => this.cleanPersonName(match[1])
        },
  
        // Message Content Patterns
        {
          regex: /\b(?:message|tell|notify|inform).*?(?:about|regarding|that|:)\s+(.+?)(?:\s+(?:to|for)\s+[a-zA-Z]|\s*$)/gi,
          entityType: EntityType.MESSAGE_CONTENT,
          confidence: 0.8,
          priority: 6,
          processor: (match) => this.cleanMessageContent(match[1])
        },
        {
          regex: /\bsay\s+"([^"]+)"/gi,
          entityType: EntityType.MESSAGE_CONTENT,
          confidence: 0.9,
          priority: 8
        },
        {
          regex: /\bsend\s+(?:a\s+)?(?:message|email|text)\s+saying\s+(.+?)(?:\s+to|\s*$)/gi,
          entityType: EntityType.MESSAGE_CONTENT,
          confidence: 0.85,
          priority: 7,
          processor: (match) => this.cleanMessageContent(match[1])
        },
  
        // Project Name Patterns
        {
          regex: /\bproject\s+(?:named\s+|called\s+)?([a-zA-Z][a-zA-Z0-9\s\-_]{1,50}?)(?:\s+(?:status|progress|update|report)|$|\s*[,.!?])/gi,
          entityType: EntityType.PROJECT_NAME,
          confidence: 0.8,
          priority: 7,
          processor: (match) => this.cleanProjectName(match[1])
        },
        {
          regex: /\b(?:on|for|in)\s+(?:the\s+)?project\s+([a-zA-Z][a-zA-Z0-9\s\-_]{1,50}?)\b/gi,
          entityType: EntityType.PROJECT_NAME,
          confidence: 0.75,
          priority: 6,
          processor: (match) => this.cleanProjectName(match[1])
        },
        {
          regex: /\b([a-zA-Z][a-zA-Z0-9\s\-_]{1,50}?)\s+project\b/gi,
          entityType: EntityType.PROJECT_NAME,
          confidence: 0.7,
          priority: 5,
          processor: (match) => this.cleanProjectName(match[1])
        },
  
        // Issue Type Patterns
        {
          regex: /\b(bug|error|issue|problem|defect|failure|malfunction)\b/gi,
          entityType: EntityType.ISSUE_TYPE,
          confidence: 0.8,
          priority: 6
        },
        {
          regex: /\b(urgent|critical|emergency|high\s+priority|immediate)\s+(?:issue|problem|bug)/gi,
          entityType: EntityType.ISSUE_TYPE,
          confidence: 0.9,
          priority: 8,
          processor: (match) => 'critical_issue'
        },
        {
          regex: /\b(safety|security|compliance|regulatory)\s+(?:issue|concern|violation|problem)/gi,
          entityType: EntityType.ISSUE_TYPE,
          confidence: 0.85,
          priority: 7,
          processor: (match) => `${match[1].toLowerCase()}_issue`
        },
  
        // Priority Level Patterns
        {
          regex: /\b(urgent|high|critical|emergency|immediate)\s*(?:priority)?\b/gi,
          entityType: EntityType.PRIORITY_LEVEL,
          confidence: 0.85,
          priority: 6,
          processor: (match) => match[1].toLowerCase()
        },
        {
          regex: /\b(low|medium|normal|standard)\s*(?:priority)?\b/gi,
          entityType: EntityType.PRIORITY_LEVEL,
          confidence: 0.75,
          priority: 5,
          processor: (match) => match[1].toLowerCase()
        },
  
        // User Name Patterns (for assignment/team operations)
        {
          regex: /\bassign.*?(?:to|for)\s+([a-zA-Z][a-zA-Z\s]{1,30}?)\b/gi,
          entityType: EntityType.USER_NAME,
          confidence: 0.8,
          priority: 7,
          processor: (match) => this.cleanPersonName(match[1])
        },
        {
          regex: /\b([a-zA-Z][a-zA-Z\s]{1,30}?)\s+(?:should|will|can)\s+(?:handle|work\s+on|take)/gi,
          entityType: EntityType.USER_NAME,
          confidence: 0.75,
          priority: 6,
          processor: (match) => this.cleanPersonName(match[1])
        },
  
        // Team Name Patterns
        {
          regex: /\b(?:team|group|department)\s+([a-zA-Z][a-zA-Z\s\-_]{1,30}?)\b/gi,
          entityType: EntityType.TEAM_NAME,
          confidence: 0.8,
          priority: 6,
          processor: (match) => this.cleanTeamName(match[1])
        },
  
        // Location Patterns
        {
          regex: /\b(?:at|in|on|from)\s+(?:the\s+)?(?:site|location|building|floor|room|area)\s+([a-zA-Z0-9][a-zA-Z0-9\s\-_]{1,30}?)\b/gi,
          entityType: EntityType.LOCATION,
          confidence: 0.75,
          priority: 5,
          processor: (match) => this.cleanLocation(match[1])
        },
  
        // Date/Time Patterns
        {
          regex: /\b(?:today|tomorrow|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
          entityType: EntityType.DATE_TIME,
          confidence: 0.8,
          priority: 6
        },
        {
          regex: /\b(?:at|by|before|after)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/gi,
          entityType: EntityType.DATE_TIME,
          confidence: 0.85,
          priority: 7
        },
        {
          regex: /\b(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/gi,
          entityType: EntityType.DATE_TIME,
          confidence: 0.9,
          priority: 8
        },
  
        // Amount/Percentage Patterns
        {
          regex: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\b/gi,
          entityType: EntityType.AMOUNT,
          confidence: 0.9,
          priority: 7
        },
        {
          regex: /\b(\d+(?:\.\d+)?)\s*(?:%|percent)\b/gi,
          entityType: EntityType.PERCENTAGE,
          confidence: 0.85,
          priority: 6
        }
      ];
  
      // Add business context-specific patterns
      if (this.businessContext) {
        this.addBusinessContextPatterns();
      }
  
      // Sort patterns by priority (highest first)
      this.patterns.sort((a, b) => b.priority - a.priority);
    }
  
    /**
     * Add business context-specific patterns
     */
    private addBusinessContextPatterns(): void {
      if (!this.businessContext) return;
  
      // Add domain-specific patterns
      const domainPatterns = this.getDomainSpecificPatterns(this.businessContext.domain);
      this.patterns.push(...domainPatterns);
  
      // Add capability-specific patterns
      this.businessContext.capabilities.forEach(capability => {
        const capabilityPatterns = this.getCapabilitySpecificPatterns(capability);
        this.patterns.push(...capabilityPatterns);
      });
    }
  
    /**
     * Get domain-specific extraction patterns
     */
    private getDomainSpecificPatterns(domain: string): ExtractionPattern[] {
      const domainPatterns: Record<string, ExtractionPattern[]> = {
        construction: [
          {
            regex: /\b(foundation|concrete|electrical|plumbing|roofing|framing)\s+(?:work|task|job|project)\b/gi,
            entityType: EntityType.ISSUE_TYPE,
            confidence: 0.8,
            priority: 7,
            processor: (match) => `${match[1].toLowerCase()}_work`
          },
          {
            regex: /\b(?:site|building|floor|level)\s+([a-zA-Z0-9\-_]{1,20})\b/gi,
            entityType: EntityType.LOCATION,
            confidence: 0.8,
            priority: 6
          }
        ],
        retail: [
          {
            regex: /\b(inventory|stock|customer|sale|refund|return)\s+(?:issue|problem|task)\b/gi,
            entityType: EntityType.ISSUE_TYPE,
            confidence: 0.8,
            priority: 7
          },
          {
            regex: /\b(?:aisle|section|department|store)\s+([a-zA-Z0-9\-_]{1,20})\b/gi,
            entityType: EntityType.LOCATION,
            confidence: 0.75,
            priority: 5
          }
        ],
        healthcare: [
          {
            regex: /\bpatient\s+([a-zA-Z][a-zA-Z\s]{1,30}?)\b/gi,
            entityType: EntityType.RECIPIENT,
            confidence: 0.8,
            priority: 7,
            processor: (match) => this.cleanPersonName(match[1])
          },
          {
            regex: /\b(?:room|ward|unit)\s+([a-zA-Z0-9\-_]{1,20})\b/gi,
            entityType: EntityType.LOCATION,
            confidence: 0.8,
            priority: 6
          }
        ]
      };
  
      return domainPatterns[domain] || [];
    }
  
    /**
     * Get capability-specific extraction patterns
     */
    private getCapabilitySpecificPatterns(capability: string): ExtractionPattern[] {
      const capabilityPatterns: Record<string, ExtractionPattern[]> = {
        'time tracking': [
          {
            regex: /\bclock\s+(?:in|out)\s+(?:for|at)\s+([a-zA-Z][a-zA-Z\s\-_]{1,30}?)\b/gi,
            entityType: EntityType.PROJECT_NAME,
            confidence: 0.8,
            priority: 7
          }
        ],
        'task management': [
          {
            regex: /\bcreate\s+(?:a\s+)?task\s+(?:for|about)\s+([^,.!?]+)/gi,
            entityType: EntityType.MESSAGE_CONTENT,
            confidence: 0.8,
            priority: 6
          }
        ]
      };
  
      return capabilityPatterns[capability] || [];
    }
  
    /**
     * Extract entities from text
     */
    extractEntities(text: string): EntityExtractionResult {
      const startTime = performance.now();
      const entities: Record<string, ExtractedEntity> = {};
      const processedRanges: Array<{start: number; end: number}> = [];
  
      // Process patterns in priority order
      for (const pattern of this.patterns) {
        if (Object.keys(entities).length >= 20) break; // Prevent excessive extraction
  
        const matches = Array.from(text.matchAll(pattern.regex));
        
        for (const match of matches) {
          if (!match.index) continue;
  
          // Check for overlapping extractions
          const start = match.index;
          const end = start + match[0].length;
          
          if (this.hasOverlap(start, end, processedRanges)) {
            continue;
          }
  
          // Process the match
          let value = match[1] || match[0];
          if (pattern.processor) {
            value = pattern.processor(match, text);
          }
  
          // Validate if validator exists
          if (pattern.validator && !pattern.validator(value)) {
            continue;
          }
  
          // Check confidence threshold
          if (pattern.confidence < this.config.confidenceThreshold) {
            continue;
          }
  
          // Create entity key (handle multiple entities of same type)
          const entityKey = this.createEntityKey(pattern.entityType, entities);
          if (!entityKey) continue; // Max entities reached
  
          entities[entityKey] = {
            type: pattern.entityType,
            value: value.trim(),
            confidence: pattern.confidence,
            sourceText: match[0],
            position: { start, end }
          };
  
          processedRanges.push({ start, end });
  
          // Break if max entities per type reached
          const typeCount = Object.values(entities).filter(e => e.type === pattern.entityType).length;
          if (typeCount >= this.config.maxEntitiesPerType) {
            break;
          }
        }
      }
  
      // Apply contextual extraction if enabled
      if (this.config.enableContextualExtraction) {
        this.applyContextualExtraction(text, entities);
      }
  
      // Calculate overall confidence
      const entityValues = Object.values(entities);
      const overallConfidence = entityValues.length > 0
        ? entityValues.reduce((sum, e) => sum + e.confidence, 0) / entityValues.length
        : 0;
  
      return {
        entities,
        confidence: overallConfidence,
        extractedText: text,
        missingRequired: this.findMissingRequiredEntities(text, entities)
      };
    }
  
    /**
     * Check for overlapping text ranges
     */
    private hasOverlap(
      start: number, 
      end: number, 
      ranges: Array<{start: number; end: number}>
    ): boolean {
      return ranges.some(range => 
        (start >= range.start && start < range.end) ||
        (end > range.start && end <= range.end) ||
        (start < range.start && end > range.end)
      );
    }
  
    /**
     * Create unique entity key for multiple entities of same type
     */
    private createEntityKey(type: EntityType, existing: Record<string, ExtractedEntity>): string | null {
      const baseKey = type;
      
      if (!existing[baseKey]) {
        return baseKey;
      }
  
      if (!this.config.enableMultipleEntityTypes) {
        return null;
      }
  
      // Find next available key
      for (let i = 2; i <= this.config.maxEntitiesPerType; i++) {
        const key = `${baseKey}_${i}`;
        if (!existing[key]) {
          return key;
        }
      }
  
      return null; // Max entities reached
    }
  
    /**
     * Apply contextual extraction for improved accuracy
     */
    private applyContextualExtraction(
      text: string, 
      entities: Record<string, ExtractedEntity>
    ): void {
      // Enhance confidence based on context
      Object.values(entities).forEach(entity => {
        const contextBonus = this.calculateContextBonus(entity, text);
        entity.confidence = Math.min(entity.confidence + contextBonus, 1.0);
      });
  
      // Extract implied entities based on existing ones
      this.extractImpliedEntities(text, entities);
    }
  
    /**
     * Calculate confidence bonus based on context
     */
    private calculateContextBonus(entity: ExtractedEntity, text: string): number {
      let bonus = 0;
      const lowerText = text.toLowerCase();
  
      // Task context bonus
      if (entity.type === EntityType.TASK_IDENTIFIER) {
        if (/\b(complete|finish|update|close|mark)\b/.test(lowerText)) {
          bonus += 0.1;
        }
      }
  
      // Message context bonus
      if (entity.type === EntityType.MESSAGE_CONTENT) {
        if (/\b(send|message|tell|notify|email)\b/.test(lowerText)) {
          bonus += 0.1;
        }
      }
  
      // Business context bonus
      if (this.businessContext) {
        this.businessContext.capabilities.forEach(capability => {
          if (lowerText.includes(capability.toLowerCase())) {
            bonus += 0.05;
          }
        });
      }
  
      return bonus;
    }
  
    /**
     * Extract implied entities based on existing extractions
     */
    private extractImpliedEntities(
      text: string, 
      entities: Record<string, ExtractedEntity>
    ): void {
      // If we have a task identifier, look for implied actions
      if (entities[EntityType.TASK_IDENTIFIER]) {
        const lowerText = text.toLowerCase();
        if (/\b(complete|finish|done)\b/.test(lowerText) && !entities[EntityType.PRIORITY_LEVEL]) {
          // Imply completion action - could add ACTION entity type if needed
        }
      }
  
      // If we have a recipient, look for implied message content
      if (entities[EntityType.RECIPIENT] && !entities[EntityType.MESSAGE_CONTENT]) {
        const aboutMatch = text.match(/\babout\s+([^,.!?]+)/i);
        if (aboutMatch) {
          entities[EntityType.MESSAGE_CONTENT] = {
            type: EntityType.MESSAGE_CONTENT,
            value: this.cleanMessageContent(aboutMatch[1]),
            confidence: 0.6,
            sourceText: aboutMatch[0]
          };
        }
      }
    }
  
    /**
     * Find missing required entities based on command context
     */
    private findMissingRequiredEntities(
      text: string, 
      entities: Record<string, ExtractedEntity>
    ): string[] {
      const missing: string[] = [];
      const lowerText = text.toLowerCase();
  
      // Task-related commands should have task identifiers
      if (/\b(complete|finish|update|close|mark).*task\b/.test(lowerText)) {
        if (!entities[EntityType.TASK_IDENTIFIER] && !entities[EntityType.TASK_NUMBER]) {
          missing.push('taskIdentifier');
        }
      }
  
      // Message commands should have recipients
      if (/\b(send|message|tell|notify|email)\b/.test(lowerText)) {
        if (!entities[EntityType.RECIPIENT]) {
          missing.push('recipient');
        }
      }
  
      // Assignment commands should have user names
      if (/\bassign\b/.test(lowerText)) {
        if (!entities[EntityType.USER_NAME] && !entities[EntityType.RECIPIENT]) {
          missing.push('assignee');
        }
      }
  
      return missing;
    }
  
    // ================================
    // TEXT PROCESSORS
    // ================================
  
    /**
     * Clean person name extraction
     */
    private cleanPersonName(name: string): string {
      return name
        .replace(/\b(mr|mrs|ms|dr|prof)\b\.?\s*/gi, '') // Remove titles
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()
        .replace(/^(the|a|an)\s+/i, ''); // Remove articles
    }
  
    /**
     * Clean message content
     */
    private cleanMessageContent(content: string): string {
      return content
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/^(that|about|regarding)\s+/i, '') // Remove prefix words
        .trim()
        .replace(/[.!?]+$/, ''); // Remove trailing punctuation
    }
  
    /**
     * Clean project name
     */
    private cleanProjectName(name: string): string {
      return name
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/^(the|a|an)\s+/i, '') // Remove articles
        .replace(/\s+(project|job|task)$/i, '') // Remove suffix words
        .trim();
    }
  
    /**
     * Clean team name
     */
    private cleanTeamName(name: string): string {
      return name
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/^(the|a|an)\s+/i, '') // Remove articles
        .replace(/\s+(team|group|department)$/i, '') // Remove suffix words
        .trim();
    }
  
    /**
     * Clean location
     */
    private cleanLocation(location: string): string {
      return location
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/^(the|a|an)\s+/i, '') // Remove articles
        .trim();
    }
  
    // ================================
    // PUBLIC METHODS
    // ================================
  
    /**
     * Update business context
     */
    updateBusinessContext(context: BusinessContext): void {
      this.businessContext = context;
      this.initializePatterns(); // Reinitialize with new context
    }
  
    /**
     * Update extraction configuration
     */
    updateConfig(config: Partial<ExtractionConfig>): void {
      this.config = { ...this.config, ...config };
    }
  
    /**
     * Add custom extraction pattern
     */
    addCustomPattern(pattern: ExtractionPattern): void {
      this.patterns.push(pattern);
      this.patterns.sort((a, b) => b.priority - a.priority);
    }
  
    /**
     * Get extraction statistics for debugging
     */
    getExtractionStats(texts: string[]): {
      totalTexts: number;
      avgEntitiesPerText: number;
      avgConfidence: number;
      entityTypeBreakdown: Record<EntityType, number>;
      mostCommonEntities: Array<{ type: EntityType; count: number }>;
    } {
      const results = texts.map(text => this.extractEntities(text));
      
      const stats = {
        totalTexts: texts.length,
        avgEntitiesPerText: 0,
        avgConfidence: 0,
        entityTypeBreakdown: {} as Record<EntityType, number>,
        mostCommonEntities: [] as Array<{ type: EntityType; count: number }>
      };
  
      if (texts.length === 0) return stats;
  
      let totalEntities = 0;
      let totalConfidence = 0;
  
      results.forEach(result => {
        const entities = Object.values(result.entities);
        totalEntities += entities.length;
        totalConfidence += result.confidence;
  
        entities.forEach(entity => {
          stats.entityTypeBreakdown[entity.type] = 
            (stats.entityTypeBreakdown[entity.type] || 0) + 1;
        });
      });
  
      stats.avgEntitiesPerText = totalEntities / texts.length;
      stats.avgConfidence = totalConfidence / texts.length;
  
      stats.mostCommonEntities = Object.entries(stats.entityTypeBreakdown)
        .map(([type, count]) => ({ type: type as EntityType, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
  
      return stats;
    }
  
    /**
     * Test extraction pattern
     */
    testPattern(pattern: ExtractionPattern, testTexts: string[]): {
      matches: number;
      avgConfidence: number;
      examples: Array<{ text: string; extracted: string; confidence: number }>;
    } {
      let matches = 0;
      let totalConfidence = 0;
      const examples: Array<{ text: string; extracted: string; confidence: number }> = [];
  
      testTexts.forEach(text => {
        const matchArray = Array.from(text.matchAll(pattern.regex));
        matchArray.forEach(match => {
          matches++;
          totalConfidence += pattern.confidence;
          
          let value = match[1] || match[0];
          if (pattern.processor) {
            value = pattern.processor(match, text);
          }
  
          examples.push({
            text,
            extracted: value,
            confidence: pattern.confidence
          });
        });
      });
  
      return {
        matches,
        avgConfidence: matches > 0 ? totalConfidence / matches : 0,
        examples: examples.slice(0, 5) // Top 5 examples
      };
    }
  }