import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft, Compass } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function NotFound() {
  const [redirectSeconds, setRedirectSeconds] = useState<number>(10);
  const [, navigate] = useLocation();
  const { currentUser } = useAuth();
  
  // Auto redirect after 10 seconds
  useEffect(() => {
    if (redirectSeconds > 0) {
      const timer = setTimeout(() => {
        setRedirectSeconds(redirectSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      navigate(currentUser ? "/dashboard" : "/");
    }
  }, [redirectSeconds, navigate, currentUser]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background pt-16">
      <Card className="w-full max-w-md mx-4 border-border bg-card shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-3xl font-bold text-primary mb-2">Page Not Found</h1>
            <div className="bg-background/50 w-16 h-1 rounded-full mb-4"></div>
            <p className="text-md text-muted-foreground">
              Oops! The page you are looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="mt-4 p-4 bg-muted/40 rounded-lg">
            <p className="text-sm text-muted-foreground">
              You will be automatically redirected to {currentUser ? "your dashboard" : "the home page"} in <span className="font-bold text-secondary">{redirectSeconds}</span> seconds.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-6">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto flex items-center gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} /> Go Back
          </Button>
          
          <Link href={currentUser ? "/dashboard" : "/"}>
            <Button 
              className="w-full sm:w-auto flex items-center gap-2 gradient-bg"
            >
              {currentUser ? <Compass size={16} /> : <Home size={16} />}
              {currentUser ? "My Dashboard" : "Home Page"}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
