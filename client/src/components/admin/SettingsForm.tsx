import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Cog, Save, Trash, RefreshCcw, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CONFIG } from "@/config";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const settingsFormSchema = z.object({
  appName: z.string().min(1, "App name is required"),
  supportEmail: z.string().email("Must be a valid email"),
  adminEmails: z.string().refine(value => {
    if (!value) return true;
    const emails = value.split(',').map(e => e.trim());
    return emails.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  }, {
    message: "Must be a comma-separated list of valid email addresses",
  }),
  razorpayKeyId: z.string().min(1, "Razorpay Key ID is required"),
  razorpaySecret: z.string().min(1, "Razorpay Secret is required"),
  razorpayPlanId: z.string().min(1, "Razorpay Plan ID is required"),
  razorpayWebhookSecret: z.string().min(1, "Razorpay Webhook Secret is required"),
  firebaseApiKey: z.string().min(1, "Firebase API Key is required"),
  firebaseProjectId: z.string().min(1, "Firebase Project ID is required"),
  firebaseAppId: z.string().min(1, "Firebase App ID is required"),
  baseUrl: z.string().url("Must be a valid URL"),
  testModeEnabled: z.boolean().default(false),
  subscriptionPrice: z.coerce.number().min(1, "Subscription price must be at least ₹1"),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const SettingsForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [randomWinnerDialogOpen, setRandomWinnerDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Initialize form with current values from config
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      appName: CONFIG.APP_NAME,
      supportEmail: CONFIG.SUPPORT_EMAIL,
      adminEmails: CONFIG.ADMIN_EMAILS.join(', '),
      razorpayKeyId: CONFIG.RAZORPAY_KEY_ID === "RAZORPAY_KEY_PLACEHOLDER" ? "" : CONFIG.RAZORPAY_KEY_ID,
      razorpaySecret: CONFIG.RAZORPAY_SECRET === "RAZORPAY_SECRET_PLACEHOLDER" ? "" : CONFIG.RAZORPAY_SECRET,
      razorpayPlanId: CONFIG.RAZORPAY_PLAN_ID === "RAZORPAY_PLAN_PLACEHOLDER" ? "" : CONFIG.RAZORPAY_PLAN_ID,
      razorpayWebhookSecret: CONFIG.RAZORPAY_WEBHOOK_SECRET === "RAZORPAY_WEBHOOK_SECRET" ? "" : CONFIG.RAZORPAY_WEBHOOK_SECRET,
      firebaseApiKey: CONFIG.FIREBASE_API_KEY === "FIREBASE_API_KEY_PLACEHOLDER" ? "" : CONFIG.FIREBASE_API_KEY,
      firebaseProjectId: CONFIG.FIREBASE_PROJECT_ID === "FIREBASE_PROJECT_ID_PLACEHOLDER" ? "" : CONFIG.FIREBASE_PROJECT_ID,
      firebaseAppId: CONFIG.FIREBASE_APP_ID === "FIREBASE_APP_ID_PLACEHOLDER" ? "" : CONFIG.FIREBASE_APP_ID,
      baseUrl: CONFIG.BASE_URL,
      testModeEnabled: false, // This would typically come from an environment variable or database setting
      subscriptionPrice: CONFIG.SUBSCRIPTION_PRICE,
    },
  });
  
  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, we would call an API endpoint to update the settings
      // For now, just simulate a delay and show a success toast
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Updated",
        description: "Application settings have been saved successfully.",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const triggerManualDraw = async () => {
    try {
      // This would call an API endpoint to manually trigger a draw
      toast({
        title: "Draw Triggered",
        description: "The weekly reward draw has been triggered manually.",
        duration: 3000,
      });
      setRandomWinnerDialogOpen(false);
    } catch (error: any) {
      console.error("Error triggering draw:", error);
      toast({
        title: "Action Failed",
        description: error.message || "Failed to trigger the draw. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Settings</h2>
        
        <Dialog open={randomWinnerDialogOpen} onOpenChange={setRandomWinnerDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Trigger Manual Draw
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Trigger Manual Draw</DialogTitle>
              <DialogDescription>
                This will manually trigger the weekly reward draw to select a random winner from all active subscribers.
                Use this only if the automated system failed to run.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-warning font-medium">Warning:</p>
              <p className="text-muted-foreground text-sm mt-1">
                Manual draws should only be used in exceptional circumstances when the scheduled draw didn't occur.
                This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRandomWinnerDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={triggerManualDraw}
              >
                Trigger Draw
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Configure general application settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="appName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name that will be displayed throughout the application.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="supportEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Support inquiries will be directed to this email address.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="adminEmails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Emails</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="admin@example.com, admin2@example.com"
                      />
                    </FormControl>
                    <FormDescription>
                      These emails will have admin privileges. Separate multiple emails with commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The base URL for the application (used for email links and redirects).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subscriptionPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Price (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Monthly subscription price in rupees.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="testModeEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Test Mode</FormLabel>
                      <FormDescription>
                        Enable test mode for development and testing.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Firebase Configuration</CardTitle>
              <CardDescription>
                Configure Firebase authentication and database settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="firebaseApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firebase API Key</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input 
                          {...field} 
                          type="password" 
                          className="rounded-r-none"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          className="rounded-l-none"
                          onClick={() => {
                            const input = document.querySelector(`input[name="${field.name}"]`) as HTMLInputElement;
                            if (input) {
                              input.type = input.type === 'password' ? 'text' : 'password';
                            }
                          }}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      API key for Firebase authentication.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="firebaseProjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firebase Project ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Your Firebase project ID.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="firebaseAppId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firebase App ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Your Firebase application ID.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Razorpay Configuration</CardTitle>
              <CardDescription>
                Configure Razorpay payment gateway settings for subscriptions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="razorpayKeyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razorpay Key ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Your Razorpay Key ID for payment processing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="razorpaySecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razorpay Secret</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input 
                          {...field} 
                          type="password" 
                          className="rounded-r-none"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          className="rounded-l-none"
                          onClick={() => {
                            const input = document.querySelector(`input[name="${field.name}"]`) as HTMLInputElement;
                            if (input) {
                              input.type = input.type === 'password' ? 'text' : 'password';
                            }
                          }}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your Razorpay Secret key.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="razorpayPlanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razorpay Plan ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Subscription plan ID from Razorpay dashboard.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="razorpayWebhookSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razorpay Webhook Secret</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input 
                          {...field} 
                          type="password" 
                          className="rounded-r-none"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          className="rounded-l-none"
                          onClick={() => {
                            const input = document.querySelector(`input[name="${field.name}"]`) as HTMLInputElement;
                            if (input) {
                              input.type = input.type === 'password' ? 'text' : 'password';
                            }
                          }}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Secret for validating Razorpay webhook events.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Reset
            </Button>
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
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SettingsForm;
