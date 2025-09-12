import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedApp from "@/components/AuthenticatedApp";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <QrCode className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <AuthenticatedApp />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <QrCode className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl">Barcode Scanner</CardTitle>
          <CardDescription className="text-lg">
            Sign in to access your inventory management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              • Scan and track inventory items
              • Save data to the cloud
              • Access from any device
              • Export to Excel
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full" size="lg">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In / Sign Up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
