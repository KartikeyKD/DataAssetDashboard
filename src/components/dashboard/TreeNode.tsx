import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export interface TreeNodeData {
  id: string;
  label: string;
  value: number;
  proportion: number;
  children?: TreeNodeData[];
  analytics?: any; // Analytics data for this node
}

interface TreeNodeProps {
  data: TreeNodeData;
  isExpanded: boolean;
  onToggle: () => void;
  hasChildren: boolean;
  level: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  data,
  isExpanded,
  onToggle,
  hasChildren,
  level,
  isSelected,
  onSelect
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${Math.round(value / 1000)}K`;
    }
    return value.toString();
  };

  const handleClick = () => {
    onSelect();
  };

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    
    // Set a new timeout to show tooltip after 1 second
    const timeout = setTimeout(() => {
      setShowTooltip(true);
    }, 1000);
    
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    // Clear the timeout if mouse leaves before 1 second
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowTooltip(false);
  };

  const renderAnalyticsTooltip = () => {
    if (!data.analytics || !showTooltip) return null;

    const analytics = data.analytics;
    
    // Special rendering for column nodes
    if (analytics.columnName) {
      return (
        <div className="absolute z-50 w-[28rem] bg-white border border-gray-200 rounded-lg shadow-xl p-4 left-full ml-4 -top-20 animate-in slide-in-from-left-2 fade-in duration-700 ease-out">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-800 mb-1">{analytics.columnName}</h4>
            <div className="w-full h-px bg-gray-200"></div>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-teal-50 rounded p-2">
                <div className="text-teal-600 font-medium">Schema Name</div>
                <div className="text-teal-900 font-bold">{analytics.schemaName}</div>
              </div>
              <div className="bg-purple-50 rounded p-2">
                <div className="text-purple-600 font-medium">Table Name</div>
                <div className="text-purple-900 font-bold">{analytics.tableName}</div>
              </div>
            </div>
            
            <div className="bg-emerald-50 rounded p-2">
              <div className="text-emerald-600 font-medium">Data Type</div>
              <div className="text-emerald-900 font-bold font-mono">{analytics.dataType}</div>
            </div>
            
            {analytics.description && (
              <div className="bg-blue-50 rounded p-2">
                <div className="text-blue-600 font-medium">Business Description</div>
                <div className="text-blue-900 leading-relaxed mt-1">{analytics.description}</div>
              </div>
            )}
            
            {!analytics.has_description && (
              <div className="bg-yellow-50 rounded p-2 border border-yellow-200">
                <div className="text-yellow-700 font-medium">⚠️ No Business Description</div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="absolute z-50 w-[28rem] bg-white border border-gray-200 rounded-lg shadow-xl p-4 left-full ml-4 -top-20 animate-in slide-in-from-left-2 fade-in duration-700 ease-out">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-800 mb-1">{data.label} Analytics</h4>
          <div className="w-full h-px bg-gray-200"></div>
        </div>
        
        <div className="space-y-2 text-xs">
          {/* L1/L2 specific analytics */}
          {analytics.l2_count !== undefined && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded p-2">
                <div className="text-blue-600 font-medium">Secondary Business Entity Count</div>
                <div className="text-blue-900 font-bold">{analytics.l2_count}</div>
              </div>
              <div className="bg-blue-50 rounded p-2">
                <div className="text-blue-600 font-medium">Secondary Business Entity (Excl. Unassigned)</div>
                <div className="text-blue-900 font-bold">{analytics.l2_count_excluding_unassigned}</div>
              </div>
            </div>
          )}
          
          {/* Schema/Table/Column counts */}
          {analytics.schema_count !== undefined && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-50 rounded p-2">
                <div className="text-green-600 font-medium">Schemas</div>
                <div className="text-green-900 font-bold">{analytics.schema_count}</div>
              </div>
              <div className="bg-green-50 rounded p-2">
                <div className="text-green-600 font-medium">Tables</div>
                <div className="text-green-900 font-bold">{analytics.table_count}</div>
              </div>
              <div className="bg-green-50 rounded p-2">
                <div className="text-green-600 font-medium">Data Columns</div>
                <div className="text-green-900 font-bold">{analytics.column_count?.toLocaleString()}</div>
              </div>
            </div>
          )}
          
          {/* Tagged columns */}
          {analytics.columns_tagged_l1_count !== undefined && (
            <div className="bg-blue-50 rounded p-2">
              <div className="text-blue-600 font-medium">Primary Business Entity Tagged Columns</div>
              <div className="text-blue-900 font-bold">{analytics.columns_tagged_l1_count?.toLocaleString()}</div>
            </div>
          )}
          
          {analytics.columns_tagged_l2_count !== undefined && (
            <div className="bg-blue-50 rounded p-2">
              <div className="text-blue-600 font-medium">Secondary Business Entity Tagged Columns</div>
              <div className="text-blue-900 font-bold">{analytics.columns_tagged_l2_count?.toLocaleString()}</div>
            </div>
          )}
          
          {/* Missing tags */}
          {analytics.columns_missing_l2_count !== undefined && (
            <div className="bg-red-50 rounded p-2">
              <div className="text-red-600 font-medium">Missing Secondary Business Entity Tags</div>
              <div className="text-red-900 font-bold">{analytics.columns_missing_l2_count?.toLocaleString()}</div>
              <div className="text-red-500 text-xs">{analytics.columns_missing_l2_pct?.toFixed(1)}%</div>
            </div>
          )}
          
          {/* Documentation percentages */}
          {analytics.columns_with_description_pct !== undefined && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 rounded p-2">
                <div className="text-green-600 font-medium">Business Description Documented</div>
                <div className="text-green-900 font-bold">{analytics.columns_with_description_pct?.toFixed(1)}%</div>
              </div>
              <div className="bg-orange-50 rounded p-2">
                <div className="text-orange-600 font-medium">Business Description Undocumented</div>
                <div className="text-orange-900 font-bold">{analytics.undocumented_columns_pct?.toFixed(1)}%</div>
              </div>
            </div>
          )}
          
          {/* Average columns per table */}
          {analytics.avg_columns_per_table !== undefined && (
            <div className="bg-purple-50 rounded p-2">
              <div className="text-purple-600 font-medium">Avg Data Columns/Table</div>
              <div className="text-purple-900 font-bold">{analytics.avg_columns_per_table?.toFixed(1)}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center relative">
      <div
        className={cn(
          "relative rounded-full flex flex-col items-center justify-center",
          "shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",
          "cursor-pointer border-2 w-32 h-32",
          hasChildren && "hover:scale-105",
          isSelected 
            ? "bg-blue-600 border-blue-700 shadow-xl ring-4 ring-blue-300/50 scale-110" 
            : "bg-blue-100 border-blue-200 hover:bg-blue-200 text-blue-800"
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative z-10 text-center px-3 py-2 w-full overflow-hidden">
          <div className={cn(
            "text-xs leading-tight mb-2 break-words line-clamp-2",
            isSelected ? "text-white/90" : "text-blue-600"
          )}>
            {data.label}
          </div>
          <div className={cn(
            "text-base font-bold",
            isSelected ? "text-white" : "text-blue-800"
          )}>
            {formatValue(data.value)}
          </div>
        </div>

        {hasChildren && (
          <div className={cn(
            "absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center",
            "shadow-md transition-transform duration-300 ease-in-out bg-white",
            isExpanded && "rotate-90"
          )}>
            <ChevronRight className={cn(
              "w-3 h-3",
              isSelected ? "text-primary" : "text-blue-600"
            )} />
          </div>
        )}
      </div>

      {/* Compact node info below */}
      <div className="mt-2 text-center">
        <div className={cn(
          "text-xs font-medium leading-tight",
          isSelected ? "text-primary" : "text-foreground"
        )}>
          {data.label}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {formatValue(data.value)}
        </div>
      </div>
      
      {/* Analytics Tooltip */}
      {renderAnalyticsTooltip()}
    </div>
  );
};
