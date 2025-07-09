import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WasteBin from "@/components/WasteBin";
import { LogOut, Wifi, WifiOff, RefreshCw, Trash2, BarChart3, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [binLevel, setBinLevel] = useState(45);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const navigate = useNavigate();
  const { toast } = useToast();

  // Simulate ESP8266 data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        // Simulate random level changes (in real app, this would come from ESP8266)
        const newLevel = Math.max(0, Math.min(100, binLevel + (Math.random() - 0.5) * 10));
        setBinLevel(Math.round(newLevel));
        setLastUpdate(new Date());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [binLevel, isConnected]);

  // Simulate connection status
  useEffect(() => {
    const connectionInterval = setInterval(() => {
      // Simulate occasional disconnections
      if (Math.random() < 0.1) {
        setIsConnected(false);
        toast({
          title: "Connection Lost",
          description: "Lost connection to ESP8266 sensor",
          variant: "destructive",
        });
        
        setTimeout(() => {
          setIsConnected(true);
          toast({
            title: "Connection Restored",
            description: "Reconnected to ESP8266 sensor",
          });
        }, 3000);
      }
    }, 15000);

    return () => clearInterval(connectionInterval);
  }, [toast]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  const handleRefresh = () => {
    setLastUpdate(new Date());
    toast({
      title: "Data refreshed",
      description: "Bin data has been updated",
    });
  };

  const getSystemStatus = () => {
    if (!isConnected) return { text: "Offline", variant: "destructive" };
    if (binLevel >= 90) return { text: "Alert", variant: "destructive" };
    if (binLevel >= 75) return { text: "Warning", variant: "warning" };
    return { text: "Normal", variant: "success" };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">WasteWatch</h1>
                <p className="text-sm text-muted-foreground">Smart Waste Management</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={systemStatus.variant as any} className="flex items-center gap-1">
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {systemStatus.text}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Bin Visualization */}
          <div className="lg:col-span-2 flex justify-center">
            <WasteBin
              level={binLevel}
              binId="001"
              location="Main Building - Floor 1"
              lastUpdated={lastUpdate}
            />
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-medium border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Level</span>
                  <span className="font-semibold text-lg">{binLevel}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Capacity</span>
                  <span className="font-semibold">120L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Remaining</span>
                  <span className="font-semibold">{Math.round(120 * (100 - binLevel) / 100)}L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={systemStatus.variant === "success" ? "default" : systemStatus.variant as any}>
                    {systemStatus.text}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Location Info */}
            <Card className="shadow-medium border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="w-4 h-4 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">Main Building</p>
                  <p className="text-sm text-muted-foreground">Floor 1, Reception Area</p>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Sensor ID: ESP8266_001</p>
                  <p>Last Update: {lastUpdate.toLocaleString()}</p>
                  <p>Connection: {isConnected ? "Active" : "Lost"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Connection Status */}
            <Card className={`shadow-medium border-0 ${!isConnected ? 'border-l-4 border-l-destructive' : 'border-l-4 border-l-success'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {isConnected ? <Wifi className="w-4 h-4 text-success" /> : <WifiOff className="w-4 h-4 text-destructive" />}
                  ESP8266 Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Connection</span>
                    <Badge variant={isConnected ? "default" : "destructive"}>
                      {isConnected ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  {isConnected && (
                    <div className="text-xs text-muted-foreground">
                      Next update in ~{5 - (Date.now() % 5000) / 1000 | 0}s
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-8 shadow-soft border-0 bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-foreground">ESP8266 Integration</h3>
              <p className="text-sm text-muted-foreground">
                Currently showing simulated data. To connect your ESP8266 sensor, you'll need to set up a backend API to receive real sensor data.
              </p>
              <p className="text-xs text-muted-foreground">
                For production use, integrate with your IoT platform or set up a REST API endpoint.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;