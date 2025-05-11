import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Join from "@/pages/Join";
import Dashboard from "@/pages/Dashboard";
import Rewards from "@/pages/Rewards";
import Winners from "@/pages/Winners";
import FAQ from "@/pages/FAQ";
import Claim from "@/pages/Claim";
import Admin from "@/pages/Admin";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Refund from "@/pages/Refund";
import Legal from "@/pages/Legal";
import Subscribe from "@/pages/Subscribe";
import ProtectedRoute from "@/pages/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/join">
        <ProtectedRoute onJoinPage>
          <Join />
        </ProtectedRoute>
      </Route>
      {/* Removed profile-complete route as it's now integrated into Dashboard */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/rewards" component={Rewards} />
      {/* Keep calendar route for backward compatibility, but show the Rewards page */}
      <Route path="/calendar" component={Rewards} />
      <Route path="/winners" component={Winners} />
      <Route path="/faq" component={FAQ} />
      <Route path="/claim">
        <ProtectedRoute>
          <Claim />
        </ProtectedRoute>
      </Route>
      {/* Redirect old profile route to dashboard */}
      <Route path="/profile">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute adminOnly>
          <Admin />
        </ProtectedRoute>
      </Route>
      {/* Add a redirect for any old profile-complete URLs to dashboard */}
      <Route path="/profile-complete">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/refund" component={Refund} />
      <Route path="/legal" component={Legal} />
      <Route path="/subscribe">
        <ProtectedRoute>
          <Subscribe />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
