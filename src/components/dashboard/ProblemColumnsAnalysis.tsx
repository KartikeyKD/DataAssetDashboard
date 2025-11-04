import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Database, Eye } from "lucide-react";
import { useGovernanceData } from "@/hooks/useGovernanceData";

export const ProblemColumnsAnalysis = () => {
  const { data } = useGovernanceData();
  const [isNamingDialogOpen, setIsNamingDialogOpen] = useState(false);

  // Get real naming issues from data.json
  const namingIssues = {
    "Has special chars": data?.global_analytics?.naming_issues?.columns_with_special_chars || 0,
    "Has spaces": data?.global_analytics?.naming_issues?.columns_with_spaces || 0,
    "Too long (>64 chars)": data?.global_analytics?.naming_issues?.columns_name_too_long_64 || 0,
    "Starts with number": data?.global_analytics?.naming_issues?.columns_starting_with_number || 0
  };

  // Get top tables with lowest documentation from real data
  const topTablesLowDoc = data?.global_analytics?.top_tables_lowest_doc || [];
  const topSchemasLowDoc = data?.global_analytics?.top_schemas_lowest_doc || [];

  // Generate problem columns from real data
  const problemColumns = [
    ...topTablesLowDoc.slice(0, 5).map(table => ({
      schema: table.schema,
      table: table.table,
      column: "Multiple columns",
      datatype: "Various",
      issues: [`${table.doc_pct}% documented`],
      url: table.url
    })),
    ...topSchemasLowDoc.slice(0, 3).map(schema => ({
      schema: schema.schema,
      table: "Multiple tables",
      column: "Multiple columns", 
      datatype: "Various",
      issues: [`${schema.doc_pct}% documented`],
      url: null
    }))
  ];

  // Debug: Show if data is loading
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading compliance data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">    
      <div className="grid gap-6 md:grid-cols-2">
        {/* Problem Columns */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Problem Columns
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Top columns requiring immediate attention
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {problemColumns.map((col, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {col.schema}.{col.table}
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {col.column}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {col.datatype}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {col.issues.map((issue, issueIndex) => (
                        <Badge 
                          key={issueIndex} 
                          variant="destructive" 
                          className="text-xs"
                        >
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Naming Issues Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-warning" />
              Naming Issues Summary
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Column naming convention violations
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(namingIssues).map(([issue, count]) => (
              <div key={issue} className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                <span className="text-sm font-medium">{issue}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                  <Dialog open={isNamingDialogOpen} onOpenChange={setIsNamingDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="text-primary hover:text-primary/80">
                        <Eye className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Naming Issues Details</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[500px] w-full">
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground mb-4">
                            <strong>Naming Issues Summary:</strong>
                          </div>
                          {Object.entries(namingIssues).map(([issue, count]) => (
                            <div key={issue} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="font-semibold">{issue}</div>
                                <Badge variant="destructive" className="text-xs">
                                  {count} columns affected
                                </Badge>
                              </div>
                            </div>
                          ))}
                          
                          <div className="text-sm text-muted-foreground mt-6 mb-4">
                            <strong>Tables with Low Documentation:</strong>
                          </div>
                          {topTablesLowDoc.slice(0, 10).map((table, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="font-medium text-muted-foreground">Schema</div>
                                  <div className="font-semibold">{table.schema}</div>
                                </div>
                                <div>
                                  <div className="font-medium text-muted-foreground">Table</div>
                                  <div className="font-semibold">{table.table}</div>
                                </div>
                                <div>
                                  <div className="font-medium text-muted-foreground">Columns</div>
                                  <div className="font-semibold">{table.columns}</div>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <Badge variant="destructive" className="text-xs">
                                  {table.doc_pct}% documented
                                </Badge>
                                {table.url && (
                                  <a href={table.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                                    View in Alation
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};