import { Card } from "@/components/ui/card";
import { LucideIcon, Plane, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subMetrics?: Array<{
    label: string;
    value: string | number;
  }>;
  className?: string;
  onClick?: () => void;
  colorTheme?: 'indigo' | 'sky' | 'orange' | 'teal' | 'purple' | 'emerald' | 'amber' | 'rose';
}

export const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  subMetrics,
  className,
  onClick,
  colorTheme = 'indigo'
}: MetricCardProps) => {
  // Unified blue gradient theme - gradient flows across all cards
  // Darkest blue at top-left (Data Sources) → Lightest blue at bottom-right (Secondary Coverage)
  const getGradientIntensity = (theme: string) => {
    const intensityMap: Record<string, number> = {
      'indigo': 0,    // Data Sources - Darkest
      'sky': 1,       // GVCs
      'orange': 2,    // Pipelines
      'teal': 3,      // Schemas
      'purple': 4,    // Tables
      'emerald': 5,   // Columns
      'amber': 6,     // Primary Coverage
      'rose': 7       // Secondary Coverage - Lightest
    };
    return intensityMap[theme] || 0;
  };

  const intensity = getGradientIntensity(colorTheme);
  const opacityStart = Math.max(0.20 - (intensity * 0.025), 0.05);  // 0.20 → 0.025
  const opacityMid = Math.max(0.15 - (intensity * 0.02), 0.03);     // 0.15 → 0.01
  const opacityEnd = Math.max(0.08 - (intensity * 0.01), 0.01);     // 0.08 → 0.01

  const colorThemes = {
    indigo: {
      gradient: 'from-indigo-100 via-blue-50 to-purple-50',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600',
      iconColor: 'text-white',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-500'
    },
    sky: {
      gradient: 'from-blue-100 via-indigo-50 to-sky-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      iconColor: 'text-white',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-500'
    },
    orange: {
      gradient: 'from-violet-100 via-purple-50 to-indigo-50',
      iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
      iconColor: 'text-white',
      textColor: 'text-violet-700',
      borderColor: 'border-violet-500'
    },
    teal: {
      gradient: 'from-cyan-100 via-sky-50 to-blue-50',
      iconBg: 'bg-gradient-to-br from-cyan-500 to-sky-600',
      iconColor: 'text-white',
      textColor: 'text-cyan-700',
      borderColor: 'border-cyan-500'
    },
    purple: {
      gradient: 'from-purple-100 via-violet-50 to-indigo-50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
      iconColor: 'text-white',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-500'
    },
    emerald: {
      gradient: 'from-sky-100 via-cyan-50 to-blue-50',
      iconBg: 'bg-gradient-to-br from-sky-500 to-cyan-600',
      iconColor: 'text-white',
      textColor: 'text-sky-700',
      borderColor: 'border-sky-500'
    },
    amber: {
      gradient: 'from-fuchsia-100 via-pink-50 to-purple-50',
      iconBg: 'bg-gradient-to-br from-fuchsia-500 to-pink-600',
      iconColor: 'text-white',
      textColor: 'text-fuchsia-700',
      borderColor: 'border-fuchsia-500'
    },
    rose: {
      gradient: 'from-pink-100 via-fuchsia-50 to-violet-50',
      iconBg: 'bg-gradient-to-br from-pink-500 to-fuchsia-600',
      iconColor: 'text-white',
      textColor: 'text-pink-700',
      borderColor: 'border-pink-500'
    }
  };

  const theme = colorThemes[colorTheme];

  return (
    <Card 
      className={cn(
        "p-6 hover:shadow-lg transition-all duration-300 relative w-44 overflow-hidden group border rounded-2xl",
        `bg-gradient-to-br ${theme.gradient}`,
        theme.borderColor,
        onClick && "cursor-pointer hover:-translate-y-1",
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
          </div>
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0",
            theme.iconBg,
            "group-hover:scale-105 transition-transform duration-300"
          )}>
            <Icon className={cn("h-6 w-6", theme.iconColor)} />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className={cn("text-3xl font-bold mb-1", theme.textColor)}>{value}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center text-sm font-semibold mt-2",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <span>{trend.isPositive ? "↗" : "↘"} {trend.isPositive ? "+" : ""}{trend.value}%</span>
            </div>
          )}
        </div>
{/* 
        {subMetrics && subMetrics.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              {subMetrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className={cn("text-lg font-bold", theme.textColor)}>{metric.value}</div>
                  <div className="text-xs text-gray-500">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </Card>
  );
};