import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useGovernanceData } from "@/hooks/useGovernanceData";

const COLORS = ['#0096c7', '#0077b6', '#023e8a', '#48cae4'];

export const GovernanceKPIs = () => {
  const { data, loading } = useGovernanceData();

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-2/3"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const global = data?.global_analytics;

  // Calculate untagged percentage
  const totalColumns = global?.total_columns || 0;
  const l1TaggedColumns = global?.business_entity_primary_coverage_pct ? 
    Math.round((global.business_entity_primary_coverage_pct / 100) * totalColumns) : 0;
  const l2TaggedColumns = global?.business_entity_secondary_coverage_pct ? 
    Math.round((global.business_entity_secondary_coverage_pct / 100) * totalColumns) : 0;
  const untaggedColumns = totalColumns - l1TaggedColumns - l2TaggedColumns;
  const untaggedPct = totalColumns > 0 ? Math.round((untaggedColumns / totalColumns) * 100) : 0;

  const taggedVsUntagged = [
    { name: 'L1 Tagged', value: global?.business_entity_primary_coverage_pct || 0, color: COLORS[0] },
    { name: 'L2 Tagged', value: global?.business_entity_secondary_coverage_pct || 0, color: COLORS[1] },
    { name: 'Untagged', value: untaggedPct, color: COLORS[2] },
  ];

  const documentationData = [
    { name: 'Schemas', value: global?.schemas_with_description_pct || 0 },
    { name: 'Tables', value: global?.tables_with_description_pct || 0 },
    { name: 'Columns', value: global?.columns_with_description_pct || 0 },
  ];

  const governanceScore = Math.round(
    ((global?.business_entity_primary_coverage_pct || 0) * 0.3) +
    ((global?.business_entity_secondary_coverage_pct || 0) * 0.2) +
    ((global?.columns_with_description_pct || 0) * 0.5)
  );

  const avgL1Score = data?.entity_heirarcy ? Object.values(data.entity_heirarcy).reduce((sum, entityData) => {
    // Calculate a governance score based on available metrics
    const analytics = entityData.analytics;
    const l1Coverage = analytics.column_count > 0 
      ? Math.round((analytics.columns_tagged_l1_count / analytics.column_count) * 100) 
      : 0;
    const l2Coverage = analytics.column_count > 0 
      ? Math.round((analytics.columns_tagged_l2_count / analytics.column_count) * 100) 
      : 0;
    const score = (analytics.columns_with_description_pct * 0.4) + 
                  (l1Coverage * 0.3) + 
                  (l2Coverage * 0.3);
    return sum + score;
  }, 0) / Object.keys(data.entity_heirarcy).length : 0;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Entity Coverage Distribution</h3>
            <p className="text-sm text-muted-foreground">
              Breakdown of column tagging across L1/L2 entities
            </p>
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taggedVsUntagged}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taggedVsUntagged.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number,name:string) => [`${value.toFixed(1)}%`,name ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {taggedVsUntagged.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Documentation Coverage</h3>
            <p className="text-sm text-muted-foreground">
              Documentation coverage across different asset levels
            </p>
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={documentationData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  className="text-xs fill-muted-foreground"
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Coverage']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#023e8a"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Governance Health</h3>
            <p className="text-sm text-muted-foreground">
              Overall governance quality metrics
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Overall Governance Score</span>
                <span className="text-2xl font-bold text-foreground">{governanceScore}</span>
              </div>
              <Progress value={governanceScore} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Based on L1/L2 coverage and documentation
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Avg L1 Entity Score</span>
                <span className="text-xl font-semibold text-foreground">{Math.round(avgL1Score)}</span>
              </div>
              <Progress value={avgL1Score} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Total Entities</span>
                <div className="text-lg font-semibold text-foreground">
                  {data?.entity_heirarcy ? Object.keys(data.entity_heirarcy).filter(name => name !== 'Unassigned L1').length : 0}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Schemas w/ Zero Doc</span>
                <div className="text-lg font-semibold text-destructive">
                  {global?.top_schemas_lowest_doc?.filter(s => s.doc_pct === 0).length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};