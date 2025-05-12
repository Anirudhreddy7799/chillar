import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { DrawConfig } from "@shared/types/lucky-draw";

export function DrawConfigurationPanel() {
  const [config, setConfig] = useState<DrawConfig>({
    drawPercentage: 50,
    profitPercentage: 30,
    maintenancePercentage: 20,
    winnersPerDraw: 3,
    minimumReward: 500,
    eligibilityDays: 21,
    notificationDays: 5,
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
      console.error("Error loading config:", error);
      toast({
        title: "Error",
        description: "Failed to load draw configuration",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const validateConfig = () => {
    if (
      config.drawPercentage +
        config.profitPercentage +
        config.maintenancePercentage !==
      100
    ) {
      toast({
        title: "Invalid Configuration",
        description: "Percentages must sum to 100%",
        variant: "destructive",
      });
      return false;
    }

    if (config.winnersPerDraw < 1) {
      toast({
        title: "Invalid Configuration",
        description: "Must have at least 1 winner per draw",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateConfig()) return;

    setIsLoading(true);
    try {
      await updateDoc(doc(db, "config", "drawConfig"), config);
      toast({
        title: "Success",
        description: "Draw configuration updated successfully",
      });
    } catch (error) {
      console.error("Error updating config:", error);
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lucky Draw Configuration</CardTitle>
        <CardDescription>
          Configure the weekly lucky draw parameters. Changes will take effect
          from the next draw.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue Split */}
            <div className="space-y-2">
              <Label htmlFor="drawPercentage">Draw Pool Percentage (%)</Label>
              <Input
                id="drawPercentage"
                name="drawPercentage"
                type="number"
                value={config.drawPercentage}
                onChange={handleInputChange}
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profitPercentage">Profit Percentage (%)</Label>
              <Input
                id="profitPercentage"
                name="profitPercentage"
                type="number"
                value={config.profitPercentage}
                onChange={handleInputChange}
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenancePercentage">
                Maintenance Percentage (%)
              </Label>
              <Input
                id="maintenancePercentage"
                name="maintenancePercentage"
                type="number"
                value={config.maintenancePercentage}
                onChange={handleInputChange}
                min="0"
                max="100"
              />
            </div>

            {/* Draw Configuration */}
            <div className="space-y-2">
              <Label htmlFor="winnersPerDraw">Winners Per Draw</Label>
              <Input
                id="winnersPerDraw"
                name="winnersPerDraw"
                type="number"
                value={config.winnersPerDraw}
                onChange={handleInputChange}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumReward">Minimum Reward (₹)</Label>
              <Input
                id="minimumReward"
                name="minimumReward"
                type="number"
                value={config.minimumReward}
                onChange={handleInputChange}
                min="500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eligibilityDays">Days Between Wins</Label>
              <Input
                id="eligibilityDays"
                name="eligibilityDays"
                type="number"
                value={config.eligibilityDays}
                onChange={handleInputChange}
                min="1"
              />
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
