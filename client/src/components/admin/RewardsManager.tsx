import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash, Plus, Image, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertRewardSchema } from "@shared/schema";
import { formatCurrency, getCurrentWeekString, formatWeekDateRange } from "@/lib/utils";

// Extended schema for the form
const rewardFormSchema = z.object({
  week: z.string().min(1, "Week is required"),
  prizeName: z.string().min(1, "Prize name is required"),
  prizeValue: z.coerce.number().min(1, "Prize value must be at least ₹1"),
  prizeType: z.string().min(1, "Prize type is required"),
  sponsor: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid image URL"),
});

type RewardFormValues = z.infer<typeof rewardFormSchema>;

const RewardsManager = () => {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<any | null>(null);
  const { toast } = useToast();
  
  // Form hook
  const form = useForm<RewardFormValues>({
    resolver: zodResolver(rewardFormSchema),
    defaultValues: {
      week: getCurrentWeekString(),
      prizeName: "",
      prizeValue: 0,
      prizeType: "voucher",
      sponsor: "",
      imageUrl: "",
    },
  });
  
  useEffect(() => {
    fetchRewards();
  }, []);
  
  // Reset form when editing reward changes
  useEffect(() => {
    if (editingReward) {
      form.reset({
        week: editingReward.week,
        prizeName: editingReward.prizeName,
        prizeValue: editingReward.prizeValue,
        prizeType: editingReward.prizeType,
        sponsor: editingReward.sponsor || "",
        imageUrl: editingReward.imageUrl,
      });
    } else {
      form.reset({
        week: getCurrentWeekString(),
        prizeName: "",
        prizeValue: 0,
        prizeType: "voucher",
        sponsor: "",
        imageUrl: "",
      });
    }
  }, [editingReward, form]);
  
  const fetchRewards = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/rewards', undefined);
      const data = await response.json();
      setRewards(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching rewards:", err);
      setError("Failed to load rewards data. Please try again later.");
      setLoading(false);
      
      // Set fallback data for development
      setRewards([
        {
          id: 1,
          week: "2023-29",
          prizeName: "Mobile Recharge",
          prizeValue: 199,
          prizeType: "recharge",
          sponsor: "Airtel",
          imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1",
          status: "active",
        },
        {
          id: 2,
          week: "2023-30",
          prizeName: "Amazon Voucher",
          prizeValue: 500,
          prizeType: "voucher",
          sponsor: "Amazon",
          imageUrl: "https://images.unsplash.com/photo-1607083206968-13611e3d76db",
          status: "scheduled",
        },
        {
          id: 3,
          week: "2023-31",
          prizeName: "Movie Tickets",
          prizeValue: 300,
          prizeType: "voucher",
          sponsor: "BookMyShow",
          imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728",
          status: "scheduled",
        },
      ]);
    }
  };
  
  const openAddDialog = () => {
    setEditingReward(null);
    setDialogOpen(true);
  };
  
  const openEditDialog = (reward: any) => {
    setEditingReward(reward);
    setDialogOpen(true);
  };
  
  const openDeleteDialog = (reward: any) => {
    setRewardToDelete(reward);
    setDeleteDialogOpen(true);
  };
  
  const handleSubmit = async (data: RewardFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingReward) {
        // Update existing reward
        const response = await apiRequest('PATCH', `/api/rewards/${editingReward.id}`, data);
        if (response.ok) {
          const updatedReward = await response.json();
          setRewards(prev => 
            prev.map(r => r.id === editingReward.id ? updatedReward : r)
          );
          toast({
            title: "Reward Updated",
            description: "The reward has been updated successfully.",
            duration: 3000,
          });
        } else {
          throw new Error("Failed to update reward");
        }
      } else {
        // Create new reward
        const response = await apiRequest('POST', '/api/rewards', data);
        if (response.ok) {
          const newReward = await response.json();
          setRewards(prev => [...prev, newReward]);
          toast({
            title: "Reward Created",
            description: "The new reward has been created successfully.",
            duration: 3000,
          });
        } else {
          throw new Error("Failed to create reward");
        }
      }
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving reward:", error);
      toast({
        title: "Action Failed",
        description: error.message || "Failed to save the reward. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!rewardToDelete) return;
    
    try {
      const response = await apiRequest('DELETE', `/api/rewards/${rewardToDelete.id}`, undefined);
      if (response.ok) {
        setRewards(prev => prev.filter(r => r.id !== rewardToDelete.id));
        toast({
          title: "Reward Deleted",
          description: "The reward has been deleted successfully.",
          duration: 3000,
        });
      } else {
        throw new Error("Failed to delete reward");
      }
    } catch (error: any) {
      console.error("Error deleting reward:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete the reward. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setDeleteDialogOpen(false);
      setRewardToDelete(null);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge variant="outline" className="bg-success/20 text-success">Active</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-warning/20 text-warning">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Sample image URLs for quick selection
  const sampleImageUrls = [
    "https://images.unsplash.com/photo-1607083206968-13611e3d76db", // Amazon voucher
    "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1", // Mobile recharge
    "https://images.unsplash.com/photo-1485846234645-a62644f84728", // Movie tickets
    "https://images.unsplash.com/photo-1576867757603-05b134ebc379", // Food delivery
    "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37", // Netflix
  ];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Manage Rewards</h2>
        
        <Button 
          onClick={openAddDialog}
          className="gradient-bg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Reward
        </Button>
      </div>
      
      {loading ? (
        <Card className="bg-card animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="bg-card">
          <CardContent className="p-6 text-center">
            <p className="text-error mb-4">{error}</p>
            <Button onClick={fetchRewards}>Retry</Button>
          </CardContent>
        </Card>
      ) : rewards.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No rewards found. Get started by adding a new reward.</p>
            <Button onClick={openAddDialog} className="gradient-bg">Add Reward</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-card rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reward</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Week</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-background flex-shrink-0 overflow-hidden mr-3">
                        <img 
                          src={reward.imageUrl} 
                          alt={reward.prizeName} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <p className="text-sm font-medium text-white">{reward.prizeName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <p className="text-sm text-white">{formatCurrency(reward.prizeValue)}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <p className="text-sm text-white">{reward.week}</p>
                    <p className="text-xs text-muted-foreground">{formatWeekDateRange(reward.week)}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {getStatusBadge(reward.status || 'scheduled')}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button 
                        size="icon"
                        variant="outline"
                        className="p-1 rounded bg-primary/20 hover:bg-primary/40 transition"
                        onClick={() => openEditDialog(reward)}
                      >
                        <Edit className="text-primary h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon"
                        variant="outline"
                        className="p-1 rounded bg-error/20 hover:bg-error/40 transition"
                        onClick={() => openDeleteDialog(reward)}
                      >
                        <Trash className="text-error h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Add/Edit Reward Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingReward ? "Edit Reward" : "Add New Reward"}</DialogTitle>
            <DialogDescription>
              {editingReward 
                ? "Update the details of this reward." 
                : "Create a new weekly reward for members to win."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="week"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Week</FormLabel>
                      <FormControl>
                        <Input placeholder="YYYY-WW (e.g., 2023-45)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Format: Year-WeekNumber (e.g., 2023-45)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prizeValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prize Value (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="prizeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prize Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Amazon Gift Card" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prizeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prize Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a prize type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="voucher">Voucher</SelectItem>
                          <SelectItem value="recharge">Recharge</SelectItem>
                          <SelectItem value="subscription">Subscription</SelectItem>
                          <SelectItem value="physical">Physical Item</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sponsor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsor (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Amazon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          {...field}
                          className="flex-1"
                        />
                        <div className="relative group">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            className="bg-primary/20"
                          >
                            <Image className="h-4 w-4" />
                          </Button>
                          <div className="absolute right-0 top-full mt-2 p-2 bg-card border border-border rounded-md shadow-lg hidden group-hover:block z-10">
                            <div className="text-xs text-muted-foreground mb-2">Quick select:</div>
                            <div className="grid grid-cols-5 gap-1">
                              {sampleImageUrls.map((url, i) => (
                                <div 
                                  key={i}
                                  className="w-10 h-10 rounded cursor-pointer overflow-hidden border border-border hover:border-primary"
                                  onClick={() => form.setValue('imageUrl', url)}
                                >
                                  <img src={url} alt={`Sample ${i+1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    {field.value && (
                      <div className="mt-2 h-24 overflow-hidden rounded-md border border-border">
                        <img 
                          src={field.value} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                          }}
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gradient-bg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : editingReward ? (
                    "Update Reward"
                  ) : (
                    "Create Reward"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the reward "{rewardToDelete?.prizeName}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardsManager;
