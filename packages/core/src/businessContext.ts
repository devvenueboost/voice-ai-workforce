// packages/core/src/businessContext.ts

import { BusinessContext } from '../../types/src/types';

export interface BusinessContextValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completeness: number; // 0-1 scale
}

export interface VariableReplacementOptions {
  preserveUnknownVariables?: boolean;
  caseSensitive?: boolean;
  customVariables?: Record<string, string>;
  enableNestedVariables?: boolean;
}

export interface ContextMetrics {
  variablesUsed: string[];
  replacementCount: number;
  unreplacedVariables: string[];
  processingTime: number;
}

/**
 * Business context manager that handles business-specific branding
 * and context injection into voice AI responses
 */
export class BusinessContextManager {
  private context: BusinessContext;
  private cachedVariables: Record<string, string> = {};
  private variablePattern = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;

  constructor(context?: BusinessContext) {
    this.context = context || this.getDefaultContext();
    this.updateVariableCache();
  }

  /**
   * Get default business context for fallback
   */
  private getDefaultContext(): BusinessContext {
    return {
      name: 'your assistant',
      domain: 'general',
      capabilities: ['basic commands', 'help', 'information'],
      website: '',
      supportEmail: '',
      brandColor: '#3B82F6',
      customVariables: {}
    };
  }

  /**
   * Update business context
   */
  updateContext(newContext: Partial<BusinessContext>): void {
    this.context = { ...this.context, ...newContext };
    this.updateVariableCache();
  }

  /**
   * Get current business context
   */
  getContext(): BusinessContext {
    return { ...this.context };
  }

  /**
   * Update cached variables for performance
   */
  private updateVariableCache(): void {
    this.cachedVariables = {
      // Core business variables
      businessName: this.context.name,
      companyName: this.context.name,
      organizationName: this.context.name,
      
      // Business details
      domain: this.context.domain,
      industry: this.context.domain,
      
      // Capabilities
      capabilities: this.context.capabilities.join(', '),
      capabilitiesList: this.context.capabilities.join(', '),
      primaryCapability: this.context.capabilities[0] || 'general assistance',
      capabilityCount: this.context.capabilities.length.toString(),
      
      // Contact information
      website: this.context.website || '',
      supportEmail: this.context.supportEmail || '',
      
      // Branding
      brandColor: this.context.brandColor || '#3B82F6',
      
      // Time-based variables
      currentDate: new Date().toLocaleDateString(),
      currentTime: new Date().toLocaleTimeString(),
      currentYear: new Date().getFullYear().toString(),
      
      // Formatting variations
      businessNameUpper: this.context.name.toUpperCase(),
      businessNameLower: this.context.name.toLowerCase(),
      businessNameTitle: this.toTitleCase(this.context.name),
      
      // Custom variables from context
      ...this.context.customVariables
    };
  }

  /**
   * Replace variables in text with business context values
   */
  replaceVariables(
    text: string, 
    options: VariableReplacementOptions = {}
  ): {
    result: string;
    metrics: ContextMetrics;
  } {
    const startTime = performance.now();
    let result = text;
    const variablesUsed: string[] = [];
    const unreplacedVariables: string[] = [];
    let replacementCount = 0;

    // Merge custom variables with cached variables
    const allVariables = {
      ...this.cachedVariables,
      ...options.customVariables
    };

    // Handle case sensitivity
    const pattern = options.caseSensitive !== false 
      ? this.variablePattern 
      : new RegExp(this.variablePattern.source, 'gi');

    result = result.replace(pattern, (match, variableName) => {
      const key = options.caseSensitive !== false 
        ? variableName 
        : this.findCaseInsensitiveKey(variableName, allVariables);

      if (key && allVariables[key] !== undefined) {
        variablesUsed.push(variableName);
        replacementCount++;
        
        let value = allVariables[key];
        
        // Handle nested variables if enabled
        if (options.enableNestedVariables && value.includes('{{')) {
          const nestedResult = this.replaceVariables(value, {
            ...options,
            enableNestedVariables: false // Prevent infinite recursion
          });
          value = nestedResult.result;
        }
        
        return value;
      } else {
        unreplacedVariables.push(variableName);
        
        // Preserve unknown variables if requested
        return options.preserveUnknownVariables !== false ? match : '';
      }
    });

    const metrics: ContextMetrics = {
      variablesUsed: [...new Set(variablesUsed)],
      replacementCount,
      unreplacedVariables: [...new Set(unreplacedVariables)],
      processingTime: performance.now() - startTime
    };

    return { result, metrics };
  }

