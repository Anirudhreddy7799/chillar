import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DrawConfigurationPanel } from "./DrawConfigurationPanel";
import { DrawSchedulePanel } from "./DrawSchedulePanel";
import { DrawHistoryPanel } from "./DrawHistoryPanel";
import { DrawAnalyticsPanel } from "./DrawAnalyticsPanel";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function DrawSettingsPage() {
  const { currentUser } = useAuth();

  if (!currentUser?.isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to access draw settings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Draw Settings</h1>
      <p className="text-muted-foreground">
        Configure and manage the weekly lucky draw system.
      </p>

      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">Draw History</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration">
          <DrawConfigurationPanel />
        </TabsContent>

        <TabsContent value="schedule">
          <DrawSchedulePanel />
        </TabsContent>

        <TabsContent value="analytics">
          <DrawAnalyticsPanel />
        </TabsContent>

        <TabsContent value="history">
          <DrawHistoryPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
