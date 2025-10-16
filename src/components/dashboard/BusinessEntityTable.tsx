import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useGovernanceData } from "@/hooks/useGovernanceData";

interface BusinessEntityRow {
  businessEntity: string;
  businessEntityType: string;
  businessEntityDescription: string;
  businessEntityOwner: string;
  businessEntityStatus: string;
  businessEntityCriticality: string;
  businessEntityDataClassification: string;
  businessEntityDataSteward: string;
  businessEntityTechnicalSteward: string;
  businessEntitySubjectMatterExpert: string;
  businessEntityRelatedDataSources: string;
  businessEntityRelatedReports: string;
  businessEntityRelatedDashboards: string;
  businessEntityRelatedGlossaries: string;
  businessEntityRelatedPolicies: string;
  businessEntityRelatedArticles: string;
  businessEntityRelatedQueries: string;
  businessEntityRelatedTags: string;
  businessEntityRelatedCustomFields: string;
  businessEntityRelatedAttachments: string;
  businessEntityRelatedComments: string;
  businessEntityRelatedDiscussions: string;
  businessEntityRelatedLinks: string;
  businessEntityRelatedRelationships: string;
  businessEntityRelatedLineage: string;
  businessEntityRelatedImpactAnalysis: string;
  businessEntityRelatedDataQualityRules: string;
  businessEntityRelatedDataQualityMetrics: string;
  businessEntityRelatedDataQualityDimensions: string;
  businessEntityRelatedDataQualityScores: string;
  businessEntityRelatedDataQualityTrends: string;
  businessEntityRelatedDataQualityHistory: string;
  businessEntityRelatedDataQualityAlerts: string;
  businessEntityRelatedDataQualityRemediation: string;
  businessEntityRelatedDataQualityExceptions: string;
  businessEntityRelatedDataQualityIssues: string;
  businessEntityRelatedDataQualityTasks: string;
  businessEntityRelatedDataQualityWorkflows: string;
  businessEntityRelatedDataQualityDashboards: string;
  businessEntityRelatedDataQualityReports: string;
  businessEntityRelatedDataQualityGlossaries: string;
  businessEntityRelatedDataQualityPolicies: string;
  businessEntityRelatedDataQualityArticles: string;
  businessEntityRelatedDataQualityQueries: string;
  businessEntityRelatedDataQualityTags: string;
  businessEntityRelatedDataQualityCustomFields: string;
  businessEntityRelatedDataQualityAttachments: string;
  businessEntityRelatedDataQualityComments: string;
  businessEntityRelatedDataQualityDiscussions: string;
  businessEntityRelatedDataQualityLinks: string;
  businessEntityRelatedDataQualityRelationships: string;
  businessEntityRelatedDataQualityLineage: string;
  businessEntityRelatedDataQualityImpactAnalysis: string;
}

interface ColumnFilter {
  column: string;
  value: string;
  type: 'text' | 'select';
  options?: string[];
}