  /**
   * Find case-insensitive key match
   */
  private findCaseInsensitiveKey(
    targetKey: string, 
    variables: Record<string, string>
  ): string | undefined {
    const lowerTarget = targetKey.toLowerCase();
    return Object.keys(variables).find(key => 
      key.toLowerCase() === lowerTarget
    );
  }

  /**
   * Convert string to title case
   */
  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Validate business context completeness and validity
   */
  validateContext(context?: BusinessContext): BusinessContextValidation {
    const ctx = context || this.context;
    const errors: string[] = [];
    const warnings: string[] = [];
    let completeness = 0;

    // Required fields validation
    if (!ctx.name || ctx.name.trim() === '') {
      errors.push('Business name is required');
    } else {
      completeness += 0.3;
    }

    if (!ctx.domain || ctx.domain.trim() === '') {
      errors.push('Business domain is required');
    } else {
      completeness += 0.2;
    }

    if (!ctx.capabilities || ctx.capabilities.length === 0) {
      errors.push('At least one capability is required');
    } else {
      completeness += 0.2;
    }

    // Optional fields that improve completeness
    if (ctx.website && ctx.website.trim() !== '') {
      completeness += 0.1;
    } else {
      warnings.push('Website not provided - some features may be limited');
    }

    if (ctx.supportEmail && ctx.supportEmail.trim() !== '') {
      completeness += 0.1;
    } else {
      warnings.push('Support email not provided - contact features may be limited');
    }

    if (ctx.brandColor && ctx.brandColor.trim() !== '') {
      completeness += 0.1;
    } else {
      warnings.push('Brand color not provided - using default styling');
    }

    // Validation rules
    if (ctx.name && ctx.name.length > 100) {
      warnings.push('Business name is very long - consider shortening for better UX');
    }

    if (ctx.capabilities && ctx.capabilities.length > 10) {
      warnings.push('Too many capabilities listed - consider grouping for better clarity');
    }

    if (ctx.website && !this.isValidUrl(ctx.website)) {
      warnings.push('Website URL appears to be invalid');
    }

    if (ctx.supportEmail && !this.isValidEmail(ctx.supportEmail)) {
      warnings.push('Support email appears to be invalid');
    }

    if (ctx.brandColor && !this.isValidColor(ctx.brandColor)) {
      warnings.push('Brand color appears to be invalid - using default');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness: Math.min(completeness, 1.0)
    };
  }

  /**
   * Simple URL validation
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Simple email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Simple color validation (hex, rgb, named colors)
   */
  private isValidColor(color: string): boolean {
    // Hex colors
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true;
    }
    
