import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const DataAssetsOverview = () => {
  const assetData = [
    {
      name: "Unassigned L1",
      columns: 82846,
      tables: 3209,
      coverage: 90,
      usage: 80,
      status: "success"
    },
    {
      name: "Agent (Pax)",
      columns: 384,
      tables: 105,
      coverage: 90,
      usage: 80,
      status: "success"
    },
    {
      name: "Not Applicable",
      columns: 1128,
      tables: 242,
      coverage: 90,
      usage: 80,
      status: "success"
    },
    {
      name: "Passenger Booking",
      columns: 734,
      tables: 140,
      coverage: 90,
      usage: 80,
      status: "success"
    },
    {
      name: "Revenue",
      columns: 567,
      tables: 89,
      coverage: 90,
      usage: 80,
      status: "success"
    }
  ];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Data Assets Overview</h3>
            <p className="text-sm text-muted-foreground">Distribution across business entities</p>
          </div>
          <Badge variant="outline">24 Entities</Badge>
        </div>

        <div className="space-y-4">
          {assetData.map((asset, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                  <h4 className="font-medium text-foreground">{asset.name}</h4>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-xs">
                    {asset.columns.toLocaleString()} cols
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {asset.tables} tables
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {asset.coverage}%
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Coverage Completion</span>
                  <span>{asset.coverage}%</span>
                </div>
                <Progress value={asset.coverage} className="h-1.5" />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{asset.usage}% usage</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};