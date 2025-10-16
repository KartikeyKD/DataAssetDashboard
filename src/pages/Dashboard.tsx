import { useState, useEffect } from "react";
import { Database, Table, Columns, TrendingUp, TrendingDown, AlertTriangle, FileText, CheckCircle, BadgeCheck, Workflow, FolderTree, TableProperties, Box, Target, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NavigationTabs } from "@/components/dashboard/NavigationTabs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CoverageScorecard } from "@/components/dashboard/CoverageScorecard";
import { DataAssetsOverview } from "@/components/dashboard/DataAssetsOverview";
import { ProblemColumnsAnalysis } from "@/components/dashboard/ProblemColumnsAnalysis";
import { GovernanceScoreHeatmap } from "@/components/dashboard/GovernanceScoreHeatmap";
import { TableComplianceDashboard } from "@/components/dashboard/TableComplianceDashboard";
import { TrendProgressChart } from "@/components/dashboard/TrendProgressChart";
import { DataAssetsHierarchy } from "@/components/dashboard/DataAssetsHierarchy";
import { AlignedExcelDataTable } from "@/components/dashboard/AlignedExcelDataTable";
import { ActionOrientedInsights } from "@/components/dashboard/ActionOrientedInsights";
import { GovernanceKPIs } from "@/components/dashboard/GovernanceKPIs";
import { SchemasModal } from "@/components/dashboard/SchemasModal";
import { TablesModal } from "@/components/dashboard/TablesModal";
import { TablesHierarchyModal } from "@/components/dashboard/TablesHierarchyModal";
import { PrimaryBusinessEntityModal } from "@/components/dashboard/PrimaryBusinessEntityModal";
import { SecondaryBusinessEntityModal } from "@/components/dashboard/SecondaryBusinessEntityModal";
import { Chatbot } from "@/components/dashboard/Chatbot";
import { useGovernanceData } from "@/hooks/useGovernanceData";
import Lineage from "./Lineage";
import { DataDashboard } from "./DataDashboard";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data, loading } = useGovernanceData();
  
  // Modal states
  const [schemasModalOpen, setSchemasModalOpen] = useState(false);
  const [tablesModalOpen, setTablesModalOpen] = useState(false);
  const [tablesHierarchyModalOpen, setTablesHierarchyModalOpen] = useState(false);
  const [primaryBusinessEntityModalOpen, setPrimaryBusinessEntityModalOpen] = useState(false);
  const [secondaryBusinessEntityModalOpen, setSecondaryBusinessEntityModalOpen] = useState(false);
  
  // GVC data state
  const [gvcData, setGvcData] = useState<any[]>([]);
  
  // Load GVC data
  useEffect(() => {
    fetch('/gvc.json')
      .then(response => response.json())
      .then(data => setGvcData(data))
      .catch(error => console.error('Error loading GVC data:', error));
  }, []);
  
  // Separate status filter states for L1 and L2
  const [l1StatusFilters, setL1StatusFilters] = useState({
    critical: true,
    healthy: true,
    attention: true
  });
  
  const [l2StatusFilters, setL2StatusFilters] = useState({
    critical: true,
    healthy: true,
    attention: true
  });
  
  const handleL1StatusFilterChange = (status: keyof typeof l1StatusFilters) => {
    setL1StatusFilters(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };
  
  const handleL2StatusFilterChange = (status: keyof typeof l2StatusFilters) => {
    setL2StatusFilters(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  // Modal states for data sources, GVC, and pipelines
  const [dataSourcesModalOpen, setDataSourcesModalOpen] = useState(false);
  const [gvcModalOpen, setGvcModalOpen] = useState(false);
  const [pipelinesModalOpen, setPipelinesModalOpen] = useState(false);

  // Extract unique data sources and pipelines from GVC data
  const uniqueDataSources = [...new Set(gvcData.map(item => item["Data Source"]))];
  const allPipelines = gvcData.flatMap(item => item.Pipelines || []);
  const uniquePipelines = [...new Set(allPipelines)];
  const gvcIssuedCount = gvcData.filter(item => item.GVRs === "Issued").length;

  // First row metrics - 3 cards
  const firstRowMetrics = [
    {
      title: "Data Sources",
      value: uniqueDataSources.length.toString(),
      subtitle: "Active data sources",
      icon: Database,
      onClick: () => setDataSourcesModalOpen(true),
      colorTheme: 'indigo' as const,
    },
    {
      title: "GVC's",
      value: gvcIssuedCount.toString(),
      subtitle: "Governance Validation Certificates",
      icon: BadgeCheck,
      onClick: () => setGvcModalOpen(true),
      colorTheme: 'sky' as const,
    },
    {
      title: "Pipelines",
      value: uniquePipelines.length.toString(),
      subtitle: "Data pipelines",
      icon: Workflow,
      onClick: () => setPipelinesModalOpen(true),
      colorTheme: 'orange' as const,
    },
  ];

  // Calculate User schemas count (schemas starting with "USER$")
  const userSchemasCount = data?.schemas?.filter((s: any) => s.name.toUpperCase().startsWith('USER$')).length || 0;
  const otherSchemasCount = (data?.global_analytics?.total_schemas || 0) - userSchemasCount;

  // Second row metrics - 5 cards
  const secondRowMetrics = [
    {
      title: "Total Schemas",
      value: data?.global_analytics?.total_schemas?.toLocaleString() || "118",
      subtitle: "Active database schemas",
      icon: FolderTree,
      onClick: () => setSchemasModalOpen(true),
      colorTheme: 'teal' as const,
      subMetrics: [
        { label: "User Schemas", value: userSchemasCount },
        { label: "Others", value: otherSchemasCount }
      ],
    },
    {
      title: "Total Tables", 
      value: data?.global_analytics?.total_tables?.toLocaleString() || "3,552",
      subtitle: "Data tables across all schemas",
      icon: TableProperties,
      onClick: () => setTablesHierarchyModalOpen(true),
      colorTheme: 'purple' as const,
    },
    {
      title: "Total Columns",
      value: data?.global_analytics?.total_columns?.toLocaleString() || "91,233", 
      subtitle: "Individual data columns",
      icon: Box,
      colorTheme: 'emerald' as const,
    },
    {
      title: "Primary Business Entity Coverage",
      value: data?.entity_global_analytics?.total_l1_excluding_unassigned || "24",
      subtitle: `${data?.global_analytics?.business_entity_primary_coverage_pct?.toFixed(2) || "8.67"}% of all columns tagged`,
      icon: Target,
      onClick: () => setPrimaryBusinessEntityModalOpen(true),
      colorTheme: 'amber' as const,
    },
    {
      title: "Secondary Business Entity Coverage", 
      value: data?.entity_global_analytics?.total_l2_excluding_unassigned || "16",
      subtitle: "",
      icon: Users,
      onClick: () => setSecondaryBusinessEntityModalOpen(true),
      colorTheme: 'rose' as const,
      subMetrics: [
        { 
          label: "% of Primary", 
          value: `${((data?.entity_global_analytics?.total_l2_excluding_unassigned || 16) / (data?.entity_global_analytics?.total_l1_excluding_unassigned || 24) * 100).toFixed(1)}%` 
        },
        { 
          label: "% Coverage", 
          value: `${data?.global_analytics?.business_entity_secondary_coverage_pct?.toFixed(2) || "2.49"}%` 
        }
      ],
    },
  ];

  const [showAllL1, setShowAllL1] = useState(false);
  
  // Helper function to extract schemas from L1 entity children
  const extractSchemasFromL1Entity = (entityData: any): string[] => {
    if (!entityData.children) return [];
    
    const allSchemas = new Set<string>();
    
    // Iterate through all children (L2 entities)
    Object.values(entityData.children).forEach((child: any) => {
      if (child.schemas) {
        // Add all schema names from this child
        Object.keys(child.schemas).forEach(schemaName => {
          allSchemas.add(schemaName);
        });
      }
    });
    
    return Array.from(allSchemas).sort();
  };

  // Helper function to extract L2 entities from L1 entity children
  const extractL2EntitiesFromL1Entity = (entityData: any): string[] => {
    if (!entityData.children) return [];
    
    // Return all children names (these are the L2 entities)
    return Object.keys(entityData.children).sort();
  };
  
  // Aggregate L1 entities from the entity hierarchy data
  const l1EntityGroups = data?.entity_heirarcy ? Object.entries(data.entity_heirarcy).reduce((acc, [l1EntityName, entityData]) => {
    const analytics = entityData.analytics;
    
    // Calculate actual percentages
    const l1TaggedPct = analytics.column_count > 0 ? (analytics.columns_tagged_l1_count / analytics.column_count) * 100 : 0;
    const l2TaggedPct = analytics.column_count > 0 ? (analytics.columns_tagged_l2_count / analytics.column_count) * 100 : 0;
    
    acc[l1EntityName] = {
      entity: l1EntityName,
      tables: analytics.table_count,
      columns: analytics.column_count,
      l1TaggedColumns: analytics.columns_tagged_l1_count,
      l2TaggedColumns: analytics.columns_tagged_l2_count,
      documentedColumns: Math.round((analytics.columns_with_description_pct / 100) * analytics.column_count),
      totalL1Tagged: l1TaggedPct,
      totalL2Tagged: l2TaggedPct,
      totalDocumented: analytics.columns_with_description_pct,
      count: 1,
      riskFlags: [] as string[],
      status: "healthy" as const,
      // Additional analytics for the card
      l2_count: analytics.l2_count,
      l2_count_excluding_unassigned: analytics.l2_count_excluding_unassigned,
      schema_count: analytics.schema_count,
      table_count: analytics.table_count,
      column_count: analytics.column_count,
      columns_tagged_l1_count: analytics.columns_tagged_l1_count,
      columns_tagged_l2_count: analytics.columns_tagged_l2_count,
      columns_missing_l2_count: analytics.columns_missing_l2_count,
      columns_missing_l2_pct: analytics.columns_missing_l2_pct,
      columns_with_description_pct: analytics.columns_with_description_pct,
      undocumented_columns_pct: analytics.undocumented_columns_pct,
      // Extract real schema list and L2 entity list from data
      schema_list: extractSchemasFromL1Entity(entityData),
      l2_entity_list: extractL2EntitiesFromL1Entity(entityData)
    };
    
    return acc;
  }, {} as Record<string, any>) : {};

  // Use the entity hierarchy data to create L1 entities
  const l1Entities = Object.values(l1EntityGroups).map((group: any) => {
    const riskFlags: string[] = [];
    let status: "healthy" | "attention" | "critical" = "healthy";
    
    // Calculate missing L1 and L2 percentages
    const missingL1Pct = group.column_count > 0 ? ((group.column_count - group.columns_tagged_l1_count) / group.column_count) * 100 : 0;
    const missingL2Pct = group.columns_missing_l2_pct || 0;
    const totalMissingPct = missingL1Pct + missingL2Pct;
    
    // Risk assessment
    if (totalMissingPct < 10) {
      status = "healthy";
    } else if (totalMissingPct >= 10 && totalMissingPct <= 40) {
      status = "attention";
      riskFlags.push("Missing L1/L2 Coverage");
    } else {
      status = "critical";
      riskFlags.push("Critical L1/L2 Gap");
    }
    
    // Additional risk flags
    if (group.columns_with_description_pct < 50) riskFlags.push("Low Documentation");
    if (group.columns_tagged_l1_count === 0) riskFlags.push("No Entity Assignment");
    
    return {
      entity: group.entity,
      tables: group.tables,
      columns: group.columns,
      l1Tagged: group.totalL1Tagged,
      l2Tagged: group.totalL2Tagged,
      documented: group.totalDocumented,
      l1TaggedCount: group.columns_tagged_l1_count,
      l2TaggedCount: group.columns_tagged_l2_count,
      documentedCount: group.documentedColumns,
      riskFlags,
      status,
      // Pass all the additional analytics
      l2_count: group.l2_count,
      l2_count_excluding_unassigned: group.l2_count_excluding_unassigned,
      schema_count: group.schema_count,
      table_count: group.table_count,
      column_count: group.column_count,
      columns_tagged_l1_count: group.columns_tagged_l1_count,
      columns_tagged_l2_count: group.columns_tagged_l2_count,
      columns_missing_l2_count: group.columns_missing_l2_count,
      columns_missing_l2_pct: group.columns_missing_l2_pct,
      columns_with_description_pct: group.columns_with_description_pct,
      undocumented_columns_pct: group.undocumented_columns_pct,
      schema_list: group.schema_list,
      l2_entity_list: group.l2_entity_list
    };
  }).sort((a, b) => {
    if (a.entity === "Unassigned L1") return 1;
    if (b.entity === "Unassigned L1") return -1;
    return b.columns - a.columns;
  });

  // Filter L1 entities based on their status
  const filteredL1Entities = l1Entities.filter(entity => 
    l1StatusFilters[entity.status as keyof typeof l1StatusFilters]
  );
  
  const displayedL1Entities = showAllL1 ? filteredL1Entities : filteredL1Entities.slice(0, 4);

  if (activeTab === "data-assets") {
    return (
      <div className="min-h-[100vh] bg-gray-50">
        <DashboardHeader />
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="px-8 py-8 max-w-[1800px] mx-auto">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Data Assets</h2>
              <p className="text-gray-600 text-lg">Interactive hierarchy: Primary Business Entity → Secondary Business Entity → Schema → Table → Column</p>
            </div>
            
            {/* <AlignedExcelDataTable /> */}
            <DataAssetsHierarchy />
            
          </div>
        </main>
      </div>
    );
  }

  if (activeTab === "compliance") {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="px-8 py-8 max-w-[1800px] mx-auto">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Table Compliance & Quality</h2>
              <p className="text-gray-600 text-lg">Table-level governance compliance and data quality issues</p>
            </div>

            <TableComplianceDashboard />
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Data Quality Issues</h3>
              <ProblemColumnsAnalysis />
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (activeTab === "lineage") {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="space-y-8">
            <Lineage />
          </div>
      </div>
    );
  }
  if (activeTab === "dataDashboard") {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="space-y-8">
            <DataDashboard />
          </div>
      </div>
    );
  }
  if (activeTab === "analytics") {
    return (
      <div className="min-h-screen w-screen bg-gray-50">
        <DashboardHeader />
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="px-8 py-8 max-w-[1800px] mx-auto">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
              <p className="text-gray-600 text-lg">Trends, KPIs, and actionable governance insights</p>
            </div>

            <GovernanceKPIs />
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Trends & Progress</h3>
              <TrendProgressChart />
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Action Required</h3>
              <ActionOrientedInsights />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-screen bg-gray-50">
      <DashboardHeader />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="min-w-screen mx-auto py-8 max-w-[1800px]">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Business Insights Dashboard</h2>
            <p className="text-gray-600 text-lg">Comprehensive overview of data assets and business entity coverage</p>
          </div>

          {/* Global Metrics - 8 Cards in 2 rows */}
          {/* First Row - 3 Cards */}
          <div className="grid gap-6 grid-cols-3">
            {firstRowMetrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>

          {/* Second Row - 5 Cards */}
          <div className="grid gap-6 grid-cols-5">
            {secondRowMetrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>

          {/* L1 Coverage Scorecards */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Primary Business Entity Analytics</h3>
                  <p className="text-sm text-gray-600">Showing {displayedL1Entities.length} of {filteredL1Entities.length} entities • {data?.entity_global_analytics?.total_l1_excluding_unassigned || 24} total</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleL1StatusFilterChange('critical')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      l1StatusFilters.critical 
                        ? 'bg-red-500 text-white shadow-sm hover:bg-red-600' 
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-red-50'
                    }`}
                  >
                    Critical
                  </button>
                  <button
                    onClick={() => handleL1StatusFilterChange('attention')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      l1StatusFilters.attention 
                        ? 'bg-orange-500 text-white shadow-sm hover:bg-orange-600' 
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-orange-50'
                    }`}
                  >
                    Attention
                  </button>
                  <button
                    onClick={() => handleL1StatusFilterChange('healthy')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      l1StatusFilters.healthy 
                        ? 'bg-green-500 text-white shadow-sm hover:bg-green-600' 
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-green-50'
                    }`}
                  >
                    Healthy
                  </button>
                </div>
              </div>
              {filteredL1Entities.length > 4 && (
                <button
                  onClick={() => setShowAllL1(!showAllL1)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all"
                >
                  {showAllL1 ? "Show Less" : `Show All ${filteredL1Entities.length}`}
                </button>
              )}
            </div>
            <div className="grid gap-6 grid-cols-4">
              {displayedL1Entities.map((entity, index) => (
                <CoverageScorecard key={index} {...entity} />
              ))}
            </div>
          </div>

          {/* L2 Heatmap */}
          <GovernanceScoreHeatmap statusFilters={l2StatusFilters} onStatusFilterChange={handleL2StatusFilterChange} />

        </div>
      </main>
      
      {/* Modals */}
      <SchemasModal 
        isOpen={schemasModalOpen} 
        onClose={() => setSchemasModalOpen(false)} 
        schemas={data?.schemas || []} 
      />
      <TablesModal 
        isOpen={tablesModalOpen} 
        onClose={() => setTablesModalOpen(false)} 
        data={data} 
      />
      <TablesHierarchyModal 
        isOpen={tablesHierarchyModalOpen} 
        onClose={() => setTablesHierarchyModalOpen(false)} 
        data={data} 
      />
      <PrimaryBusinessEntityModal 
        isOpen={primaryBusinessEntityModalOpen} 
        onClose={() => setPrimaryBusinessEntityModalOpen(false)} 
        data={data} 
      />
      <SecondaryBusinessEntityModal 
        isOpen={secondaryBusinessEntityModalOpen} 
        onClose={() => setSecondaryBusinessEntityModalOpen(false)} 
        data={data} 
      />
      
      {/* Data Sources Modal */}
      <Dialog open={dataSourcesModalOpen} onOpenChange={setDataSourcesModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Data Sources ({uniqueDataSources.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {gvcData.map((source, index) => (
              <div 
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{source["Data Source"]}</h4>
                    <p className="text-sm text-gray-500">Frequency: {source.Frequency}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {source.GVRs === "Issued" && (
                    <Badge className="bg-green-50 text-green-700 border-green-200 rounded-lg">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      GVC Issued
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* GVC Modal */}
      <Dialog open={gvcModalOpen} onOpenChange={setGvcModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Governance Validation Certificates ({gvcIssuedCount})</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {gvcData.filter(item => item.GVRs === "Issued").map((source, index) => (
              <div 
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BadgeCheck className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{source["Data Source"]}</h4>
                      <p className="text-sm text-gray-500">Certificate Status: Issued • Frequency: {source.Frequency}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200 rounded-lg">
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Pipelines Modal */}
      <Dialog open={pipelinesModalOpen} onOpenChange={setPipelinesModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Pipelines ({uniquePipelines.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {uniquePipelines.map((pipeline, index) => {
              // Find the data source for this pipeline
              const dataSource = gvcData.find(item => item.Pipelines.includes(pipeline));
              return (
                <div 
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-indigo-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{pipeline}</h4>
                        <p className="text-sm text-gray-500">Source: {dataSource?.["Data Source"] || "Unknown"} • Frequency: {dataSource?.Frequency || "N/A"}</p>
                      </div>
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 rounded-lg">
                      Active
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};