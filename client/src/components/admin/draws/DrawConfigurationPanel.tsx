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
import { Separator } from "../../ui/separator";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface DrawConfig {
  drawPercentage: number;
  profitPercentage: number;
  maintenancePercentage: number;
  winnersPerDraw: number;
  minimumReward: number;
  eligibilityDays: number;
  notificationDays: number;
}

export function DrawConfigurationPanel() {
  const [config, setConfig] = useState<DrawConfig>({
    drawPercentage: 50, // 50% for rewards
    profitPercentage: 30, // 30% profit
    maintenancePercentage: 20, // 20% maintenance
    winnersPerDraw: 3, // 3 winners per week
    minimumReward: 100, // Minimum ₹100 reward
    eligibilityDays: 21, // 21-day cooldown
    notificationDays: 2, // Notify 2 days before
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const configDoc = await getDoc(doc(db, "config", "drawConfig"));
      if (configDoc.exists()) {
        setConfig(configDoc.data() as DrawConfig);
      }
    } catch (error) {
      console.error("Error loading draw config:", error);
      toast({
        title: "Error",
        description: "Failed to load configuration",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate percentages sum to 100%
      const totalPercentage =
        config.drawPercentage +
        config.profitPercentage +
        config.maintenancePercentage;
      if (totalPercentage !== 100) {
        throw new Error("Percentages must sum to 100%");
      }

      await updateDoc(doc(db, "config", "drawConfig"), config);
      toast({
        title: "Success",
        description: "Draw configuration updated successfully",
      });
    } catch (error) {
      console.error("Error updating config:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draw Configuration</CardTitle>
        <CardDescription>
          Configure prize distribution and eligibility rules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prize Distribution */}
          <div className="space-y-4">
            <h3 className="font-semibold">Prize Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Rewards Percentage</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={config.drawPercentage}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      drawPercentage: parseInt(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Percentage allocated for rewards
                </p>
              </div>

              <div className="space-y-2">
                <Label>Profit Percentage</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={config.profitPercentage}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      profitPercentage: parseInt(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Percentage kept as profit
                </p>
              </div>

              <div className="space-y-2">
                <Label>Maintenance Percentage</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={config.maintenancePercentage}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      maintenancePercentage: parseInt(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Percentage for platform maintenance
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Draw Rules */}
          <div className="space-y-4">
            <h3 className="font-semibold">Draw Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Winners Per Draw</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={config.winnersPerDraw}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      winnersPerDraw: parseInt(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Number of winners selected each week
                </p>
              </div>

              <div className="space-y-2">
                <Label>Minimum Reward (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={config.minimumReward}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      minimumReward: parseInt(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Minimum guaranteed reward amount
                </p>
              </div>

              <div className="space-y-2">
                <Label>Eligibility Period (Days)</Label>
                <Input
                  type="number"
                  min="0"
                  value={config.eligibilityDays}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      eligibilityDays: parseInt(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Days before previous winners can win again
                </p>
              </div>

              <div className="space-y-2">
                <Label>Notification Days</Label>
                <Input
                  type="number"
                  min="1"
                  max="7"
                  value={config.notificationDays}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      notificationDays: parseInt(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Days before draw to check eligibility
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Configuration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
