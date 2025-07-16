import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WasteBinProps {
  level: number;
  binId: string;
  location: string;
  lastUpdated?: Date;
}

const WasteBin = ({ level, binId, location, lastUpdated = new Date() }: WasteBinProps) => {
  const [animatedLevel, setAnimatedLevel] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedLevel(level);
    }, 500);
    return () => clearTimeout(timer);
  }, [level]);

  const getStatusColor = () => {
    if (level >= 90) return "destructive";
    if (level >= 75) return "secondary";
    if (level >= 50) return "outline";
    return "default";
  };

  const getStatusIcon = () => {
    if (level >= 90) return <AlertTriangle className="w-4 h-4" />;
    if (level >= 75) return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (level >= 90) return "FULL - Needs Collection";
    if (level >= 75) return "Nearly Full";
    if (level >= 50) return "Half Full";
    return "Available";
  };

  const getBinFillColor = () => {
    if (level >= 90) return "bg-destructive";
    if (level >= 75) return "bg-warning";
    if (level >= 50) return "bg-info";
    return "bg-success";
  };

  return (
    <Card className="w-full max-w-lg shadow-medium border-0 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trash2 className="w-5 h-5 text-primary" />
            Bin {binId}
          </CardTitle>
          <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Waste Bin Visualization */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Bin Container */}
            <div className="relative w-32 h-48 bg-muted rounded-lg border-4 border-border shadow-inner overflow-hidden">
              {/* Waste Fill */}
              <div className="absolute bottom-0 left-0 right-0 transition-all duration-2000 ease-out">
                <div 
                  className={cn(
                    "w-full transition-all duration-2000 ease-out rounded-t-sm",
                    getBinFillColor()
                  )}
                  style={{ 
                    height: `${animatedLevel}%`
                  }}
                />
              </div>
              
              {/* Bin Lines */}
              <div className="absolute inset-x-2 top-4 h-0.5 bg-border opacity-50" />
              <div className="absolute inset-x-2 top-8 h-0.5 bg-border opacity-50" />
              <div className="absolute inset-x-2 bottom-4 h-0.5 bg-border opacity-50" />
            </div>

            {/* Bin Lid */}
            <div className="absolute -top-2 -left-2 -right-2 h-4 bg-primary rounded-lg shadow-md flex items-center justify-center">
              <div className="w-8 h-2 bg-primary-foreground rounded-full opacity-50" />
            </div>

            {/* Overflow Indicator */}
            {level >= 100 && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-pulse-eco">
                <div className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Level Display */}
          <div className="mt-6 text-center">
            <div className="text-3xl font-bold text-foreground">
              {level}%
            </div>
            <div className="text-sm text-muted-foreground">Fill Level</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Capacity</span>
            <span className="font-medium">{level}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-2000 ease-out rounded-full",
                getBinFillColor()
              )}
              style={{ width: `${animatedLevel}%` }}
            />
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default WasteBin;