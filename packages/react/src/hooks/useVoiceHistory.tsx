// packages/react/src/hooks/useVoiceHistory.tsx

import { useState, useCallback, useEffect, useMemo } from 'react';
import { VoiceCommand, VoiceResponse, AIProvider } from '../../../types/src/types';
import { VoiceAIHistoryFilters } from '../types/theme';

// Enhanced command history entry
export interface VoiceCommandHistoryEntry extends VoiceCommand {
  id: string;
  response?: VoiceResponse;
  duration?: number;
  success: boolean;
  error?: string;
  sessionId?: string;
}

// History statistics
export interface VoiceHistoryStats {
  totalCommands: number;
  successfulCommands: number;
  failedCommands: number;
  averageConfidence: number;
  commandsByProvider: Record<AIProvider, number>;
  commandsByIntent: Record<string, number>;
  mostUsedCommands: Array<{ intent: string; count: number }>;
  averageResponseTime: number;
}

// History hook options
interface UseVoiceHistoryOptions {
  maxHistoryItems?: number;
  persistHistory?: boolean;
  storageKey?: string;
  enableStats?: boolean;
}

// History hook return type
interface UseVoiceHistoryReturn {
  // History data
  history: VoiceCommandHistoryEntry[];
  filteredHistory: VoiceCommandHistoryEntry[];
  stats: VoiceHistoryStats;
  
  // Actions
  addCommand: (command: VoiceCommand, response?: VoiceResponse, duration?: number) => void;
  clearHistory: () => void;
  removeCommand: (id: string) => void;
  exportHistory: (format?: 'json' | 'csv') => string;
  
  // Filtering
  filters: VoiceAIHistoryFilters;
  setFilters: (filters: Partial<VoiceAIHistoryFilters>) => void;
  clearFilters: () => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Replay functionality
  replayCommand: (id: string) => VoiceCommand | null;
  getRecentCommands: (count?: number) => VoiceCommandHistoryEntry[];
  getFavoriteCommands: (count?: number) => VoiceCommandHistoryEntry[];
}

// Default options
const defaultOptions: UseVoiceHistoryOptions = {
  maxHistoryItems: 100,
  persistHistory: true,
  storageKey: 'voice-ai-history',
  enableStats: true,
};

