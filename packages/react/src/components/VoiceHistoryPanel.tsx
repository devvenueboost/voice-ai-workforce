// packages/react/src/components/VoiceHistoryPanel.tsx

import React, { useState, useMemo } from 'react';
import { useVoiceAI } from '../hooks/useVoiceAI';
import { useVoiceHistory } from '../hooks/useVoiceHistory';
import { useComponentTheme } from './VoiceProvider';
import { 
  VoiceAIConfig,
  VoiceModeProps,
  useVoiceVisibility
} from '../../../types/src/types';
import { VoiceAIThemeProps, VoiceAIHistoryFilters } from '../types/theme';
import { SIZE_CLASSES } from '../utils/theme';

// Props interface with mode support
export interface VoiceHistoryPanelProps extends VoiceAIThemeProps, VoiceModeProps {
  config: VoiceAIConfig;
  maxItems?: number;
  onCommandReplay?: (commandId: string) => void;
  onHistoryChange?: (historyLength: number) => void;
  
  // Legacy props - now controlled by visibility config
  showFilters?: boolean;
  showSearch?: boolean;
  showStats?: boolean;
  showExport?: boolean;
}

// Icons
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const DeleteIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const ExportIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
  </svg>
);

const StatsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
  </svg>
);

const ClearIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.42L9 19 21 7l-1.42-1.42z"/>
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const HistoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
  </svg>
);

