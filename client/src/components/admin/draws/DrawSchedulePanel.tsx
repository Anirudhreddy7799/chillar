import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Switch } from "../../ui/switch";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Separator } from "../../ui/separator";

interface DrawScheduleConfig {
  isAutoDrawEnabled: boolean;
  drawDayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
  drawHour: number; // 0-23
  drawMinute: number; // 0-59
  timezone: string;
  notificationDaysBefore: number;
  notificationEmail: string;
  backupDrawEnabled: boolean;
  maxDrawAttempts: number;
}

export function DrawSchedulePanel() {
  const [config, setConfig] = useState<DrawScheduleConfig>({
    isAutoDrawEnabled: true,
    drawDayOfWeek: 6, // Saturday
    drawHour: 8, // 8 AM
    drawMinute: 0,
    timezone: "Asia/Kolkata",
    notificationDaysBefore: 2,
    notificationEmail: "",
    backupDrawEnabled: true,
    maxDrawAttempts: 3,
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      if (!db) return;
      const configRef = doc(db, "config", "drawSchedule");
      const configDoc = await getDoc(configRef);
      if (configDoc.exists()) {
        setConfig(configDoc.data() as DrawScheduleConfig);
      }
    } catch (error) {
      console.error("Error loading schedule config:", error);
      toast({
        title: "Error",
        description: "Failed to load schedule configuration",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!db) return;
      const configRef = doc(db, "config", "drawSchedule");
      await updateDoc(configRef, {
        isAutoDrawEnabled: config.isAutoDrawEnabled,
        drawDayOfWeek: config.drawDayOfWeek,
        drawHour: config.drawHour,
        drawMinute: config.drawMinute,
        timezone: config.timezone,
        notificationDaysBefore: config.notificationDaysBefore,
        notificationEmail: config.notificationEmail,
        backupDrawEnabled: config.backupDrawEnabled,
        maxDrawAttempts: config.maxDrawAttempts,
      });
      toast({
        title: "Success",
        description: "Draw schedule updated successfully",
      });
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const hours = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, "0") + ":00",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draw Schedule</CardTitle>
        <CardDescription>
          Configure when and how the weekly draw should run
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Automatic Draw Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-draw"
              checked={config.isAutoDrawEnabled}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({ ...prev, isAutoDrawEnabled: checked }))
              }
            />
            <Label htmlFor="auto-draw">Enable Automatic Weekly Draw</Label>
          </div>

          <Separator />

          {/* Schedule Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold">Schedule</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Draw Day</Label>
                <Select
                  value={config.drawDayOfWeek.toString()}
                  onValueChange={(value) =>
                    setConfig((prev) => ({
                      ...prev,
                      drawDayOfWeek: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Hour</Label>
                  <Select
                    value={config.drawHour.toString()}
                    onValueChange={(value) =>
                      setConfig((prev) => ({
                        ...prev,
                        drawHour: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem
                          key={hour.value}
                          value={hour.value.toString()}
                        >
                          {hour.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Minute</Label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={config.drawMinute}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        drawMinute: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="font-semibold">Notifications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Notification Email</Label>
                <Input
                  type="email"
                  value={config.notificationEmail}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificationEmail: e.target.value,
                    }))
                  }
                  placeholder="admin@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Receive notifications about draw execution
                </p>
              </div>

              <div className="space-y-2">
                <Label>Notification Lead Time (Days)</Label>
                <Input
                  type="number"
                  min="1"
                  max="7"
                  value={config.notificationDaysBefore}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificationDaysBefore: parseInt(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Days before draw to send notifications
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Backup Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Backup Settings</h3>

            <div className="flex items-center space-x-2">
              <Switch
                id="backup-draw"
                checked={config.backupDrawEnabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, backupDrawEnabled: checked }))
                }
              />
              <Label htmlFor="backup-draw">Enable Backup Draw System</Label>
            </div>

            <div className="pl-6">
              <div className="space-y-2">
                <Label>Maximum Draw Attempts</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={config.maxDrawAttempts}
                  disabled={!config.backupDrawEnabled}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      maxDrawAttempts: parseInt(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Number of retry attempts if draw fails
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Schedule Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
