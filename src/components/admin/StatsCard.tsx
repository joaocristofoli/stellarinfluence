import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number; // percentage
    direction: "up" | "down" | "neutral";
  };
  suffix?: string;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  suffix,
  className = "" 
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";
    
    switch (trend.direction) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="glass border-border/50 hover:border-accent/50 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="text-accent">{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-bold">
                {value}
              </span>
              {suffix && (
                <span className="text-sm text-muted-foreground">{suffix}</span>
              )}
            </div>
            
            {trend && (
              <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
