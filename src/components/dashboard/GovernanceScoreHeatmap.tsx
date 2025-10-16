import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGovernanceData } from "@/hooks/useGovernanceData";
import { CoverageScorecard } from "./CoverageScorecard";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

interface GovernanceScoreHeatmapProps {
  statusFilters?: {
    critical: boolean;
    healthy: boolean;
    attention: boolean;
  };
  onStatusFilterChange?: (status: 'critical' | 'healthy' | 'attention') => void;
}

export const GovernanceScoreHeatmap = ({ statusFilters, onStatusFilterChange }: GovernanceScoreHeatmapProps) => {
  const { data } = useGovernanceData();
  const [selectedL1Filters, setSelectedL1Filters] = useState<string[]>([]);
  const [showAllL2, setShowAllL2] = useState(false);
  
  // Extract L2 entities: prefer children under L1 analytics; fallback to entity hierarchy when missing
  const l2FromChildren = data?.l1_entity_analytics 
    ? Object.entries(data.l1_entity_analytics)
        .filter(([_, l1Data]: [string, any]) => l1Data.children && Object.keys(l1Data.children).length > 0)
        .flatMap(([l1Entity, l1Data]: [string, any]) => 
          Object.entries(l1Data.children).map(([l2Name, l2Data]: [string, any]) => {
            const missingL1Pct = l2Data.column_count > 0 ? ((l2Data.column_count - (l2Data.columns_tagged_l1_count || l2Data.column_count)) / l2Data.column_count) * 100 : 0;
            const missingL2Pct = l2Data.column_count > 0 ? ((l2Data.column_count - l2Data.columns_tagged_l2_count) / l2Data.column_count) * 100 : 0;
            const totalMissingPct = missingL1Pct + missingL2Pct;
            
            let status: "healthy" | "attention" | "critical" = "healthy";
            const riskFlags: string[] = [];
            
            if (totalMissingPct < 10) {
              status = "healthy";
            } else if (totalMissingPct >= 10 && totalMissingPct <= 40) {
              status = "attention";
              riskFlags.push("Missing L1/L2 Coverage");
            } else {
              status = "critical";
              riskFlags.push("Critical L1/L2 Gap");
            }
            
            if (l2Data.columns_with_description_pct < 50) riskFlags.push("Low Documentation");

            return {
              entity: l2Name,
              tables: l2Data.table_count,
              columns: l2Data.column_count,
              l1Tagged: 100,
              l2Tagged: Math.round((l2Data.columns_tagged_l2_count / l2Data.column_count) * 100),
              documented: Math.round(l2Data.columns_with_description_pct),
              l1TaggedCount: l2Data.column_count,
              l2TaggedCount: l2Data.columns_tagged_l2_count,
              documentedCount: Math.round((l2Data.columns_with_description_pct / 100) * l2Data.column_count),
              riskFlags,
              status,
              parentL1: l1Entity,
              l2_count: 1,
              l2_count_excluding_unassigned: 1,
              schema_count: l2Data.schema_count,
              table_count: l2Data.table_count,
              column_count: l2Data.column_count,
              columns_tagged_l1_count: l2Data.column_count,
              columns_tagged_l2_count: l2Data.columns_tagged_l2_count,
              columns_missing_l2_count: l2Data.column_count - l2Data.columns_tagged_l2_count,
              columns_missing_l2_pct: missingL2Pct,
              columns_with_description_pct: l2Data.columns_with_description_pct,
              undocumented_columns_pct: l2Data.undocumented_columns_pct
            };
          })
        )
    : [];

  const l2FromHierarchy = (!l2FromChildren?.length && data?.entity_heirarcy)
    ? Object.entries(data.entity_heirarcy).map(([l1EntityName, entityData]) => {
        const analytics = entityData.analytics;
        const l1TaggedColumns = analytics.columns_tagged_l1_count;
        const l2TaggedColumns = analytics.columns_tagged_l2_count;
        const documentedColumns = Math.round((analytics.columns_with_description_pct / 100) * analytics.column_count);
        const missingL1Pct = analytics.column_count > 0 ? ((analytics.column_count - l1TaggedColumns) / analytics.column_count) * 100 : 0;
        const missingL2Pct = analytics.column_count > 0 ? ((analytics.column_count - l2TaggedColumns) / analytics.column_count) * 100 : 0;
        const totalMissingPct = missingL1Pct + missingL2Pct;
        let status: "healthy" | "attention" | "critical" = "healthy";
        const riskFlags: string[] = [];
        if (totalMissingPct < 10) {
          status = "healthy";
        } else if (totalMissingPct >= 10 && totalMissingPct <= 40) {
          status = "attention";
          riskFlags.push("Missing L1/L2 Coverage");
        } else {
          status = "critical";
          riskFlags.push("Critical L1/L2 Gap");
        }
        if (analytics.columns_with_description_pct < 50) riskFlags.push("Low Documentation");

        return {
          entity: l1EntityName, // Using L1 entity name since we don't have L2 breakdown in new structure
          tables: analytics.table_count,
          columns: analytics.column_count,
          l1Tagged: analytics.columns_tagged_l1_count > 0 ? 100 : 0,
          l2Tagged: analytics.columns_tagged_l2_count > 0 ? 100 : 0,
          documented: Math.round(analytics.columns_with_description_pct),
          l1TaggedCount: l1TaggedColumns,
          l2TaggedCount: l2TaggedColumns,
          documentedCount: documentedColumns,
          riskFlags,
          status,
          parentL1: l1EntityName,
          l2_count: analytics.l2_count,
          l2_count_excluding_unassigned: analytics.l2_count_excluding_unassigned,
          table_count: analytics.table_count,
          column_count: analytics.column_count,
          columns_tagged_l1_count: l1TaggedColumns,
          columns_tagged_l2_count: l2TaggedColumns,
          columns_missing_l2_count: analytics.columns_missing_l2_count,
          columns_missing_l2_pct: analytics.columns_missing_l2_pct,
          columns_with_description_pct: analytics.columns_with_description_pct,
          undocumented_columns_pct: analytics.undocumented_columns_pct
        };
      })
    : [];

  let l2Entities = l2FromChildren.length ? l2FromChildren : l2FromHierarchy;
  
  // Get unique L1 entities for the filter
  const uniqueL1Entities = Array.from(new Set(l2Entities.map(entity => entity.parentL1)));
  
  // Apply L1 filter - show all if no filters selected, otherwise filter by selected L1s
  if (selectedL1Filters.length > 0) {
    l2Entities = l2Entities.filter(entity => selectedL1Filters.includes(entity.parentL1));
  }
  
  // Handle L1 filter toggle
  const handleL1FilterToggle = (l1Entity: string) => {
    setSelectedL1Filters(prev => 
      prev.includes(l1Entity) 
        ? prev.filter(item => item !== l1Entity)
        : [...prev, l1Entity]
    );
  };
  
  // Apply status filtering if filters are provided
  if (statusFilters) {
    l2Entities = l2Entities.filter(entity => 
      statusFilters[entity.status as keyof typeof statusFilters]
    );
  }

  // Filter entities for display (show first 4 by default, all if showAllL2 is true)
  const filteredL2Entities = l2Entities;
  const displayedL2Entities = showAllL2 ? filteredL2Entities : filteredL2Entities.slice(0, 4);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Secondary Business Entity Analytics</h3>
            <p className="text-sm text-gray-600">Showing {displayedL2Entities.length} of {filteredL2Entities.length} entities • {data?.entity_global_analytics?.total_l2_excluding_unassigned || 16} total</p>
          </div>
          {statusFilters && onStatusFilterChange && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onStatusFilterChange('critical')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  statusFilters.critical 
                    ? 'bg-red-500 text-white shadow-sm hover:bg-red-600' 
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-red-50'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => onStatusFilterChange('attention')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  statusFilters.attention 
                    ? 'bg-orange-500 text-white shadow-sm hover:bg-orange-600' 
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-orange-50'
                }`}
              >
                Attention
              </button>
              <button
                onClick={() => onStatusFilterChange('healthy')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  statusFilters.healthy 
                    ? 'bg-green-500 text-white shadow-sm hover:bg-green-600' 
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-green-50'
                }`}
              >
                Healthy
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 font-medium">Filter by Primary:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-48 justify-between rounded-lg border-gray-300 hover:bg-gray-50">
                {selectedL1Filters.length === 0 
                  ? "All Primary Entities" 
                  : selectedL1Filters.length === 1 
                    ? selectedL1Filters[0]
                    : `${selectedL1Filters.length} Selected`
                }
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 bg-white border border-gray-200 shadow-lg z-50 rounded-lg">
              <div className="space-y-2">
                {uniqueL1Entities.map((l1Entity) => (
                  <div key={l1Entity} className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded">
                    <Checkbox
                      id={l1Entity}
                      checked={selectedL1Filters.includes(l1Entity)}
                      onCheckedChange={() => handleL1FilterToggle(l1Entity)}
                    />
                    <label
                      htmlFor={l1Entity}
                      className="text-sm cursor-pointer flex-1 truncate"
                      title={l1Entity}
                    >
                      {l1Entity}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          {filteredL2Entities.length > 4 && (
            <button
              onClick={() => setShowAllL2(!showAllL2)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all"
            >
              {showAllL2 ? "Show Less" : `Show All ${filteredL2Entities.length}`}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-4">
        {displayedL2Entities.map((entity, index) => (
          <div key={index} className="relative">
            <div className="absolute -top-2 -left-2 z-10">
              <Badge variant="outline" className="text-xs bg-white shadow-sm rounded-lg border-indigo-200 text-indigo-700">
                {entity.parentL1}
              </Badge>
            </div>
            <CoverageScorecard {...entity} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-2">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Healthy (&lt;10% missing)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">Attention (10-40% missing)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Critical (&gt;40% missing)</span>
          </div>
        </div>
        <Badge variant="outline" className="text-sm bg-white border-gray-300 rounded-lg">
          {filteredL2Entities.length} Entities
        </Badge>
      </div>
    </div>
  );
};