export const useVoiceHistory = (options: UseVoiceHistoryOptions = {}): UseVoiceHistoryReturn => {
  const config = { ...defaultOptions, ...options };
  
  // State
  const [history, setHistory] = useState<VoiceCommandHistoryEntry[]>([]);
  const [filters, setFiltersState] = useState<VoiceAIHistoryFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Load history from localStorage on mount
  useEffect(() => {
    if (config.persistHistory && typeof window !== 'undefined') {
      try {
        const savedHistory = localStorage.getItem(config.storageKey!);
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          setHistory(parsed);
        }
      } catch (error) {
        console.warn('Failed to load voice history from localStorage:', error);
      }
    }
  }, [config.persistHistory, config.storageKey]);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (config.persistHistory && typeof window !== 'undefined' && history.length > 0) {
      try {
        localStorage.setItem(config.storageKey!, JSON.stringify(history));
      } catch (error) {
        console.warn('Failed to save voice history to localStorage:', error);
      }
    }
  }, [history, config.persistHistory, config.storageKey]);

  // Add command to history
  const addCommand = useCallback((
    command: VoiceCommand, 
    response?: VoiceResponse, 
    duration?: number
  ) => {
    const historyEntry: VoiceCommandHistoryEntry = {
      ...command,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      response,
      duration,
      success: response?.success ?? true,
      error: response?.success === false ? 'Command failed' : undefined,
      sessionId: `session-${Date.now()}`,
    };

    setHistory(prev => {
      const newHistory = [historyEntry, ...prev];
      
      // Limit history size
      if (config.maxHistoryItems && newHistory.length > config.maxHistoryItems) {
        return newHistory.slice(0, config.maxHistoryItems);
      }
      
      return newHistory;
    });
  }, [config.maxHistoryItems]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    
    if (config.persistHistory && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(config.storageKey!);
      } catch (error) {
        console.warn('Failed to clear voice history from localStorage:', error);
      }
    }
  }, [config.persistHistory, config.storageKey]);

  // Remove specific command
  const removeCommand = useCallback((id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  }, []);

  // Export history
  const exportHistory = useCallback((format: 'json' | 'csv' = 'json'): string => {
    if (format === 'json') {
      return JSON.stringify(history, null, 2);
    }
    
    // CSV export
    const headers = ['timestamp', 'intent', 'rawText', 'confidence', 'provider', 'success', 'duration'];
    const rows = history.map(entry => [
      entry.timestamp.toISOString(),
      entry.intent,
      `"${entry.rawText.replace(/"/g, '""')}"`, // Escape quotes
      entry.confidence.toString(),
      entry.provider || 'unknown',
      entry.success.toString(),
      entry.duration?.toString() || '',
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }, [history]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<VoiceAIHistoryFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState({});
    setSearchQuery('');
  }, []);

  // Replay command
  const replayCommand = useCallback((id: string): VoiceCommand | null => {
    const entry = history.find(h => h.id === id);
    if (!entry) return null;
    
    return {
      intent: entry.intent,
      entities: entry.entities,
      confidence: entry.confidence,
      rawText: entry.rawText,
      timestamp: new Date(),
      provider: entry.provider,
    };
  }, [history]);

  // Get recent commands
  const getRecentCommands = useCallback((count = 5): VoiceCommandHistoryEntry[] => {
    return history.slice(0, count);
  }, [history]);

  // Get favorite commands (most used)
  const getFavoriteCommands = useCallback((count = 5): VoiceCommandHistoryEntry[] => {
    const intentCounts = history.reduce((acc, entry) => {
      acc[entry.intent] = (acc[entry.intent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedIntents = Object.entries(intentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([intent]) => intent);

    return sortedIntents
      .map(intent => history.find(entry => entry.intent === intent))
      .filter(Boolean) as VoiceCommandHistoryEntry[];
  }, [history]);

  // Filtered history based on search and filters
  const filteredHistory = useMemo(() => {
    let filtered = [...history];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.intent.toLowerCase().includes(query) ||
        entry.rawText.toLowerCase().includes(query) ||
        (entry.response?.text || '').toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.dateFrom) {
      filtered = filtered.filter(entry => entry.timestamp >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(entry => entry.timestamp <= filters.dateTo!);
    }

    if (filters.commandType) {
      filtered = filtered.filter(entry => entry.intent === filters.commandType);
    }

    if (filters.success !== undefined) {
      filtered = filtered.filter(entry => entry.success === filters.success);
    }

    if (filters.provider) {
      filtered = filtered.filter(entry => entry.provider === filters.provider);
    }

    return filtered;
  }, [history, searchQuery, filters]);

  // Calculate statistics
  const stats = useMemo((): VoiceHistoryStats => {
    if (!config.enableStats || history.length === 0) {
      return {
        totalCommands: 0,
        successfulCommands: 0,
        failedCommands: 0,
        averageConfidence: 0,
        commandsByProvider: {} as Record<AIProvider, number>,
        commandsByIntent: {},
        mostUsedCommands: [],
        averageResponseTime: 0,
      };
    }

    const totalCommands = history.length;
    const successfulCommands = history.filter(h => h.success).length;
    const failedCommands = totalCommands - successfulCommands;
    
    const averageConfidence = history.reduce((sum, h) => sum + h.confidence, 0) / totalCommands;
    
    const commandsByProvider = history.reduce((acc, h) => {
      const provider = h.provider || AIProvider.KEYWORDS;
      acc[provider] = (acc[provider] || 0) + 1;
      return acc;
    }, {} as Record<AIProvider, number>);
    
    const commandsByIntent = history.reduce((acc, h) => {
      acc[h.intent] = (acc[h.intent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedCommands = Object.entries(commandsByIntent)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([intent, count]) => ({ intent, count }));
    
    const responseTimes = history.filter(h => h.duration).map(h => h.duration!);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    return {
      totalCommands,
      successfulCommands,
      failedCommands,
      averageConfidence,
      commandsByProvider,
      commandsByIntent,
      mostUsedCommands,
      averageResponseTime,
    };
  }, [history, config.enableStats]);

  return {
    history,
    filteredHistory,
    stats,
    addCommand,
    clearHistory,
    removeCommand,
    exportHistory,
    filters,
    setFilters,
    clearFilters,
    searchQuery,
    setSearchQuery,
    replayCommand,
    getRecentCommands,
    getFavoriteCommands,
  };
};