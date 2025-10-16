import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export const TrendProgressChart = () => {
  // Simulated trend data - in real implementation, this would come from time-series data
  const trendData = [
    { month: "Jan", l1Coverage: 8.5, l2Coverage: 1.8, documentation: 91.2 },
    { month: "Feb", l1Coverage: 8.7, l2Coverage: 1.9, documentation: 91.4 },
    { month: "Mar", l1Coverage: 8.9, l2Coverage: 2.0, documentation: 91.6 },
    { month: "Apr", l1Coverage: 9.0, l2Coverage: 2.0, documentation: 91.7 },
  ];

  const problemsResolvedData = [
    { month: "Jan", resolved: 45, added: 52 },
    { month: "Feb", resolved: 58, added: 41 },
    { month: "Mar", resolved: 72, added: 38 },
    { month: "Apr", resolved: 89, added: 34 },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Coverage Trends</h3>
            <p className="text-sm text-muted-foreground">
              L1/L2 coverage and documentation progress over time
            </p>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs fill-muted-foreground"
                />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="l1Coverage" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="L1 Coverage %"
                />
                <Line 
                  type="monotone" 
                  dataKey="l2Coverage" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  name="L2 Coverage %"
                />
                <Line 
                  type="monotone" 
                  dataKey="documentation" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  name="Documentation %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Problem Resolution</h3>
            <p className="text-sm text-muted-foreground">
              Problems resolved vs new issues identified
            </p>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={problemsResolvedData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs fill-muted-foreground"
                />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="resolved" 
                  fill="hsl(var(--chart-1))" 
                  name="Problems Resolved"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="added" 
                  fill="hsl(var(--chart-5))" 
                  name="New Problems"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-chart-1"></div>
              <span className="text-muted-foreground">Resolved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-chart-5"></div>
              <span className="text-muted-foreground">New Issues</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};