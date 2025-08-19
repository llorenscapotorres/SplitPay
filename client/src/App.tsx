import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Bill from "@/pages/bill";
import Dashboard from "@/pages/dashboard";
import QRGenerator from "@/pages/qr-generator";
import NavigationHeader from "@/components/navigation-header";

function Router() {
  return (
    <div className="relative">
      <NavigationHeader />
      <Switch>
        <Route path="/" component={Bill} />
        <Route path="/bill/:tableNumber/:restaurant" component={Bill} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/qr" component={QRGenerator} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
