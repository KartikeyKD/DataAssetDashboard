import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CoverageScorecardProps {
  entity: string;
  tables: number;
  columns: number;
  l1Tagged: number;
  l2Tagged: number;
  documented: number;
  l1TaggedCount?: number;
  l2TaggedCount?: number;
  documentedCount?: number;
  riskFlags: string[];
  status: "healthy" | "attention" | "critical";
  // New fields
  l2_count?: number;
  l2_count_excluding_unassigned?: number;
  schema_count?: number;
  table_count?: number;
  column_count?: number;
  columns_tagged_l1_count?: number;
  columns_tagged_l2_count?: number;
  columns_missing_l2_count?: number;
  columns_missing_l2_pct?: number;
  columns_with_description_pct?: number;
  undocumented_columns_pct?: number;
  // New fields for popups
  schema_list?: string[];
  l2_entity_list?: string[];
}

export const CoverageScorecard = ({
  entity,
  tables,
  columns,
  l1Tagged,
  l2Tagged,
  documented,
  l1TaggedCount,
  l2TaggedCount,
  documentedCount,
  riskFlags,
  status,
  l2_count,
  l2_count_excluding_unassigned,
  schema_count,
  table_count,
  column_count,
  columns_tagged_l1_count,
  columns_tagged_l2_count,
  columns_missing_l2_count,
  columns_missing_l2_pct,
  columns_with_description_pct,
  undocumented_columns_pct,
  schema_list = [],
  l2_entity_list = []
}: CoverageScorecardProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "healthy":
        return {
          color: "text-success",
          bgColor: "bg-success/10",
          icon: CheckCircle,
          badge: "success"
        };
      case "attention":
        return {
          color: "text-warning",
          bgColor: "bg-warning/10", 
          icon: AlertCircle,
          badge: "warning"
        };
      case "critical":
        return {
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          icon: AlertTriangle,
          badge: "destructive"
        };
      default:
        return {
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          icon: AlertCircle,
          badge: "secondary"
        };
    }
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-300 border rounded-xl bg-white">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", config.bgColor)}>
              <StatusIcon className={cn("h-5 w-5", config.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{entity}</h3>
              <p className="text-sm text-gray-500">{tables} Tables • {columns.toLocaleString()} Columns</p>
            </div>
          </div>
          <Badge variant={config.badge as any} className="rounded-lg">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reference Schema Count</span>
              <Dialog>
                <DialogTrigger asChild>
                  <span className="font-medium text-primary bg-blue-400 px-2 shadow-md hover:scale-110 hover:shadow-xl text-white py-1 hover:bg-blue-200 border rounded-lg hover:text-primary/80 cursor-pointer">
                    {schema_count || 0}
                  </span>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Reference Schemas for {entity}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    {schema_list.length > 0 ? (
                      schema_list.map((schema, index) => (
                        <div key={index} className="p-2 bg-muted rounded-md text-sm">
                          {schema}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No schema data available</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reference Column Count</span>
              <span className="font-medium">
                {column_count?.toLocaleString() || columns.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Associated Secondary Business Entity</span>
              <span className="font-medium">
                {l2Tagged.toFixed(1)}%
              </span>
            </div>
            <Progress value={l2Tagged} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Secondary Business Entity Count</span>
              <Dialog>
                <DialogTrigger asChild>
                  <span className="font-medium text-primary bg-blue-400 px-2 shadow-md hover:scale-110 hover:shadow-xl text-white py-1 hover:bg-blue-200 border rounded-lg hover:text-primary/80 cursor-pointer">
                    {l2_count_excluding_unassigned || l2_count || 0}
                  </span>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Secondary Business Entities for {entity}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    {l2_entity_list.length > 0 ? (
                      l2_entity_list.map((l2Entity, index) => (
                        <div key={index} className="p-2 bg-muted rounded-md text-sm">
                          {l2Entity}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No secondary entity data available</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

        </div>

        {riskFlags.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Risk Flags</p>
            <div className="flex flex-wrap gap-1">
              {riskFlags.map((flag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {flag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};