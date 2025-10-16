import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingDown, Users, Database } from "lucide-react";
import { useGovernanceData } from "@/hooks/useGovernanceData";

export const ActionOrientedInsights = () => {
  const { data, loading } = useGovernanceData();

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-2/3"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-12 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Get critical entities with low documentation from real data
  const criticalEntities = data?.entity_heirarcy ? Object.entries(data.entity_heirarcy).filter(([l1EntityName, entityData]) => {
    const analytics = entityData.analytics;
    return l1EntityName !== 'Unassigned L1' && 
           analytics.columns_with_description_pct < 70;
  }).map(([l1EntityName, entityData]) => ({
    l1_entity: l1EntityName,
    documented_pct: entityData.analytics.columns_with_description_pct,
    tables: entityData.analytics.table_count,
    columns: entityData.analytics.column_count
  })).sort((a, b) => a.documented_pct - b.documented_pct).slice(0, 5) : [];

  // Get L1 entities with lowest coverage from real data
  const lowCoverageL1s = data?.entity_heirarcy ? Object.entries(data.entity_heirarcy).filter(([l1EntityName, entityData]) => {
    return l1EntityName !== 'Unassigned L1';
  }).map(([l1EntityName, entityData]) => {
    const analytics = entityData.analytics;
    const l1Coverage = analytics.column_count > 0 
      ? Math.round((analytics.columns_tagged_l1_count / analytics.column_count) * 100) 
      : 0;
    return {
      l1_entity: l1EntityName,
      l1_tagged_pct: l1Coverage,
      columns: analytics.column_count
    };
  }).sort((a, b) => a.l1_tagged_pct - b.l1_tagged_pct).slice(0, 5) : [];

  // Get high-risk tables from real data
  const highUsageLowDoc = data?.global_analytics?.top_tables_lowest_doc?.filter(t => 
    t.doc_pct < 50
  ).slice(0, 5) || [];

  // Get entities missing L2 coverage from real data
  const missingL2s = data?.entity_heirarcy ? Object.entries(data.entity_heirarcy).filter(([l1EntityName, entityData]) => {
    const analytics = entityData.analytics;
    return analytics.columns_tagged_l2_count === 0 && l1EntityName !== 'Unassigned L1';
  }).map(([l1EntityName, entityData]) => ({
    l1_entity: l1EntityName,
    l2_tagged_pct: 0,
    columns: entityData.analytics.column_count
  })).slice(0, 5) : [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="text-lg font-semibold text-foreground">Critical Entity Issues</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Key business entities with poor governance coverage
          </p>
          
          <div className="space-y-3">
            {criticalEntities.length > 0 ? criticalEntities.map((entity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">{entity.l1_entity}</div>
                  <div className="text-sm text-muted-foreground">
                    {entity.tables} tables, {entity.columns} columns
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={entity.documented_pct} className="h-2 w-16" />
                  <Badge variant="destructive" className="text-xs">
                    {entity.documented_pct}% docs
                  </Badge>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No critical entity issues found</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-warning" />
            <h3 className="text-lg font-semibold text-foreground">Lowest L1 Coverage</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            L1 entities with poorest tagging coverage
          </p>
          
          <div className="space-y-3">
            {lowCoverageL1s.map((entity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">{entity.l1_entity}</div>
                  <div className="text-sm text-muted-foreground">
                    {entity.columns} columns
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={entity.l1_tagged_pct} className="h-2 w-16" />
                  <Badge variant={entity.l1_tagged_pct < 50 ? "destructive" : "secondary"} className="text-xs">
                    {entity.l1_tagged_pct}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-chart-2" />
            <h3 className="text-lg font-semibold text-foreground">High-Risk Tables</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Tables with low documentation requiring urgent attention
          </p>
          
          <div className="space-y-3">
            {highUsageLowDoc.map((table, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium text-foreground truncate">
                    {table.schema}.{table.table}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {table.columns} columns
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={table.doc_pct} className="h-2 w-16" />
                  <Badge variant="destructive" className="text-xs">
                    {table.doc_pct}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="text-lg font-semibold text-foreground">Missing L2 Entities</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            L2 entities with incomplete sub-entity mapping
          </p>
          
          <div className="space-y-3">
            {missingL2s.map((entity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">{entity.l1_entity}</div>
                  <div className="text-sm text-muted-foreground">
                    {entity.columns} columns
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={entity.l2_tagged_pct} className="h-2 w-16" />
                  <Badge variant="secondary" className="text-xs">
                    {entity.l2_tagged_pct}% L2
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};