export const VoiceHistoryPanel: React.FC<VoiceHistoryPanelProps> = ({
  config,
  maxItems = 50,
  onCommandReplay,
  onHistoryChange,
  theme: customTheme,
  size = 'md',
  className = '',
  style,
  
  // Legacy props - now controlled by visibility
  showFilters,
  showSearch,
  showStats,
  showExport,
  
  // NEW: Mode support props
  mode,
  visibilityOverrides,
  customLabels: propCustomLabels,
  ...props
}) => {
  const theme = useComponentTheme(customTheme);
  
  // NEW: Resolve visibility and labels based on mode
  const { visibility, labels } = useVoiceVisibility(config, mode, visibilityOverrides);
  
  // Merge prop labels with resolved labels
  const effectiveLabels = {
    voiceButton: { ...labels.voiceButton, ...propCustomLabels?.voiceButton },
    status: { ...labels.status, ...propCustomLabels?.status },
    providers: { ...labels.providers, ...propCustomLabels?.providers },
    errors: { ...labels.errors, ...propCustomLabels?.errors }
  };

  // Determine what features to show based on mode and legacy props
  const shouldShowFilters = showFilters !== undefined ? showFilters : visibility.showAdvancedSettings;
  const shouldShowSearch = showSearch !== undefined ? showSearch : true; // Always show search
  const shouldShowStats = showStats !== undefined ? showStats : visibility.showAnalytics;
  const shouldShowExport = showExport !== undefined ? showExport : visibility.showExportOptions;

  // Available tabs based on visibility
  const availableTabs = [
    { id: 'history', label: 'History', icon: HistoryIcon, visible: true },
    { id: 'stats', label: 'Analytics', icon: StatsIcon, visible: shouldShowStats }
  ].filter(tab => tab.visible);

  const [activeTab, setActiveTab] = useState<'history' | 'stats'>(availableTabs[0]?.id as any || 'history');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Voice AI for command processing
  const { processText } = useVoiceAI({ config, autoStart: false });

  // History hook
  const {
    filteredHistory,
    stats,
    removeCommand,
    clearHistory,
    exportHistory,
    filters,
    setFilters,
    clearFilters,
    searchQuery,
    setSearchQuery,
    replayCommand,
  } = useVoiceHistory({ maxHistoryItems: maxItems });

  // Notify parent of history changes
  React.useEffect(() => {
    onHistoryChange?.(filteredHistory.length);
  }, [filteredHistory.length, onHistoryChange]);

  // Handle command replay
  const handleReplayCommand = async (commandId: string) => {
    try {
      const command = replayCommand(commandId);
      if (command) {
        await processText(command.rawText);
        onCommandReplay?.(commandId);
      }
    } catch (error) {
      console.error('Failed to replay command:', error);
    }
  };

  // Handle export
  const handleExport = (format: 'json' | 'csv') => {
    const data = exportHistory(format);
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-history.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return theme.colors.success;
    if (confidence >= 0.6) return theme.colors.warning;
    return theme.colors.error;
  };

  // Group history by date
  const groupedHistory = useMemo(() => {
    const groups: Record<string, typeof filteredHistory> = {};
    
    filteredHistory.forEach(entry => {
      const dateKey = entry.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });
    
    return groups;
  }, [filteredHistory]);

  const panelClasses = [
    'bg-white rounded-lg border shadow-sm',
    SIZE_CLASSES.panel?.[size] || 'w-96 max-h-96',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={panelClasses}
      style={{ 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        ...style
      }}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" 
           style={{ borderColor: theme.colors.border }}>
        <h3 className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
          {visibility.useGenericLabels ? 'Command History' : 'Voice History'}
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* Tab buttons - only show if there are multiple tabs */}
          {availableTabs.length > 1 && (
            <>
              {availableTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition-colors ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </>
          )}
          
          {/* Action buttons */}
          {shouldShowExport && (
            <div className="relative group">
              <button
                className="p-2 rounded hover:bg-gray-100 transition-colors"
                style={{ color: theme.colors.text.secondary }}
                title="Export History"
              >
                <ExportIcon className="w-4 h-4" />
              </button>
              
              {/* Export dropdown */}
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10"
                   style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 last:rounded-b-lg"
                >
                  Export CSV
                </button>
              </div>
            </div>
          )}
          
          <button
            onClick={clearHistory}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            style={{ color: theme.colors.text.secondary }}
            title="Clear History"
          >
            <DeleteIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {(shouldShowSearch || shouldShowFilters) && activeTab === 'history' && (
        <div className="p-4 border-b space-y-3" style={{ borderColor: theme.colors.border }}>
          {/* Search */}
          {shouldShowSearch && (
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                            //@ts-ignore
                          style={{ color: theme.colors.text.muted }} />
              <input
                type="text"
                placeholder="Search commands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text.primary
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                    {/* @ts-ignore */}
                  <ClearIcon className="w-4 h-4" style={{ color: theme.colors.text.muted }} />
                </button>
              )}
            </div>
          )}

          {/* Filter Controls */}
          {shouldShowFilters && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition-colors ${
                  showFilterPanel ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FilterIcon className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              {(filters.dateFrom || filters.dateTo || filters.commandType || filters.success !== undefined || filters.provider) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                >
                  <ClearIcon className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          )}

          {/* Filter Panel */}
          {shouldShowFilters && showFilterPanel && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg"
                 style={{ backgroundColor: theme.colors.background }}>
              {/* Date Range */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.text.secondary }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFilters({ 
                    dateFrom: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  className="w-full px-2 py-1 text-xs border rounded"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border
                  }}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.text.secondary }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFilters({ 
                    dateTo: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  className="w-full px-2 py-1 text-xs border rounded"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border
                  }}
                />
              </div>
              
              {/* Success Filter */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.text.secondary }}>
                  Status
                </label>
                <select
                  value={filters.success === undefined ? 'all' : filters.success ? 'success' : 'failed'}
                  onChange={(e) => setFilters({ 
                    success: e.target.value === 'all' ? undefined : e.target.value === 'success'
                  })}
                  className="w-full px-2 py-1 text-xs border rounded"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border
                  }}
                >
                  <option value="all">All</option>
                  <option value="success">Successful</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              {/* Provider Filter - only show if visibility allows */}
              {visibility.showProviders && (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.text.secondary }}>
                    Provider
                  </label>
                  <select
                    value={filters.provider || 'all'}
                    onChange={(e) => setFilters({ 
                      provider: e.target.value === 'all' ? undefined : e.target.value
                    })}
                    className="w-full px-2 py-1 text-xs border rounded"
                    style={{ 
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border
                    }}
                  >
                    <option value="all">All Providers</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google</option>
                    <option value="keywords">Keywords</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'history' ? (
          <div className="h-full overflow-y-auto p-4">
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <div className="text-gray-400 mb-2">
                  <SearchIcon className="w-8 h-8 mx-auto" />
                </div>
                <div className="text-sm" style={{ color: theme.colors.text.muted }}>
                  {searchQuery || Object.keys(filters).length > 0 
                    ? 'No commands match your search'
                    : visibility.useGenericLabels 
                      ? 'No commands yet'
                      : 'No voice commands yet'
                  }
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedHistory).map(([dateKey, entries]) => (
                  <div key={dateKey}>
                    {/* Date Header */}
                    <div className="sticky top-0 bg-gray-50 px-2 py-1 rounded text-xs font-medium mb-2"
                         style={{ backgroundColor: theme.colors.background, color: theme.colors.text.secondary }}>
                      {dateKey === new Date().toDateString() ? 'Today' : dateKey}
                    </div>
                    
                    {/* Commands */}
                    <div className="space-y-2">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-3 rounded-lg border hover:bg-gray-50 transition-colors group"
                          style={{ 
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              {/* Command Info */}
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm" style={{ color: theme.colors.text.primary }}>
                                  {entry.intent}
                                </span>
                                
                                {/* Confidence Score - only show if visibility allows */}
                                {visibility.showConfidenceScores && (
                                  <span 
                                    className="px-2 py-0.5 text-xs rounded-full"
                                    style={{ 
                                      backgroundColor: `${getConfidenceColor(entry.confidence)}20`,
                                      color: getConfidenceColor(entry.confidence)
                                    }}
                                  >
                                    {Math.round(entry.confidence * 100)}%
                                  </span>
                                )}
                                
                                {/* Success/Failure indicator */}
                                {entry.success ? (
                                    // @ts-ignore
                                  <CheckIcon className="w-3 h-3" style={{ color: theme.colors.success }} />
                                ) : (
                                    // @ts-ignore
                                  <CloseIcon className="w-3 h-3" style={{ color: theme.colors.error }} />
                                )}
                              </div>
                              
                              <div className="text-sm mb-1" style={{ color: theme.colors.text.secondary }}>
                                "{entry.rawText}"
                              </div>
                              
                              <div className="flex items-center space-x-3 text-xs" style={{ color: theme.colors.text.muted }}>
                                <span>{formatRelativeTime(entry.timestamp)}</span>
                                
                                {/* Provider info - only show if visibility allows */}
                                {entry.provider && visibility.showProviders && (
                                  <span>via {entry.provider}</span>
                                )}
                                
                                {/* Processing time - only show if visibility allows */}
                                {entry.duration && visibility.showProcessingTimes && (
                                  <span>{entry.duration}ms</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleReplayCommand(entry.id)}
                                className="p-1 rounded hover:bg-gray-200 transition-colors"
                                title="Replay Command"
                              >
                                {/* @ts-ignore */}
                                <PlayIcon className="w-4 h-4" style={{ color: theme.colors.text.secondary }} />
                              </button>
                              
                              {/* Delete button - only show in advanced modes */}
                              {visibility.showAdvancedSettings && (
                                <button
                                  onClick={() => removeCommand(entry.id)}
                                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                                  title="Remove"
                                >
                                    {/* @ts-ignore */}
                                  <DeleteIcon className="w-4 h-4" style={{ color: theme.colors.text.secondary }} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Stats Tab - only shown if analytics are enabled
          shouldShowStats && (
            <div className="p-4 space-y-4">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg"
                     style={{ backgroundColor: theme.colors.background }}>
                  <div className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
                    {stats.totalCommands}
                  </div>
                  <div className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    Total Commands
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg"
                     style={{ backgroundColor: theme.colors.background }}>
                  <div className="text-2xl font-bold" style={{ color: theme.colors.success }}>
                    {Math.round((stats.successfulCommands / stats.totalCommands) * 100) || 0}%
                  </div>
                  <div className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    Success Rate
                  </div>
                </div>
                
                {/* Confidence - only show if visibility allows */}
                {visibility.showConfidenceScores && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg"
                       style={{ backgroundColor: theme.colors.background }}>
                    <div className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
                      {Math.round(stats.averageConfidence * 100)}%
                    </div>
                    <div className="text-sm" style={{ color: theme.colors.text.secondary }}>
                      Avg Confidence
                    </div>
                  </div>
                )}
                
                {/* Response Time - only show if visibility allows */}
                {visibility.showProcessingTimes && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg"
                       style={{ backgroundColor: theme.colors.background }}>
                    <div className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
                      {Math.round(stats.averageResponseTime)}ms
                    </div>
                    <div className="text-sm" style={{ color: theme.colors.text.secondary }}>
                      Avg Response Time
                    </div>
                  </div>
                )}
              </div>

              {/* Most Used Commands */}
              {stats.mostUsedCommands.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                    Most Used Commands
                  </h4>
                  <div className="space-y-2">
                    {stats.mostUsedCommands.slice(0, 5).map((command, index) => (
                      <div key={command.intent} className="flex items-center justify-between py-1">
                        <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                          {index + 1}. {command.intent}
                        </span>
                        <span className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>
                          {command.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Provider Breakdown - only show if visibility allows */}
              {visibility.showProviders && Object.keys(stats.commandsByProvider).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                    By Provider
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(stats.commandsByProvider).map(([provider, count]) => (
                      <div key={provider} className="flex items-center justify-between py-1">
                        <span className="text-sm capitalize" style={{ color: theme.colors.text.secondary }}>
                          {provider}
                        </span>
                        <span className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>
                          {count} ({Math.round((count / stats.totalCommands) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default VoiceHistoryPanel;