    // RGB/RGBA colors
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+)?\s*\)$/.test(color)) {
      return true;
    }
    
    // Named colors (basic set)
    const namedColors = [
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
      'black', 'white', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy'
    ];
    
    return namedColors.includes(color.toLowerCase());
  }

  /**
   * Generate business context presets for common industries
   */
  static getPresetContext(industry: string): BusinessContext {
    const presets: Record<string, BusinessContext> = {
      construction: {
        name: 'Construction Manager',
        domain: 'construction',
        capabilities: [
          'time tracking',
          'project management', 
          'team coordination',
          'safety compliance',
          'quality control'
        ],
        brandColor: '#F59E0B',
        customVariables: {
          industry: 'construction',
          workType: 'field operations',
          safetyFocus: 'workplace safety'
        }
      },

      retail: {
        name: 'Retail Assistant',
        domain: 'retail',
        capabilities: [
          'customer service',
          'inventory management',
          'sales tracking',
          'team coordination'
        ],
        brandColor: '#10B981',
        customVariables: {
          industry: 'retail',
          workType: 'customer operations',
          salesFocus: 'customer satisfaction'
        }
      },

      healthcare: {
        name: 'Healthcare Assistant',
        domain: 'healthcare',
        capabilities: [
          'appointment scheduling',
          'patient communication',
          'staff coordination',
          'compliance tracking'
        ],
        brandColor: '#3B82F6',
        customVariables: {
          industry: 'healthcare',
          workType: 'patient care',
          complianceFocus: 'patient safety'
        }
      },

      manufacturing: {
        name: 'Production Assistant',
        domain: 'manufacturing',
        capabilities: [
          'production tracking',
          'quality control',
          'shift management',
          'equipment monitoring'
        ],
        brandColor: '#8B5CF6',
        customVariables: {
          industry: 'manufacturing',
          workType: 'production operations',
          qualityFocus: 'product excellence'
        }
      },

      hospitality: {
        name: 'Hospitality Manager',
        domain: 'hospitality',
        capabilities: [
          'guest services',
          'staff scheduling',
          'event coordination',
          'facility management'
        ],
        brandColor: '#EC4899',
        customVariables: {
          industry: 'hospitality',
          workType: 'guest services',
          serviceFocus: 'guest satisfaction'
        }
      }
    };

    return presets[industry] || {
      name: 'Business Assistant',
      domain: 'general',
      capabilities: ['task management', 'team coordination', 'basic operations'],
      brandColor: '#6B7280',
      customVariables: {
        industry: 'general',
        workType: 'business operations'
      }
    };
  }

  /**
   * Generate context-aware response templates
   */
  generateResponseTemplates(): Record<string, string> {
    return {
      greeting: "Hello! I'm your {{businessName}} assistant. I can help you with {{capabilities}}.",
      
      introduction: "I'm your {{businessName}} voice assistant, specialized in {{domain}} operations. I can assist with {{capabilities}}. How can I help you today?",
      
      help: "I'm your {{businessName}} voice assistant! I can help you with:\n\n{{capabilitiesList}}\n\nWhat would you like to do?",
      
      fallback: "I'll connect you to the {{businessName}} system to handle that request. Please wait a moment...",
      
      error: "I'm having trouble with that request in {{businessName}}. {{#supportEmail}}You can contact support at {{supportEmail}} for assistance.{{/supportEmail}}",
      
      processing: "Processing your {{businessName}} request...",
      
      completed: "Your {{businessName}} request has been completed successfully.",
      
      needsPermission: "This action requires {{businessName}} system access. Please ensure you're properly authenticated.",
      
      businessHours: "I'm your {{businessName}} assistant, available to help with {{capabilities}} during business hours.",
      
      capabilities: "As your {{businessName}} assistant, I can help you with: {{capabilitiesList}}. What would you like to do?"
    };
  }

  /**
   * Get available variables for documentation/debugging
   */
  getAvailableVariables(): Record<string, string> {
    return {
      ...this.cachedVariables,
      // Add descriptions for documentation
      '{{businessName}}': 'Primary business/organization name',
      '{{capabilities}}': 'Comma-separated list of capabilities',
      '{{domain}}': 'Business domain/industry',
      '{{currentDate}}': 'Current date in local format',
      '{{supportEmail}}': 'Business support email address',
      '{{website}}': 'Business website URL'
    };
  }

  /**
   * Extract variables used in a text template
   */
  extractVariables(text: string): string[] {
    const matches = text.match(this.variablePattern);
    if (!matches) return [];
    
    return matches.map(match => 
      match.replace(/^\{\{|\}\}$/g, '')
    );
  }

  /**
   * Preview variable replacement without modifying state
   */
  previewReplacement(
    text: string, 
    options: VariableReplacementOptions = {}
  ): {
    preview: string;
    variables: Array<{
      name: string;
      value: string;
      found: boolean;
    }>;
  } {
    const extractedVars = this.extractVariables(text);
    const allVariables = {
      ...this.cachedVariables,
      ...options.customVariables
    };

    const variables = extractedVars.map(varName => ({
      name: varName,
      value: allVariables[varName] || '',
      found: varName in allVariables
    }));

    const { result } = this.replaceVariables(text, options);

    return {
      preview: result,
      variables
    };
  }

  /**
   * Add custom variables to context
   */
  addCustomVariables(variables: Record<string, string>): void {
    this.context.customVariables = {
      ...this.context.customVariables,
      ...variables
    };
    this.updateVariableCache();
  }

  /**
   * Remove custom variables from context
   */
  removeCustomVariables(variableNames: string[]): void {
    const newCustomVars = { ...this.context.customVariables };
    variableNames.forEach(name => {
      delete newCustomVars[name];
    });
    this.context.customVariables = newCustomVars;
    this.updateVariableCache();
  }

  /**
   * Export context for serialization
   */
  exportContext(): BusinessContext {
    return JSON.parse(JSON.stringify(this.context));
  }

  /**
   * Import context from serialized data
   */
  importContext(context: BusinessContext): BusinessContextValidation {
    const validation = this.validateContext(context);
    
    if (validation.isValid) {
      this.context = context;
      this.updateVariableCache();
    }
    
    return validation;
  }
}