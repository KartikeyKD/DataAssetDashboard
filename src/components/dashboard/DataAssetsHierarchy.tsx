import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronDown, Database, Table, Columns, Layers, FileText, CloudCog } from "lucide-react";
import { useGovernanceData } from "@/hooks/useGovernanceData";
import { DecompositionTree } from "./DecompositionTree";
import { TreeNodeData } from "./TreeNode";
import DrilldownTree from "./DrilldownTree";
import HybridDrilldownTree from "./BubbleView";
import ForceChart from "./ForceChart";
import MultiBubbleView from "./MultiBubbleView";

interface HierarchyNodeProps {
  level: number;
  name: string;
  type: 'l1' | 'l2' | 'schema' | 'table' | 'column';
  metrics?: {
    schemas?: number;
    tables?: number;
    columns?: number;
    coverage?: number;
    documentation?: number;
    tagged_count?: number;
  };
  dataType?: string;
  description?: string;
  children?: HierarchyNodeProps[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

const HierarchyNode = ({ level, name, type, metrics, dataType, description, children, isExpanded, onToggle }: HierarchyNodeProps) => {
  const hasChildren = children && children.length > 0;

  const getIcon = () => {
    switch (type) {
      case 'l1': return <Database className="h-4 w-4 text-primary" />;
      case 'l2': return <Table className="h-4 w-4 text-chart-2" />;
      case 'schema': return <Layers className="h-4 w-4 text-chart-3" />;
      case 'table': return <Columns className="h-4 w-4 text-chart-4" />;
      case 'column': return <FileText className="h-4 w-4 text-muted-foreground" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getStatusColor = (value: number) => {
    if (value >= 80) return "text-success";
    if (value >= 50) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border ${level === 0 ? 'bg-card border-border' : 'border-transparent'
          }`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={onToggle}
      >
        {hasChildren && (
          isExpanded ?
            <ChevronDown className="h-4 w-4 text-muted-foreground" /> :
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        {!hasChildren && <div className="w-4" />}

        {getIcon()}

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-foreground truncate">{name}</span>
            {type === 'l1' && (
              <Badge variant="outline" className="text-xs">
                Primary Business Entity
              </Badge>
            )}
            {type === 'l2' && (
              <Badge variant="secondary" className="text-xs">
                Secondary Business Entity
              </Badge>
            )}
          </div>

          {metrics && (
            <div className="flex items-center space-x-4 mt-1">
              {metrics.schemas && (
                <span className="text-xs text-muted-foreground">
                  {metrics.schemas} schemas
                </span>
              )}
              {metrics.tables && (
                <span className="text-xs text-muted-foreground">
                  {metrics.tables} tables
                </span>
              )}
              {metrics.columns && (
                <span className="text-xs text-muted-foreground">
                  {metrics.columns} columns
                </span>
              )}
              {metrics.coverage !== undefined && (
                <div className="flex items-center space-x-1">
                  <Progress value={metrics.coverage} className="h-1 w-12" />
                  <span className={`text-xs ${getStatusColor(metrics.coverage)}`}>
                    {metrics.coverage}%
                  </span>
                </div>
              )}
            </div>
          )}

          {type === 'column' && (
            <div className="mt-1 space-y-1">
              {dataType && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">{dataType}</span>
                </div>
              )}
              {description && (
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {description}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isExpanded && children && (
        <div className="space-y-1">
          {children.map((child, index) => (
            <HierarchyNode key={index} {...child} />
          ))}
        </div>
      )}
    </div>
  );
};







const flattenUnassignedL2Children = (node: any): any => {
  if (!node?.children || !Array.isArray(node.children)) return node;

  // We'll collect children, skipping "Unassigned L2"
  const flattenedChildren: any[] = [];

  node.children.forEach((child: any) => {
    if (child.label === "Unassigned L2" && Array.isArray(child.children)) {
      // Bring all "Unassigned L2" children up
      flattenedChildren.push(...child.children);
    } else {
      // Continue flattening recursively
      flattenedChildren.push(flattenUnassignedL2Children(child));
    }
  });

  node.children = flattenedChildren;
  return node;
};

const transformToTreeNodeData = (data: any): TreeNodeData => {
  if (!data?.entity_heirarcy) {
    return {
      id: "root",
      label: "No Data",
      value: 0,
      proportion: 0
    };
  }


  // Calculate total columns across all entities
  const totalColumns = Object.values(data.entity_heirarcy).reduce(
    (sum: number, entityData: any) =>
      sum + ((entityData as any).analytics?.column_count || 0),
    0
  );

  // Get ALL L1 entities
  const allL1Entities = Object.entries(data.entity_heirarcy)
    .filter(([name]) => name !== "Unassigned L1")
    .map(([l1Name, l1Data]: [string, any]) => {
      const analytics = l1Data.analytics;
      const l1Coverage =
        analytics.column_count > 0
          ? Math.round(
              (analytics.columns_tagged_l1_count / analytics.column_count) * 100
            )
          : 0;

      // Flatten unassigned_l2 before mapping
      let l2ChildrenRaw = (l1Data as any).children
        ? { ...(l1Data as any).children }
        : {};

      if (
        l2ChildrenRaw["unassigned_l2"] &&
        l2ChildrenRaw["unassigned_l2"].children
      ) {
        const unassignedChildren = l2ChildrenRaw["unassigned_l2"].children;
        Object.entries(unassignedChildren).forEach(([childName, childData]) => {
          l2ChildrenRaw[childName] = childData;
        });
        delete l2ChildrenRaw["unassigned_l2"];
      }

      // Get ALL L2 entities
      const allL2Entities = Object.entries(l2ChildrenRaw)
        .map(([l2Name, l2Data]: [string, any]) => {
          const l2Analytics = l2Data.analytics;
          const l2Coverage =
            l2Analytics.column_count > 0
              ? Math.round(
                  (l2Analytics.columns_tagged_l2_count /
                    l2Analytics.column_count) *
                    100
                )
              : 0;

          // Get ALL schemas for this L2
          const allSchemas = (l2Data as any).schemas
            ? Object.entries((l2Data as any).schemas)
                .map(([schemaName, schemaData]: [string, any]) => {
                  const schemaAnalytics = schemaData.analytics;
                  const schemaCoverage =
                    schemaAnalytics.column_count > 0
                      ? Math.round(
                          schemaAnalytics.columns_with_description_pct || 0
                        )
                      : 0;

                  // Get ALL tables for this schema
                  const allTables = (schemaData as any).tables
                    ? Object.entries((schemaData as any).tables)
                        .map(([tableName, tableData]: [string, any]) => {
                          const tableAnalytics = tableData.analytics;
                          const tableCoverage =
                            tableAnalytics.column_count > 0
                              ? Math.round(
                                  tableAnalytics.columns_with_description_pct ||
                                    0
                                )
                              : 0;

                          // Get ALL columns for this table
                          const allColumns = (tableData as any).columns
                            ? (tableData as any).columns.map((column: any) => ({
                                id: `column-${l1Name}-${l2Name}-${schemaName}-${tableName}-${column.name}`,
                                label: column.name,
                                value: 1,
                                proportion: column.has_description ? 100 : 0,
                                analytics: {
                                  columnName: column.name,
                                  schemaName: schemaName,
                                  tableName: tableName,
                                  dataType: column.data_type,
                                  description: column.description,
                                  has_description: column.has_description
                                }
                              }))
                            : [];

                          return {
                            id: `table-${l1Name}-${l2Name}-${schemaName}-${tableName}`,
                            label: tableName,
                            value: tableAnalytics.column_count,
                            proportion: tableCoverage,
                            children: allColumns,
                            analytics: tableAnalytics
                          };
                        })
                        .sort((a, b) => b.value - a.value)
                    : [];

                  return {
                    id: `schema-${l1Name}-${l2Name}-${schemaName}`,
                    label: schemaName,
                    value: schemaAnalytics.column_count,
                    proportion: schemaCoverage,
                    children: allTables,
                    analytics: schemaAnalytics
                  };
                })
                .sort((a, b) => b.value - a.value)
            : [];

          return {
            id: `l2-${l1Name}-${l2Name}`,
            label: l2Name,
            value: l2Analytics.column_count,
            proportion: l2Coverage,
            children: allSchemas,
            analytics: l2Analytics
          };
        })
        .sort((a, b) => b.value - a.value);

      return {
        id: `l1-${l1Name}`,
        label: l1Name,
        value: analytics.column_count,
        proportion: l1Coverage,
        children: allL2Entities,
        analytics: analytics
      };
    })
    .sort((a, b) => b.value - a.value);

  // Build root node
  const root: TreeNodeData = {
    id: "root",
    label: "Data Assets",
    value: totalColumns as number,
    proportion: 100,
    children: allL1Entities,
    analytics: data.entity_global_analytics
  };

  // 🔥 Now flatten "Unassigned L2" nodes at the final stage
  return flattenUnassignedL2Children(root);
};


export const DataAssetsHierarchy = () => {
  const { data, loading } = useGovernanceData();
  const [expanded, setExpanded] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [alignSingleRow, setAlignSingleRow] = useState("InLine");
const [fullScreenChart, setFullScreenChart] = useState(false);

const dataAssetHierarchyValue = {
  id: "root",
  label: "Data Assets",
  value: 100000,       // placeholder value
  proportion: 100,
  children: [
    {
      id: "l1-Airport",
      label: "Airport",
      value: 1000,
      proportion: 100,
      children: [
        { id: "l2-Airport-Region", label: "Region", value: 500, proportion: 100, children: [] },
        { id: "l2-Airport-Country", label: "Country", value: 500, proportion: 100, children: [] }
      ]
    },
    {
      id: "l1-Aircraft",
      label: "Aircraft",
      value: 1200,
      proportion: 100,
      children: [
        { id: "l2-Aircraft-Aircraft Type", label: "Aircraft Type", value: 400, proportion: 100, children: [] },
        { id: "l2-Aircraft-Seating Plan", label: "Seating Plan", value: 400, proportion: 100, children: [] },
        { id: "l2-Aircraft-Registration", label: "Registration", value: 400, proportion: 100, children: [] }
      ]
    },
    {
      id: "l1-Customer",
      label: "Customer",
      value: 2000,
      proportion: 100,
      children: [
        { id: "l2-Customer-Profile", label: "Profile", value: 300, proportion: 100, children: [] },
        { id: "l2-Customer-Booking History", label: "Booking History", value: 300, proportion: 100, children: [] },
        { id: "l2-Customer-Booking Behaviours", label: "Booking Behaviours", value: 300, proportion: 100, children: [] },
        { id: "l2-Customer-Hotel Bookings", label: "Hotel Bookings", value: 200, proportion: 100, children: [] },
        { id: "l2-Customer-Ancillary Preferences", label: "Ancillary Preferences", value: 200, proportion: 100, children: [] },
        { id: "l2-Customer-Customer Experience", label: "Customer Experience", value: 200, proportion: 100, children: [] },
        { id: "l2-Customer-Booking Channels", label: "Booking Channels", value: 200, proportion: 100, children: [] }
      ]
    },
    {
      id: "l1-Employee",
      label: "Employee",
      value: 1000,
      proportion: 100,
      children: [
        { id: "l2-Employee-Profile", label: "Profile", value: 200, proportion: 100, children: [] },
        { id: "l2-Employee-Headcount", label: "Headcount", value: 200, proportion: 100, children: [] },
        { id: "l2-Employee-Attrition", label: "Attrition", value: 200, proportion: 100, children: [] },
        { id: "l2-Employee-Diversity", label: "Diversity", value: 200, proportion: 100, children: [] },
        { id: "l2-Employee-Span of Control", label: "Span of Control", value: 200, proportion: 100, children: [] }
      ]
    },
    {
      id: "l1-Cargo",
      label: "Cargo",
      value: 800,
      proportion: 100,
      children: [
        { id: "l2-Cargo-Category", label: "Category", value: 200, proportion: 100, children: [] },
        { id: "l2-Cargo-Freighter Tonnage/Volumes", label: "Freighter Tonnage/Volumes", value: 200, proportion: 100, children: [] },
        { id: "l2-Cargo-Freighters", label: "Freighters", value: 200, proportion: 100, children: [] },
        { id: "l2-Cargo-Cargo Agent Performances", label: "Cargo Agent Performances", value: 200, proportion: 100, children: [] }
      ]
    },
    {
      id: "l1-Crew",
      label: "Crew",
      value: 500,
      proportion: 100,
      children: [
        { id: "l2-Crew-Roaster", label: "Roaster", value: 250, proportion: 100, children: [] },
        { id: "l2-Crew-Block Hours", label: "Block Hours", value: 250, proportion: 100, children: [] }
      ]
    },
    {
      id: "l1-Bluechip",
      label: "Bluechip",
      value: 300,
      proportion: 100,
      children: []
    },
    {
      id: "l1-Sales",
      label: "Sales",
      value: 1500,
      proportion: 100,
      children: [
        { id: "l2-Sales-Revenue", label: "Revenue", value: 200, proportion: 100, children: [] },
        { id: "l2-Sales-Routes", label: "Routes", value: 200, proportion: 100, children: [] },
        { id: "l2-Sales-Product Class", label: "Product Class", value: 200, proportion: 100, children: [] },
        { id: "l2-Sales-Connections", label: "Connections", value: 200, proportion: 100, children: [] },
        { id: "l2-Sales-Cancellations", label: "Cancellations", value: 150, proportion: 100, children: [] },
        { id: "l2-Sales-Channel", label: "Channel", value: 150, proportion: 100, children: [] },
        { id: "l2-Sales-Baggage Details", label: "Baggage Details", value: 200, proportion: 100, children: [] },
        { id: "l2-Sales-Sales Agent Performances", label: "Sales Agent Performances", value: 200, proportion: 100, children: [] }
      ]
    },
    {
      id: "l1-Flight",
      label: "Flight",
      value: 900,
      proportion: 100,
      children: [
        { id: "l2-Flight-Schedules", label: "Schedules", value: 225, proportion: 100, children: [] },
        { id: "l2-Flight-Sectors", label: "Sectors", value: 225, proportion: 100, children: [] },
        { id: "l2-Flight-Codeshare", label: "Codeshare", value: 225, proportion: 100, children: [] },
        { id: "l2-Flight-Network", label: "Network", value: 225, proportion: 100, children: [] }
      ]
    }
  ]
};


  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded" style={{ marginLeft: `${(i % 3) * 1.5}rem` }}></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Build hierarchy from the real data structure
  const buildHierarchy = (): HierarchyNodeProps[] => {
    if (!data?.entity_heirarcy) return [];

    return Object.entries(data.entity_heirarcy).map(([l1Name, l1Data]) => {
      const analytics = l1Data.analytics;

      // Calculate coverage percentages
      const l1Coverage = analytics.column_count > 0
        ? Math.round((analytics.columns_tagged_l1_count / analytics.column_count) * 100)
        : 0;
      const docCoverage = analytics.columns_with_description_pct || 0;

      // Build Secondary Business Entity children
      const l2Children: HierarchyNodeProps[] = (l1Data as any).children
        ? Object.entries((l1Data as any).children).map(([l2Name, l2Data]: [string, any]) => {
          const l2Analytics = l2Data.analytics;

          // Calculate Secondary Business Entity coverage
          const l2Coverage = l2Analytics.column_count > 0
            ? Math.round((l2Analytics.columns_tagged_l2_count / l2Analytics.column_count) * 100)
            : 0;
          const l2DocCoverage = l2Analytics.columns_with_description_pct || 0;

          // Build schema children
          const schemaChildren: HierarchyNodeProps[] = (l2Data as any).schemas
            ? Object.entries((l2Data as any).schemas).map(([schemaName, schemaData]: [string, any]) => {
              const schemaAnalytics = schemaData.analytics;

              // Calculate schema coverage
              const schemaCoverage = schemaAnalytics.column_count > 0
                ? Math.round((schemaAnalytics.columns_with_description_pct || 0))
                : 0;

              // Build table children
              const tableChildren: HierarchyNodeProps[] = (schemaData as any).tables
                ? Object.entries((schemaData as any).tables).map(([tableName, tableData]: [string, any]) => {
                  const tableAnalytics = tableData.analytics;

                  // Calculate table coverage
                  const tableCoverage = tableAnalytics.column_count > 0
                    ? Math.round((tableAnalytics.columns_with_description_pct || 0))
                    : 0;

                  // Build column children
                  const columnChildren: HierarchyNodeProps[] = (tableData as any).columns
                    ? (tableData as any).columns.map((column: any) => ({
                      level: 4,
                      name: column.name,
                      type: 'column' as const,
                      dataType: column.data_type,
                      description: column.has_description
                        ? `Business description available`
                        : 'No business description',
                    }))
                    : [];

                  return {
                    level: 3,
                    name: tableName,
                    type: 'table' as const,
                    metrics: {
                      columns: tableAnalytics.column_count,
                      coverage: tableCoverage,
                      tagged_count: Math.round((tableCoverage / 100) * tableAnalytics.column_count),
                    },
                    isExpanded: expandedNodes.has(`${l1Name}-${l2Name}-${schemaName}-${tableName}`),
                    onToggle: () => toggleNode(`${l1Name}-${l2Name}-${schemaName}-${tableName}`),
                    children: columnChildren,
                  };
                })
                : [];

              return {
                level: 2,
                name: schemaName,
                type: 'schema' as const,
                metrics: {
                  tables: schemaAnalytics.table_count,
                  columns: schemaAnalytics.column_count,
                  coverage: schemaCoverage,
                  tagged_count: Math.round((schemaCoverage / 100) * schemaAnalytics.column_count),
                },
                isExpanded: expandedNodes.has(`${l1Name}-${l2Name}-${schemaName}`),
                onToggle: () => toggleNode(`${l1Name}-${l2Name}-${schemaName}`),
                children: tableChildren,
              };
            })
            : [];

          return {
            level: 1,
            name: l2Name,
            type: 'l2' as const,
            metrics: {
              schemas: l2Analytics.schema_count,
              tables: l2Analytics.table_count,
              columns: l2Analytics.column_count,
              coverage: l2Coverage,
              documentation: Math.round(l2DocCoverage),
              tagged_count: Math.round((l2Coverage / 100) * l2Analytics.column_count),
            },
            isExpanded: expandedNodes.has(`${l1Name}-${l2Name}`),
            onToggle: () => toggleNode(`${l1Name}-${l2Name}`),
            children: schemaChildren,
          };
        })
        : [];

      return {
        level: 0,
        name: l1Name,
        type: 'l1' as const,
        metrics: {
          schemas: analytics.schema_count,
          tables: analytics.table_count,
          columns: analytics.column_count,
          coverage: l1Coverage,
          documentation: Math.round(docCoverage),
          tagged_count: analytics.columns_tagged_l1_count,
        },
        isExpanded: expandedNodes.has(l1Name),
        onToggle: () => toggleNode(l1Name),
        children: l2Children,
      };
    }).sort((a, b) => {
      // Sort with "Unassigned Primary Business Entity" at the bottom
      if (a.name === "Unassigned Primary Business Entity") return 1;
      if (b.name === "Unassigned Primary Business Entity") return -1;
      return (b.metrics?.columns || 0) - (a.metrics?.columns || 0);
    });
  };

  const hierarchyData = buildHierarchy();

  const treeData = transformToTreeNodeData(data);
  return (
    <div className="space-y-6 w-full overflow-hidden h-[72vh]">
      <div className="flex max-h-full gap-6">
        {/* Main Tree Container */}
        <div className={`bg-white ${expanded ? "w-full transition-all ease-in-out" : "w-80 transition-all ease-in-out"} transition-all ease-in-out rounded-2xl border border-gray-200 shadow-sm p-6 flex-1`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Data Assets Hierarchy</h3>
              <p className="text-sm text-gray-600">
                Interactive visualization of your data structure
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {setAlignSingleRow('DataAsset')
                setFullScreenChart(true);
                }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${alignSingleRow==='DataAsset'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Data Assets View
              </button>
              <button
                onClick={() => setAlignSingleRow('InLine')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${alignSingleRow==='InLine'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                In Line View
              </button>
              <button
                onClick={() => setAlignSingleRow('Hierarchal')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${alignSingleRow==='Hierarchal'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Hierarchical View
              </button>
            </div>
          </div>

          <div className={`max-h-[60vh] flex justify-center transition-all duration-300`}>
            <div className="w-full flex justify-center">
              <div className="w-full max-h-full  flex justify-center overflow-auto">
                {alignSingleRow==="InLine" &&
                <DecompositionTree
                  title=""
                  data={treeData}
                  className="bg-transparent min-w-full"
                  alignLevelsSingleRow={false}
                />
                }
               {alignSingleRow==='Hierarchal' && <DrilldownTree
                  title=""
                  data={treeData}
                  className="bg-transparent min-w-full"
                   alignLevelsSingleRow={true}
                />}
               {alignSingleRow==='DataAsset' && 
               
              //  <HybridDrilldownTree
              //     title="Data Asset View"
              //     fullScreenChart={fullScreenChart}
              //     setFullScreenChart={setFullScreenChart}
              //     data={treeData as TreeNodeData}
              //   />
                
                <MultiBubbleView
                data={dataAssetHierarchyValue as TreeNodeData}
                fullScreenChart={fullScreenChart}
                setFullScreenChart={setFullScreenChart}
                />
                
                }
                {/* <BubblePopHierarchy/> */}

              </div>
            </div>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="bg-slate-300 text-black font-semibold text-xl rounded-full border">
          {expanded ? "<" : ">"}
        </button>
        {!expanded && <div className={`${expanded ? "w-[0px] overflow-hidden" : 'w-80'} ease-in-out duration-2000 bg-gradient-to-br from-indigo-50 via-blue-50 to-white rounded-2xl border border-indigo-100 shadow-sm p-6`}>
          <div className="mb-4">
            <h4 className="text-lg font-bold text-gray-900 mb-2">Analytics Overview</h4>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Entity Counts</h5>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-amber-600 font-medium">Primary Entities</div>
                  <div className="text-gray-900 font-bold text-xl">{data?.entity_global_analytics?.total_l1_excluding_unassigned || 0}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-rose-600 font-medium">Secondary Entities</div>
                  <div className="text-gray-900 font-bold text-xl">{data?.entity_global_analytics?.total_l2_excluding_unassigned || 0}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Column Analytics</h5>
              <div className="space-y-2">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-emerald-600 font-medium text-xs">Total Columns</div>
                  <div className="text-gray-900 font-bold text-xl">{data?.entity_global_analytics?.total_columns?.toLocaleString() || 0}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-amber-600 font-medium text-xs">Primary Tagged</div>
                    <div className="text-gray-900 font-bold text-sm">{data?.entity_global_analytics?.columns_tagged_l1_count?.toLocaleString() || 0}</div>
                    <div className="text-amber-500 text-xs">{data?.entity_global_analytics?.columns_tagged_l1_pct?.toFixed(1) || 0}%</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-rose-600 font-medium text-xs">Secondary Tagged</div>
                    <div className="text-gray-900 font-bold text-sm">{data?.entity_global_analytics?.columns_tagged_l2_count?.toLocaleString() || 0}</div>
                    <div className="text-rose-500 text-xs">{data?.entity_global_analytics?.columns_tagged_l2_pct?.toFixed(1) || 0}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Missing Tags</h5>
              <div className="space-y-2">
                <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                  <div className="text-red-600 font-medium text-xs">Missing Primary</div>
                  <div className="text-red-900 font-bold text-sm">{data?.entity_global_analytics?.columns_missing_l1_count?.toLocaleString() || 0}</div>
                  <div className="text-red-500 text-xs">{data?.entity_global_analytics?.columns_missing_l1_pct?.toFixed(1) || 0}%</div>
                </div>

                <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                  <div className="text-red-600 font-medium text-xs">Missing Secondary</div>
                  <div className="text-red-900 font-bold text-sm">{data?.entity_global_analytics?.columns_missing_l2_count?.toLocaleString() || 0}</div>
                  <div className="text-red-500 text-xs">{data?.entity_global_analytics?.columns_missing_l2_pct?.toFixed(1) || 0}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>}
      </div>

      {/* <div className="flex items-center justify-between text-sm text-gray-600 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-indigo-600" />
            <span className="font-medium">Primary Business Entity</span>
          </div>
          <div className="flex items-center space-x-2">
            <Table className="h-4 w-4 text-sky-600" />
            <span className="font-medium">Secondary Business Entity</span>
          </div>
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-teal-600" />
            <span className="font-medium">Schema</span>
          </div>
          <div className="flex items-center space-x-2">
            <Columns className="h-4 w-4 text-purple-600" />
            <span className="font-medium">Table</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Column</span>
          </div>
        </div>
        <span className="text-gray-500">Click nodes to expand/collapse</span>
      </div> */}
    </div>
  );
};

