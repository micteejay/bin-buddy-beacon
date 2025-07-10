import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, BarChart3, Wifi } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 text-foreground">WasteWatch</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Smart waste management system powered by ESP8266 sensors. Monitor bin levels in real-time and optimize collection routes.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="px-8 py-3 text-lg"
          >
            Access Dashboard
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-medium border-0">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Real-time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Connect ESP8266 sensors to monitor waste bin levels continuously with live updates.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Visualize bin capacity trends and optimize collection schedules with detailed analytics.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Smart Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Receive notifications when bins reach capacity thresholds for efficient waste management.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