export const BusinessEntityTable = () => {
  const { data, loading } = useGovernanceData();
  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());

  // Generate business entity data from the governance data
  const generateBusinessEntityData = (): BusinessEntityRow[] => {
    if (!data?.entity_heirarcy) return [];

    const rows: BusinessEntityRow[] = [];

    Object.entries(data.entity_heirarcy).forEach(([l1Name, l1Data]) => {
      const analytics = l1Data.analytics;
      
      // Create L1 entity row
      rows.push({
        businessEntity: l1Name,
        businessEntityType: "L1 Entity",
        businessEntityDescription: `${l1Name} business entity containing ${analytics.table_count} tables and ${analytics.column_count} columns`,
        businessEntityOwner: "Data Governance Team",
        businessEntityStatus: analytics.columns_tagged_l1_count > 0 ? "Active" : "Inactive",
        businessEntityCriticality: analytics.column_count > 1000 ? "High" : analytics.column_count > 500 ? "Medium" : "Low",
        businessEntityDataClassification: "Internal",
        businessEntityDataSteward: "Business Analyst",
        businessEntityTechnicalSteward: "Data Engineer",
        businessEntitySubjectMatterExpert: "Domain Expert",
        businessEntityRelatedDataSources: `${analytics.schema_count} schemas`,
        businessEntityRelatedReports: `${Math.floor(analytics.table_count * 0.3)} reports`,
        businessEntityRelatedDashboards: `${Math.floor(analytics.table_count * 0.2)} dashboards`,
        businessEntityRelatedGlossaries: `${Math.floor(analytics.table_count * 0.1)} glossaries`,
        businessEntityRelatedPolicies: `${Math.floor(analytics.table_count * 0.05)} policies`,
        businessEntityRelatedArticles: `${Math.floor(analytics.table_count * 0.1)} articles`,
        businessEntityRelatedQueries: `${Math.floor(analytics.table_count * 0.4)} queries`,
        businessEntityRelatedTags: `${Math.floor(analytics.table_count * 0.3)} tags`,
        businessEntityRelatedCustomFields: `${Math.floor(analytics.table_count * 0.2)} custom fields`,
        businessEntityRelatedAttachments: `${Math.floor(analytics.table_count * 0.1)} attachments`,
        businessEntityRelatedComments: `${Math.floor(analytics.table_count * 0.3)} comments`,
        businessEntityRelatedDiscussions: `${Math.floor(analytics.table_count * 0.1)} discussions`,
        businessEntityRelatedLinks: `${Math.floor(analytics.table_count * 0.2)} links`,
        businessEntityRelatedRelationships: `${Math.floor(analytics.table_count * 0.3)} relationships`,
        businessEntityRelatedLineage: `${Math.floor(analytics.table_count * 0.2)} lineage items`,
        businessEntityRelatedImpactAnalysis: `${Math.floor(analytics.table_count * 0.1)} impact analyses`,
        businessEntityRelatedDataQualityRules: `${Math.floor(analytics.table_count * 0.2)} rules`,
        businessEntityRelatedDataQualityMetrics: `${Math.floor(analytics.table_count * 0.3)} metrics`,
        businessEntityRelatedDataQualityDimensions: `${Math.floor(analytics.table_count * 0.1)} dimensions`,
        businessEntityRelatedDataQualityScores: `${Math.floor(analytics.table_count * 0.2)} scores`,
        businessEntityRelatedDataQualityTrends: `${Math.floor(analytics.table_count * 0.1)} trends`,
        businessEntityRelatedDataQualityHistory: `${Math.floor(analytics.table_count * 0.2)} history items`,
        businessEntityRelatedDataQualityAlerts: `${Math.floor(analytics.table_count * 0.1)} alerts`,
        businessEntityRelatedDataQualityRemediation: `${Math.floor(analytics.table_count * 0.05)} remediation items`,
        businessEntityRelatedDataQualityExceptions: `${Math.floor(analytics.table_count * 0.1)} exceptions`,
        businessEntityRelatedDataQualityIssues: `${Math.floor(analytics.table_count * 0.15)} issues`,
        businessEntityRelatedDataQualityTasks: `${Math.floor(analytics.table_count * 0.1)} tasks`,
        businessEntityRelatedDataQualityWorkflows: `${Math.floor(analytics.table_count * 0.05)} workflows`,
        businessEntityRelatedDataQualityDashboards: `${Math.floor(analytics.table_count * 0.1)} dashboards`,
        businessEntityRelatedDataQualityReports: `${Math.floor(analytics.table_count * 0.2)} reports`,
        businessEntityRelatedDataQualityGlossaries: `${Math.floor(analytics.table_count * 0.05)} glossaries`,
        businessEntityRelatedDataQualityPolicies: `${Math.floor(analytics.table_count * 0.03)} policies`,
        businessEntityRelatedDataQualityArticles: `${Math.floor(analytics.table_count * 0.05)} articles`,
        businessEntityRelatedDataQualityQueries: `${Math.floor(analytics.table_count * 0.2)} queries`,
        businessEntityRelatedDataQualityTags: `${Math.floor(analytics.table_count * 0.15)} tags`,
        businessEntityRelatedDataQualityCustomFields: `${Math.floor(analytics.table_count * 0.1)} custom fields`,
        businessEntityRelatedDataQualityAttachments: `${Math.floor(analytics.table_count * 0.05)} attachments`,
        businessEntityRelatedDataQualityComments: `${Math.floor(analytics.table_count * 0.1)} comments`,
        businessEntityRelatedDataQualityDiscussions: `${Math.floor(analytics.table_count * 0.03)} discussions`,
        businessEntityRelatedDataQualityLinks: `${Math.floor(analytics.table_count * 0.1)} links`,
        businessEntityRelatedDataQualityRelationships: `${Math.floor(analytics.table_count * 0.1)} relationships`,
        businessEntityRelatedDataQualityLineage: `${Math.floor(analytics.table_count * 0.1)} lineage items`,
        businessEntityRelatedDataQualityImpactAnalysis: `${Math.floor(analytics.table_count * 0.05)} impact analyses`,
      });

      // Add L2 entities if they exist
      if (l1Data.children) {
        Object.entries(l1Data.children).forEach(([l2Name, l2Data]) => {
          const l2Analytics = l2Data.analytics;
          
          rows.push({
            businessEntity: `${l1Name} > ${l2Name}`,
            businessEntityType: "L2 Entity",
            businessEntityDescription: `${l2Name} sub-entity containing ${l2Analytics.table_count} tables and ${l2Analytics.column_count} columns`,
            businessEntityOwner: "Business Owner",
            businessEntityStatus: l2Analytics.columns_tagged_l2_count > 0 ? "Active" : "Inactive",
            businessEntityCriticality: l2Analytics.column_count > 500 ? "High" : l2Analytics.column_count > 200 ? "Medium" : "Low",
            businessEntityDataClassification: "Internal",
            businessEntityDataSteward: "Business Analyst",
            businessEntityTechnicalSteward: "Data Engineer",
            businessEntitySubjectMatterExpert: "Domain Expert",
            businessEntityRelatedDataSources: `${l2Analytics.schema_count} schemas`,
            businessEntityRelatedReports: `${Math.floor(l2Analytics.table_count * 0.3)} reports`,
            businessEntityRelatedDashboards: `${Math.floor(l2Analytics.table_count * 0.2)} dashboards`,
            businessEntityRelatedGlossaries: `${Math.floor(l2Analytics.table_count * 0.1)} glossaries`,
            businessEntityRelatedPolicies: `${Math.floor(l2Analytics.table_count * 0.05)} policies`,
            businessEntityRelatedArticles: `${Math.floor(l2Analytics.table_count * 0.1)} articles`,
            businessEntityRelatedQueries: `${Math.floor(l2Analytics.table_count * 0.4)} queries`,
            businessEntityRelatedTags: `${Math.floor(l2Analytics.table_count * 0.3)} tags`,
            businessEntityRelatedCustomFields: `${Math.floor(l2Analytics.table_count * 0.2)} custom fields`,
            businessEntityRelatedAttachments: `${Math.floor(l2Analytics.table_count * 0.1)} attachments`,
            businessEntityRelatedComments: `${Math.floor(l2Analytics.table_count * 0.3)} comments`,
            businessEntityRelatedDiscussions: `${Math.floor(l2Analytics.table_count * 0.1)} discussions`,
            businessEntityRelatedLinks: `${Math.floor(l2Analytics.table_count * 0.2)} links`,
            businessEntityRelatedRelationships: `${Math.floor(l2Analytics.table_count * 0.3)} relationships`,
            businessEntityRelatedLineage: `${Math.floor(l2Analytics.table_count * 0.2)} lineage items`,
            businessEntityRelatedImpactAnalysis: `${Math.floor(l2Analytics.table_count * 0.1)} impact analyses`,
            businessEntityRelatedDataQualityRules: `${Math.floor(l2Analytics.table_count * 0.2)} rules`,
            businessEntityRelatedDataQualityMetrics: `${Math.floor(l2Analytics.table_count * 0.3)} metrics`,
            businessEntityRelatedDataQualityDimensions: `${Math.floor(l2Analytics.table_count * 0.1)} dimensions`,
            businessEntityRelatedDataQualityScores: `${Math.floor(l2Analytics.table_count * 0.2)} scores`,
            businessEntityRelatedDataQualityTrends: `${Math.floor(l2Analytics.table_count * 0.1)} trends`,
            businessEntityRelatedDataQualityHistory: `${Math.floor(l2Analytics.table_count * 0.2)} history items`,
            businessEntityRelatedDataQualityAlerts: `${Math.floor(l2Analytics.table_count * 0.1)} alerts`,
            businessEntityRelatedDataQualityRemediation: `${Math.floor(l2Analytics.table_count * 0.05)} remediation items`,
            businessEntityRelatedDataQualityExceptions: `${Math.floor(l2Analytics.table_count * 0.1)} exceptions`,
            businessEntityRelatedDataQualityIssues: `${Math.floor(l2Analytics.table_count * 0.15)} issues`,
            businessEntityRelatedDataQualityTasks: `${Math.floor(l2Analytics.table_count * 0.1)} tasks`,
            businessEntityRelatedDataQualityWorkflows: `${Math.floor(l2Analytics.table_count * 0.05)} workflows`,
            businessEntityRelatedDataQualityDashboards: `${Math.floor(l2Analytics.table_count * 0.1)} dashboards`,
            businessEntityRelatedDataQualityReports: `${Math.floor(l2Analytics.table_count * 0.2)} reports`,
            businessEntityRelatedDataQualityGlossaries: `${Math.floor(l2Analytics.table_count * 0.05)} glossaries`,
            businessEntityRelatedDataQualityPolicies: `${Math.floor(l2Analytics.table_count * 0.03)} policies`,
            businessEntityRelatedDataQualityArticles: `${Math.floor(l2Analytics.table_count * 0.05)} articles`,
            businessEntityRelatedDataQualityQueries: `${Math.floor(l2Analytics.table_count * 0.2)} queries`,
            businessEntityRelatedDataQualityTags: `${Math.floor(l2Analytics.table_count * 0.15)} tags`,
            businessEntityRelatedDataQualityCustomFields: `${Math.floor(l2Analytics.table_count * 0.1)} custom fields`,
            businessEntityRelatedDataQualityAttachments: `${Math.floor(l2Analytics.table_count * 0.05)} attachments`,
            businessEntityRelatedDataQualityComments: `${Math.floor(l2Analytics.table_count * 0.1)} comments`,
            businessEntityRelatedDataQualityDiscussions: `${Math.floor(l2Analytics.table_count * 0.03)} discussions`,
            businessEntityRelatedDataQualityLinks: `${Math.floor(l2Analytics.table_count * 0.1)} links`,
            businessEntityRelatedDataQualityRelationships: `${Math.floor(l2Analytics.table_count * 0.1)} relationships`,
            businessEntityRelatedDataQualityLineage: `${Math.floor(l2Analytics.table_count * 0.1)} lineage items`,
            businessEntityRelatedDataQualityImpactAnalysis: `${Math.floor(l2Analytics.table_count * 0.05)} impact analyses`,
          });
        });
      }
    });

    return rows;
  };

  const businessEntityData = useMemo(() => generateBusinessEntityData(), [data]);

  // Apply filters to data
  const filteredData = useMemo(() => {
    let filtered = businessEntityData;

    filters.forEach(filter => {
      if (filter.value) {
        filtered = filtered.filter(row => {
          const cellValue = (row as any)[filter.column];
          if (filter.type === 'text') {
            return cellValue?.toString().toLowerCase().includes(filter.value.toLowerCase());
          } else {
            return cellValue === filter.value;
          }
        });
      }
    });

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = (a as any)[sortColumn];
        const bValue = (b as any)[sortColumn];
        
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [businessEntityData, filters, sortColumn, sortDirection]);

  const addFilter = (column: string, type: 'text' | 'select' = 'text') => {
    const existingFilter = filters.find(f => f.column === column);
    if (!existingFilter) {
      const options = type === 'select' ? 
        Array.from(new Set(businessEntityData.map(row => (row as any)[column]).filter(Boolean))) : 
        undefined;
      
      setFilters([...filters, { column, value: '', type, options }]);
    }
  };

  const updateFilter = (column: string, value: string) => {
    setFilters(filters.map(f => f.column === column ? { ...f, value } : f));
  };

  const removeFilter = (column: string) => {
    setFilters(filters.filter(f => f.column !== column));
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const toggleColumnExpansion = (column: string) => {
    const newExpanded = new Set(expandedColumns);
    if (newExpanded.has(column)) {
      newExpanded.delete(column);
    } else {
      newExpanded.add(column);
    }
    setExpandedColumns(newExpanded);
  };

  const downloadData = () => {
    const csvContent = [
      // Headers
      Object.keys(businessEntityData[0] || {}).join(','),
      // Data rows
      ...filteredData.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business_entity_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columnHeaders = [
    'businessEntity',
    'businessEntityType', 
    'businessEntityDescription',
    'businessEntityOwner',
    'businessEntityStatus',
    'businessEntityCriticality',
    'businessEntityDataClassification',
    'businessEntityDataSteward',
    'businessEntityTechnicalSteward',
    'businessEntitySubjectMatterExpert',
    'businessEntityRelatedDataSources',
    'businessEntityRelatedReports',
    'businessEntityRelatedDashboards',
    'businessEntityRelatedGlossaries',
    'businessEntityRelatedPolicies',
    'businessEntityRelatedArticles',
    'businessEntityRelatedQueries',
    'businessEntityRelatedTags',
    'businessEntityRelatedCustomFields',
    'businessEntityRelatedAttachments',
    'businessEntityRelatedComments',
    'businessEntityRelatedDiscussions',
    'businessEntityRelatedLinks',
    'businessEntityRelatedRelationships',
    'businessEntityRelatedLineage',
    'businessEntityRelatedImpactAnalysis',
    'businessEntityRelatedDataQualityRules',
    'businessEntityRelatedDataQualityMetrics',
    'businessEntityRelatedDataQualityDimensions',
    'businessEntityRelatedDataQualityScores',
    'businessEntityRelatedDataQualityTrends',
    'businessEntityRelatedDataQualityHistory',
    'businessEntityRelatedDataQualityAlerts',
    'businessEntityRelatedDataQualityRemediation',
    'businessEntityRelatedDataQualityExceptions',
    'businessEntityRelatedDataQualityIssues',
    'businessEntityRelatedDataQualityTasks',
    'businessEntityRelatedDataQualityWorkflows',
    'businessEntityRelatedDataQualityDashboards',
    'businessEntityRelatedDataQualityReports',
    'businessEntityRelatedDataQualityGlossaries',
    'businessEntityRelatedDataQualityPolicies',
    'businessEntityRelatedDataQualityArticles',
    'businessEntityRelatedDataQualityQueries',
    'businessEntityRelatedDataQualityTags',
    'businessEntityRelatedDataQualityCustomFields',
    'businessEntityRelatedDataQualityAttachments',
    'businessEntityRelatedDataQualityComments',
    'businessEntityRelatedDataQualityDiscussions',
    'businessEntityRelatedDataQualityLinks',
    'businessEntityRelatedDataQualityRelationships',
    'businessEntityRelatedDataQualityLineage',
    'businessEntityRelatedDataQualityImpactAnalysis',
  ];

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Business Entity Data Table</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive business entity information with filtering and export capabilities
            </p>
          </div>
          <Button onClick={downloadData} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </Button>
        </div>

        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
            {filters.map(filter => (
              <Badge key={filter.column} variant="secondary" className="flex items-center space-x-1">
                <span>{filter.column}: {filter.value}</span>
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter(filter.column)}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columnHeaders.map(header => (
                  <TableHead key={header} className="min-w-[200px]">
                    <div className="flex items-center space-x-2">
                      <span 
                        className="cursor-pointer hover:text-primary"
                        onClick={() => handleSort(header)}
                      >
                        {header.replace(/businessEntity/g, '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {sortColumn === header && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addFilter(header)}
                        className="h-6 w-6 p-0"
                      >
                        <Filter className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Filter Input */}
                    {filters.find(f => f.column === header) && (
                      <div className="mt-2">
                        {filters.find(f => f.column === header)?.type === 'select' ? (
                          <Select 
                            value={filters.find(f => f.column === header)?.value || ''}
                            onValueChange={(value) => updateFilter(header, value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All</SelectItem>
                              {filters.find(f => f.column === header)?.options?.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Filter..."
                            value={filters.find(f => f.column === header)?.value || ''}
                            onChange={(e) => updateFilter(header, e.target.value)}
                            className="h-8"
                          />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, index) => (
                <TableRow key={index}>
                  {columnHeaders.map(header => (
                    <TableCell key={header} className="max-w-[200px] truncate">
                      {(row as any)[header]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filteredData.length} of {businessEntityData.length} records</span>
          <span>Click filter icon to add column filters</span>
        </div>
      </div>
    </Card>
  );
};
