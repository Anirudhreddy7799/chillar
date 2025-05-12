import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CONFIG } from "@/config";
import { apiRequest } from "@/lib/queryClient";

const settingsFormSchema = z.object({
  isAutoDrawEnabled: z.boolean().default(true),
  drawDayOfWeek: z.number().min(0).max(6, "Valid draw day is required"),
  drawHour: z.number().min(0).max(23, "Valid draw time is required"),
  notificationDaysBefore: z.number().min(0).max(7),
  notificationEmail: z.string().email("Please enter a valid email"),
  backupDrawEnabled: z.boolean().default(false),
  maxDrawAttempts: z.number().min(1).max(5),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface DrawSettingsSectionProps {
  form?: UseFormReturn<any>;
  standalone?: boolean;
}

const DAYS_OF_WEEK = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString(),
  label: i.toString().padStart(2, "0") + ":00",
}));

const DrawSettingsSection = ({
  form: parentForm,
  standalone = false,
}: DrawSettingsSectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Create a local form instance for standalone mode
  const localForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      isAutoDrawEnabled: true,
      drawDayOfWeek: 0,
      drawHour: 23,
      notificationDaysBefore: 1,
      notificationEmail: CONFIG.SUPPORT_EMAIL,
      backupDrawEnabled: false,
      maxDrawAttempts: 3,
    },
  });

  const form = standalone ? localForm : parentForm;

  if (!form) {
    console.error("No form instance available");
    return null;
  }

  const onSubmit = async (data: SettingsFormValues) => {
    if (!standalone) return; // Only handle submit in standalone mode

    setIsSubmitting(true);
    try {
      const drawSettingsResponse = await apiRequest(
        "POST",
        "/api/settings/draw",
        {
          isAutoDrawEnabled: data.isAutoDrawEnabled,
          drawDayOfWeek: data.drawDayOfWeek,
          drawHour: data.drawHour,
          notificationDaysBefore: data.notificationDaysBefore,
          notificationEmail: data.notificationEmail,
          backupDrawEnabled: data.backupDrawEnabled,
          maxDrawAttempts: data.maxDrawAttempts,
        }
      );

      if (!drawSettingsResponse.ok) {
        throw new Error("Failed to save draw settings");
      }

      toast({
        title: "Settings Updated",
        description: "Draw settings have been saved successfully.",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error saving draw settings:", error);
      toast({
        title: "Update Failed",
        description:
          error.message || "Failed to save draw settings. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <Card>
      <CardHeader>
        <CardTitle>Draw Settings</CardTitle>
        <CardDescription>
          Configure automatic draw schedule and backup settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto Draw Schedule */}
        <FormField
          control={form.control}
          name="isAutoDrawEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Automatic Draws</FormLabel>
                <FormDescription>
                  Enable automatic weekly reward draws
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Draw Day */}
        <FormField
          control={form.control}
          name="drawDayOfWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Draw Day</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value ? field.value.toString() : "0"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select draw day" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The day of the week when draws will be conducted
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Draw Time */}
        <FormField
          control={form.control}
          name="drawHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Draw Time</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value ? field.value.toString() : "23"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select draw time" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {HOURS.map((hour) => (
                    <SelectItem key={hour.value} value={hour.value}>
                      {hour.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The time when draws will be conducted (in your timezone)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notification Settings */}
        <FormField
          control={form.control}
          name="notificationDaysBefore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notification Days</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="7"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Days before the draw to send reminder notifications
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notification Email */}
        <FormField
          control={form.control}
          name="notificationEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notification Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Email address to receive draw notifications and alerts
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Backup System */}
        <FormField
          control={form.control}
          name="backupDrawEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Backup System</FormLabel>
                <FormDescription>
                  Enable automatic backup draw system if primary draw fails
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Retry Attempts */}
        <FormField
          control={form.control}
          name="maxDrawAttempts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Draw Attempts</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Number of attempts to retry failed draws (1-5)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  if (standalone) {
    return (
      <Form {...localForm}>
        <form onSubmit={localForm.handleSubmit(onSubmit)} className="space-y-6">
          {content}

          <div className="flex justify-end">
            <Button
              type="submit"
              className="gradient-bg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draw Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return content;
};

export { DrawSettingsSection };
